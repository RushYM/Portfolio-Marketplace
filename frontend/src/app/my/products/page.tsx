'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Edit3, Trash2, Eye, Heart, Package, Plus, Loader2 } from 'lucide-react';
import { ProductService, Product } from '@/services/productService';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

// 상태별 스타일
const getStatusStyle = (status: string) => {
  switch (status) {
    case 'AVAILABLE':
      return 'bg-green-100 text-green-800';
    case 'RESERVED':
      return 'bg-yellow-100 text-yellow-800';
    case 'SOLD':
      return 'bg-gray-100 text-gray-800';
    case 'DELETED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// 상태별 라벨
const getStatusLabel = (status: string) => {
  switch (status) {
    case 'AVAILABLE':
      return '판매중';
    case 'RESERVED':
      return '예약중';
    case 'SOLD':
      return '판매완료';
    case 'DELETED':
      return '삭제됨';
    default:
      return status;
  }
};

export default function MyProductsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const statusTabs = [
    { id: 'ALL', label: '전체', count: products.length },
    { id: 'AVAILABLE', label: '판매중', count: products.filter(p => p.status === 'AVAILABLE').length },
    { id: 'RESERVED', label: '예약중', count: products.filter(p => p.status === 'RESERVED').length },
    { id: 'SOLD', label: '판매완료', count: products.filter(p => p.status === 'SOLD').length },
  ];

  // 상품 목록 로드
  useEffect(() => {
    const loadMyProducts = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const result = await ProductService.getUserProducts(user.id, 1, 50, 'AVAILABLE');
        setProducts(result.data);
      } catch (error) {
        console.error('내 상품 목록 로드 실패:', error);
        toast.error('상품 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user) {
      loadMyProducts();
    } else if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [user, isAuthenticated, router]);

  // 상품 삭제
  const handleDelete = async (productId: string, productTitle: string) => {
    if (!confirm(`"${productTitle}" 상품을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await ProductService.deleteProduct(productId);
      setProducts(products.map(p => 
        p.id === productId ? { ...p, status: 'DELETED' } : p
      ));
      toast.success('상품이 삭제되었습니다.');
    } catch (error: any) {
      console.error('상품 삭제 실패:', error);
      const errorMessage = error.response?.data?.message || '상품 삭제에 실패했습니다.';
      toast.error(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
    }
  };

  // 필터링된 상품 목록
  const filteredProducts = selectedStatus === 'ALL' 
    ? products 
    : products.filter(product => product.status === selectedStatus);

  // 가격 포맷팅
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom max-w-6xl">
        {/* 헤더 */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">내 상품 관리</h1>
              <p className="text-gray-600">등록한 상품을 관리하고 판매 현황을 확인해보세요.</p>
            </div>
            <Link
              href="/products/create"
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>상품 등록</span>
            </Link>
          </div>
        </div>

        {/* 상태별 탭 */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            {statusTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  selectedStatus === tab.id
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  selectedStatus === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 상품 목록 */}
        <div className="bg-white rounded-2xl shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              <span className="ml-2 text-gray-600">상품을 불러오는 중...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {selectedStatus === 'ALL' ? '등록된 상품이 없습니다' : `${statusTabs.find(t => t.id === selectedStatus)?.label} 상품이 없습니다`}
              </h3>
              <p className="text-gray-600 mb-6">새로운 상품을 등록해보세요.</p>
              <Link
                href="/products/create"
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center space-x-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>상품 등록하기</span>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredProducts.map((product) => {
                const mainImage = product.images[product.mainImageIndex] || product.images[0];
                
                return (
                  <div key={product.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      {/* 상품 이미지 */}
                      <div className="flex-shrink-0">
                        <img
                          src={mainImage || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop'}
                          alt={product.title}
                          className="w-20 h-20 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop';
                          }}
                        />
                      </div>

                      {/* 상품 정보 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {product.title}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(product.status)}`}>
                            {getStatusLabel(product.status)}
                          </span>
                        </div>
                        <p className="text-lg font-bold text-orange-500 mb-1">
                          {formatPrice(product.price)}원
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{product.location}</span>
                          <span>등록일: {formatDate(product.createdAt)}</span>
                          <div className="flex items-center space-x-3">
                            <span className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>{product.viewCount}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Heart className="w-4 h-4" />
                              <span>{product._count.favorites}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 액션 버튼 */}
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/products/${product.id}`}
                          className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                          title="상품 보기"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                        {product.status !== 'DELETED' && (
                          <>
                            <Link
                              href={`/products/${product.id}/edit`}
                              className="p-2 text-blue-500 hover:text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
                              title="수정"
                            >
                              <Edit3 className="w-5 h-5" />
                            </Link>
                            <button
                              onClick={() => handleDelete(product.id, product.title)}
                              className="p-2 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                              title="삭제"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 