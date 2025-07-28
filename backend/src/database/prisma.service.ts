import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('✅ Database connected successfully');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('❌ Database disconnected');
  }

  async cleanDb() {
    if (process.env.NODE_ENV === 'production') return;

    // 명시적으로 모델들을 나열하여 타입 안전성 확보
    const deletions = [
      this.report.deleteMany(),
      this.review.deleteMany(),
      this.favorite.deleteMany(),
      this.chatMessage.deleteMany(),
      this.chatRoom.deleteMany(),
      this.product.deleteMany(),
      this.user.deleteMany(),
    ];

    return Promise.all(deletions);
  }
} 