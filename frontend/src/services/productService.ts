import api from '@/lib/api';

export interface ProductQueryParams {
  search?: string;
  category?: string;
  condition?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  sortBy?: 'createdAt' | 'price' | 'viewCount' | 'likeCount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CreateProductData {
  title: string;
  description: string;
  price: number;
  images: string[];
  mainImageIndex?: number;
  category: string;
  condition: string;
  location: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  status?: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  mainImageIndex: number;
  category: string;
  condition: string;
  status: string;
  location: string;
  latitude?: number;
  longitude?: number;
  viewCount: number;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
  seller: {
    id: string;
    username: string;
    profileImage?: string;
    location: string;
    rating: number;
    isVerified: boolean;
  };
  _count: {
    favorites: number;
  };
}

export interface PaginatedProducts {
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

export class ProductService {
  // 상품 목록 조회
  static async getProducts(params?: ProductQueryParams): Promise<PaginatedProducts> {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      console.error('상품 목록 조회 실패:', error);
      throw error;
    }
  }

  // 인기 상품 조회
  static async getPopularProducts(limit = 10): Promise<Product[]> {
    try {
      const response = await api.get('/products/popular', { params: { limit } });
      return response.data;
    } catch (error) {
      console.error('인기 상품 조회 실패:', error);
      throw error;
    }
  }

  // 최신 상품 조회
  static async getRecentProducts(limit = 10): Promise<Product[]> {
    try {
      const response = await api.get('/products/recent', { params: { limit } });
      return response.data;
    } catch (error) {
      console.error('최신 상품 조회 실패:', error);
      throw error;
    }
  }

  // 상품 상세 조회
  static async getProduct(id: string): Promise<Product> {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('상품 상세 조회 실패:', error);
      throw error;
    }
  }

  // 상품 생성
  static async createProduct(data: CreateProductData): Promise<Product> {
    try {
      const response = await api.post('/products', data);
      return response.data;
    } catch (error) {
      console.error('상품 생성 실패:', error);
      throw error;
    }
  }

  // 상품 삭제
  static async deleteProduct(productId: string): Promise<{ message: string }> {
    try {
      const response = await api.delete(`/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error('상품 삭제 실패:', error);
      throw error;
    }
  }

  // 상품 상태 변경
  static async updateProductStatus(productId: string, status: 'AVAILABLE' | 'RESERVED' | 'SOLD'): Promise<Product> {
    try {
      const response = await api.patch(`/products/${productId}`, { status });
      return response.data;
    } catch (error) {
      console.error('상품 상태 변경 실패:', error);
      throw error;
    }
  }

  // 상품 부분 수정 (제목, 가격, 설명 등)
  static async updateProduct(productId: string, updateData: Partial<CreateProductData>): Promise<Product> {
    try {
      const response = await api.patch(`/products/${productId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('상품 수정 실패:', error);
      throw error;
    }
  }

  // 사용자별 상품 목록 조회
  static async getUserProducts(
    userId: string, 
    page: number = 1, 
    limit: number = 20,
    status?: 'AVAILABLE' | 'RESERVED' | 'SOLD',
    category?: string,
    condition?: string
  ): Promise<PaginatedProducts> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      if (status) params.append('status', status);
      if (category) params.append('category', category);
      if (condition) params.append('condition', condition);

      console.log('🛍️ 사용자별 상품 조회 API 호출:', `/products/user/${userId}?${params}`);
      
      const response = await api.get(`/products/user/${userId}?${params}`);
      console.log('✅ 사용자별 상품 조회 성공:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ 사용자별 상품 조회 실패:', error);
      throw error;
    }
  }
} 