import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { AuthService } from '../auth.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    console.log('=== JWT 검증 시작 ===');
    console.log('JWT Payload:', {
      sub: payload.sub,
      email: payload.email,
      username: payload.username,
      iat: payload.iat ? new Date(payload.iat * 1000).toISOString() : null,
      exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : null,
      currentTime: new Date().toISOString(),
    });
    
    try {
      const user = await this.authService.validateJwtPayload(payload);
      
      console.log('사용자 검증 결과:', user ? '성공' : '실패');
      
      if (!user) {
        console.log('JWT 검증 실패 - 사용자를 찾을 수 없음');
        throw new UnauthorizedException('유효하지 않은 토큰입니다.');
      }

      const validatedUser = {
        id: user.id,
        email: user.email,
        username: user.username,
        profileImage: user.profileImage,
        location: user.location,
        rating: user.rating,
        isVerified: user.isVerified,
      };
      
      console.log('✅ JWT 검증 성공:', { 
        id: validatedUser.id, 
        username: validatedUser.username,
        isActive: user.isActive,
      });

      return validatedUser;
    } catch (error) {
      console.error('❌ JWT 검증 중 오류 발생:', {
        error: error.message,
        payload: payload,
      });
      throw new UnauthorizedException('토큰 검증에 실패했습니다.');
    }
  }
} 