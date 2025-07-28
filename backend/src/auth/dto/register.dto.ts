import { IsEmail, IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: '사용자 이메일 주소 (로그인시 사용)',
    example: 'user@example.com',
    format: 'email'
  })
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  email: string;

  @ApiProperty({
    description: '사용자명 (화면에 표시되는 닉네임)',
    example: '홍길동',
    minLength: 2,
    maxLength: 20
  })
  @IsString({ message: '사용자명은 문자열이어야 합니다.' })
  @MinLength(2, { message: '사용자명은 최소 2자 이상이어야 합니다.' })
  @MaxLength(20, { message: '사용자명은 최대 20자까지 가능합니다.' })
  username: string;

  @ApiProperty({
    description: '계정 비밀번호 (최소 8자, 영문+숫자+특수문자 조합 권장)',
    example: 'SecurePass123!',
    minLength: 8
  })
  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  password: string;

  @ApiProperty({
    description: '사용자의 활동 지역 (거래시 참고용)',
    example: '서울특별시 강남구',
    required: false,
    maxLength: 100
  })
  @IsOptional()
  @IsString({ message: '위치는 문자열이어야 합니다.' })
  @MaxLength(100, { message: '위치는 최대 100자까지 가능합니다.' })
  location?: string;
} 