'use client';

import { Search, Heart, MessageCircle, User, Menu, X, LogOut, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { ChatService } from '@/services/chatService';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  // 읽지 않은 메시지 수 로드
  useEffect(() => {
    const loadUnreadCount = async () => {
      if (isAuthenticated) {
        try {
          const chatRooms = await ChatService.getChatRooms();
          const unreadTotal = chatRooms.reduce((total, room) => {
            return total + (room.unreadCount || 0);
          }, 0);
          setUnreadCount(unreadTotal);
        } catch (error) {
          console.error('읽지 않은 메시지 수 로드 실패:', error);
        }
      } else {
        setUnreadCount(0);
      }
    };

    loadUnreadCount();
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
    setIsMenuOpen(false);
  };

  const handleLoginClick = () => {
    router.push('/auth/login');
    setIsMenuOpen(false);
  };

  const handleCreateProduct = () => {
    router.push('/products/create');
    setIsMenuOpen(false);
  };

  // 검색 처리
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  // 모바일 검색 처리
  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form.querySelector('input') as HTMLInputElement;
    if (input.value.trim()) {
      router.push(`/search?q=${encodeURIComponent(input.value.trim())}`);
      input.value = '';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-xl font-bold text-gray-900">마켓플레이스</span>
          </Link>

          {/* 검색바 (데스크톱) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="상품명, 지역명 등으로 검색"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </form>
          </div>

          {/* 네비게이션 (데스크톱) */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/products" className="text-gray-700 hover:text-orange-500 transition-colors">
              중고거래
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  href="/chat"
                  className="relative text-gray-700 hover:text-orange-500 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                
                <Link
                  href="/wishlist"
                  className="relative text-gray-700 hover:text-orange-500 transition-colors"
                >
                  <Heart className="w-5 h-5" />
                </Link>

                <Link 
                  href="/my/products"
                  className="flex items-center space-x-2 text-gray-700 hover:text-orange-500 transition-colors"
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="text-sm font-medium">{user?.username}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-orange-500 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>

                <button
                  onClick={handleCreateProduct}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors font-medium flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>상품등록</span>
                </button>
              </>
            ) : (
              <>
                <button onClick={handleLoginClick} className="text-gray-700 hover:text-orange-500 transition-colors font-medium">
                  로그인
                </button>
                <Link href="/auth/register" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors font-medium">
                  회원가입
                </Link>
              </>
            )}
          </nav>

          {/* 모바일 메뉴 버튼 */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* 모바일 검색바 */}
        <div className="md:hidden py-3 border-t border-gray-100">
          <form onSubmit={handleMobileSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="상품명, 지역명 등으로 검색"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </form>
        </div>

        {/* 모바일 메뉴 */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4">
            <nav className="space-y-4">
              <Link href="/products" className="block text-gray-700 hover:text-orange-500 transition-colors font-medium">
                중고거래
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    href="/chat"
                    className="flex items-center space-x-3 text-gray-700 hover:text-orange-500 transition-colors font-medium w-full text-left"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>채팅</span>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-auto">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                  
                  <Link 
                    href="/wishlist"
                    className="flex items-center space-x-3 text-gray-700 hover:text-orange-500 transition-colors font-medium w-full text-left"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Heart className="w-5 h-5" />
                    <span>찜</span>
                  </Link>

                  <Link 
                    href="/my/products"
                    className="flex items-center space-x-3 py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user?.username}</span>
                  </Link>

                  <button
                    onClick={handleCreateProduct}
                    className="flex items-center space-x-3 text-orange-500 hover:text-orange-600 transition-colors font-medium w-full text-left"
                  >
                    <Plus className="w-5 h-5" />
                    <span>상품등록</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 text-gray-700 hover:text-orange-500 transition-colors font-medium w-full text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>로그아웃</span>
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleLoginClick} className="block w-full text-left text-gray-700 hover:text-orange-500 transition-colors font-medium">
                    로그인
                  </button>
                  <Link href="/auth/register" className="block w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg transition-colors text-center font-medium">
                    회원가입
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}