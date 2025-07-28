import { IsOptional, IsString, MaxLength, MinLength, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    description: '수정할 사용자명 (프로필에 표시되는 이름)',
    example: '새로운닉네임',
    required: false,
    minLength: 2,
    maxLength: 20
  })
  @IsOptional()
  @IsString({ message: '사용자명은 문자열이어야 합니다.' })
  @MinLength(2, { message: '사용자명은 최소 2자 이상이어야 합니다.' })
  @MaxLength(20, { message: '사용자명은 최대 20자까지 가능합니다.' })
  username?: string;

  @ApiProperty({
    description: '수정할 거주 지역 또는 활동 구역',
    example: '부산광역시 해운대구',
    required: false,
    maxLength: 100
  })
  @IsOptional()
  @IsString({ message: '위치는 문자열이어야 합니다.' })
  @MaxLength(100, { message: '위치는 최대 100자까지 가능합니다.' })
  location?: string;

  @ApiProperty({
    description: '수정할 연락 가능한 전화번호',
    example: '010-9876-5432',
    required: false,
    maxLength: 20
  })
  @IsOptional()
  @IsString({ message: '전화번호는 문자열이어야 합니다.' })
  @MaxLength(20, { message: '전화번호는 최대 20자까지 가능합니다.' })
  phone?: string;

  @ApiProperty({
    description: '수정할 프로필 이미지 URL 또는 경로',
    example: 'https://example.com/new-profile.jpg',
    required: false
  })
  @IsOptional()
  @IsString({ message: '프로필 이미지는 문자열이어야 합니다.' })
  profileImage?: string;

  @ApiProperty({
    description: '사용자 인증 상태 (이메일 인증 완료 여부)',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean({ message: '인증 상태는 불린값이어야 합니다.' })
  isVerified?: boolean;

  @ApiProperty({
    description: '계정 활성화 상태 (계정 정지/활성화)',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean({ message: '활성 상태는 불린값이어야 합니다.' })
  isActive?: boolean;
} 