import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('System')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: '서버 상태 확인',
    description: `
    API 서버의 기본 상태를 확인합니다.
    
    **사용 방법:**
    - 서버가 정상적으로 작동하는지 확인
    - 헬스체크 용도로 사용
    - 인증 없이 접근 가능
    
    **프론트엔드 처리:**
    - 앱 시작시 서버 연결 상태 확인
    - 주기적인 연결 상태 모니터링
    - 네트워크 오류 디버깅용
    `,
  })
  @ApiResponse({
    status: 200,
    description: '서버 정상 작동 중',
    schema: {
      type: 'string',
      example: 'Hello World!',
    },
  })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('api/v1/health')
  @ApiOperation({
    summary: '헬스체크 엔드포인트',
    description: '배포 플랫폼에서 서버 상태를 확인하기 위한 헬스체크 엔드포인트',
  })
  @ApiResponse({
    status: 200,
    description: '서버 정상 작동 중',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        uptime: { type: 'number', example: 123.456 },
      },
    },
  })
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
