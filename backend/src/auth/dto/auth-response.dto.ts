import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT 액세스 토큰 (Bearer 토큰으로 사용)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  access_token: string;

  @ApiProperty({
    description: '토큰 타입 (항상 Bearer)',
    example: 'Bearer'
  })
  token_type: string;

  @ApiProperty({
    description: '토큰 만료 시간 (초 단위)',
    example: 3600
  })
  expires_in: number;

  @ApiProperty({
    description: '로그인한 사용자 정보',
    type: Object,
    example: {
      id: 'uuid-string',
      email: 'user@example.com',
      username: '홍길동',
      location: '서울특별시 강남구'
    }
  })
  user: {
    id: string;
    email: string;
    username: string;
    location?: string;
  };
}

export class RegisterResponseDto {
  @ApiProperty({
    description: '회원가입 성공 메시지',
    example: '회원가입이 성공적으로 완료되었습니다.'
  })
  message: string;

  @ApiProperty({
    description: '생성된 사용자 정보 (비밀번호 제외)',
    type: Object,
    example: {
      id: 'uuid-string',
      email: 'user@example.com',
      username: '홍길동',
      location: '서울특별시 강남구',
      createdAt: '2024-01-01T00:00:00.000Z'
    }
  })
  user: {
    id: string;
    email: string;
    username: string;
    location?: string;
    createdAt: Date;
  };
}

export class ProfileResponseDto {
  @ApiProperty({
    description: '현재 로그인한 사용자 정보',
    type: Object,
    example: {
      id: 'uuid-string',
      email: 'user@example.com',
      username: '홍길동',
      location: '서울특별시 강남구',
      phone: '010-1234-5678',
      profileImage: 'https://example.com/profile.jpg',
      isVerified: true,
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z'
    }
  })
  user: {
    id: string;
    email: string;
    username: string;
    location?: string;
    phone?: string;
    profileImage?: string;
    isVerified: boolean;
    isActive: boolean;
    createdAt: Date;
  };
}

export class LogoutResponseDto {
  @ApiProperty({
    description: '로그아웃 성공 메시지',
    example: '로그아웃되었습니다.'
  })
  message: string;
} 