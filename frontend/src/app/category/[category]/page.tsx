'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Filter, SlidersHorizontal, Grid3X3, List, Loader2, ArrowLeft } from 'lucide-react';
import ProductCard from '@/components/common/ProductCard';
import { ProductService, Product, ProductQueryParams } from '@/services/productService';
import toast from 'react-hot-toast';

// 카테고리 매핑
const categoryMap: { [key: string]: { label: string; icon: string; description: string } } = {
  'ELECTRONICS': {
    label: '전자기기',
    icon: '📱',
    description: '스마트폰, 노트북, 태블릿, 가전제품 등 다양한 전자기기'
  },
  'FASHION': {
    label: '패션/의류',
    icon: '👕',
    description: '옷, 신발, 가방, 액세서리 등 패션 아이템'
  },
  'HOME': {
    label: '가구/생활',
    icon: '🏠',
    description: '가구, 인테리어, 생활용품, 주방용품 등'
  },
  'BOOKS': {
    label: '도서',
    icon: '📚',
    description: '소설, 전문서적, 만화, 잡지 등 모든 종류의 책'
  },
  'SPORTS': {
    label: '스포츠',
    icon: '⚽',
    description: '운동용품, 스포츠웨어, 헬스기구 등'
  },
  'BEAUTY': {
    label: '뷰티',
    icon: '💄',
    description: '화장품, 스킨케어, 향수, 미용기기 등'
  },
  'TOYS': {
    label: '장난감/취미',
    icon: '🧸',
    description: '장난감, 게임, 키덜트, 수집품 등 취미용품'
  },
  'OTHER': {
    label: '기타',
    icon: '📦',
    description: '위 카테고리에 속하지 않는 다양한 상품'
  },
};

// 정렬 옵션
const sortOptions = [
  { value: 'createdAt:desc', label: '최신순' },
  { value: 'price:asc', label: '가격 낮은순' },
  { value: 'price:desc', label: '가격 높은순' },
  { value: 'viewCount:desc', label: '조회수순' },
  { value: 'likeCount:desc', label: '찜 많은순' },
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

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const category = params.category as string;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // 필터 상태
  const [filters, setFilters] = useState({
    condition: '',
    minPrice: '',
    maxPrice: '',
    location: '',
    sortBy: 'createdAt:desc',
  });

  // 카테고리 정보
  const categoryInfo = categoryMap[category?.toUpperCase()];

  // 상품 목록 로드
  const loadProducts = async (page = 1) => {
    if (!category || !categoryInfo) return;

    try {
      setLoading(true);
      
      const [sortBy, sortOrder] = filters.sortBy.split(':');
      
      const queryParams: ProductQueryParams = {
        category: category.toUpperCase(),
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
      console.error('카테고리 상품 목록 로드 실패:', error);
      toast.error('상품 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 초기 로드 및 필터 변경 시 실행
  useEffect(() => {
    if (category && categoryInfo) {
      loadProducts(1);
    } else if (category && !categoryInfo) {
      // 잘못된 카테고리인 경우 404 처리
      router.push('/404');
    }
  }, [category, categoryInfo, filters, router]);

  // 필터 변경
  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  // 필터 초기화
  const resetFilters = () => {
    setFilters({
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

  if (!categoryInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">카테고리를 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-4">요청하신 카테고리가 존재하지 않습니다.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg"
          >
            홈으로 가기
          </button>
        </div>
      </div>
    );
  }

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

        {/* 카테고리 헤더 */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center space-x-3">
                <span className="text-4xl">{categoryInfo.icon}</span>
                <span>{categoryInfo.label}</span>
              </h1>
              <p className="text-gray-600 text-lg mb-4">
                {categoryInfo.description}
              </p>
              <p className="text-gray-500">
                총 {total.toLocaleString()}개의 상품이 있습니다
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              {categoryInfo.label} 상품
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
            <div className="text-6xl mb-4">{categoryInfo.icon}</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {categoryInfo.label} 상품이 없습니다
            </h3>
            <p className="text-gray-600 mb-6">
              아직 등록된 {categoryInfo.label} 상품이 없어요.<br />
              다른 조건으로 검색해보거나 첫 번째 상품을 등록해보세요!
            </p>
            <div className="space-x-4">
              <button
                onClick={resetFilters}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg transition-colors"
              >
                필터 초기화
              </button>
              <button
                onClick={() => router.push('/products/create')}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                상품 등록하기
              </button>
            </div>
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