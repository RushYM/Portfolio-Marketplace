import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  @Post('images')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: require('multer').diskStorage({
        destination: './uploads/products',
        filename: (req: any, file: any, callback: any) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `product-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req: any, file: any, callback: any) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return callback(
            new BadRequestException('이미지 파일만 업로드 가능합니다. (jpg, jpeg, png, gif, webp)'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  @ApiOperation({
    summary: '상품 이미지 업로드',
    description: '상품 등록/수정 시 사용할 이미지 파일들을 업로드합니다. 최대 10개, 각 파일당 5MB 제한.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: '이미지 업로드 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '이미지 업로드가 완료되었습니다.' },
        data: {
          type: 'object',
          properties: {
            imageUrls: {
              type: 'array',
              items: { type: 'string' },
              example: [
                'http://localhost:3001/uploads/products/product-1640995200000-123456789.jpg',
                'http://localhost:3001/uploads/products/product-1640995200001-987654321.png'
              ]
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 파일 형식 또는 크기 초과',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: '이미지 파일만 업로드 가능합니다.' },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: '인증이 필요합니다.',
  })
  async uploadImages(@UploadedFiles() files: any[]) {
    console.log('=== 이미지 업로드 요청 ===');
    console.log('파일 개수:', files?.length || 0);
    console.log('파일 정보:', files?.map(f => ({ name: f.originalname, size: f.size, mimetype: f.mimetype })));
    
    if (!files || files.length === 0) {
      console.log('파일이 없음 - BadRequest 응답');
      throw new BadRequestException('업로드할 이미지 파일을 선택해주세요.');
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
    const imageUrls = files.map((file: any) => `${baseUrl}/uploads/products/${file.filename}`);

    console.log('업로드 성공:', imageUrls);

    return {
      success: true,
      message: '이미지 업로드가 완료되었습니다.',
      data: {
        imageUrls,
      },
    };
  }
} 