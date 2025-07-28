import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: createUserDto,
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        profileImage: true,
        location: true,
        rating: true,
        ratingCount: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findById(id: string) {
    console.log('👤 사용자 ID로 조회 시작:', id);
    
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        profileImage: true,
        location: true,
        rating: true,
        ratingCount: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log('📊 조회 결과:', user ? `사용자 발견: ${user.username}` : '사용자 없음');

    if (!user) {
      console.log('❌ 사용자를 찾을 수 없음, ID:', id);
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    console.log('✅ 사용자 조회 성공:', user.id, user.username);
    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByUsername(username: string) {
    return this.prisma.user.findFirst({
      where: { username },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findById(id);

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        username: true,
        profileImage: true,
        location: true,
        phone: true,
        rating: true,
        ratingCount: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    const user = await this.findById(id);

    // Soft delete - 계정 비활성화
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        email: true,
        username: true,
        isActive: true,
      },
    });
  }

  async updateRating(userId: string, newRating: number) {
    const user = await this.findById(userId);
    
    const totalRating = user.rating * user.ratingCount + newRating;
    const newRatingCount = user.ratingCount + 1;
    const averageRating = totalRating / newRatingCount;

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        rating: Math.round(averageRating * 10) / 10, // 소수점 첫째자리까지
        ratingCount: newRatingCount,
      },
    });
  }
} 