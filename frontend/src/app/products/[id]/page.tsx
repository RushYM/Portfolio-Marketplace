'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Heart, 
  MessageCircle, 
  MapPin, 
  Eye, 
  Clock, 
  Star,
  Share2,
  ChevronLeft,
  ChevronRight,
  User,
  Loader2,
  Edit3
} from 'lucide-react';
import { ProductService, Product } from '@/services/productService';
import { useAuthStore } from '@/store/authStore';
import { ChatService } from '@/services/chatService';
import { FavoriteService } from '@/services/favoriteService';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  // 상품 정보 로드
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const productData = await ProductService.getProduct(productId);
        setProduct(productData);
        
        // 메인 이미지 인덱스로 초기 이미지 설정
        setCurrentImageIndex(productData.mainImageIndex || 0);

        // 로그인한 사용자의 찜 상태 확인
        if (isAuthenticated) {
          try {
            const favoriteStatus = await FavoriteService.getFavoriteStatus(productId);
            setIsFavorite(favoriteStatus.isFavorite);
          } catch (error) {
            console.error('찜 상태 확인 실패:', error);
          }
        }
      } catch (error) {
        console.error('상품 정보 로드 실패:', error);
        toast.error('상품 정보를 불러올 수 없습니다.');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      loadProduct();
    }
  }, [productId, isAuthenticated, router]);

  // 가격 포맷팅
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return '방금 전';
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    if (diffInDays < 7) return `${diffInDays}일 전`;
    
    return date.toLocaleDateString('ko-KR', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
  };

  // 카테고리 라벨 변환
  const getCategoryLabel = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'ELECTRONICS': '전자기기',
      'FASHION': '패션/의류',
      'HOME': '가구/생활',
      'BOOKS': '도서',
      'SPORTS': '스포츠',
      'BEAUTY': '뷰티',
      'TOYS': '장난감/취미',
      'OTHER': '기타',
    };
    return categoryMap[category] || category;
  };

  // 상품 상태 라벨 변환
  const getConditionLabel = (condition: string) => {
    const conditionMap: { [key: string]: string } = {
      'NEW': '새상품',
      'LIKE_NEW': '거의 새것',
      'GOOD': '좋음',
      'FAIR': '보통',
      'POOR': '나쁨',
    };
    return conditionMap[condition] || condition;
  };

  // 판매 상태 스타일
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800';
      case 'RESERVED':
        return 'bg-yellow-100 text-yellow-800';
      case 'SOLD':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return '판매중';
      case 'RESERVED':
        return '예약중';
      case 'SOLD':
        return '판매완료';
      default:
        return status;
    }
  };

  // 이미지 네비게이션
  const goToPrevImage = () => {
    if (product && product.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  const goToNextImage = () => {
    if (product && product.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  // 찜하기 토글
  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다.');
      router.push('/auth/login');
      return;
    }
    
    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await FavoriteService.removeFromFavorites(productId);
        setIsFavorite(false);
        toast.success('찜 목록에서 제거되었습니다.');
      } else {
        await FavoriteService.addToFavorites(productId);
        setIsFavorite(true);
        toast.success('찜 목록에 추가되었습니다.');
      }
    } catch (error) {
      console.error('찜 토글 실패:', error);
      toast.error('찜 목록 변경에 실패했습니다.');
    } finally {
      setFavoriteLoading(false);
    }
  };

  // 채팅하기
  const handleChat = async () => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다.');
      router.push('/auth/login');
      return;
    }

    if (!product) return;

    setChatLoading(true);
    try {
      const chatRoom = await ChatService.createOrFindChatRoom(product.seller.id, productId);
      toast.success('채팅방으로 이동합니다.');
      router.push(`/chat/${chatRoom.id}`);
    } catch (error) {
      console.error('채팅 생성 실패:', error);
      toast.error('채팅방 생성에 실패했습니다.');
    } finally {
      setChatLoading(false);
    }
  };

  // 공유하기
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.title,
          text: `${product?.title} - ${formatPrice(product?.price || 0)}원`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('공유 취소됨');
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('링크가 복사되었습니다.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          <span className="text-gray-600">상품 정보를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">상품을 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-4">요청하신 상품이 존재하지 않거나 삭제되었습니다.</p>
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

  const isMyProduct = user && product.seller.id === user.id;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상품 이미지 섹션 */}
      <div className="bg-white">
        <div className="container-custom max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-8">
            {/* 이미지 갤러리 */}
            <div className="space-y-4">
              {/* 메인 이미지 */}
              <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden">
                {product.images.length > 0 ? (
                  <>
                    <img
                      src={product.images[currentImageIndex]}
                      alt={product.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=800&fit=crop';
                      }}
                    />
                    
                    {/* 이미지 네비게이션 버튼 */}
                    {product.images.length > 1 && (
                      <>
                        <button
                          onClick={goToPrevImage}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={goToNextImage}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        
                        {/* 이미지 인디케이터 */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                          {product.images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`w-2 h-2 rounded-full transition-all ${
                                index === currentImageIndex 
                                  ? 'bg-white' 
                                  : 'bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <User className="w-16 h-16 mx-auto mb-2" />
                      <p>이미지가 없습니다</p>
                    </div>
                  </div>
                )}
              </div>

              {/* 썸네일 이미지들 */}
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex 
                          ? 'border-orange-500' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 상품 정보 */}
            <div className="space-y-6">
              {/* 판매 상태 */}
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(product.status)}`}>
                  {getStatusLabel(product.status)}
                </span>
                
                {isMyProduct && (
                  <Link
                    href={`/products/${product.id}/edit`}
                    className="flex items-center space-x-1 text-gray-600 hover:text-orange-500 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span className="text-sm">수정</span>
                  </Link>
                )}
              </div>

              {/* 제목 */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{product.viewCount}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Heart className="w-4 h-4" />
                    <span>{product._count.favorites}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(product.createdAt)}</span>
                  </span>
                </div>
              </div>

              {/* 가격 */}
              <div className="py-4 border-y border-gray-100">
                <p className="text-4xl font-bold text-orange-500">
                  {formatPrice(product.price)}
                  <span className="text-lg text-gray-600 ml-1">원</span>
                </p>
              </div>

              {/* 상품 정보 */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">카테고리</span>
                    <p className="font-medium">{getCategoryLabel(product.category)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">상품 상태</span>
                    <p className="font-medium">{getConditionLabel(product.condition)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">거래 지역</span>
                  <span className="font-medium">{product.location}</span>
                </div>
              </div>

              {/* 판매자 정보 */}
              <div className="p-4 bg-gray-50 rounded-2xl">
                <Link 
                  href={`/users/${product.seller.id}`}
                  className="flex items-center space-x-3 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                >
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    {product.seller.profileImage ? (
                      <img
                        src={product.seller.profileImage}
                        alt={product.seller.username}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">{product.seller.username}</h3>
                      {product.seller.isVerified && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          인증
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                      <span className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>{product.seller.rating.toFixed(1)}</span>
                      </span>
                      <span>{product.seller.location}</span>
                    </div>
                  </div>
                </Link>
              </div>

              {/* 액션 버튼들 */}
              <div className="space-y-3">
                {!isMyProduct && product.status === 'AVAILABLE' && (
                  <div className="flex space-x-3">
                    <button
                      onClick={handleFavoriteToggle}
                      className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                        isFavorite
                          ? 'bg-red-50 text-red-600 border border-red-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      disabled={favoriteLoading}
                    >
                      <Heart className={`w-5 h-5 mx-auto ${isFavorite ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={handleChat}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
                      disabled={chatLoading}
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>채팅하기</span>
                    </button>
                  </div>
                )}
                
                <button
                  onClick={handleShare}
                  className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                >
                  <Share2 className="w-5 h-5" />
                  <span>공유하기</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 상품 설명 */}
      <div className="bg-white mt-8">
        <div className="container-custom max-w-4xl py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">상품 설명</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
              {product.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 