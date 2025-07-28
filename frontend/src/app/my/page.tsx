'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, Heart, MessageCircle, User, Settings, Star, MapPin, Calendar, Loader2 } from 'lucide-react';
import { ProductService, Product } from '@/services/productService';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function MyPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    sold: 0,
    reserved: 0,
  });
  const [loading, setLoading] = useState(true);

  // 데이터 로드
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const result = await ProductService.getUserProducts(user.id, {
          page: 1,
          limit: 4,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        });

        setRecentProducts(result.data);

        // 통계 계산
        const totalProducts = result.pagination.total;
        const availableCount = result.data.filter(p => p.status === 'AVAILABLE').length;
        const soldCount = result.data.filter(p => p.status === 'SOLD').length;
        const reservedCount = result.data.filter(p => p.status === 'RESERVED').length;

        setStats({
          total: totalProducts,
          available: availableCount,
          sold: soldCount,
          reserved: reservedCount,
        });
      } catch (error) {
        console.error('대시보드 데이터 로드 실패:', error);
        toast.error('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user) {
      loadDashboardData();
    } else if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [user, isAuthenticated, router]);

  // 가격 포맷팅
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          <span className="text-gray-600">로딩 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom max-w-6xl">
        {/* 사용자 프로필 카드 */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.username}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-gray-500" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{user?.username}</h1>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  활성
                </span>
              </div>
              <div className="flex items-center space-x-4 text-gray-600">
                {user?.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{user.location}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>가입일: {user?.createdAt ? formatDate(user.createdAt) : '-'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>{user?.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
            <Link
              href="/my/profile"
              className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 통계 카드들 */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">판매 현황</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Package className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-700">전체 상품</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stats.total}개</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">판매중</span>
                  </div>
                  <span className="font-semibold text-green-600">{stats.available}개</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-yellow-500 rounded-full"></div>
                    <span className="text-gray-700">예약중</span>
                  </div>
                  <span className="font-semibold text-yellow-600">{stats.reserved}개</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700">판매완료</span>
                  </div>
                  <span className="font-semibold text-blue-600">{stats.sold}개</span>
                </div>
              </div>
            </div>

            {/* 빠른 링크 */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">빠른 메뉴</h2>
              <div className="space-y-3">
                <Link
                  href="/products/create"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-orange-50 text-orange-600 hover:text-orange-700 transition-colors"
                >
                  <Package className="w-5 h-5" />
                  <span>상품 등록하기</span>
                </Link>
                <Link
                  href="/my/products"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <Package className="w-5 h-5" />
                  <span>내 상품 관리</span>
                </Link>
                <button className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-gray-900 transition-colors w-full text-left">
                  <Heart className="w-5 h-5" />
                  <span>찜한 상품</span>
                </button>
                <button className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-gray-900 transition-colors w-full text-left">
                  <MessageCircle className="w-5 h-5" />
                  <span>채팅 목록</span>
                </button>
              </div>
            </div>
          </div>

          {/* 최근 등록한 상품 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">최근 등록한 상품</h2>
                <Link
                  href="/my/products"
                  className="text-orange-500 hover:text-orange-600 font-medium text-sm"
                >
                  전체보기
                </Link>
              </div>

              {recentProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">등록된 상품이 없습니다.</p>
                  <Link
                    href="/products/create"
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    상품 등록하기
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentProducts.map((product) => {
                    const mainImage = product.images[product.mainImageIndex] || product.images[0];
                    
                    return (
                      <Link
                        key={product.id}
                        href={`/products/${product.id}`}
                        className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <img
                          src={mainImage || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop'}
                          alt={product.title}
                          className="w-16 h-16 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{product.title}</h3>
                          <p className="text-orange-500 font-semibold">{formatPrice(product.price)}원</p>
                          <p className="text-sm text-gray-500">{formatDate(product.createdAt)}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 