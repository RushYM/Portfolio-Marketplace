import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: '사용자 고유 ID',
    example: 'uuid-string'
  })
  id: string;

  @ApiProperty({
    description: '사용자 이메일 주소',
    example: 'user@example.com'
  })
  email: string;

  @ApiProperty({
    description: '사용자명 (닉네임)',
    example: '홍길동'
  })
  username: string;

  @ApiProperty({
    description: '사용자 거주 지역',
    example: '서울특별시 강남구',
    required: false
  })
  location?: string;

  @ApiProperty({
    description: '연락처 전화번호',
    example: '010-1234-5678',
    required: false
  })
  phone?: string;

  @ApiProperty({
    description: '프로필 이미지 URL',
    example: 'https://example.com/profile.jpg',
    required: false
  })
  profileImage?: string;

  @ApiProperty({
    description: '이메일 인증 완료 여부',
    example: true
  })
  isVerified: boolean;

  @ApiProperty({
    description: '계정 활성화 상태',
    example: true
  })
  isActive: boolean;

  @ApiProperty({
    description: '계정 생성 일시',
    example: '2024-01-01T00:00:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: '계정 정보 마지막 수정 일시',
    example: '2024-01-01T00:00:00.000Z'
  })
  updatedAt: Date;
}

export class UsersListResponseDto {
  @ApiProperty({
    description: '사용자 목록',
    type: [UserResponseDto]
  })
  users: UserResponseDto[];

  @ApiProperty({
    description: '전체 사용자 수',
    example: 150
  })
  total: number;
}

export class UserCreatedResponseDto {
  @ApiProperty({
    description: '사용자 생성 성공 메시지',
    example: '사용자가 성공적으로 생성되었습니다.'
  })
  message: string;

  @ApiProperty({
    description: '생성된 사용자 정보',
    type: UserResponseDto
  })
  user: UserResponseDto;
}

export class UserUpdatedResponseDto {
  @ApiProperty({
    description: '사용자 정보 수정 성공 메시지',
    example: '사용자 정보가 성공적으로 수정되었습니다.'
  })
  message: string;

  @ApiProperty({
    description: '수정된 사용자 정보',
    type: UserResponseDto
  })
  user: UserResponseDto;
}

export class UserDeletedResponseDto {
  @ApiProperty({
    description: '사용자 삭제 성공 메시지',
    example: '사용자가 성공적으로 삭제되었습니다.'
  })
  message: string;
} 