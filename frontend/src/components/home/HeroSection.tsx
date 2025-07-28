'use client';

import { Search, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-orange-50 to-white py-16">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto text-center">
          {/* 메인 타이틀 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              우리 동네 중고거래
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              믿을 수 있는 이웃과 함께하는 안전한 거래
            </p>
          </motion.div>

          {/* 메인 검색바 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              <input
                type="text"
                placeholder="어떤 상품을 찾고 계신가요?"
                className="w-full pl-16 pr-32 py-5 text-lg border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-lg bg-white"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl transition-colors flex items-center space-x-2 font-medium">
                <span>검색</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          {/* 인기 검색어 */}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-3"
          >
            <span className="text-gray-500 text-sm">인기 검색어:</span>
            {['아이폰', '맥북', '에어팟', '가구', '의류', '자전거'].map((keyword, index) => (
              <button
                key={keyword}
                className="px-4 py-2 bg-white text-gray-700 rounded-full text-sm hover:bg-orange-50 hover:text-orange-600 transition-colors border border-gray-200"
              >
                {keyword}
              </button>
            ))}
          </motion.div> */}
        </div>
      </div>
    </section>
  );
} 