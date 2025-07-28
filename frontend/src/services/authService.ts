import api from '@/lib/api';

// 타입 정의
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  location?: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  profileImage?: string;
  location?: string;
  rating: number;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

// 인증 서비스 클래스
class AuthService {
  // 회원가입
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // 로그인
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // 프로필 조회
  async getProfile(): Promise<{ user: User }> {
    try {
      const response = await api.get<{ user: User }>('/auth/profile');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // 토큰 갱신
  async refreshToken(): Promise<{ accessToken: string }> {
    try {
      const response = await api.post<{ accessToken: string }>('/auth/refresh');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // 로그아웃
  async logout(): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>('/auth/logout');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // 에러 처리 헬퍼
  private handleError(error: any): ApiError {
    if (error.response?.data) {
      return {
        message: error.response.data.message || '오류가 발생했습니다.',
        statusCode: error.response.status,
        error: error.response.data.error,
      };
    }
    
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      return {
        message: '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.',
        statusCode: 0,
      };
    }

    return {
      message: error.message || '알 수 없는 오류가 발생했습니다.',
      statusCode: 500,
    };
  }
}

export const authService = new AuthService();