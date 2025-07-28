import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  UserResponseDto,
  UsersListResponseDto,
  UserCreatedResponseDto,
  UserUpdatedResponseDto,
  UserDeletedResponseDto,
} from './dto/user-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ValidationErrorResponseDto,
  UnauthorizedErrorResponseDto,
  ForbiddenErrorResponseDto,
  NotFoundErrorResponseDto,
  ConflictErrorResponseDto,
} from '../common/dto/error-response.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: '사용자 생성 (관리자용)',
    description: `
    새로운 사용자를 직접 생성합니다. (관리자 기능)
    
    **주의:** 일반적으로는 /auth/register를 사용하세요.
    
    **사용 방법:**
    - 관리자가 사용자를 대신 생성할 때 사용
    - 모든 필드를 직접 지정 가능
    
    **프론트엔드 처리:**
    - 관리자 패널에서만 사용
    - 성공시 사용자 목록 새로고침
    `,
  })
  @ApiBody({
    type: CreateUserDto,
    description: '생성할 사용자 정보',
  })
  @ApiResponse({
    status: 201,
    description: '사용자 생성 성공',
    type: UserCreatedResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '유효성 검사 실패',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: '이미 존재하는 이메일',
    type: ConflictErrorResponseDto,
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '전체 사용자 목록 조회',
    description: `
    시스템에 등록된 모든 사용자의 목록을 조회합니다.
    
    **인증 필요:** Bearer Token
    
    **사용 방법:**
    - 관리자 또는 특별한 권한이 있는 사용자만 접근
    - 페이지네이션은 향후 추가 예정
    
    **프론트엔드 처리:**
    - 관리자 패널의 사용자 관리 페이지에서 사용
    - 사용자 목록을 테이블 형태로 표시
    - 각 사용자별 액션 버튼 제공 (수정, 삭제 등)
    `,
  })
  @ApiResponse({
    status: 200,
    description: '사용자 목록 조회 성공',
    type: UsersListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: '인증 토큰이 없거나 유효하지 않음',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: '접근 권한 없음 (관리자만 접근 가능)',
    type: ForbiddenErrorResponseDto,
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '내 프로필 조회',
    description: `
    현재 로그인한 사용자의 상세 프로필 정보를 조회합니다.
    
    **인증 필요:** Bearer Token
    
    **사용 방법:**
    - /auth/profile과 유사하지만 더 상세한 정보 포함
    - 사용자 자신의 정보만 조회 가능
    
    **프론트엔드 처리:**
    - 마이페이지에서 사용
    - 프로필 편집 폼의 초기값으로 사용
    - 사용자 정보 표시용
    `,
  })
  @ApiResponse({
    status: 200,
    description: '프로필 조회 성공',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: '인증 토큰이 없거나 유효하지 않음',
    type: UnauthorizedErrorResponseDto,
  })
  getProfile(@Request() req: any) {
    return this.usersService.findById(req.user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: '특정 사용자 정보 조회',
    description: `
    ID로 특정 사용자의 공개 정보를 조회합니다.
    
    **사용 방법:**
    - 다른 사용자의 프로필 보기
    - 공개된 정보만 반환 (민감한 정보 제외)
    
    **프론트엔드 처리:**
    - 사용자 프로필 페이지에서 사용
    - 판매자 정보 표시용
    - 채팅 상대방 정보 표시용
    `,
  })
  @ApiParam({
    name: 'id',
    description: '조회할 사용자의 고유 ID',
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 200,
    description: '사용자 정보 조회 성공',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: '사용자를 찾을 수 없음',
    type: NotFoundErrorResponseDto,
  })
  async findOne(@Param('id') id: string) {
    console.log('👤 사용자 정보 조회 요청:', id);
    try {
      const user = await this.usersService.findById(id);
      console.log('✅ 사용자 정보 조회 성공:', user.id, user.username);
      return user;
    } catch (error) {
      console.error('❌ 사용자 정보 조회 실패:', error.message);
      throw error;
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '사용자 정보 수정',
    description: `
    특정 사용자의 정보를 수정합니다.
    
    **인증 필요:** Bearer Token
    
    **권한:**
    - 본인의 정보만 수정 가능
    - 관리자는 모든 사용자 정보 수정 가능
    
    **사용 방법:**
    - 수정하고 싶은 필드만 포함하여 요청
    - 빈 값으로 보내면 해당 필드는 수정되지 않음
    
    **프론트엔드 처리:**
    - 프로필 편집 페이지에서 사용
    - 변경된 필드만 서버로 전송
    - 성공시 사용자 정보 업데이트
    `,
  })
  @ApiParam({
    name: 'id',
    description: '수정할 사용자의 고유 ID',
    example: 'uuid-string',
  })
  @ApiBody({
    type: UpdateUserDto,
    description: '수정할 사용자 정보 (변경할 필드만 포함)',
  })
  @ApiResponse({
    status: 200,
    description: '사용자 정보 수정 성공',
    type: UserUpdatedResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '유효성 검사 실패',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: '인증 토큰이 없거나 유효하지 않음',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: '권한 없음 (본인 또는 관리자만 수정 가능)',
    type: ForbiddenErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: '사용자를 찾을 수 없음',
    type: NotFoundErrorResponseDto,
  })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '사용자 삭제',
    description: `
    특정 사용자 계정을 영구적으로 삭제합니다.
    
    **인증 필요:** Bearer Token
    **위험:** 이 작업은 되돌릴 수 없습니다!
    
    **권한:**
    - 본인 계정 삭제 가능
    - 관리자는 모든 사용자 삭제 가능
    
    **주의사항:**
    - 연관된 모든 데이터도 함께 삭제됩니다
    - 진행 중인 거래가 있는 경우 삭제할 수 없습니다
    
    **프론트엔드 처리:**
    - 반드시 확인 다이얼로그 표시
    - "정말로 삭제하시겠습니까?" 메시지
    - 성공시 로그아웃 처리 (본인 삭제 시)
    `,
  })
  @ApiParam({
    name: 'id',
    description: '삭제할 사용자의 고유 ID',
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 200,
    description: '사용자 삭제 성공',
    type: UserDeletedResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: '인증 토큰이 없거나 유효하지 않음',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: '권한 없음 (본인 또는 관리자만 삭제 가능)',
    type: ForbiddenErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: '사용자를 찾을 수 없음',
    type: NotFoundErrorResponseDto,
  })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
} 