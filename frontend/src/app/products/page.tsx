'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Package, Filter, SlidersHorizontal, Grid3X3, List, Loader2 } from 'lucide-react';
import ProductCard from '@/components/common/ProductCard';
import { ProductService, Product, ProductQueryParams } from '@/services/productService';
import toast from 'react-hot-toast';

// 정렬 옵션
const sortOptions = [
  { value: 'createdAt:desc', label: '최신순' },
  { value: 'price:asc', label: '가격 낮은순' },
  { value: 'price:desc', label: '가격 높은순' },
  { value: 'viewCount:desc', label: '조회수순' },
  { value: 'likeCount:desc', label: '찜 많은순' },
];

// 카테고리 옵션
const categories = [
  { value: '', label: '전체 카테고리' },
  { value: 'ELECTRONICS', label: '전자기기' },
  { value: 'FASHION', label: '패션/의류' },
  { value: 'HOME', label: '가구/생활' },
  { value: 'BOOKS', label: '도서' },
  { value: 'SPORTS', label: '스포츠' },
  { value: 'BEAUTY', label: '뷰티' },
  { value: 'TOYS', label: '장난감/취미' },
  { value: 'OTHER', label: '기타' },
];

// 상품 상태 옵션
const conditions = [
  { value: '', label: '전체 상태' },
  { value: 'NEW', label: '새상품' },
  { value: 'LIKE_NEW', label: '거의 새것' },
  { value: 'GOOD', label: '좋음' },
  { value: 'FAIR', label: '보통' },
  { value: 'POOR', label: '나쁨' },
];

export default function ProductsPage() {
  const searchParams = useSearchParams();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // 필터 상태
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    condition: searchParams.get('condition') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    location: searchParams.get('location') || '',
    sortBy: searchParams.get('sort') || 'createdAt:desc',
  });

  // 상품 목록 로드
  const loadProducts = async (page = 1) => {
    try {
      setLoading(true);
      
      const [sortBy, sortOrder] = filters.sortBy.split(':');
      
      const queryParams: ProductQueryParams = {
        category: filters.category || undefined,
        condition: filters.condition || undefined,
        minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
        location: filters.location || undefined,
        sortBy: sortBy as any,
        sortOrder: sortOrder as 'asc' | 'desc',
        page,
        limit: 12,
      };

      const result = await ProductService.getProducts(queryParams);
      setProducts(result.data);
      setCurrentPage(result.pagination.page);
      setTotalPages(result.pagination.totalPages);
      setTotal(result.pagination.total);
    } catch (error) {
      console.error('상품 목록 로드 실패:', error);
      toast.error('상품 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 초기 로드 및 필터 변경 시 실행
  useEffect(() => {
    loadProducts(1);
  }, [filters]);

  // 필터 변경
  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  // 필터 초기화
  const resetFilters = () => {
    setFilters({
      category: '',
      condition: '',
      minPrice: '',
      maxPrice: '',
      location: '',
      sortBy: 'createdAt:desc',
    });
  };

  // 페이지 변경
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadProducts(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      isFavorite: false, // TODO: 실제 찜하기 상태 연동
      isReserved: product.status === 'RESERVED',
      isSold: product.status === 'SOLD',
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-8">
        {/* 헤더 */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center space-x-3">
                <Package className="w-8 h-8 text-orange-500" />
                <span>전체 상품</span>
              </h1>
              <p className="text-gray-600">
                다양한 중고 상품들을 만나보세요. 총 {total.toLocaleString()}개의 상품이 있습니다.
              </p>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span>필터</span>
            </button>
          </div>

          {/* 필터 섹션 */}
          {showFilters && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 카테고리 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    카테고리
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 상품 상태 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    상품 상태
                  </label>
                  <select
                    value={filters.condition}
                    onChange={(e) => handleFilterChange('condition', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {conditions.map((condition) => (
                      <option key={condition.value} value={condition.value}>
                        {condition.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 지역 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    거래 지역
                  </label>
                  <input
                    type="text"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    placeholder="예: 서울시 강남구"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* 가격 범위 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    최소 가격
                  </label>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    최대 가격
                  </label>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    placeholder="999999999"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* 필터 액션 */}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  초기화
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 결과 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">
              상품 목록
            </h2>
            <span className="text-gray-500">
              {total.toLocaleString()}개 상품
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* 정렬 */}
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* 뷰 모드 */}
            <div className="flex border border-gray-300 rounded-md">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* 상품 목록 */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            <span className="ml-2 text-gray-600">상품을 불러오는 중...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              등록된 상품이 없습니다
            </h3>
            <p className="text-gray-600 mb-6">
              다른 조건으로 검색해보거나 새로운 상품을 등록해보세요.
            </p>
            <button
              onClick={resetFilters}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg"
            >
              필터 초기화
            </button>
          </div>
        ) : (
          <>
            {/* 그리드 뷰 */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} {...formatProductForCard(product)} />
                ))}
              </div>
            )}

            {/* 리스트 뷰 */}
            {viewMode === 'list' && (
              <div className="space-y-4">
                {products.map((product) => {
                  const productData = formatProductForCard(product);
                  return (
                    <div key={product.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-4">
                        <img
                          src={productData.image}
                          alt={product.title}
                          className="w-24 h-24 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop';
                          }}
                        />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.title}</h3>
                          <p className="text-xl font-bold text-orange-500 mb-2">
                            {product.price.toLocaleString()}원
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{product.location}</span>
                            <span>{productData.timeAgo}</span>
                            <span>조회 {product.viewCount}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <div className="flex space-x-2">
                  {currentPage > 1 && (
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      이전
                    </button>
                  )}
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = Math.max(1, currentPage - 2) + i;
                    if (page > totalPages) return null;
                    
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-md transition-colors ${
                          page === currentPage
                            ? 'bg-orange-500 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  {currentPage < totalPages && (
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      다음
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 