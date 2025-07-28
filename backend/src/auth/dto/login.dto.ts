import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: '등록된 이메일 주소',
    example: 'user@example.com',
    format: 'email'
  })
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  email: string;

  @ApiProperty({
    description: '계정 비밀번호',
    example: 'SecurePass123!',
    minLength: 1
  })
  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @MinLength(1, { message: '비밀번호를 입력해주세요.' })
  password: string;
} 