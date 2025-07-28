import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
  Body,
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
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Favorites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post(':productId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '상품 찜하기',
    description: '특정 상품을 찜 목록에 추가합니다.',
  })
  @ApiParam({
    name: 'productId',
    description: '찜할 상품의 ID',
    example: 'clxyz123456789',
  })
  @ApiResponse({
    status: 201,
    description: '찜하기 성공',
    schema: {
      example: {
        message: '찜 목록에 추가되었습니다.',
        favorite: {
          id: 'clxyz123456789',
          userId: 'user123',
          productId: 'product123',
          createdAt: '2024-01-01T00:00:00.000Z',
          product: {
            id: 'product123',
            title: '아이폰 15 Pro',
            price: 1200000,
            // ... 기타 상품 정보
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '상품을 찾을 수 없음',
  })
  @ApiResponse({
    status: 409,
    description: '이미 찜한 상품이거나 자신의 상품',
  })
  async addToFavorites(@Request() req: any, @Param('productId') productId: string) {
    return this.favoritesService.addToFavorites(req.user.id, productId);
  }

  @Delete(':productId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '상품 찜하기 해제',
    description: '특정 상품을 찜 목록에서 제거합니다.',
  })
  @ApiParam({
    name: 'productId',
    description: '찜 해제할 상품의 ID',
    example: 'clxyz123456789',
  })
  @ApiResponse({
    status: 200,
    description: '찜하기 해제 성공',
    schema: {
      example: {
        message: '찜 목록에서 제거되었습니다.',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '찜한 상품이 아님',
  })
  async removeFromFavorites(@Request() req: any, @Param('productId') productId: string) {
    return this.favoritesService.removeFromFavorites(req.user.id, productId);
  }

  @Get()
  @ApiOperation({
    summary: '찜 목록 조회',
    description: '사용자의 찜한 상품 목록을 조회합니다.',
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
    description: '페이지당 항목 수 (기본값: 10)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: '찜 목록 조회 성공',
    schema: {
      example: {
        data: [
          {
            id: 'product123',
            title: '아이폰 15 Pro',
            price: 1200000,
            location: '서울시 강남구',
            images: ['image1.jpg', 'image2.jpg'],
            mainImageIndex: 0,
            status: 'AVAILABLE',
            // ... 기타 상품 정보
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 5,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      },
    },
  })
  async getFavorites(
    @Request() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.favoritesService.getFavorites(
      req.user.id,
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
    );
  }

  @Get(':productId/status')
  @ApiOperation({
    summary: '상품 찜 상태 확인',
    description: '특정 상품의 찜 상태를 확인합니다.',
  })
  @ApiParam({
    name: 'productId',
    description: '확인할 상품의 ID',
    example: 'clxyz123456789',
  })
  @ApiResponse({
    status: 200,
    description: '찜 상태 확인 성공',
    schema: {
      example: {
        isFavorite: true,
      },
    },
  })
  async getFavoriteStatus(@Request() req: any, @Param('productId') productId: string) {
    const isFavorite = await this.favoritesService.isFavorite(req.user.id, productId);
    return { isFavorite };
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '여러 상품 찜하기 해제',
    description: '여러 상품을 한번에 찜 목록에서 제거합니다.',
  })
  @ApiBody({
    description: '제거할 상품 ID 목록',
    schema: {
      type: 'object',
      properties: {
        productIds: {
          type: 'array',
          items: { type: 'string' },
          example: ['product1', 'product2', 'product3'],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '여러 상품 찜하기 해제 성공',
    schema: {
      example: {
        message: '3개의 상품이 찜 목록에서 제거되었습니다.',
        removedCount: 3,
      },
    },
  })
  async removeMultipleFromFavorites(
    @Request() req: any,
    @Body() body: { productIds: string[] },
  ) {
    return this.favoritesService.removeMultipleFromFavorites(req.user.id, body.productIds);
  }
} 