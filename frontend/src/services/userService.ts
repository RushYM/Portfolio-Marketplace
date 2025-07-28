import { api } from '@/lib/api';

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  profileImage?: string;
  location?: string;
  rating: number;
  ratingCount: number;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserResponse {
  id: string;
  username: string;
  email?: string;
  profileImage?: string;
  location?: string;
  rating: number;
  ratingCount: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export class UserService {
  private static baseURL = '/users';

  // 특정 사용자 정보 조회
  static async getUserById(userId: string): Promise<UserProfile> {
    try {
      console.log('🔄 사용자 정보 API 호출 시작:', `${this.baseURL}/${userId}`);
      const response = await api.get(`${this.baseURL}/${userId}`);
      console.log('✅ 사용자 정보 API 응답:', response);
      console.log('📊 응답 데이터:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 사용자 정보 조회 실패:', error);
      console.error('❌ API 오류 세부사항:', {
        url: `${this.baseURL}/${userId}`,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  }

  // 현재 로그인한 사용자 프로필 조회
  static async getMyProfile(): Promise<UserProfile> {
    try {
      const response = await api.get(`${this.baseURL}/profile`);
      return response.data;
    } catch (error) {
      console.error('내 프로필 조회 실패:', error);
      throw error;
    }
  }

  // 사용자 정보 수정
  static async updateProfile(userData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await api.patch(`${this.baseURL}/profile`, userData);
      return response.data;
    } catch (error) {
      console.error('프로필 수정 실패:', error);
      throw error;
    }
  }
} 