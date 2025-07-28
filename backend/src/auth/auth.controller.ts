import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  LoginResponseDto,
  RegisterResponseDto,
  ProfileResponseDto,
  LogoutResponseDto,
} from './dto/auth-response.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  ValidationErrorResponseDto,
  UnauthorizedErrorResponseDto,
  ConflictErrorResponseDto,
} from '../common/dto/error-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '회원가입',
    description: `
    새로운 사용자 계정을 생성합니다.
    
    **사용 방법:**
    - 이메일은 고유해야 하며, 이미 존재하는 이메일로는 가입할 수 없습니다
    - 비밀번호는 최소 8자 이상이어야 합니다
    - 사용자명은 2-20자 사이여야 합니다
    - 위치는 선택사항입니다
    
    **프론트엔드 처리:**
    - 성공시 사용자 정보를 받아 환영 메시지 표시
    - 실패시 에러 메시지를 사용자에게 표시
    `,
  })
  @ApiBody({
    type: RegisterDto,
    description: '회원가입에 필요한 사용자 정보',
  })
  @ApiResponse({
    status: 201,
    description: '회원가입 성공',
    type: RegisterResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '유효성 검사 실패 (이메일 형식 오류, 비밀번호 길이 부족 등)',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: '이미 존재하는 이메일',
    type: ConflictErrorResponseDto,
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '로그인',
    description: `
    사용자 인증을 통해 JWT 토큰을 발급받습니다.
    
    **사용 방법:**
    - 가입시 사용한 이메일과 비밀번호를 입력
    - 성공시 받은 access_token을 Authorization 헤더에 'Bearer {token}' 형태로 사용
    
    **프론트엔드 처리:**
    - 토큰을 안전한 저장소(httpOnly 쿠키 권장)에 저장
    - 사용자 정보를 전역 상태로 저장
    - 메인 페이지로 리다이렉트
    `,
  })
  @ApiBody({
    type: LoginDto,
    description: '로그인에 필요한 사용자 자격증명',
  })
  @ApiResponse({
    status: 200,
    description: '로그인 성공',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '유효성 검사 실패 (이메일 형식 오류 등)',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패 (잘못된 이메일 또는 비밀번호)',
    type: UnauthorizedErrorResponseDto,
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '프로필 조회',
    description: `
    현재 로그인한 사용자의 프로필 정보를 조회합니다.
    
    **인증 필요:** Bearer Token
    
    **사용 방법:**
    - Authorization 헤더에 'Bearer {access_token}' 포함
    
    **프론트엔드 처리:**
    - 사용자 프로필 페이지에서 정보 표시
    - 토큰이 만료된 경우 로그인 페이지로 리다이렉트
    `,
  })
  @ApiResponse({
    status: 200,
    description: '프로필 조회 성공',
    type: ProfileResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: '인증 토큰이 없거나 유효하지 않음',
    type: UnauthorizedErrorResponseDto,
  })
  getProfile(@Request() req: any) {
    return {
      user: req.user,
    };
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '토큰 갱신',
    description: `
    기존 토큰을 사용하여 새로운 액세스 토큰을 발급받습니다.
    
    **인증 필요:** Bearer Token
    
    **사용 방법:**
    - 토큰 만료 전에 호출하여 새 토큰 획득
    
    **프론트엔드 처리:**
    - 토큰 만료 15분 전에 자동으로 갱신
    - 새 토큰으로 기존 토큰 교체
    `,
  })
  @ApiResponse({
    status: 200,
    description: '토큰 갱신 성공',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: '인증 토큰이 없거나 유효하지 않음',
    type: UnauthorizedErrorResponseDto,
  })
  async refreshToken(@Request() req: any) {
    return this.authService.refreshToken(req.user.id);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '로그아웃',
    description: `
    사용자 로그아웃을 처리합니다.
    
    **인증 필요:** Bearer Token
    
    **참고사항:**
    - JWT는 stateless하므로 서버에서 토큰을 무효화할 수 없습니다
    - 클라이언트에서 토큰을 삭제해야 합니다
    
    **프론트엔드 처리:**
    - 저장된 토큰을 삭제 (localStorage, 쿠키 등)
    - 사용자 상태를 초기화
    - 로그인 페이지로 리다이렉트
    `,
  })
  @ApiResponse({
    status: 200,
    description: '로그아웃 성공',
    type: LogoutResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: '인증 토큰이 없거나 유효하지 않음',
    type: UnauthorizedErrorResponseDto,
  })
  async logout() {
    // JWT는 stateless하므로 서버에서 할 일이 없음
    // 클라이언트에서 토큰을 삭제하면 됨
    return {
      message: '로그아웃되었습니다.',
    };
  }
} 