'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Star, 
  MapPin, 
  Calendar, 
  Package, 
  User as UserIcon, 
  Shield, 
  Loader2,
  ArrowLeft,
  MessageCircle
} from 'lucide-react';
import ProductCard from '@/components/common/ProductCard';
import { ProductService, Product } from '@/services/productService';
import { UserService, UserProfile } from '@/services/userService';
import { useAuthStore } from '@/store/authStore';
import { ChatService } from '@/services/chatService';
import toast from 'react-hot-toast';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const userId = params.id as string;

  const [user, setUser] = useState<UserProfile | null>(null);
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'available' | 'sold'>('all');
  const [chatLoading, setChatLoading] = useState(false);

  // 사용자 정보 로드
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!userId || userId === 'undefined' || userId === 'null') {
        console.error('❌ 잘못된 사용자 ID:', userId);
        toast.error('잘못된 사용자 ID입니다.');
        router.back();
        return;
      }

      try {
        setLoading(true);
        
        console.log('👤 사용자 프로필 로드 시작, userId:', userId);
        
        // 실제 API 호출
        const userData = await UserService.getUserById(userId);
        console.log('✅ 사용자 데이터 로드 성공:', userData);
        setUser(userData);
      } catch (error: any) {
        console.error('❌ 사용자 정보 로드 실패:', error);
        console.error('❌ 오류 세부사항:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        });

        // 404 오류인 경우 더 구체적인 메시지
        if (error.response?.status === 404) {
          toast.error('존재하지 않는 사용자입니다.');
        } else {
          toast.error('사용자 정보를 불러올 수 없습니다.');
        }
        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadUserProfile();
    }
  }, [userId, router]);

  // 사용자의 상품 목록 로드
  useEffect(() => {
    const loadUserProducts = async () => {
      try {
        setProductsLoading(true);
        
        console.log('🛍️ 사용자 상품 목록 로드 시작, userId:', userId, 'activeTab:', activeTab);
        
        // 탭에 따른 상태 필터 설정
        let status: 'AVAILABLE' | 'RESERVED' | 'SOLD' | undefined;
        if (activeTab === 'available') {
          status = 'AVAILABLE';
        } else if (activeTab === 'sold') {
          status = 'SOLD';
        }
        
        // 실제 사용자별 상품 API 호출
        const result = await ProductService.getUserProducts(userId, 1, 20, status);
        console.log('✅ 사용자 상품 목록 로드 성공:', result);
        
        setUserProducts(result.data);
      } catch (error: any) {
        console.error('❌ 사용자 상품 목록 로드 실패:', error);
        console.error('❌ 오류 세부사항:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        });
        toast.error('상품 목록을 불러오는데 실패했습니다.');
      } finally {
        setProductsLoading(false);
      }
    };

    if (userId) {
      loadUserProducts();
    }
  }, [userId, activeTab]);

  // 가입일 포맷팅
  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // 채팅하기
  const handleChat = async () => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다.');
      router.push('/auth/login');
      return;
    }
    
    if (currentUser && user && user.id === currentUser.id) {
      toast.error('본인과는 채팅할 수 없습니다.');
      return;
    }

    if (!user) return;

    // 해당 사용자의 판매 중인 상품 중 첫 번째 상품을 기반으로 채팅방 생성
    const availableProducts = userProducts.filter(p => p.status === 'AVAILABLE');
    
    if (availableProducts.length === 0) {
      toast.error('판매 중인 상품이 없어 채팅을 시작할 수 없습니다.');
      return;
    }

    setChatLoading(true);
    try {
      const firstProduct = availableProducts[0];
      const chatRoom = await ChatService.createOrFindChatRoom(user.id, firstProduct.id);
      toast.success('채팅방으로 이동합니다.');
      router.push(`/chat/${chatRoom.id}`);
    } catch (error) {
      console.error('채팅 생성 실패:', error);
      toast.error('채팅방 생성에 실패했습니다.');
    } finally {
      setChatLoading(false);
    }
  };

  // ProductCard에 맞는 형태로 데이터 변환
  const formatProductForCard = (product: Product) => {
    const mainImage = product.images[product.mainImageIndex] || product.images[0];
    
    const getTimeAgo = (dateString: string): string => {
      const now = new Date();
      const date = new Date(dateString);
      const diffInMs = now.getTime() - date.getTime();
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);

      if (diffInMinutes < 1) return '방금 전';
      if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
      if (diffInHours < 24) return `${diffInHours}시간 전`;
      if (diffInDays < 7) return `${diffInDays}일 전`;
      
      return date.toLocaleDateString('ko-KR', { 
        month: 'long', 
        day: 'numeric' 
      });
    };
    
    return {
      id: product.id,
      title: product.title,
      price: product.price,
      location: product.location,
      timeAgo: getTimeAgo(product.createdAt),
      image: mainImage || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop',
      isFavorite: false,
      isReserved: product.status === 'RESERVED',
      isSold: product.status === 'SOLD',
    };
  };

  // 탭별 상품 필터링 - API에서 이미 필터링된 데이터 사용
  const getFilteredProducts = () => {
    return userProducts;
  };

  const filteredProducts = getFilteredProducts();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          <span className="text-gray-600">사용자 정보를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">사용자를 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-4">요청하신 사용자가 존재하지 않습니다.</p>
          <button
            onClick={() => router.back()}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg"
          >
            이전 페이지로
          </button>
        </div>
      </div>
    );
  }

  const isMyProfile = currentUser && user.id === currentUser.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-8">
        {/* 뒤로가기 버튼 */}
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>뒤로가기</span>
        </button>

        {/* 사용자 프로필 */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* 프로필 이미지 */}
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto md:mx-0">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.username}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <UserIcon className="w-12 h-12 text-gray-500" />
              )}
            </div>

            {/* 사용자 정보 */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{user.username}</h1>
                {user.isVerified && (
                  <div className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm font-medium">인증됨</span>
                  </div>
                )}
              </div>

              {/* 평점 */}
              <div className="flex items-center justify-center md:justify-start space-x-2 mb-3">
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="font-semibold text-lg">{user.rating.toFixed(1)}</span>
                </div>
                <span className="text-gray-500">({user.ratingCount}개 리뷰)</span>
              </div>

              {/* 기타 정보 */}
              <div className="space-y-2 text-gray-600">
                {user.location && (
                  <div className="flex items-center justify-center md:justify-start space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>{user.location}</span>
                  </div>
                )}
                <div className="flex items-center justify-center md:justify-start space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatJoinDate(user.createdAt)} 가입</span>
                </div>
              </div>
            </div>

            {/* 액션 버튼 */}
            {!isMyProfile && (
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleChat}
                  disabled={chatLoading}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  {chatLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <MessageCircle className="w-5 h-5" />
                  )}
                  <span>{chatLoading ? '채팅방 생성 중...' : '채팅하기'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 판매 상품 섹션 */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
              <Package className="w-6 h-6 text-orange-500" />
              <span>{isMyProfile ? '내 상품' : '판매 상품'}</span>
            </h2>
            
            <div className="text-gray-500">
              총 {userProducts.length}개
            </div>
          </div>

          {/* 상품 상태 탭 */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              전체 ({userProducts.length})
            </button>
            <button
              onClick={() => setActiveTab('available')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === 'available'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              판매중 ({userProducts.filter(p => p.status === 'AVAILABLE').length})
            </button>
            <button
              onClick={() => setActiveTab('sold')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === 'sold'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              판매완료 ({userProducts.filter(p => p.status === 'SOLD').length})
            </button>
          </div>

          {/* 상품 목록 */}
          {productsLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              <span className="ml-2 text-gray-600">상품을 불러오는 중...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {activeTab === 'all' ? '등록된 상품이 없습니다' :
                 activeTab === 'available' ? '판매중인 상품이 없습니다' :
                 '판매완료된 상품이 없습니다'}
              </h3>
              <p className="text-gray-600">
                {isMyProfile ? '첫 번째 상품을 등록해보세요!' : '아직 등록된 상품이 없어요.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} {...formatProductForCard(product)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 