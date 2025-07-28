import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  // 상품을 찜하기
  async addToFavorites(userId: string, productId: string) {
    // 상품 존재 여부 확인
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('상품을 찾을 수 없습니다.');
    }

    // 자신의 상품인지 확인
    if (product.sellerId === userId) {
      throw new ConflictException('자신의 상품은 찜할 수 없습니다.');
    }

    // 이미 찜한 상품인지 확인
    const existingFavorite = await this.prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existingFavorite) {
      throw new ConflictException('이미 찜한 상품입니다.');
    }

    // 찜하기 추가
    const favorite = await this.prisma.favorite.create({
      data: {
        userId,
        productId,
      },
      include: {
        product: {
          include: {
            seller: {
              select: {
                id: true,
                username: true,
                profileImage: true,
                rating: true,
                location: true,
              },
            },
            _count: {
              select: {
                favorites: true,
              },
            },
          },
        },
      },
    });

    return {
      message: '찜 목록에 추가되었습니다.',
      favorite,
    };
  }

  // 찜하기 제거
  async removeFromFavorites(userId: string, productId: string) {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (!favorite) {
      throw new NotFoundException('찜한 상품이 아닙니다.');
    }

    await this.prisma.favorite.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    return {
      message: '찜 목록에서 제거되었습니다.',
    };
  }

  // 찜 목록 조회
  async getFavorites(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [favorites, total] = await Promise.all([
      this.prisma.favorite.findMany({
        where: { userId },
        include: {
          product: {
            include: {
              seller: {
                select: {
                  id: true,
                  username: true,
                  profileImage: true,
                  rating: true,
                  location: true,
                },
              },
              _count: {
                select: {
                  favorites: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      this.prisma.favorite.count({
        where: { userId },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: favorites.map(favorite => favorite.product),
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

  // 특정 상품의 찜 상태 확인
  async isFavorite(userId: string, productId: string): Promise<boolean> {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    return !!favorite;
  }

  // 상품별 찜 개수 조회
  async getFavoriteCount(productId: string): Promise<number> {
    return this.prisma.favorite.count({
      where: { productId },
    });
  }

  // 사용자의 찜 목록에서 여러 상품 제거
  async removeMultipleFromFavorites(userId: string, productIds: string[]) {
    const result = await this.prisma.favorite.deleteMany({
      where: {
        userId,
        productId: {
          in: productIds,
        },
      },
    });

    return {
      message: `${result.count}개의 상품이 찜 목록에서 제거되었습니다.`,
      removedCount: result.count,
    };
  }
} 