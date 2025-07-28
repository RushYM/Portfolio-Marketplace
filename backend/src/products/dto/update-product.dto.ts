import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProductStatus } from '@prisma/client';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiProperty({
    description: '상품 판매 상태 (상품 소유자만 변경 가능)',
    enum: ProductStatus,
    example: ProductStatus.AVAILABLE,
    enumName: 'ProductStatus',
    required: false,
  })
  @IsOptional()
  @IsEnum(ProductStatus, { message: '올바른 상품 상태를 선택해주세요.' })
  status?: ProductStatus;
} 