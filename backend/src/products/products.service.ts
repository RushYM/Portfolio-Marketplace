import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { ProductStatus } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  // 상품 생성
  async create(createProductDto: CreateProductDto, sellerId: string) {
    return this.prisma.product.create({
      data: {
        ...createProductDto,
        sellerId,
      },
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            profileImage: true,
            location: true,
            rating: true,
            isVerified: true,
          },
        },
        _count: {
          select: {
            favorites: true,
          },
        },
      },
    });
  }

  // 상품 목록 조회 (검색, 필터링, 페이지네이션)
  async findAll(query: ProductQueryDto) {
    const {
      search,
      category,
      condition,
      status = ProductStatus.AVAILABLE,
      minPrice,
      maxPrice,
      location,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = query;

    // 검색 조건 구성
    const where: any = {
      status: status,
    };

    // 키워드 검색
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // 카테고리 필터
    if (category) {
      where.category = category;
    }

    // 상품 상태 필터
    if (condition) {
      where.condition = condition;
    }

    // 가격 범위 필터
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    // 지역 필터
    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    // 정렬 설정
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // 페이지네이션 설정
    const skip = (page - 1) * limit;

    // 데이터 조회
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          seller: {
            select: {
              id: true,
              username: true,
              profileImage: true,
              location: true,
              rating: true,
              isVerified: true,
            },
          },
          _count: {
            select: {
              favorites: true,
            },
          },
        },
        orderBy,
        skip,
        take: Number(limit),
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  // 상품 상세 조회
  async findOne(id: string, viewerId?: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            profileImage: true,
            location: true,
            rating: true,
            ratingCount: true,
            isVerified: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            favorites: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('상품을 찾을 수 없습니다.');
    }

    // 조회수 증가 (본인 상품이 아닌 경우만)
    if (viewerId && product.sellerId !== viewerId) {
      await this.prisma.product.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      });
      product.viewCount += 1;
    }

    return product;
  }

  // 상품 수정
  async update(id: string, updateProductDto: UpdateProductDto, sellerId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('상품을 찾을 수 없습니다.');
    }

    if (product.sellerId !== sellerId) {
      throw new ForbiddenException('본인의 상품만 수정할 수 있습니다.');
    }

    // 판매 완료된 상품은 상태 변경만 가능
    if (product.status === ProductStatus.SOLD && updateProductDto.status !== ProductStatus.SOLD) {
      throw new BadRequestException('판매 완료된 상품은 상태 변경만 가능합니다.');
    }

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            profileImage: true,
            location: true,
            rating: true,
            isVerified: true,
          },
        },
        _count: {
          select: {
            favorites: true,
          },
        },
      },
    });
  }

  // 상품 삭제 (소프트 삭제)
  async remove(id: string, sellerId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('상품을 찾을 수 없습니다.');
    }

    if (product.sellerId !== sellerId) {
      throw new ForbiddenException('본인의 상품만 삭제할 수 있습니다.');
    }

    return this.prisma.product.update({
      where: { id },
      data: { status: ProductStatus.DELETED },
      select: {
        id: true,
        title: true,
        status: true,
      },
    });
  }

  // 사용자별 상품 조회
  async findByUser(userId: string, query: ProductQueryDto) {
    console.log('🛍️ 사용자별 상품 조회 시작:', { userId, query });
    
    const {
      status,
      category,
      condition,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = query;

    const where: any = {
      sellerId: userId,
    };

    // 상태 필터
    if (status) {
      where.status = status;
    }

    // 카테고리 필터
    if (category) {
      where.category = category;
    }

    // 상품 상태 필터
    if (condition) {
      where.condition = condition;
    }

    console.log('🔍 조회 조건:', where);

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          seller: {
            select: {
              id: true,
              username: true,
              profileImage: true,
              location: true,
              rating: true,
              isVerified: true,
            },
          },
          _count: {
            select: {
              favorites: true,
            },
          },
        },
        orderBy,
        skip,
        take: Number(limit),
      }),
      this.prisma.product.count({ where }),
    ]);

    console.log('✅ 사용자별 상품 조회 완료:', { 
      userId, 
      foundCount: products.length, 
      totalCount: total 
    });

    return {
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  // 인기 상품 조회
  async findPopular(limit = 10) {
    return this.prisma.product.findMany({
      where: {
        status: ProductStatus.AVAILABLE,
      },
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            profileImage: true,
            location: true,
            rating: true,
            isVerified: true,
          },
        },
        _count: {
          select: {
            favorites: true,
          },
        },
      },
      orderBy: [
        { likeCount: 'desc' },
        { viewCount: 'desc' },
        { createdAt: 'desc' },
      ],
      take: Number(limit),
    });
  }

  // 최신 상품 조회
  async findRecent(limit = 10) {
    return this.prisma.product.findMany({
      where: {
        status: ProductStatus.AVAILABLE,
      },
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            profileImage: true,
            location: true,
            rating: true,
            isVerified: true,
          },
        },
        _count: {
          select: {
            favorites: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: Number(limit),
    });
  }
} 