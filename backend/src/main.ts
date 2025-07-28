import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // 정적 파일 서빙 설정 (업로드된 이미지 파일들)
  const uploadsPath = join(__dirname, '..', '..', 'uploads');
  console.log('📁 정적 파일 서빙 경로:', uploadsPath);
  
  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads/',
    index: false, // 디렉토리 인덱싱 비활성화
  });


  app.enableCors();

  // API 버전 prefix
  app.setGlobalPrefix('api/v1');

  // Swagger 문서 설정
  const config = new DocumentBuilder()
    .setTitle('마켓플레이스 API')
    .setDescription('중고거래 플랫폼 API 문서')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'JWT 토큰을 입력하세요',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', '인증 관련 API')
    .addTag('Users', '사용자 관련 API')
    .addTag('Products', '상품 관련 API')
    .addTag('Chat', '채팅 관련 API')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // 새로고침 후에도 토큰 유지
    },
  });

  const port = configService.get<number>('PORT') || 3001;
  
  await app.listen(port);
  
  console.log(`🚀 서버가 http://localhost:${port}에서 실행 중입니다.`);
  console.log(`📚 API 문서는 http://localhost:${port}/api/docs에서 확인하세요.`);
}

bootstrap();
