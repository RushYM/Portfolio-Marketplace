import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authService, User, LoginRequest, RegisterRequest } from '@/services/authService';
import { getValidToken, getTokenRemainingMinutes } from '@/utils/jwt';
import toast from 'react-hot-toast';

interface AuthState {
  // 상태
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean; // 초기화 완료 여부

  // 액션
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  getProfile: () => Promise<{ user: User } | void>; // 반환 타입 수정
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>; // 초기화 함수
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isInitialized: false,

      // 초기화 함수
      initialize: async () => {
        console.log('🔄 인증 스토어 초기화 시작:', new Date().toISOString());

        set({ isLoading: true });

        try {
          // 유효한 토큰 체크 (만료 시간 포함)
          const validToken = getValidToken();
          
          if (validToken) {
            const remainingMinutes = getTokenRemainingMinutes(validToken);
            console.log('✅ 유효한 토큰 발견 - 프로필 조회 API 호출 시작:', {
              tokenPreview: `${validToken.substring(0, 20)}...`,
              remainingMinutes: remainingMinutes,
            });
            
            const response = await authService.getProfile();
            
            if (!response || !response.user) {
              throw new Error('프로필 응답이 비어있습니다');
            }
            
            set({
              user: response.user,
              isAuthenticated: true,
              isLoading: false,
              isInitialized: true,
              error: null,
            });
            
            console.log('✅ 인증 초기화 성공:', {
              username: response.user.username,
              userId: response.user.id,
              tokenRemainingMinutes: remainingMinutes,
            });
          } else {
            console.log('❌ 유효한 토큰 없음 - 로그아웃 상태 설정');
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              isInitialized: true,
              error: null,
            });
          }
        } catch (error: any) {
          console.error('❌ 인증 초기화 실패:', {
            error: error.message,
            response: error.response?.data,
            status: error.response?.status,
          });
          
          // 모든 인증 관련 오류의 경우 토큰 제거
          localStorage.removeItem('accessToken');
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            isInitialized: true,
            error: null, // 사용자에게는 에러 메시지 표시하지 않음
          });
        }
      },

      // 로그인
      login: async (data: LoginRequest) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await authService.login(data);
          
          // 토큰 저장
          localStorage.setItem('accessToken', response.accessToken);
          
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          console.log('✅ 로그인 성공:', response.user.username);
          toast.success('로그인되었습니다!');
        } catch (error: any) {
          console.error('❌ 로그인 실패:', error);
          set({
            error: error.message,
            isLoading: false,
            isAuthenticated: false,
            user: null,
          });
          toast.error(error.message);
          throw error;
        }
      },

      // 회원가입
      register: async (data: RegisterRequest) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await authService.register(data);
          
          // 토큰 저장
          localStorage.setItem('accessToken', response.accessToken);
          
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          console.log('✅ 회원가입 성공:', response.user.username);
          toast.success('회원가입이 완료되었습니다!');
        } catch (error: any) {
          console.error('❌ 회원가입 실패:', error);
          set({
            error: error.message,
            isLoading: false,
            isAuthenticated: false,
            user: null,
          });
          toast.error(error.message);
          throw error;
        }
      },

      // 로그아웃
      logout: async () => {
        try {
          set({ isLoading: true });
          
          // 백엔드 로그아웃 API 호출 (선택사항)
          try {
            await authService.logout();
          } catch (error) {
            console.warn('백엔드 로그아웃 API 실패 (무시):', error);
          }
          
          // 토큰 제거
          localStorage.removeItem('accessToken');
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          
          console.log('✅ 로그아웃 완료');
          toast.success('로그아웃되었습니다.');
        } catch (error: any) {
          console.error('❌ 로그아웃 처리 중 오류:', error);
          
          // 오류가 발생해도 로컬 상태는 초기화
          localStorage.removeItem('accessToken');
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      // 프로필 조회 (내부용)
      getProfile: async () => {
        try {
          const response = await authService.getProfile();
          
          set({
            user: response.user,
            isAuthenticated: true,
            error: null,
          });
          
          return response;
        } catch (error: any) {
          console.error('❌ 프로필 조회 실패:', error);
          
          // 토큰이 유효하지 않은 경우 로그아웃 처리
          localStorage.removeItem('accessToken');
          
          set({
            user: null,
            isAuthenticated: false,
            error: error.message,
          });
          
          throw error;
        }
      },

      // 에러 초기화
      clearError: () => set({ error: null }),

      // 로딩 상태 설정
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        // isAuthenticated는 항상 토큰 유효성에 따라 결정
      }),
      onRehydrateStorage: () => (state) => {
        console.log('🔄 Zustand 상태 복원 완료:', state ? { hasUser: !!state.user } : 'null');
      },
    }
  )
);