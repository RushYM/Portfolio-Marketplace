'use client';

import { useEffect, ReactNode, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const { initialize, isInitialized, isLoading } = useAuthStore();
  const initializeRef = useRef(false); // 중복 실행 방지

  useEffect(() => {
    // 이미 실행되었거나 초기화 완료된 경우 스킵
    if (initializeRef.current || isInitialized) {
      console.log('🔄 AuthProvider: 이미 처리됨 또는 초기화 완료');
      return;
    }

    console.log('🚀 AuthProvider: 인증 초기화 시작');
    initializeRef.current = true;

    // 비동기 함수 실행
    const runInitialize = async () => {
      try {
        await initialize();
        console.log('✅ AuthProvider: 인증 초기화 완료');
      } catch (error) {
        console.error('❌ AuthProvider: 인증 초기화 실패:', error);
        // 실패 시 플래그 리셋하여 재시도 가능하게 함
        initializeRef.current = false;
      }
    };

    runInitialize();
  }, [initialize, isInitialized]); // 의존성 배열 유지

  // 디버깅용 상태 로그
  useEffect(() => {
    console.log('🔍 AuthProvider 상태:', {
      isInitialized,
      isLoading,
      initializeRefCurrent: initializeRef.current,
    });
  }, [isInitialized, isLoading]);

  // 초기화 중일 때 로딩 화면 표시
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="text-gray-600 text-sm">
            {!isInitialized ? '인증 상태 확인 중...' : '로딩 중...'}
          </p>
          <p className="text-xs text-gray-400">
            새로고침 시 잠깐 표시되는 화면입니다
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 