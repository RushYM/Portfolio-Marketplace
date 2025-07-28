'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { MapPin, Loader2 } from 'lucide-react';
import { ProductService, UpdateProductData, Product } from '@/services/productService';
import { useAuthStore } from '@/store/authStore';
import ImageUpload from '@/components/common/ImageUpload';
import toast from 'react-hot-toast';

// 카테고리 옵션
const categories = [
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
  { value: 'NEW', label: '새상품' },
  { value: 'LIKE_NEW', label: '거의 새것' },
  { value: 'GOOD', label: '좋음' },
  { value: 'FAIR', label: '보통' },
  { value: 'POOR', label: '나쁨' },
];

// 판매 상태 옵션
const statuses = [
  { value: 'AVAILABLE', label: '판매중' },
  { value: 'RESERVED', label: '예약중' },
  { value: 'SOLD', label: '판매완료' },
];

// 유효성 검사 스키마
const updateProductSchema = yup.object({
  title: yup
    .string()
    .required('상품 제목을 입력해주세요.')
    .min(2, '제목은 최소 2자 이상이어야 합니다.')
    .max(100, '제목은 최대 100자까지 가능합니다.'),
  description: yup
    .string()
    .required('상품 설명을 입력해주세요.')
    .min(10, '설명은 최소 10자 이상이어야 합니다.')
    .max(2000, '설명은 최대 2000자까지 가능합니다.'),
  price: yup
    .number()
    .required('가격을 입력해주세요.')
    .min(100, '가격은 최소 100원 이상이어야 합니다.')
    .max(99999999, '가격은 최대 99,999,999원까지 가능합니다.'),
  category: yup
    .string()
    .required('카테고리를 선택해주세요.'),
  condition: yup
    .string()
    .required('상품 상태를 선택해주세요.'),
  status: yup
    .string()
    .required('판매 상태를 선택해주세요.'),
  location: yup
    .string()
    .required('거래 지역을 입력해주세요.')
    .max(100, '지역은 최대 100자까지 가능합니다.'),
});

type FormData = yup.InferType<typeof updateProductSchema>;

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const productId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(updateProductSchema),
  });

  // 상품 정보 로드
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setIsLoading(true);
        const productData = await ProductService.getProduct(productId);
        
        // 권한 체크 (본인의 상품만 수정 가능)
        if (user && productData.seller.id !== user.id) {
          toast.error('본인의 상품만 수정할 수 있습니다.');
          router.back();
          return;
        }

        setProduct(productData);
        setImages(productData.images);
        setMainImageIndex(productData.mainImageIndex);

        // 폼에 기존 데이터 설정
        reset({
          title: productData.title,
          description: productData.description,
          price: productData.price,
          category: productData.category,
          condition: productData.condition,
          status: productData.status,
          location: productData.location,
        });
      } catch (error) {
        console.error('상품 정보 로드 실패:', error);
        toast.error('상품 정보를 불러오는데 실패했습니다.');
        router.back();
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadProduct();
    }
  }, [productId, user, reset, router]);

  // 폼 제출
  const onSubmit = async (data: FormData) => {
    if (images.length === 0) {
      toast.error('최소 1개의 상품 이미지가 필요합니다.');
      return;
    }

    try {
      setIsSubmitting(true);

      const updateData: UpdateProductData = {
        ...data,
        images,
        mainImageIndex,
      };

      await ProductService.updateProduct(productId, updateData);
      toast.success('상품이 성공적으로 수정되었습니다!');
      router.push(`/products/${productId}`);
    } catch (error: any) {
      console.error('상품 수정 실패:', error);
      const errorMessage = error.response?.data?.message || '상품 수정에 실패했습니다.';
      toast.error(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 상품 삭제
  const handleDelete = async () => {
    if (!confirm('정말로 이 상품을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await ProductService.deleteProduct(productId);
      toast.success('상품이 삭제되었습니다.');
      router.push('/my/products');
    } catch (error: any) {
      console.error('상품 삭제 실패:', error);
      const errorMessage = error.response?.data?.message || '상품 삭제에 실패했습니다.';
      toast.error(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
    }
  };

  if (isLoading) {
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
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">상품 수정</h1>
            <p className="text-gray-600">
              상품 정보를 수정하거나 판매 상태를 변경할 수 있습니다.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* 상품 이미지 업로드 */}
            <ImageUpload
              images={images}
              onImagesChange={setImages}
              mainImageIndex={mainImageIndex}
              onMainImageChange={setMainImageIndex}
              maxImages={10}
            />

            {/* 상품 제목 */}
            <div className="space-y-2">
              <label className="block text-lg font-semibold text-gray-900">
                상품 제목 <span className="text-red-500">*</span>
              </label>
              <input
                {...register('title')}
                type="text"
                placeholder="상품 제목을 입력해주세요"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {errors.title && (
                <p className="text-red-500 text-sm">{errors.title.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 카테고리 */}
              <div className="space-y-2">
                <label className="block text-lg font-semibold text-gray-900">
                  카테고리 <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('category')}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-500 text-sm">{errors.category.message}</p>
                )}
              </div>

              {/* 상품 상태 */}
              <div className="space-y-2">
                <label className="block text-lg font-semibold text-gray-900">
                  상품 상태 <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('condition')}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {conditions.map((condition) => (
                    <option key={condition.value} value={condition.value}>
                      {condition.label}
                    </option>
                  ))}
                </select>
                {errors.condition && (
                  <p className="text-red-500 text-sm">{errors.condition.message}</p>
                )}
              </div>

              {/* 판매 상태 */}
              <div className="space-y-2">
                <label className="block text-lg font-semibold text-gray-900">
                  판매 상태 <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('status')}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {statuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                {errors.status && (
                  <p className="text-red-500 text-sm">{errors.status.message}</p>
                )}
              </div>
            </div>

            {/* 가격 */}
            <div className="space-y-2">
              <label className="block text-lg font-semibold text-gray-900">
                가격 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  {...register('price', { valueAsNumber: true })}
                  type="number"
                  placeholder="100"
                  min="100"
                  max="99999999"
                  className="w-full px-4 py-3 pr-8 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  원
                </span>
              </div>
              {errors.price && (
                <p className="text-red-500 text-sm">{errors.price.message}</p>
              )}
            </div>

            {/* 거래 지역 */}
            <div className="space-y-2">
              <label className="block text-lg font-semibold text-gray-900">
                거래 지역 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  {...register('location')}
                  type="text"
                  placeholder="예: 서울시 강남구"
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              {errors.location && (
                <p className="text-red-500 text-sm">{errors.location.message}</p>
              )}
            </div>

            {/* 상품 설명 */}
            <div className="space-y-2">
              <label className="block text-lg font-semibold text-gray-900">
                상품 설명 <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('description')}
                rows={6}
                placeholder="상품에 대한 자세한 설명을 입력해주세요"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              />
              {errors.description && (
                <p className="text-red-500 text-sm">{errors.description.message}</p>
              )}
            </div>

            {/* 버튼 */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-6 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium"
              >
                삭제
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {isSubmitting ? '수정 중...' : '수정 완료'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 