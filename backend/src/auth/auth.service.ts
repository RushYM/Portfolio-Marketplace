import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, username, password, location } = registerDto;

    // 이메일 중복 확인
    const existingUserByEmail = await this.usersService.findByEmail(email);
    if (existingUserByEmail) {
      throw new ConflictException('이미 사용 중인 이메일입니다.');
    }

    // 사용자명 중복 확인
    const existingUserByUsername = await this.usersService.findByUsername(username);
    if (existingUserByUsername) {
      throw new ConflictException('이미 사용 중인 사용자명입니다.');
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 12);

    // 사용자 생성
    const user = await this.usersService.create({
      email,
      username,
      password: hashedPassword,
      location,
    });

    // JWT 토큰 생성
    const payload: JwtPayload = { 
      sub: user.id, 
      email: user.email,
      username: user.username,
    };
    
    const accessToken = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        profileImage: user.profileImage,
        location: user.location,
        rating: user.rating,
        createdAt: user.createdAt,
      },
      accessToken,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 사용자 확인
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    // JWT 토큰 생성
    const payload: JwtPayload = { 
      sub: user.id, 
      email: user.email,
      username: user.username,
    };
    
    const accessToken = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        profileImage: user.profileImage,
        location: user.location,
        rating: user.rating,
        createdAt: user.createdAt,
      },
      accessToken,
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    if (!user.isActive) {
      throw new BadRequestException('비활성화된 계정입니다.');
    }

    return user;
  }

  async validateJwtPayload(payload: JwtPayload) {
    const user = await this.usersService.findById(payload.sub);
    
    if (!user || !user.isActive) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

    return user;
  }

  async refreshToken(userId: string) {
    const user = await this.usersService.findById(userId);
    
    if (!user || !user.isActive) {
      throw new UnauthorizedException('유효하지 않은 사용자입니다.');
    }

    const payload: JwtPayload = { 
      sub: user.id, 
      email: user.email,
      username: user.username,
    };
    
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
    };
  }
} 