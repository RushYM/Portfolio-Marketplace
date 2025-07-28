'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CategorySection() {
  const categories = [
    { id: 'electronics', name: '전자기기', icon: '📱', slug: 'ELECTRONICS' },
    { id: 'fashion', name: '패션/의류', icon: '👕', slug: 'FASHION' },
    { id: 'home', name: '가구/생활', icon: '🏠', slug: 'HOME' },
    { id: 'books', name: '도서', icon: '📚', slug: 'BOOKS' },
    { id: 'sports', name: '스포츠', icon: '⚽', slug: 'SPORTS' },
    { id: 'beauty', name: '뷰티', icon: '💄', slug: 'BEAUTY' },
    { id: 'toys', name: '장난감/취미', icon: '🧸', slug: 'TOYS' },
    { id: 'other', name: '기타', icon: '📦', slug: 'OTHER' },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            카테고리별 상품 찾기
          </h2>
          <p className="text-gray-600">
            원하는 카테고리를 선택하여 상품을 쉽게 찾아보세요
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Link
                href={`/category/${category.slug.toLowerCase()}`}
                className="block p-6 bg-gray-50 rounded-2xl hover:bg-orange-50 hover:shadow-md transition-all duration-300 text-center group"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
                <h3 className="text-sm font-medium text-gray-900 group-hover:text-orange-600 transition-colors">
                  {category.name}
                </h3>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 