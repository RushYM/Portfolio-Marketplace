import axios from 'axios';

// API 기본 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// 인증 처리 플래그 (중복 처리 방지)
let isAuthProcessing = false;

// Axios 인스턴스 생성
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000, // 10초 타임아웃
});

// 요청 인터셉터 - 토큰 자동 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    
    // 디버깅 로그 (개발 환경에서만)
    if (process.env.NODE_ENV === 'development') {
      console.log('🌐 API 요청:', {
        url: config.url,
        method: config.method?.toUpperCase(),
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 20)}...` : null,
      });
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // FormData가 아닌 경우에만 Content-Type을 application/json으로 설정
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => {
    console.error('❌ API 요청 인터셉터 오류:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리 및 인증 관리
api.interceptors.response.use(
  (response) => {
    // 성공 응답 로그 (개발 환경에서만)
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ API 응답 성공:', {
        url: response.config.url,
        status: response.status,
      });
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 401 에러 처리
    if (error.response?.status === 401 && !isAuthProcessing) {
      isAuthProcessing = true;
      
      console.error('🚨 401 인증 오류 발생:', {
        url: originalRequest?.url,
        method: originalRequest?.method,
        hasToken: !!localStorage.getItem('accessToken'),
        error: error.response?.data?.message || error.message,
        isProfileRequest: originalRequest?.url?.includes('/auth/profile'),
      });

      try {
        // 토큰 제거
        localStorage.removeItem('accessToken');
        
        // authStore 상태 업데이트
        const { useAuthStore } = await import('@/store/authStore');
        
        // 프로필 요청이었다면 초기화 과정에서 실패한 것이므로 덜 공격적으로 처리
        if (originalRequest?.url?.includes('/auth/profile')) {
          console.log('📊 프로필 요청 실패 - 로그아웃 상태로 설정만 함');
          useAuthStore.setState({
            user: null,
            isAuthenticated: false,
            error: null,
            isLoading: false,
            isInitialized: true, // 초기화는 완료로 표시
          });
          
          // 프로필 요청 실패 시에는 리다이렉트 하지 않음
        } else {
          console.log('🔄 일반 API 요청 실패 - 로그인 페이지로 리다이렉트');
          useAuthStore.setState({
            user: null,
            isAuthenticated: false,
            error: '로그인이 만료되었습니다.',
            isLoading: false,
          });

          // 로그인 페이지가 아닌 경우에만 리다이렉트
          if (!window.location.pathname.includes('/auth/')) {
            setTimeout(() => {
              window.location.href = '/auth/login?redirected=true';
            }, 100);
          }
        }
      } catch (err) {
        console.error('❌ 401 처리 중 오류:', err);
      } finally {
        // 플래그 리셋 (1초 후)
        setTimeout(() => {
          isAuthProcessing = false;
        }, 1000);
      }
    }

    // 기타 에러 로그
    if (error.response?.status !== 401) {
      console.error('❌ API 오류:', {
        url: originalRequest?.url,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      });
    }

    return Promise.reject(error);
  }
);

export default api;