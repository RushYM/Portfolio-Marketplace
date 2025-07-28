'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, Package, Trash2, Search, Loader2 } from 'lucide-react';
import ProductCard from '@/components/common/ProductCard';
import { ProductService, Product } from '@/services/productService';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // 찜 목록 로드 (임시 데이터)
  useEffect(() => {
    const loadWishlist = async () => {
      if (!isAuthenticated) {
        router.push('/auth/login');
        return;
      }

      try {
        setLoading(true);
        // TODO: 실제 찜 목록 API 호출
        // 임시로 최신 상품 몇 개를 가져와서 표시
        const products = await ProductService.getRecentProducts(6);
        setWishlistProducts(products);
      } catch (error) {
        console.error('찜 목록 로드 실패:', error);
        toast.error('찜 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();
  }, [isAuthenticated, router]);

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
      isFavorite: true, // 찜 목록에서는 모두 찜된 상태
      isReserved: product.status === 'RESERVED',
      isSold: product.status === 'SOLD',
    };
  };

  // 전체 선택/해제
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(wishlistProducts.map(p => p.id)));
    }
    setSelectAll(!selectAll);
  };

  // 개별 선택/해제
  const handleSelectItem = (productId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedItems(newSelected);
    setSelectAll(newSelected.size === wishlistProducts.length);
  };

  // 선택한 상품들을 찜 목록에서 제거
  const handleRemoveSelected = () => {
    if (selectedItems.size === 0) {
      toast.error('삭제할 상품을 선택해주세요.');
      return;
    }

    const selectedCount = selectedItems.size;
    if (!confirm(`선택한 ${selectedCount}개의 상품을 찜 목록에서 제거하시겠습니까?`)) {
      return;
    }

    // TODO: 실제 찜 제거 API 호출
    const updatedProducts = wishlistProducts.filter(p => !selectedItems.has(p.id));
    setWishlistProducts(updatedProducts);
    setSelectedItems(new Set());
    setSelectAll(false);
    toast.success(`${selectedCount}개의 상품이 찜 목록에서 제거되었습니다.`);
  };

  // 단일 상품 찜 해제
  const handleRemoveSingle = (productId: string, productTitle: string) => {
    if (!confirm(`"${productTitle}"을(를) 찜 목록에서 제거하시겠습니까?`)) {
      return;
    }

    // TODO: 실제 찜 제거 API 호출
    const updatedProducts = wishlistProducts.filter(p => p.id !== productId);
    setWishlistProducts(updatedProducts);
    
    // 선택 목록에서도 제거
    const newSelected = new Set(selectedItems);
    newSelected.delete(productId);
    setSelectedItems(newSelected);
    setSelectAll(newSelected.size === updatedProducts.length);
    
    toast.success('찜 목록에서 제거되었습니다.');
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          <span className="text-gray-600">찜 목록을 불러오는 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom max-w-6xl">
        {/* 헤더 */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center space-x-3">
                <Heart className="w-8 h-8 text-red-500 fill-current" />
                <span>찜한 상품</span>
              </h1>
              <p className="text-gray-600">
                관심있는 상품들을 모아서 확인해보세요. 총 {wishlistProducts.length}개의 상품이 있습니다.
              </p>
            </div>
            
            {wishlistProducts.length > 0 && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-600">전체선택</span>
                </div>
                
                {selectedItems.size > 0 && (
                  <button
                    onClick={handleRemoveSelected}
                    className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>선택 삭제 ({selectedItems.size})</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 찜 목록 */}
        {wishlistProducts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
            <Heart className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">찜한 상품이 없습니다</h3>
            <p className="text-gray-600 mb-8 text-lg">
              마음에 드는 상품을 찜해보세요.<br />
              찜한 상품들을 한곳에서 쉽게 관리할 수 있습니다.
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                href="/search"
                className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Search className="w-5 h-5" />
                <span>상품 둘러보기</span>
              </Link>
              <Link
                href="/"
                className="flex items-center space-x-2 border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Package className="w-5 h-5" />
                <span>홈으로 가기</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 상품 그리드 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistProducts.map((product) => (
                <div key={product.id} className="relative">
                  {/* 선택 체크박스 */}
                  <div className="absolute top-3 left-3 z-10">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(product.id)}
                      onChange={() => handleSelectItem(product.id)}
                      className="w-5 h-5 text-orange-500 bg-white rounded border-2 border-gray-300 focus:ring-orange-500 shadow-sm"
                    />
                  </div>
                  
                  {/* 찜 해제 버튼 */}
                  <div className="absolute top-3 right-3 z-10">
                    <button
                      onClick={() => handleRemoveSingle(product.id, product.title)}
                      className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
                      title="찜 해제"
                    >
                      <Heart className="w-5 h-5 text-red-500 fill-current hover:text-red-600" />
                    </button>
                  </div>
                  
                  <ProductCard {...formatProductForCard(product)} />
                </div>
              ))}
            </div>

            {/* 추가 액션 버튼들 */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/search"
                  className="flex items-center justify-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  <Search className="w-5 h-5" />
                  <span>더 많은 상품 찾기</span>
                </Link>
                
                <Link
                  href="/products/create"
                  className="flex items-center justify-center space-x-2 border border-orange-500 text-orange-500 hover:bg-orange-50 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  <Package className="w-5 h-5" />
                  <span>내 상품 등록하기</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 