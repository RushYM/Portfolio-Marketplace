import { api } from '@/lib/api';
import { Product } from './productService';

export interface FavoriteResponse {
  message: string;
  favorite?: {
    id: string;
    userId: string;
    productId: string;
    createdAt: string;
    product: Product;
  };
}

export interface FavoritesListResponse {
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface FavoriteStatusResponse {
  isFavorite: boolean;
}

export interface MultipleFavoriteRemoveResponse {
  message: string;
  removedCount: number;
}

export class FavoriteService {
  private static baseURL = '/favorites';

  // 상품 찜하기
  static async addToFavorites(productId: string): Promise<FavoriteResponse> {
    try {
      const response = await api.post(`${this.baseURL}/${productId}`);
      return response.data;
    } catch (error) {
      console.error('찜하기 실패:', error);
      throw error;
    }
  }

  // 찜하기 해제
  static async removeFromFavorites(productId: string): Promise<{ message: string }> {
    try {
      const response = await api.delete(`${this.baseURL}/${productId}`);
      return response.data;
    } catch (error) {
      console.error('찜하기 해제 실패:', error);
      throw error;
    }
  }

  // 찜 목록 조회
  static async getFavorites(page: number = 1, limit: number = 10): Promise<FavoritesListResponse> {
    try {
      const response = await api.get(this.baseURL, {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error('찜 목록 조회 실패:', error);
      throw error;
    }
  }

  // 상품 찜 상태 확인
  static async getFavoriteStatus(productId: string): Promise<FavoriteStatusResponse> {
    try {
      const response = await api.get(`${this.baseURL}/${productId}/status`);
      return response.data;
    } catch (error) {
      console.error('찜 상태 확인 실패:', error);
      throw error;
    }
  }

  // 여러 상품 찜하기 해제
  static async removeMultipleFromFavorites(productIds: string[]): Promise<MultipleFavoriteRemoveResponse> {
    try {
      const response = await api.delete(this.baseURL, {
        data: { productIds },
      });
      return response.data;
    } catch (error) {
      console.error('여러 상품 찜하기 해제 실패:', error);
      throw error;
    }
  }

  // 찜 상태 토글 (찜하기/해제 자동 판단)
  static async toggleFavorite(productId: string): Promise<{ isFavorite: boolean; message: string }> {
    try {
      // 현재 찜 상태 확인
      const statusResponse = await this.getFavoriteStatus(productId);
      
      if (statusResponse.isFavorite) {
        // 이미 찜한 상태라면 해제
        const response = await this.removeFromFavorites(productId);
        return {
          isFavorite: false,
          message: response.message,
        };
      } else {
        // 찜하지 않은 상태라면 추가
        const response = await this.addToFavorites(productId);
        return {
          isFavorite: true,
          message: response.message,
        };
      }
    } catch (error) {
      console.error('찜 상태 토글 실패:', error);
      throw error;
    }
  }
} 