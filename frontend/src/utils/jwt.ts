/**
 * JWT 토큰 관련 유틸리티 함수들
 */

interface JwtPayload {
  sub: string;
  email: string;
  username: string;
  iat: number;
  exp: number;
}

/**
 * JWT 토큰을 디코딩합니다 (서명 검증은 하지 않음)
 */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('❌ JWT 형식이 올바르지 않습니다');
      return null;
    }

    const payload = parts[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    
    console.log('🔍 JWT 디코딩 결과:', {
      sub: decoded.sub,
      email: decoded.email,
      username: decoded.username,
      issuedAt: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : null,
      expiresAt: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : null,
    });

    return decoded;
  } catch (error) {
    console.error('❌ JWT 디코딩 실패:', error);
    return null;
  }
}

/**
 * JWT 토큰이 만료되었는지 확인합니다
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeJwt(token);
  if (!decoded || !decoded.exp) {
    console.log('❌ 토큰 디코딩 실패 또는 만료 시간 없음');
    return true;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  const isExpired = currentTime >= decoded.exp;
  
  console.log('⏰ 토큰 만료 체크:', {
    currentTime: new Date(currentTime * 1000).toISOString(),
    expiresAt: new Date(decoded.exp * 1000).toISOString(),
    isExpired,
    remainingSeconds: decoded.exp - currentTime,
  });

  return isExpired;
}

/**
 * localStorage에서 토큰을 가져와 유효성을 체크합니다
 */
export function getValidToken(): string | null {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    console.log('❌ 토큰이 없습니다');
    return null;
  }

  if (isTokenExpired(token)) {
    console.log('⏰ 토큰이 만료되었습니다 - 제거');
    localStorage.removeItem('accessToken');
    return null;
  }

  console.log('✅ 유효한 토큰 발견');
  return token;
}

/**
 * 토큰의 남은 시간을 분 단위로 반환합니다
 */
export function getTokenRemainingMinutes(token: string): number {
  const decoded = decodeJwt(token);
  if (!decoded || !decoded.exp) {
    return 0;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  const remainingSeconds = decoded.exp - currentTime;
  
  return Math.max(0, Math.floor(remainingSeconds / 60));
} 