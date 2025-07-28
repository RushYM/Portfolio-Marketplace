import { io, Socket } from 'socket.io-client';
import { api } from '@/lib/api';

// 인터페이스 정의
export interface ChatRoom {
  id: string;
  sellerId: string;
  buyerId: string;
  productId: string;
  product: {
    id: string;
    title: string;
    price: number;
    images: string[];
    mainImageIndex: number;
    status: string;
  };
  otherUser: {
    id: string;
    username: string;
    profileImage?: string;
  };
  lastMessage?: {
    id: string;
    content: string;
    createdAt: string;
  };
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
  senderId: string;
  sender: {
    id: string;
    username: string;
    profileImage?: string;
  };
}

export interface ChatRoomsResponse {
  data: ChatRoom[];
}

export interface MessagesResponse {
  data: ChatMessage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Socket 이벤트 타입
export interface SocketEvents {
  newMessage: (data: ChatMessage & { chatRoomId: string }) => void;
  userTyping: (data: { userId: string; isTyping: boolean; chatRoomId: string }) => void;
  messagesRead: (data: { chatRoomId: string; userId: string }) => void;
  chatRoomUpdated: (data: { chatRoomId: string }) => void;
}

class ChatServiceClass {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private baseURL = '/chat';

  // Socket.IO 연결
  connect(token: string) {
    if (this.socket && this.socket.connected) {
      console.log('🔗 이미 Socket.IO에 연결되어 있습니다.');
      return this.socket;
    }

    // 기존 연결이 있으면 정리
    if (this.socket) {
      this.socket.disconnect();
    }

    console.log('🔌 Socket.IO 연결 시작:', process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001/chat');
    console.log('🔐 사용 토큰:', token ? token.substring(0, 20) + '...' : '없음');

    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001/chat', {
      auth: {
        token,
      },
      transports: ['websocket'],
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('✅ 채팅 서버에 연결되었습니다. Socket ID:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ 채팅 서버와의 연결이 끊어졌습니다. 이유:', reason);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 채팅 서버에 재연결되었습니다. 시도 횟수:', attemptNumber);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ 채팅 서버 연결 오류:', error);
    });

    return this.socket;
  }

  // Socket.IO 연결 해제
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  // 이벤트 리스너 등록
  on(event: string, listener: (...args: any[]) => void) {
    if (!this.socket) return;

    this.socket.on(event, listener);
    
    // 리스너 추적을 위한 저장
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  // 이벤트 리스너 제거
  off(event: string, listener?: (...args: any[]) => void) {
    if (!this.socket) return;

    if (listener) {
      this.socket.off(event, listener);
      
      // 리스너 목록에서 제거
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        const index = eventListeners.indexOf(listener);
        if (index > -1) {
          eventListeners.splice(index, 1);
        }
      }
    } else {
      this.socket.off(event);
      this.listeners.delete(event);
    }
  }

  // Socket 이벤트 발행
  emit(event: string, data: any) {
    if (this.socket && this.socket.connected) {
      console.log(`🚀 Socket 이벤트 발행: ${event}`, data);
      return this.socket.emit(event, data);
    } else {
      console.error('❌ Socket이 연결되지 않음. 이벤트 발행 실패:', event);
    }
  }

  // Socket 메서드들
  joinRoom(chatRoomId: string) {
    console.log('🚪 채팅방 입장 요청:', chatRoomId);
    return this.emit('joinRoom', { chatRoomId });
  }

  leaveRoom(chatRoomId: string) {
    console.log('👋 채팅방 나가기:', chatRoomId);
    return this.emit('leaveRoom', { chatRoomId });
  }

  sendMessageSocket(chatRoomId: string, content: string, type: 'TEXT' | 'IMAGE' | 'FILE' = 'TEXT') {
    console.log('📤 Socket으로 메시지 전송:', { chatRoomId, content, type });
    return this.emit('sendMessage', { chatRoomId, content, type });
  }

  sendTyping(chatRoomId: string, isTyping: boolean) {
    return this.emit('typing', { chatRoomId, isTyping });
  }

  markAsReadSocket(chatRoomId: string) {
    console.log('👁️ 메시지 읽음 처리:', chatRoomId);
    return this.emit('markAsRead', { chatRoomId });
  }

  // REST API 메서드들

  // 채팅방 생성 또는 찾기
  async createOrFindChatRoom(sellerId: string, productId: string): Promise<ChatRoom> {
    try {
      const response = await api.post(`${this.baseURL}/rooms`, {
        sellerId,
        productId,
      });
      return response.data;
    } catch (error) {
      console.error('채팅방 생성/조회 실패:', error);
      throw error;
    }
  }

  // 채팅방 목록 조회
  async getChatRooms(): Promise<ChatRoom[]> {
    try {
      const response = await api.get(`${this.baseURL}/rooms`);
      return response.data;
    } catch (error) {
      console.error('채팅방 목록 조회 실패:', error);
      throw error;
    }
  }

  // 특정 채팅방 조회
  async getChatRoom(chatRoomId: string): Promise<ChatRoom> {
    try {
      const response = await api.get(`${this.baseURL}/rooms/${chatRoomId}`);
      return response.data;
    } catch (error) {
      console.error('채팅방 조회 실패:', error);
      throw error;
    }
  }

  // 채팅방 메시지 목록 조회
  async getMessages(chatRoomId: string, page: number = 1, limit: number = 50): Promise<MessagesResponse> {
    try {
      const response = await api.get(`${this.baseURL}/rooms/${chatRoomId}/messages`, {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error('메시지 목록 조회 실패:', error);
      throw error;
    }
  }

  // 메시지 전송 (REST API)
  async sendMessage(chatRoomId: string, content: string, type: 'TEXT' | 'IMAGE' | 'FILE' = 'TEXT'): Promise<ChatMessage> {
    try {
      const response = await api.post(`${this.baseURL}/rooms/${chatRoomId}/messages`, {
        content,
        type,
      });
      return response.data;
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      throw error;
    }
  }

  // 메시지 읽음 처리 (REST API)
  async markAsRead(chatRoomId: string): Promise<{ message: string }> {
    try {
      const response = await api.post(`${this.baseURL}/rooms/${chatRoomId}/read`);
      return response.data;
    } catch (error) {
      console.error('메시지 읽음 처리 실패:', error);
      throw error;
    }
  }

  // 채팅방 삭제
  async deleteChatRoom(chatRoomId: string): Promise<{ message: string }> {
    try {
      const response = await api.delete(`${this.baseURL}/rooms/${chatRoomId}`);
      return response.data;
    } catch (error) {
      console.error('채팅방 삭제 실패:', error);
      throw error;
    }
  }

  // 연결 상태 확인
  get isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const ChatService = new ChatServiceClass(); 