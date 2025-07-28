import api from '@/lib/api';

export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    imageUrls: string[];
  };
}

export class UploadService {
  // 이미지 파일 업로드
  static async uploadImages(files: File[]): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      
      files.forEach((file) => {
        formData.append('images', file);
      });

      const response = await api.post('/upload/images', formData);

      return response.data;
    } catch (error: any) {
      console.error('이미지 업로드 실패:', error);
      
      // 401 에러의 경우 더 구체적인 에러 메시지
      if (error.response?.status === 401) {
        const token = localStorage.getItem('accessToken');
        console.error('인증 토큰 상태:', token ? '존재함' : '없음');
        throw new Error('로그인이 필요합니다. 다시 로그인해주세요.');
      }
      
      // 기타 에러 처리
      const errorMessage = error.response?.data?.message || '이미지 업로드에 실패했습니다.';
      throw new Error(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
    }
  }
} 