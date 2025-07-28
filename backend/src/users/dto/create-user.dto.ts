import { IsEmail, IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: '사용자 이메일 주소 (고유 식별자)',
    example: 'user@example.com',
    format: 'email'
  })
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  email: string;

  @ApiProperty({
    description: '사용자명 (프로필에 표시되는 이름)',
    example: '홍길동',
    minLength: 2,
    maxLength: 20
  })
  @IsString({ message: '사용자명은 문자열이어야 합니다.' })
  @MinLength(2, { message: '사용자명은 최소 2자 이상이어야 합니다.' })
  @MaxLength(20, { message: '사용자명은 최대 20자까지 가능합니다.' })
  username: string;

  @ApiProperty({
    description: '계정 비밀번호 (암호화되어 저장)',
    example: 'SecurePass123!'
  })
  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  password: string;

  @ApiProperty({
    description: '사용자의 거주 지역 또는 활동 구역',
    example: '서울특별시 강남구',
    required: false,
    maxLength: 100
  })
  @IsOptional()
  @IsString({ message: '위치는 문자열이어야 합니다.' })
  @MaxLength(100, { message: '위치는 최대 100자까지 가능합니다.' })
  location?: string;

  @ApiProperty({
    description: '연락 가능한 전화번호',
    example: '010-1234-5678',
    required: false,
    maxLength: 20
  })
  @IsOptional()
  @IsString({ message: '전화번호는 문자열이어야 합니다.' })
  @MaxLength(20, { message: '전화번호는 최대 20자까지 가능합니다.' })
  phone?: string;

  @ApiProperty({
    description: '프로필 이미지 URL 또는 경로',
    example: 'https://example.com/profile.jpg',
    required: false
  })
  @IsOptional()
  @IsString({ message: '프로필 이미지는 문자열이어야 합니다.' })
  profileImage?: string;
} 