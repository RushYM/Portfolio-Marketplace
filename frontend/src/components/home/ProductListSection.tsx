'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProductCard from '../common/ProductCard';
import { ChevronRight, Clock, Loader2 } from 'lucide-react';
import { ProductService, Product } from '@/services/productService';
import toast from 'react-hot-toast';

export default function ProductListSection() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const itemsPerPage = 8;

  // 상품 데이터 로드
  const loadProducts = async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const result = await ProductService.getProducts({
        page,
        limit: itemsPerPage,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      
      if (append) {
        setProducts(prev => [...prev, ...result.data]);
      } else {
        setProducts(result.data);
      }

      setCurrentPage(page);
      setHasMore(page < result.pagination.totalPages);
    } catch (error) {
      console.error('상품 로드 실패:', error);
      toast.error('상품을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    loadProducts(1);
  }, []);

  // 더보기 처리
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadProducts(currentPage + 1, true);
    }
  };

  // 전체보기 처리
  const handleViewAll = () => {
    router.push('/products');
  };

  // ProductCard에 맞는 형태로 데이터 변환
  const formatProductForCard = (product: Product) => {
    // 메인 이미지 인덱스를 사용하여 썸네일 선택
    const mainImage = product.images[product.mainImageIndex] || product.images[0];
    
    return {
      id: product.id,
      title: product.title,
      price: product.price,
      location: product.location,
      timeAgo: getTimeAgo(product.createdAt),
      image: mainImage ,
      isFavorite: false, // TODO: 실제 찜하기 상태 연동
      isReserved: product.status === 'RESERVED',
      isSold: product.status === 'SOLD',
    };
  };

  // 시간 경과 계산 함수
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

  return (
    <section className="py-16 bg-gray-50">
      <div className="container-custom">
        {/* 섹션 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Clock className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-bold text-gray-900">최신 상품</h2>
          </div>

          <button
            onClick={handleViewAll}
            className="text-orange-500 hover:text-orange-600 font-medium flex items-center space-x-1 transition-colors"
          >
            <span>전체보기</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 로딩 상태 */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            <span className="ml-2 text-gray-600">상품을 불러오는 중...</span>
          </div>
        ) : (
          <>
            {/* 상품 그리드 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {products.length > 0 ? (
                products.map((product) => (
                  <ProductCard key={product.id} {...formatProductForCard(product)} />
                ))
              ) : (
                <div className="col-span-full text-center py-20">
                  <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">등록된 상품이 없습니다.</p>
                  <p className="text-gray-400 text-sm mt-2">첫 번째 상품을 등록해보세요!</p>
                </div>
              )}
            </div>

            {/* 더보기/전체보기 버튼들 */}
            {products.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {/* 더보기 버튼 */}
                {hasMore && (
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 px-8 py-3 rounded-xl font-medium transition-colors inline-flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>불러오는 중...</span>
                      </>
                    ) : (
                      <>
                        <span>더 많은 상품 보기</span>
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}

                {/* 전체보기 버튼 */}
                <button
                  onClick={handleViewAll}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-medium transition-colors inline-flex items-center space-x-2"
                >
                  <span>모든 상품 보기</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* 더 이상 상품이 없을 때 메시지 */}
            {!hasMore && products.length > 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">모든 상품을 확인했습니다!</p>
                <button
                  onClick={handleViewAll}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  상품 검색하기
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
} 