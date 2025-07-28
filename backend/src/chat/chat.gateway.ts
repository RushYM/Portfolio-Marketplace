import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000'], // 프론트엔드 URL
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // JWT 토큰 검증
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');
      
      console.log('🔐 Socket 연결 시도, 토큰 확인:', token ? '존재함' : '없음');
      
      if (!token) {
        console.log('❌ 토큰 없음, 연결 거부');
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      client.userId = payload.sub;
      
      if (!client.userId) {
        console.log('❌ 사용자 ID 없음, 연결 거부');
        client.disconnect();
        return;
      }
      
      this.connectedUsers.set(client.userId, client.id);
      
      // 사용자의 채팅방 목록 조회 후 해당 채팅방들에 자동 입장
      const chatRooms = await this.chatService.getChatRooms(client.userId);
      chatRooms.forEach(room => {
        client.join(`room_${room.id}`);
      });

      console.log(`✅ 사용자 ${client.userId}가 채팅 서버에 연결됨`);
    } catch (error) {
      console.error('❌ 채팅 연결 오류:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.connectedUsers.delete(client.userId);
      console.log(`👋 사용자 ${client.userId}가 채팅 서버에서 연결 해제됨`);
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatRoomId: string },
  ) {
    try {
      console.log(`🚪 채팅방 입장: ${client.userId} -> ${data.chatRoomId}`);
      
      if (!client.userId) {
        return { status: 'error', message: '인증되지 않은 사용자입니다.' };
      }

      // 채팅방 접근 권한 확인
      await this.chatService.getChatRoom(data.chatRoomId, client.userId);
      
      // 채팅방에 입장
      client.join(`room_${data.chatRoomId}`);
      
      // 해당 채팅방의 안 읽은 메시지를 읽음 처리
      await this.chatService.markMessagesAsRead(data.chatRoomId, client.userId);
      
      // 다른 참여자에게 읽음 상태 업데이트 알림
      client.to(`room_${data.chatRoomId}`).emit('messagesRead', {
        chatRoomId: data.chatRoomId,
        userId: client.userId,
      });

      console.log(`✅ 채팅방 입장 완료: ${client.userId} -> ${data.chatRoomId}`);
      return { status: 'success', message: '채팅방에 참여했습니다.' };
    } catch (error) {
      console.error(`❌ 채팅방 입장 실패:`, error);
      return { status: 'error', message: error.message };
    }
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatRoomId: string },
  ) {
    client.leave(`room_${data.chatRoomId}`);
    return { status: 'success', message: '채팅방을 나갔습니다.' };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatRoomId: string; content: string; type?: 'TEXT' | 'IMAGE' | 'FILE' },
  ) {
    try {
      console.log(`📤 메시지 전송 받음: ${client.userId} -> ${data.chatRoomId}:`, data.content);
      
      if (!client.userId) {
        return { status: 'error', message: '인증되지 않은 사용자입니다.' };
      }

      // 메시지 저장
      const message = await this.chatService.sendMessage(
        data.chatRoomId,
        client.userId,
        data.content,
        data.type || 'TEXT',
      );

      console.log(`💾 메시지 저장 완료:`, message);

      // 채팅방의 다른 참여자들에게만 메시지 전송 (자신 제외)
      client.to(`room_${data.chatRoomId}`).emit('newMessage', {
        ...message,
        chatRoomId: data.chatRoomId,
      });

      console.log(`📨 메시지 브로드캐스트 완료: room_${data.chatRoomId} (자신 제외)`);

      // 채팅방 목록 업데이트를 위해 참여자들에게 알림
      const chatRoom = await this.chatService.getChatRoom(data.chatRoomId, client.userId);
      const otherUserId = chatRoom.sellerId === client.userId ? chatRoom.buyerId : chatRoom.sellerId;
      
      // 상대방이 온라인이면 채팅방 목록 업데이트 알림
      const otherUserSocketId = this.connectedUsers.get(otherUserId);
      if (otherUserSocketId) {
        this.server.to(otherUserSocketId).emit('chatRoomUpdated', {
          chatRoomId: data.chatRoomId,
        });
      }

      return { status: 'success', message };
    } catch (error) {
      console.error(`❌ 메시지 전송 실패:`, error);
      return { status: 'error', message: error.message };
    }
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatRoomId: string; isTyping: boolean },
  ) {
    // 타이핑 상태를 다른 참여자에게 전송 (본인 제외)
    client.to(`room_${data.chatRoomId}`).emit('userTyping', {
      userId: client.userId,
      isTyping: data.isTyping,
      chatRoomId: data.chatRoomId,
    });
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatRoomId: string },
  ) {
    try {
      if (!client.userId) {
        return { status: 'error', message: '인증되지 않은 사용자입니다.' };
      }

      await this.chatService.markMessagesAsRead(data.chatRoomId, client.userId);
      
      // 다른 참여자에게 읽음 상태 업데이트 알림
      client.to(`room_${data.chatRoomId}`).emit('messagesRead', {
        chatRoomId: data.chatRoomId,
        userId: client.userId,
      });

      return { status: 'success' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @SubscribeMessage('productStatusChanged')
  async handleProductStatusChanged(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { 
      chatRoomId: string; 
      productId: string; 
      newStatus: string; 
      statusMessage: string;
      changedBy: string;
    },
  ) {
    try {
      console.log(`📦 상품 상태 변경 이벤트 수신: ${data.productId} -> ${data.newStatus}`);
      
      // 채팅방의 다른 참여자들에게 상품 상태 변경 알림
      client.to(`room_${data.chatRoomId}`).emit('productStatusChanged', {
        chatRoomId: data.chatRoomId,
        productId: data.productId,
        newStatus: data.newStatus,
        statusMessage: data.statusMessage,
        changedBy: data.changedBy,
      });

      console.log(`📨 상품 상태 변경 알림 브로드캐스트 완료: room_${data.chatRoomId}`);
      
      return { status: 'success', message: '상품 상태 변경이 전달되었습니다.' };
    } catch (error) {
      console.error(`❌ 상품 상태 변경 이벤트 처리 실패:`, error);
      return { status: 'error', message: error.message };
    }
  }

  // 다른 사용자에게 알림 전송 (유틸리티 메서드)
  async notifyUser(userId: string, event: string, data: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
    }
  }

  // 채팅방에 알림 전송 (유틸리티 메서드)
  async notifyRoom(chatRoomId: string, event: string, data: any) {
    this.server.to(`room_${chatRoomId}`).emit(event, data);
  }
} 