'use client';

import { Heart, MapPin, Clock } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  location: string;
  timeAgo: string;
  image: string;
  isFavorite?: boolean;
  isReserved?: boolean;
  isSold?: boolean;
}

export default function ProductCard({
  id,
  title,
  price,
  location,
  timeAgo,
  image,
  isFavorite = false,
  isReserved = false,
  isSold = false,
}: ProductCardProps) {
  const [liked, setLiked] = useState(isFavorite);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원';
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked(!liked);
  };

  return (
    <Link href={`/products/${id}`}>
      <div className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden card-hover">
        {/* 이미지 섹션 */}
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* 상태 배지 */}
          {(isReserved || isSold) && (
            <div className="absolute top-3 left-3 z-10">
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-lg ${
                  isSold
                    ? 'bg-gray-800 text-white'
                    : 'bg-orange-500 text-white'
                }`}
              >
                {isSold ? '판매완료' : '예약중'}
              </span>
            </div>
          )}

          {/* 찜하기 버튼 */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 z-10 w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all duration-200"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                liked
                  ? 'text-red-500 fill-red-500'
                  : 'text-gray-600 hover:text-red-500'
              }`}
            />
          </button>

          {/* 그라데이션 오버레이 (판매완료/예약중일 때) */}
          {(isReserved || isSold) && (
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          )}
        </div>

        {/* 콘텐츠 섹션 */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-500 transition-colors">
            {title}
          </h3>
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold text-orange-500">
              {formatPrice(price)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <MapPin className="w-3 h-3" />
              <span>{location}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{timeAgo}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
} 