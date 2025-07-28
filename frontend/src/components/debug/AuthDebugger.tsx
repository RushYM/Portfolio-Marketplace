'use client';

import { useAuthStore } from '@/store/authStore';
import { decodeJwt, isTokenExpired, getTokenRemainingMinutes } from '@/utils/jwt';

export default function AuthDebugger() {
  const { user, isAuthenticated, isLoading, isInitialized, initialize } = useAuthStore();
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  
  // JWT 정보 디코딩
  const jwtInfo = token ? {
    decoded: decodeJwt(token),
    isExpired: isTokenExpired(token),
    remainingMinutes: getTokenRemainingMinutes(token),
  } : null;

  // 개발 환경에서만 표시
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // 토큰 만료 시뮬레이션
  const simulateTokenExpiry = () => {
    localStorage.removeItem('accessToken');
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      error: null,
      isInitialized: false, // 재초기화 필요
    });
    console.log('🧪 토큰 만료 시뮬레이션 - 페이지 새로고침');
    window.location.reload();
  };

  // 강제 재초기화
  const forceReinitialize = async () => {
    console.log('🔄 강제 재초기화 시작');
    useAuthStore.setState({ isInitialized: false });
    await initialize();
  };

  // 상태 진단
  const getStatusDiagnosis = () => {
    if (!isInitialized) {
      return { status: 'warning', message: '⏳ 초기화 중...' };
    }
    
    if (isLoading) {
      return { status: 'warning', message: '⏳ 로딩 중...' };
    }

    // JWT 토큰 만료 체크
    if (token && jwtInfo?.isExpired) {
      return { status: 'error', message: '⏰ 토큰 만료됨 - 재로그인 필요' };
    }

    if (token && isAuthenticated && user) {
      const remainingMinutes = jwtInfo?.remainingMinutes || 0;
      if (remainingMinutes < 10) {
        return { status: 'warning', message: `⚠️ 토큰 곧 만료 (${remainingMinutes}분)` };
      }
      return { status: 'success', message: '✅ 로그인 상태 정상' };
    }

    if (!token && !isAuthenticated && !user) {
      return { status: 'success', message: '✅ 로그아웃 상태 정상' };
    }

    if (token && !isAuthenticated) {
      return { status: 'error', message: '❌ 불일치: 토큰 있지만 인증 X' };
    }

    if (!token && isAuthenticated) {
      return { status: 'error', message: '❌ 불일치: 토큰 없지만 인증 O' };
    }

    return { status: 'warning', message: '⚠️ 알 수 없는 상태' };
  };

  const diagnosis = getStatusDiagnosis();

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs opacity-95 z-50 max-w-sm shadow-2xl">
      <div className="font-bold mb-3 text-yellow-400 flex items-center">
        🔍 인증 디버거
        <span className="ml-2 text-xs bg-gray-700 px-2 py-1 rounded">DEV</span>
      </div>
      
      {/* 현재 상태 */}
      <div className="space-y-1 mb-3 text-xs">
        <div className="flex justify-between">
          <span>isInitialized:</span>
          <span className={isInitialized ? 'text-green-400' : 'text-red-400'}>
            {String(isInitialized)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>isAuthenticated:</span>
          <span className={isAuthenticated ? 'text-green-400' : 'text-red-400'}>
            {String(isAuthenticated)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>isLoading:</span>
          <span className={isLoading ? 'text-yellow-400' : 'text-gray-400'}>
            {String(isLoading)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>user:</span>
          <span className={user ? 'text-green-400' : 'text-red-400'}>
            {user ? user.username : 'null'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>token:</span>
          <span className={token ? 'text-green-400' : 'text-red-400'}>
            {token ? `${token.substring(0, 12)}...` : 'null'}
          </span>
        </div>
        
        {/* JWT 토큰 정보 */}
        {jwtInfo && (
          <>
            <div className="border-t border-gray-600 pt-1 mt-2">
              <div className="text-yellow-400 font-semibold mb-1">JWT 정보:</div>
            </div>
            <div className="flex justify-between">
              <span>만료됨:</span>
              <span className={jwtInfo.isExpired ? 'text-red-400' : 'text-green-400'}>
                {String(jwtInfo.isExpired)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>남은시간:</span>
              <span className={jwtInfo.remainingMinutes > 60 ? 'text-green-400' : 
                              jwtInfo.remainingMinutes > 10 ? 'text-yellow-400' : 'text-red-400'}>
                {jwtInfo.remainingMinutes}분
              </span>
            </div>
            {jwtInfo.decoded && (
              <>
                <div className="flex justify-between">
                  <span>사용자ID:</span>
                  <span className="text-blue-400">
                    {jwtInfo.decoded.sub?.substring(0, 8)}...
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>이메일:</span>
                  <span className="text-blue-400">
                    {jwtInfo.decoded.email?.substring(0, 15)}...
                  </span>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* 상태 진단 */}
      <div className="mb-3 p-2 bg-gray-800 rounded border">
        <div className="font-semibold mb-1 text-xs">상태 진단:</div>
        <div className={`text-xs ${
          diagnosis.status === 'success' ? 'text-green-400' :
          diagnosis.status === 'error' ? 'text-red-400' : 'text-yellow-400'
        }`}>
          {diagnosis.message}
        </div>
      </div>

      {/* 액션 버튼들 */}
      <div className="space-y-2">
        <button
          onClick={forceReinitialize}
          className="w-full bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs transition-colors"
          disabled={isLoading}
        >
          🔄 강제 재초기화
        </button>
        
        <button
          onClick={simulateTokenExpiry}
          className="w-full bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs transition-colors"
        >
          🧪 토큰 만료 시뮬레이션
        </button>
      </div>

      {/* 도움말 */}
      <div className="text-xs text-gray-400 mt-3 pt-2 border-t border-gray-700">
        <div>💡 F12 Console에서 상세 로그 확인</div>
        <div className="mt-1">URL에 ?debug=auth 추가 시 더 자세한 정보</div>
      </div>
    </div>
  );
} 