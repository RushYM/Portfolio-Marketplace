import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP 상태 코드',
    example: 400
  })
  statusCode: number;

  @ApiProperty({
    description: '에러 메시지',
    example: '잘못된 요청입니다.'
  })
  message: string;

  @ApiProperty({
    description: '에러 발생 시각',
    example: '2024-01-01T00:00:00.000Z'
  })
  timestamp: string;

  @ApiProperty({
    description: '요청된 경로',
    example: '/api/v1/auth/login'
  })
  path: string;
}

export class ValidationErrorResponseDto {
  @ApiProperty({
    description: 'HTTP 상태 코드',
    example: 400
  })
  statusCode: number;

  @ApiProperty({
    description: '유효성 검사 에러 상세 정보',
    example: [
      '이메일 형식이 올바르지 않습니다.',
      '비밀번호는 최소 8자 이상이어야 합니다.'
    ]
  })
  message: string | string[];

  @ApiProperty({
    description: '에러 발생 시각',
    example: '2024-01-01T00:00:00.000Z'
  })
  timestamp: string;

  @ApiProperty({
    description: '요청된 경로',
    example: '/api/v1/auth/register'
  })
  path: string;
}

export class UnauthorizedErrorResponseDto {
  @ApiProperty({
    description: 'HTTP 상태 코드',
    example: 401
  })
  statusCode: number;

  @ApiProperty({
    description: '인증 실패 에러 메시지',
    example: '인증이 필요합니다.'
  })
  message: string;

  @ApiProperty({
    description: '에러 발생 시각',
    example: '2024-01-01T00:00:00.000Z'
  })
  timestamp: string;

  @ApiProperty({
    description: '요청된 경로',
    example: '/api/v1/auth/login'
  })
  path: string;
}

export class ForbiddenErrorResponseDto {
  @ApiProperty({
    description: 'HTTP 상태 코드',
    example: 403
  })
  statusCode: number;

  @ApiProperty({
    description: '권한 부족 에러 메시지',
    example: '접근 권한이 없습니다.'
  })
  message: string;

  @ApiProperty({
    description: '에러 발생 시각',
    example: '2024-01-01T00:00:00.000Z'
  })
  timestamp: string;

  @ApiProperty({
    description: '요청된 경로',
    example: '/api/v1/users/1'
  })
  path: string;
}

export class NotFoundErrorResponseDto {
  @ApiProperty({
    description: 'HTTP 상태 코드',
    example: 404
  })
  statusCode: number;

  @ApiProperty({
    description: '리소스를 찾을 수 없음 에러 메시지',
    example: '사용자를 찾을 수 없습니다.'
  })
  message: string;

  @ApiProperty({
    description: '에러 발생 시각',
    example: '2024-01-01T00:00:00.000Z'
  })
  timestamp: string;

  @ApiProperty({
    description: '요청된 경로',
    example: '/api/v1/users/999'
  })
  path: string;
}

export class ConflictErrorResponseDto {
  @ApiProperty({
    description: 'HTTP 상태 코드',
    example: 409
  })
  statusCode: number;

  @ApiProperty({
    description: '중복 리소스 에러 메시지',
    example: '이미 존재하는 이메일입니다.'
  })
  message: string;

  @ApiProperty({
    description: '에러 발생 시각',
    example: '2024-01-01T00:00:00.000Z'
  })
  timestamp: string;

  @ApiProperty({
    description: '요청된 경로',
    example: '/api/v1/auth/register'
  })
  path: string;
} 