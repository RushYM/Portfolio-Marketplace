import { IsString, IsNumber, IsEnum, IsArray, IsOptional, Min, Max, MaxLength, MinLength, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProductCategory, ProductCondition } from '@prisma/client';

export class CreateProductDto {
  @ApiProperty({
    description: '상품 제목',
    example: '아이폰 14 Pro 128GB 딥퍼플',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: '상품 제목은 문자열이어야 합니다.' })
  @MinLength(2, { message: '상품 제목은 최소 2자 이상이어야 합니다.' })
  @MaxLength(100, { message: '상품 제목은 최대 100자까지 가능합니다.' })
  title: string;

  @ApiProperty({
    description: '상품 설명',
    example: '깨끗하게 사용한 아이폰 14 Pro입니다. 케이스와 필름 적용하여 사용했고 스크래치 거의 없습니다.',
    minLength: 10,
    maxLength: 2000,
  })
  @IsString({ message: '상품 설명은 문자열이어야 합니다.' })
  @MinLength(10, { message: '상품 설명은 최소 10자 이상이어야 합니다.' })
  @MaxLength(2000, { message: '상품 설명은 최대 2000자까지 가능합니다.' })
  description: string;

  @ApiProperty({
    description: '상품 가격 (원 단위)',
    example: 850000,
    minimum: 100,
    maximum: 99999999,
  })
  @IsNumber({}, { message: '가격은 숫자여야 합니다.' })
  @Min(100, { message: '가격은 최소 100원 이상이어야 합니다.' })
  @Max(99999999, { message: '가격은 최대 99,999,999원까지 가능합니다.' })
  price: number;

  @ApiProperty({
    description: '상품 이미지 URL 배열',
    example: [
      'http://localhost:3001/uploads/products/product-1640995200000-123456789.jpg',
      'http://localhost:3001/uploads/products/product-1640995200001-987654321.png'
    ],
    type: [String],
    maxItems: 10,
  })
  @IsArray({ message: '이미지는 배열 형태여야 합니다.' })
  @IsString({ each: true, message: '각 이미지는 문자열(URL)이어야 합니다.' })
  @MaxLength(500, { each: true, message: '각 이미지 URL은 최대 500자까지 가능합니다.' })
  images: string[];

  @ApiProperty({
    description: '메인 이미지 인덱스 (0부터 시작)',
    example: 0,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: '메인 이미지 인덱스는 정수여야 합니다.' })
  @Min(0, { message: '메인 이미지 인덱스는 0 이상이어야 합니다.' })
  mainImageIndex?: number;

  @ApiProperty({
    description: '상품 카테고리',
    enum: ProductCategory,
    example: ProductCategory.ELECTRONICS,
    enumName: 'ProductCategory',
  })
  @IsEnum(ProductCategory, { message: '올바른 카테고리를 선택해주세요.' })
  category: ProductCategory;

  @ApiProperty({
    description: '상품 상태/컨디션',
    enum: ProductCondition,
    example: ProductCondition.GOOD,
    enumName: 'ProductCondition',
  })
  @IsEnum(ProductCondition, { message: '올바른 상품 상태를 선택해주세요.' })
  condition: ProductCondition;

  @ApiProperty({
    description: '거래 희망 지역',
    example: '서울시 강남구',
    maxLength: 100,
  })
  @IsString({ message: '거래 지역은 문자열이어야 합니다.' })
  @MaxLength(100, { message: '거래 지역은 최대 100자까지 가능합니다.' })
  location: string;

  @ApiProperty({
    description: '위도 (선택사항)',
    example: 37.5665,
    required: false,
    minimum: -90,
    maximum: 90,
  })
  @IsOptional()
  @IsNumber({}, { message: '위도는 숫자여야 합니다.' })
  @Min(-90, { message: '위도는 -90 이상이어야 합니다.' })
  @Max(90, { message: '위도는 90 이하여야 합니다.' })
  latitude?: number;

  @ApiProperty({
    description: '경도 (선택사항)',
    example: 126.9780,
    required: false,
    minimum: -180,
    maximum: 180,
  })
  @IsOptional()
  @IsNumber({}, { message: '경도는 숫자여야 합니다.' })
  @Min(-180, { message: '경도는 -180 이상이어야 합니다.' })
  @Max(180, { message: '경도는 180 이하여야 합니다.' })
  longitude?: number;
} 