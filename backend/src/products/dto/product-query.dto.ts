import { IsOptional, IsString, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ProductCategory, ProductCondition, ProductStatus } from '@prisma/client';

export class ProductQueryDto {
  @ApiProperty({
    description: '검색 키워드 (제목, 설명에서 검색)',
    example: '아이폰',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '검색어는 문자열이어야 합니다.' })
  search?: string;

  @ApiProperty({
    description: '상품 카테고리 필터',
    enum: ProductCategory,
    required: false,
    enumName: 'ProductCategory',
  })
  @IsOptional()
  @IsEnum(ProductCategory, { message: '올바른 카테고리를 선택해주세요.' })
  category?: ProductCategory;

  @ApiProperty({
    description: '상품 상태 필터',
    enum: ProductCondition,
    required: false,
    enumName: 'ProductCondition',
  })
  @IsOptional()
  @IsEnum(ProductCondition, { message: '올바른 상품 상태를 선택해주세요.' })
  condition?: ProductCondition;

  @ApiProperty({
    description: '판매 상태 필터',
    enum: ProductStatus,
    required: false,
    enumName: 'ProductStatus',
  })
  @IsOptional()
  @IsEnum(ProductStatus, { message: '올바른 판매 상태를 선택해주세요.' })
  status?: ProductStatus;

  @ApiProperty({
    description: '최소 가격',
    example: 10000,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '최소 가격은 숫자여야 합니다.' })
  @Min(0, { message: '최소 가격은 0 이상이어야 합니다.' })
  minPrice?: number;

  @ApiProperty({
    description: '최대 가격',
    example: 1000000,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '최대 가격은 숫자여야 합니다.' })
  @Min(0, { message: '최대 가격은 0 이상이어야 합니다.' })
  maxPrice?: number;

  @ApiProperty({
    description: '지역 필터',
    example: '강남구',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '지역은 문자열이어야 합니다.' })
  location?: string;

  @ApiProperty({
    description: '정렬 기준',
    enum: ['createdAt', 'price', 'viewCount', 'likeCount'],
    example: 'createdAt',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '정렬 기준은 문자열이어야 합니다.' })
  sortBy?: 'createdAt' | 'price' | 'viewCount' | 'likeCount';

  @ApiProperty({
    description: '정렬 순서',
    enum: ['asc', 'desc'],
    example: 'desc',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '정렬 순서는 문자열이어야 합니다.' })
  sortOrder?: 'asc' | 'desc';

  @ApiProperty({
    description: '페이지 번호 (1부터 시작)',
    example: 1,
    required: false,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '페이지 번호는 숫자여야 합니다.' })
  @Min(1, { message: '페이지 번호는 1 이상이어야 합니다.' })
  page?: number;

  @ApiProperty({
    description: '페이지당 항목 수',
    example: 20,
    required: false,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '페이지당 항목 수는 숫자여야 합니다.' })
  @Min(1, { message: '페이지당 항목 수는 1 이상이어야 합니다.' })
  @Max(100, { message: '페이지당 항목 수는 100 이하여야 합니다.' })
  limit?: number;
} 