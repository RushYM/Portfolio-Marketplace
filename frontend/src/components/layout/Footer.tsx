import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-20">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 로고 및 설명 */}
          <div className="col-span-1 md:col-span-2 pt-8">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-bold text-gray-900">마켓플레이스</span>
            </div>
            <p className="text-gray-600 mb-4 max-w-md">
              우리 동네 중고거래의 새로운 경험을 제공합니다. 안전하고 편리한 거래로 소중한 물건들에게 새로운 주인을 찾아주세요.
            </p>
            {/* <div className="flex space-x-4">
              <Link href="/terms" className="text-sm text-gray-500 hover:text-orange-500 transition-colors">
                이용약관
              </Link>
              <Link href="/privacy" className="text-sm text-gray-500 hover:text-orange-500 transition-colors">
                개인정보처리방침
              </Link>
            </div> */}
          </div>

        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 pb-12 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © 2025 마켓플레이스. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm mt-2 md:mt-0">
            Portfolio Project - Modern Marketplace Platform
          </p>
        </div>
      </div>
    </footer>
  );
} 