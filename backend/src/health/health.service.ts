import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HealthService implements OnModuleInit {
  private readonly logger = new Logger(HealthService.name);
  private serverUrl: string;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    // 서버 URL 설정 (환경변수에서 가져오거나 기본값 사용)
    this.serverUrl = this.configService.get<string>('SERVER_URL') || 'http://localhost:3001';
    this.logger.log(`헬스체크 서비스가 초기화되었습니다. 서버 URL: ${this.serverUrl}`);
  }

  @Cron('*/30 * * * * *') // 30초마다 실행
  async performHealthCheck() {
    try {
      const healthUrl = `${this.serverUrl}/api/v1/health`;
      this.logger.debug(`헬스체크 요청 전송: ${healthUrl}`);
      
      const response = await axios.get(healthUrl, {
        timeout: 10000, // 10초 타임아웃
      });

      if (response.status === 200) {
        this.logger.debug('헬스체크 성공 - 서버가 정상 작동 중입니다.');
      } else {
        this.logger.warn(`헬스체크 실패 - 예상치 못한 상태 코드: ${response.status}`);
      }
    } catch (error) {
      this.logger.error(`헬스체크 실패: ${error.message}`);
      
      // 에러 상세 정보 로깅
      if (error.response) {
        this.logger.error(`응답 상태: ${error.response.status}`);
        this.logger.error(`응답 데이터: ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        this.logger.error('요청이 전송되었지만 응답을 받지 못했습니다.');
      } else {
        this.logger.error(`요청 설정 중 오류: ${error.message}`);
      }
    }
  }

  // 수동으로 헬스체크를 실행할 수 있는 메서드
  async manualHealthCheck(): Promise<boolean> {
    try {
      const healthUrl = `${this.serverUrl}/api/v1/health`;
      const response = await axios.get(healthUrl, {
        timeout: 10000,
      });
      
      this.logger.log('수동 헬스체크 성공');
      return response.status === 200;
    } catch (error) {
      this.logger.error(`수동 헬스체크 실패: ${error.message}`);
      return false;
    }
  }

  // 서버 URL 업데이트 메서드
  updateServerUrl(newUrl: string) {
    this.serverUrl = newUrl;
    this.logger.log(`서버 URL이 업데이트되었습니다: ${this.serverUrl}`);
  }
} 