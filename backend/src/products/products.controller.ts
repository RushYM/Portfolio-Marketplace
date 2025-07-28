import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';


@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '새 상품 등록',
    description: '로그인한 사용자가 새로운 상품을 등록합니다. 이미지는 사전에 업로드되어 URL로 전달되어야 합니다.',
  })
  @ApiBody({
    type: CreateProductDto,
    description: '등록할 상품 정보',
    examples: {
      example1: {
        summary: '전자기기 상품 등록 예시',
        value: {
          title: '아이폰 14 Pro 128GB 딥퍼플',
          description: '깨끗하게 사용한 아이폰 14 Pro입니다. 케이스와 필름 적용하여 사용했고 스크래치 거의 없습니다. 배터리 효율 95% 이상입니다.',
          price: 850000,
          images: [
            'https://example.com/iphone14pro_1.jpg',
            'https://example.com/iphone14pro_2.jpg'
          ],
          category: 'ELECTRONICS',
          condition: 'GOOD',
          location: '서울시 강남구',
          latitude: 37.5665,
          longitude: 126.9780
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: '상품이 성공적으로 등록되었습니다.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'cuid123456789' },
        title: { type: 'string', example: '아이폰 14 Pro 128GB 딥퍼플' },
        description: { type: 'string', example: '깨끗하게 사용한 아이폰...' },
        price: { type: 'number', example: 850000 },
        images: { type: 'array', items: { type: 'string' } },
        category: { type: 'string', example: 'ELECTRONICS' },
        condition: { type: 'string', example: 'GOOD' },
        status: { type: 'string', example: 'AVAILABLE' },
        location: { type: 'string', example: '서울시 강남구' },
        viewCount: { type: 'number', example: 0 },
        likeCount: { type: 'number', example: 0 },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        seller: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            username: { type: 'string' },
            profileImage: { type: 'string' },
            location: { type: 'string' },
            rating: { type: 'number' },
            isVerified: { type: 'boolean' }
          }
        },
        _count: {
          type: 'object',
          properties: {
            favorites: { type: 'number', example: 0 }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 데이터입니다.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'array', items: { type: 'string' }, example: ['상품 제목은 최소 2자 이상이어야 합니다.'] },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: '인증이 필요합니다.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  create(@Body() createProductDto: CreateProductDto, @Request() req: any) {
    return this.productsService.create(createProductDto, req.user.id);
  }

  @Get()
  @ApiOperation({
    summary: '상품 목록 조회',
    description: '조건에 따라 상품 목록을 조회합니다. 검색, 필터링, 정렬, 페이지네이션을 지원합니다.',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: '검색 키워드 (상품 제목, 설명에서 검색)',
    example: '아이폰'
  })
  @ApiQuery({
    name: 'category',
    required: false,
    enum: ['ELECTRONICS', 'FASHION', 'HOME', 'BOOKS', 'SPORTS', 'BEAUTY', 'TOYS', 'OTHER'],
    description: '상품 카테고리 필터'
  })
  @ApiQuery({
    name: 'condition',
    required: false,
    enum: ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR'],
    description: '상품 상태 필터'
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['AVAILABLE', 'RESERVED', 'SOLD', 'DELETED'],
    description: '판매 상태 필터 (기본값: AVAILABLE)'
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    type: 'number',
    description: '최소 가격',
    example: 10000
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    type: 'number',
    description: '최대 가격',
    example: 1000000
  })
  @ApiQuery({
    name: 'location',
    required: false,
    description: '지역 필터',
    example: '강남구'
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'price', 'viewCount', 'likeCount'],
    description: '정렬 기준 (기본값: createdAt)'
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: '정렬 순서 (기본값: desc)'
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: 'number',
    description: '페이지 번호 (기본값: 1)',
    example: 1
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'number',
    description: '페이지당 항목 수 (기본값: 20, 최대: 100)',
    example: 20
  })
  @ApiResponse({
    status: 200,
    description: '상품 목록이 성공적으로 조회되었습니다.',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              price: { type: 'number' },
              images: { type: 'array', items: { type: 'string' } },
              category: { type: 'string' },
              condition: { type: 'string' },
              status: { type: 'string' },
              location: { type: 'string' },
              viewCount: { type: 'number' },
              likeCount: { type: 'number' },
              createdAt: { type: 'string', format: 'date-time' },
              seller: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  username: { type: 'string' },
                  profileImage: { type: 'string' },
                  rating: { type: 'number' }
                }
              },
              _count: {
                type: 'object',
                properties: {
                  favorites: { type: 'number' }
                }
              }
            }
          }
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 20 },
            total: { type: 'number', example: 150 },
            totalPages: { type: 'number', example: 8 },
            hasNext: { type: 'boolean', example: true },
            hasPrev: { type: 'boolean', example: false }
          }
        }
      }
    }
  })
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get('popular')
  @ApiOperation({
    summary: '인기 상품 조회',
    description: '좋아요 수와 조회수를 기준으로 인기 상품을 조회합니다.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'number',
    description: '조회할 상품 수 (기본값: 10)',
    example: 10
  })
  @ApiResponse({
    status: 200,
    description: '인기 상품이 성공적으로 조회되었습니다.',
  })
  findPopular(@Query('limit') limit?: number) {
    return this.productsService.findPopular(limit);
  }

  @Get('recent')
  @ApiOperation({
    summary: '최신 상품 조회',
    description: '최근 등록된 상품을 조회합니다.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'number',
    description: '조회할 상품 수 (기본값: 10)',
    example: 10
  })
  @ApiResponse({
    status: 200,
    description: '최신 상품이 성공적으로 조회되었습니다.',
  })
  findRecent(@Query('limit') limit?: number) {
    return this.productsService.findRecent(limit);
  }

  @Get('user/:userId')
  @ApiOperation({
    summary: '사용자별 상품 목록 조회',
    description: `
    특정 사용자가 등록한 상품 목록을 조회합니다.
    
    **쿼리 파라미터:**
    - page: 페이지 번호 (기본값: 1)
    - limit: 페이지당 상품 수 (기본값: 20)
    - status: 상품 상태 필터 (AVAILABLE, RESERVED, SOLD)
    - category: 카테고리 필터
    - condition: 상품 상태 필터 (NEW, LIKE_NEW, GOOD, FAIR, POOR)
    
    **응답:**
    - 상품 목록 (판매자 정보 포함)
    - 페이지네이션 정보
    - 총 상품 수
    `,
  })
  @ApiParam({
    name: 'userId',
    description: '상품을 조회할 사용자의 고유 ID',
    example: 'uuid-string',
  })
  @ApiQuery({
    name: 'page',
    description: '페이지 번호',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: '페이지당 상품 수',
    required: false,
    type: Number,
    example: 20,
  })
  @ApiQuery({
    name: 'status',
    description: '상품 상태 필터',
    required: false,
    enum: ['AVAILABLE', 'RESERVED', 'SOLD'],
    example: 'AVAILABLE',
  })
  @ApiQuery({
    name: 'category',
    description: '카테고리 필터',
    required: false,
    enum: ['ELECTRONICS', 'CLOTHING', 'BOOKS', 'HOME', 'SPORTS', 'BEAUTY', 'TOYS', 'OTHER'],
    example: 'ELECTRONICS',
  })
  @ApiQuery({
    name: 'condition',
    description: '상품 상태 필터',
    required: false,
    enum: ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR'],
    example: 'GOOD',
  })
  @ApiResponse({
    status: 200,
    description: '사용자별 상품 목록 조회 성공',
  })
  @ApiResponse({
    status: 404,
    description: '사용자를 찾을 수 없음',
  })
  async findByUser(
    @Param('userId') userId: string,
    @Query() query: ProductQueryDto,
  ) {
    console.log('🛍️ 사용자별 상품 조회 요청:', { userId, query });
    try {
      const result = await this.productsService.findByUser(userId, query);
      console.log('✅ 사용자별 상품 조회 성공:', { userId, count: result.data.length });
      return result;
    } catch (error) {
      console.error('❌ 사용자별 상품 조회 실패:', error.message);
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: '상품 상세 조회',
    description: '특정 상품의 상세 정보를 조회합니다. 본인이 아닌 경우 조회수가 증가합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '조회할 상품의 ID',
    example: 'cuid123456789'
  })
  @ApiResponse({
    status: 200,
    description: '상품 상세 정보가 성공적으로 조회되었습니다.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        price: { type: 'number' },
        images: { type: 'array', items: { type: 'string' } },
        category: { type: 'string' },
        condition: { type: 'string' },
        status: { type: 'string' },
        location: { type: 'string' },
        latitude: { type: 'number' },
        longitude: { type: 'number' },
        viewCount: { type: 'number' },
        likeCount: { type: 'number' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        seller: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            username: { type: 'string' },
            profileImage: { type: 'string' },
            location: { type: 'string' },
            rating: { type: 'number' },
            ratingCount: { type: 'number' },
            isVerified: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        _count: {
          type: 'object',
          properties: {
            favorites: { type: 'number' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: '상품을 찾을 수 없습니다.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: '상품을 찾을 수 없습니다.' }
      }
    }
  })
  findOne(@Param('id') id: string, @Request() req?: any) {
    const viewerId = req?.user?.id;
    return this.productsService.findOne(id, viewerId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '상품 정보 수정',
    description: '본인이 등록한 상품의 정보를 수정합니다. 판매 완료된 상품은 상태 변경만 가능합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '수정할 상품의 ID',
    example: 'cuid123456789'
  })
  @ApiBody({
    type: UpdateProductDto,
    description: '수정할 상품 정보 (변경할 필드만 전송)',
    examples: {
      example1: {
        summary: '가격 수정 예시',
        value: {
          price: 800000
        }
      },
      example2: {
        summary: '상태 변경 예시',
        value: {
          status: 'SOLD'
        }
      },
      example3: {
        summary: '전체 정보 수정 예시',
        value: {
          title: '아이폰 14 Pro 128GB 딥퍼플 (급매)',
          description: '가격 협상 가능합니다. 직거래 환영합니다.',
          price: 800000,
          condition: 'GOOD',
          location: '서울시 서초구'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: '상품 정보가 성공적으로 수정되었습니다.',
  })
  @ApiResponse({
    status: 403,
    description: '본인의 상품만 수정할 수 있습니다.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: '본인의 상품만 수정할 수 있습니다.' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: '상품을 찾을 수 없습니다.',
  })
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req: any
  ) {
    return this.productsService.update(id, updateProductDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '상품 삭제',
    description: '본인이 등록한 상품을 삭제합니다. 실제로는 소프트 삭제되어 상태가 DELETED로 변경됩니다.',
  })
  @ApiParam({
    name: 'id',
    description: '삭제할 상품의 ID',
    example: 'cuid123456789'
  })
  @ApiResponse({
    status: 200,
    description: '상품이 성공적으로 삭제되었습니다.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'cuid123456789' },
        title: { type: 'string', example: '아이폰 14 Pro 128GB 딥퍼플' },
        status: { type: 'string', example: 'DELETED' }
      }
    }
  })
  @ApiResponse({
    status: 403,
    description: '본인의 상품만 삭제할 수 있습니다.',
  })
  @ApiResponse({
    status: 404,
    description: '상품을 찾을 수 없습니다.',
  })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.productsService.remove(id, req.user.id);
  }
} 