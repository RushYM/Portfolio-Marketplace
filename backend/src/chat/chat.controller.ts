import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('rooms')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '채팅방 생성 또는 찾기',
    description: '판매자와 구매자 간의 채팅방을 생성하거나 기존 채팅방을 찾습니다.',
  })
  @ApiBody({
    description: '채팅방 생성 정보',
    schema: {
      type: 'object',
      properties: {
        sellerId: { type: 'string', example: 'seller123' },
        productId: { type: 'string', example: 'product123' },
      },
      required: ['sellerId', 'productId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: '채팅방 생성/조회 성공',
    schema: {
      example: {
        id: 'chatroom123',
        sellerId: 'seller123',
        buyerId: 'buyer123',
        productId: 'product123',
        product: {
          id: 'product123',
          title: '아이폰 15 Pro',
          price: 1200000,
          images: ['image1.jpg'],
          mainImageIndex: 0,
          status: 'AVAILABLE',
        },
        seller: {
          id: 'seller123',
          username: '판매자',
          profileImage: null,
        },
        buyer: {
          id: 'buyer123',
          username: '구매자',
          profileImage: null,
        },
        messages: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  async createOrFindChatRoom(
    @Request() req: any,
    @Body() body: { sellerId: string; productId: string },
  ) {
    return this.chatService.findOrCreateChatRoom(
      body.sellerId,
      req.user.id, // buyerId는 현재 로그인한 사용자
      body.productId,
    );
  }

  @Get('rooms')
  @ApiOperation({
    summary: '채팅방 목록 조회',
    description: '사용자의 채팅방 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '채팅방 목록 조회 성공',
    schema: {
      example: [
        {
          id: 'chatroom123',
          sellerId: 'seller123',
          buyerId: 'buyer123',
          productId: 'product123',
          product: {
            id: 'product123',
            title: '아이폰 15 Pro',
            price: 1200000,
            images: ['image1.jpg'],
            mainImageIndex: 0,
            status: 'AVAILABLE',
          },
          otherUser: {
            id: 'seller123',
            username: '판매자',
            profileImage: null,
          },
          lastMessage: {
            id: 'message123',
            content: '안녕하세요!',
            createdAt: '2024-01-01T00:00:00.000Z',
          },
          unreadCount: 2,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ],
    },
  })
  async getChatRooms(@Request() req: any) {
    return this.chatService.getChatRooms(req.user.id);
  }

  @Get('rooms/:id')
  @ApiOperation({
    summary: '특정 채팅방 조회',
    description: '특정 채팅방의 정보를 조회합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '채팅방 ID',
    example: 'chatroom123',
  })
  @ApiResponse({
    status: 200,
    description: '채팅방 조회 성공',
    schema: {
      example: {
        id: 'chatroom123',
        sellerId: 'seller123',
        buyerId: 'buyer123',
        productId: 'product123',
        product: {
          id: 'product123',
          title: '아이폰 15 Pro',
          price: 1200000,
          images: ['image1.jpg'],
          mainImageIndex: 0,
          status: 'AVAILABLE',
        },
        otherUser: {
          id: 'seller123',
          username: '판매자',
          profileImage: null,
        },
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  async getChatRoom(@Request() req: any, @Param('id') chatRoomId: string) {
    return this.chatService.getChatRoom(chatRoomId, req.user.id);
  }

  @Get('rooms/:id/messages')
  @ApiOperation({
    summary: '채팅방 메시지 목록 조회',
    description: '특정 채팅방의 메시지 목록을 조회합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '채팅방 ID',
    example: 'chatroom123',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: '페이지 번호 (기본값: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: '페이지당 메시지 수 (기본값: 50)',
    example: 50,
  })
  @ApiResponse({
    status: 200,
    description: '메시지 목록 조회 성공',
    schema: {
      example: {
        data: [
          {
            id: 'message123',
            content: '안녕하세요!',
            type: 'TEXT',
            isRead: true,
            createdAt: '2024-01-01T00:00:00.000Z',
            sender: {
              id: 'user123',
              username: '사용자',
              profileImage: null,
            },
          },
        ],
        pagination: {
          page: 1,
          limit: 50,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      },
    },
  })
  async getMessages(
    @Request() req: any,
    @Param('id') chatRoomId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.chatService.getMessages(
      chatRoomId,
      req.user.id,
      page ? Number(page) : 1,
      limit ? Number(limit) : 50,
    );
  }

  @Post('rooms/:id/messages')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '메시지 전송',
    description: '채팅방에 메시지를 전송합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '채팅방 ID',
    example: 'chatroom123',
  })
  @ApiBody({
    description: '메시지 내용',
    schema: {
      type: 'object',
      properties: {
        content: { type: 'string', example: '안녕하세요!' },
        type: { 
          type: 'string', 
          enum: ['TEXT', 'IMAGE', 'FILE'],
          example: 'TEXT',
          default: 'TEXT',
        },
      },
      required: ['content'],
    },
  })
  @ApiResponse({
    status: 201,
    description: '메시지 전송 성공',
    schema: {
      example: {
        id: 'message123',
        content: '안녕하세요!',
        type: 'TEXT',
        isRead: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        sender: {
          id: 'user123',
          username: '사용자',
          profileImage: null,
        },
      },
    },
  })
  async sendMessage(
    @Request() req: any,
    @Param('id') chatRoomId: string,
    @Body() body: { content: string; type?: 'TEXT' | 'IMAGE' | 'FILE' },
  ) {
    return this.chatService.sendMessage(
      chatRoomId,
      req.user.id,
      body.content,
      body.type || 'TEXT',
    );
  }

  @Post('rooms/:id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '메시지 읽음 처리',
    description: '채팅방의 메시지들을 읽음 처리합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '채팅방 ID',
    example: 'chatroom123',
  })
  @ApiResponse({
    status: 200,
    description: '메시지 읽음 처리 성공',
    schema: {
      example: {
        message: '메시지가 읽음 처리되었습니다.',
      },
    },
  })
  async markMessagesAsRead(@Request() req: any, @Param('id') chatRoomId: string) {
    await this.chatService.markMessagesAsRead(chatRoomId, req.user.id);
    return { message: '메시지가 읽음 처리되었습니다.' };
  }

  @Delete('rooms/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '채팅방 삭제',
    description: '채팅방을 삭제합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '채팅방 ID',
    example: 'chatroom123',
  })
  @ApiResponse({
    status: 200,
    description: '채팅방 삭제 성공',
    schema: {
      example: {
        message: '채팅방이 삭제되었습니다.',
      },
    },
  })
  async deleteChatRoom(@Request() req: any, @Param('id') chatRoomId: string) {
    return this.chatService.deleteChatRoom(chatRoomId, req.user.id);
  }
} 