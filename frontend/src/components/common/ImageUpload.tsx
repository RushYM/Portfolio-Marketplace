'use client';

import { useState, useRef } from 'react';
import { Plus, X, Image as ImageIcon, Star } from 'lucide-react';
import { UploadService } from '@/services/uploadService';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  mainImageIndex: number;
  onMainImageChange: (index: number) => void;
  maxImages?: number;
}

export default function ImageUpload({
  images,
  onImagesChange,
  mainImageIndex,
  onMainImageChange,
  maxImages = 10,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    // 현재 인증 상태 확인 로그 추가
    const token = localStorage.getItem('accessToken');
    console.log('이미지 업로드 시작:', {
      filesCount: files.length,
      hasToken: !!token,
      tokenLength: token?.length,
      authStoreState: { isAuthenticated: true }, // useAuthStore를 여기서 바로 가져올 수 없으므로
    });

    // 현재 이미지 수와 새로 선택한 파일 수를 합쳐서 최대 개수 체크
    if (images.length + files.length > maxImages) {
      toast.error(`최대 ${maxImages}개의 이미지만 업로드 가능합니다.`);
      return;
    }

    // 파일 형식 체크
    const validFiles = files.filter(file => {
      const isValidType = file.type.match(/^image\/(jpg|jpeg|png|gif|webp)$/);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB

      if (!isValidType) {
        toast.error(`${file.name}은(는) 지원하지 않는 파일 형식입니다.`);
        return false;
      }
      
      if (!isValidSize) {
        toast.error(`${file.name}의 크기가 5MB를 초과합니다.`);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    try {
      setIsUploading(true);
      console.log('UploadService.uploadImages 호출 시작');
      const result = await UploadService.uploadImages(validFiles);
      console.log('이미지 업로드 성공:', result);
      
      const newImages = [...images, ...result.data.imageUrls];
      onImagesChange(newImages);
      
      toast.success(`${validFiles.length}개의 이미지가 업로드되었습니다.`);
    } catch (error: any) {
      console.error('이미지 업로드 에러:', error);
      
      // 401 인증 오류의 경우 특별 처리 (API 인터셉터가 이미 처리하지만 추가 안내)
      if (error.response?.status === 401) {
        toast.error('로그인이 만료되었습니다. 로그인 페이지로 이동합니다.');
        return; // API 인터셉터가 리디렉션을 처리함
      }
      
      const errorMessage = error.response?.data?.message || error.message || '이미지 업로드에 실패했습니다.';
      toast.error(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
    } finally {
      setIsUploading(false);
      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    
    // 메인 이미지가 삭제된 경우 처리
    if (index === mainImageIndex) {
      onMainImageChange(0); // 첫 번째 이미지를 메인으로 설정
    } else if (index < mainImageIndex) {
      onMainImageChange(mainImageIndex - 1); // 인덱스 조정
    }
  };

  const handleSetMainImage = (index: number) => {
    onMainImageChange(index);
    toast.success('메인 이미지가 설정되었습니다.');
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-lg font-semibold text-gray-900">
          상품 이미지 <span className="text-red-500">*</span>
        </label>
        <span className="text-sm text-gray-500">
          {images.length}/{maxImages}
        </span>
      </div>
      
      <p className="text-sm text-gray-600">
        이미지를 클릭하면 메인 이미지로 설정됩니다. 메인 이미지는 상품 목록에서 썸네일로 사용됩니다.
      </p>

      {/* 이미지 그리드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* 업로드된 이미지들 */}
        {images.map((imageUrl, index) => (
          <div key={index} className="relative group">
            <div
              className={`relative aspect-square rounded-lg border-2 overflow-hidden cursor-pointer transition-all ${
                index === mainImageIndex
                  ? 'border-orange-500 ring-2 ring-orange-200'
                  : 'border-gray-200 hover:border-orange-300'
              }`}
              onClick={() => handleSetMainImage(index)}
            >
              <img
                src={imageUrl}
                alt={`상품 이미지 ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop';
                }}
              />
              
              {/* 메인 이미지 표시 */}
              {index === mainImageIndex && (
                <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center space-x-1">
                  <Star className="w-3 h-3 fill-current" />
                  <span>메인</span>
                </div>
              )}

              {/* 삭제 버튼 */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage(index);
                }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}

        {/* 업로드 버튼 */}
        {images.length < maxImages && (
          <button
            type="button"
            onClick={handleUploadClick}
            disabled={isUploading}
            className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-orange-300 flex flex-col items-center justify-center text-gray-500 hover:text-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            ) : (
              <>
                <Plus className="w-8 h-8 mb-2" />
                <span className="text-sm font-medium">이미지 추가</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* 빈 상태 */}
      {images.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">상품 이미지를 업로드해주세요</p>
          <button
            type="button"
            onClick={handleUploadClick}
            disabled={isUploading}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? '업로드 중...' : '이미지 선택'}
          </button>
        </div>
      )}

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpg,image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
} 