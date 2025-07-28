import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  // 채팅방 생성 또는 찾기
  async findOrCreateChatRoom(sellerId: string, buyerId: string, productId: string) {
    // 이미 존재하는 채팅방 찾기
    let chatRoom = await this.prisma.chatRoom.findFirst({
      where: {
        sellerId,
        buyerId,
        productId,
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            images: true,
            mainImageIndex: true,
            status: true,
          },
        },
        seller: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
        buyer: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    // 채팅방이 없으면 새로 생성
    if (!chatRoom) {
      chatRoom = await this.prisma.chatRoom.create({
        data: {
          sellerId,
          buyerId,
          productId,
        },
        include: {
          product: {
            select: {
              id: true,
              title: true,
              price: true,
              images: true,
              mainImageIndex: true,
              status: true,
            },
          },
          seller: {
            select: {
              id: true,
              username: true,
              profileImage: true,
            },
          },
          buyer: {
            select: {
              id: true,
              username: true,
              profileImage: true,
            },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });
    }

    return chatRoom;
  }

  // 사용자의 채팅방 목록 조회
  async getChatRooms(userId: string) {
    const chatRooms = await this.prisma.chatRoom.findMany({
      where: {
        OR: [
          { sellerId: userId },
          { buyerId: userId },
        ],
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            images: true,
            mainImageIndex: true,
            status: true,
          },
        },
        seller: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
        buyer: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            messages: {
              where: {
                senderId: { not: userId },
                isRead: false,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return chatRooms.map(room => ({
      ...room,
      unreadCount: room._count.messages,
      otherUser: room.sellerId === userId ? room.buyer : room.seller,
      lastMessage: room.messages[0] || null,
    }));
  }

  // 특정 채팅방 조회
  async getChatRoom(chatRoomId: string, userId: string) {
    console.log('🏠 채팅방 조회 시작:', { chatRoomId, userId });
    
    const chatRoom = await this.prisma.chatRoom.findUnique({
      where: { id: chatRoomId },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            images: true,
            mainImageIndex: true,
            status: true,
          },
        },
        seller: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
        buyer: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
      },
    });

    if (!chatRoom) {
      console.log('❌ 채팅방을 찾을 수 없음:', chatRoomId);
      throw new NotFoundException('채팅방을 찾을 수 없습니다.');
    }

    console.log('📊 채팅방 정보:', {
      id: chatRoom.id,
      sellerId: chatRoom.sellerId,
      buyerId: chatRoom.buyerId,
      seller: chatRoom.seller,
      buyer: chatRoom.buyer,
    });

    // 참여자 확인
    if (chatRoom.sellerId !== userId && chatRoom.buyerId !== userId) {
      console.log('❌ 채팅방 접근 권한 없음:', { sellerId: chatRoom.sellerId, buyerId: chatRoom.buyerId, userId });
      throw new ForbiddenException('채팅방에 접근할 권한이 없습니다.');
    }

    const otherUser = chatRoom.sellerId === userId ? chatRoom.buyer : chatRoom.seller;
    console.log('👥 otherUser 설정:', { userId, sellerId: chatRoom.sellerId, otherUser });

    const result = {
      ...chatRoom,
      otherUser,
    };

    console.log('✅ 채팅방 조회 성공, otherUser ID:', result.otherUser.id);
    return result;
  }

  // 채팅방의 메시지 목록 조회
  async getMessages(chatRoomId: string, userId: string, page: number = 1, limit: number = 50) {
    // 채팅방 참여자 확인
    const chatRoom = await this.prisma.chatRoom.findUnique({
      where: { id: chatRoomId },
      select: { sellerId: true, buyerId: true },
    });

    if (!chatRoom) {
      throw new NotFoundException('채팅방을 찾을 수 없습니다.');
    }

    if (chatRoom.sellerId !== userId && chatRoom.buyerId !== userId) {
      throw new ForbiddenException('채팅방에 접근할 권한이 없습니다.');
    }

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      this.prisma.chatMessage.findMany({
        where: { chatRoomId },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              profileImage: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      this.prisma.chatMessage.count({
        where: { chatRoomId },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: messages.reverse(), // 최신 메시지가 아래로 오도록
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  // 메시지 전송
  async sendMessage(chatRoomId: string, senderId: string, content: string, type: 'TEXT' | 'IMAGE' | 'FILE' = 'TEXT') {
    // 채팅방 참여자 확인
    const chatRoom = await this.prisma.chatRoom.findUnique({
      where: { id: chatRoomId },
      select: { sellerId: true, buyerId: true },
    });

    if (!chatRoom) {
      throw new NotFoundException('채팅방을 찾을 수 없습니다.');
    }

    if (chatRoom.sellerId !== senderId && chatRoom.buyerId !== senderId) {
      throw new ForbiddenException('채팅방에 접근할 권한이 없습니다.');
    }

    // 메시지 생성
    const message = await this.prisma.chatMessage.create({
      data: {
        chatRoomId,
        senderId,
        content,
        type,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
      },
    });

    // 채팅방 업데이트 시간 갱신
    await this.prisma.chatRoom.update({
      where: { id: chatRoomId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  // 메시지 읽음 처리
  async markMessagesAsRead(chatRoomId: string, userId: string) {
    const chatRoom = await this.prisma.chatRoom.findUnique({
      where: { id: chatRoomId },
      select: { sellerId: true, buyerId: true },
    });

    if (!chatRoom) {
      throw new NotFoundException('채팅방을 찾을 수 없습니다.');
    }

    if (chatRoom.sellerId !== userId && chatRoom.buyerId !== userId) {
      throw new ForbiddenException('채팅방에 접근할 권한이 없습니다.');
    }

    // 내가 보내지 않은 메시지들을 읽음 처리
    await this.prisma.chatMessage.updateMany({
      where: {
        chatRoomId,
        senderId: { not: userId },
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }

  // 채팅방 삭제 (소프트 삭제)
  async deleteChatRoom(chatRoomId: string, userId: string) {
    const chatRoom = await this.prisma.chatRoom.findUnique({
      where: { id: chatRoomId },
      select: { sellerId: true, buyerId: true },
    });

    if (!chatRoom) {
      throw new NotFoundException('채팅방을 찾을 수 없습니다.');
    }

    if (chatRoom.sellerId !== userId && chatRoom.buyerId !== userId) {
      throw new ForbiddenException('채팅방에 접근할 권한이 없습니다.');
    }

    // TODO: 실제로는 소프트 삭제나 사용자별 삭제 상태 관리 필요
    await this.prisma.chatRoom.delete({
      where: { id: chatRoomId },
    });

    return { message: '채팅방이 삭제되었습니다.' };
  }
} 