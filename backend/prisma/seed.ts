import { PrismaClient, ProductCategory, ProductCondition, ProductStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 시딩 시작...');

  // 기존 데이터 삭제 (개발 환경에서만)
  if (process.env.NODE_ENV === 'development') {
    console.log('🗑️  기존 데이터 삭제 중...');
    await prisma.favorite.deleteMany();
    await prisma.chatMessage.deleteMany();
    await prisma.chatRoom.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();
  }

  // 테스트 사용자들 생성
  console.log('👥 사용자 생성 중...');
  const hashedPassword = await bcrypt.hash('password123', 12);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'seller1@example.com',
        username: '김판매자',
        password: hashedPassword,
        location: '서울시 강남구',
        rating: 4.8,
        ratingCount: 25,
        isVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'seller2@example.com',
        username: '이상인',
        password: hashedPassword,
        location: '서울시 서초구',
        rating: 4.5,
        ratingCount: 18,
        isVerified: false,
      },
    }),
    prisma.user.create({
      data: {
        email: 'seller3@example.com',
        username: '박거래왕',
        password: hashedPassword,
        location: '서울시 송파구',
        rating: 4.9,
        ratingCount: 42,
        isVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'user4@example.com',
        username: '최구매자',
        password: hashedPassword,
        location: '서울시 마포구',
        rating: 4.2,
        ratingCount: 8,
        isVerified: false,
      },
    }),
  ]);

  console.log(`✅ ${users.length}명의 사용자가 생성되었습니다.`);

  // 상품 더미 데이터
  const productsData = [
    {
      title: '아이폰 14 Pro 128GB 딥퍼플',
      description: '깨끗하게 사용한 아이폰 14 Pro입니다. 케이스와 필름 적용하여 사용했고 스크래치 거의 없습니다. 배터리 효율 95% 이상, 모든 기능 정상 작동합니다. 충전기, 박스 포함.',
      price: 850000,
      images: [
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=600&fit=crop'
      ],
      category: ProductCategory.ELECTRONICS,
      condition: ProductCondition.GOOD,
      location: '서울시 강남구',
      sellerId: users[0].id,
      viewCount: 127,
      likeCount: 15,
    },
    {
      title: '맥북 프로 13인치 M2 실버',
      description: 'M2 칩셋의 맥북 프로 13인치입니다. 학업용으로 구매했으나 업그레이드로 인해 판매합니다. 사용 기간 6개월, 기스나 손상 없이 깨끗합니다. 원박스, 충전기 모두 포함.',
      price: 1200000,
      images: [
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop'
      ],
      category: ProductCategory.ELECTRONICS,
      condition: ProductCondition.LIKE_NEW,
      location: '서울시 서초구',
      sellerId: users[1].id,
      status: ProductStatus.RESERVED,
      viewCount: 89,
      likeCount: 23,
    },
    {
      title: '에어팟 프로 2세대 새상품',
      description: '미개봉 새상품 에어팟프로 2세대입니다. 선물받았는데 이미 있어서 판매합니다. 정품, AS 가능합니다. 택배거래 가능합니다.',
      price: 180000,
      images: [
        'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=400&fit=crop'
      ],
      category: ProductCategory.ELECTRONICS,
      condition: ProductCondition.NEW,
      location: '서울시 송파구',
      sellerId: users[2].id,
      viewCount: 203,
      likeCount: 31,
    },
    {
      title: '삼성 갤럭시 북3 프로 16인치',
      description: '삼성 갤럭시 북3 프로 16인치 노트북입니다. i7 프로세서, 16GB RAM, 512GB SSD. 게임이나 영상편집 용도로 구매했으나 맥북으로 교체하면서 판매합니다.',
      price: 950000,
      images: [
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop'
      ],
      category: ProductCategory.ELECTRONICS,
      condition: ProductCondition.GOOD,
      location: '서울시 마포구',
      sellerId: users[3].id,
      status: ProductStatus.SOLD,
      viewCount: 156,
      likeCount: 8,
    },
    {
      title: '다이슨 V15 무선청소기',
      description: '다이슨 V15 디텍트 무선청소기입니다. 구매한지 1년 정도 되었고, 사용 빈도가 낮아 상태 매우 좋습니다. 모든 브러시와 충전 거치대 포함입니다.',
      price: 320000,
      images: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop'
      ],
      category: ProductCategory.HOME,
      condition: ProductCondition.GOOD,
      location: '서울시 용산구',
      sellerId: users[0].id,
      viewCount: 78,
      likeCount: 12,
    },
    {
      title: '소니 WH-1000XM4 헤드폰',
      description: '소니 무선 노이즈캔슬링 헤드폰입니다. 음질 정말 좋고 노이즈캔슬링 성능 뛰어납니다. 케이스, 충전케이블 모두 포함. 이어패드 교체한 새것입니다.',
      price: 150000,
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'
      ],
      category: ProductCategory.ELECTRONICS,
      condition: ProductCondition.GOOD,
      location: '서울시 성동구',
      sellerId: users[1].id,
      viewCount: 94,
      likeCount: 19,
    },
    {
      title: '아이패드 에어 5세대 64GB',
      description: '아이패드 에어 5세대 64GB WiFi 모델입니다. 주로 동영상 시청용으로 사용했고, 애플펜슬과 키보드도 함께 드립니다. 보호필름, 케이스 적용했습니다.',
      price: 480000,
      images: [
        'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop'
      ],
      category: ProductCategory.ELECTRONICS,
      condition: ProductCondition.GOOD,
      location: '서울시 관악구',
      sellerId: users[2].id,
      viewCount: 67,
      likeCount: 14,
    },
    {
      title: '닌텐도 스위치 OLED 화이트',
      description: '닌텐도 스위치 OLED 화이트 모델입니다. 게임은 포함되지 않고 본체만 판매합니다. 사용감 있지만 기능상 문제없습니다. 독, 컨트롤러, 충전케이블 모두 포함.',
      price: 220000,
      images: [
        'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400&h=400&fit=crop'
      ],
      category: ProductCategory.TOYS,
      condition: ProductCondition.FAIR,
      location: '서울시 동작구',
      sellerId: users[3].id,
      viewCount: 234,
      likeCount: 27,
    },
    {
      title: '캐논 EOS R6 미러리스 카메라',
      description: '캐논 EOS R6 바디만 판매합니다. 풀프레임 미러리스로 화질 정말 좋습니다. 사진 취미 시작하시는 분께 추천합니다. 셔터수 약 3만회, 모든 기능 정상.',
      price: 1850000,
      images: [
        'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=400&fit=crop'
      ],
      category: ProductCategory.ELECTRONICS,
      condition: ProductCondition.GOOD,
      location: '서울시 강남구',
      sellerId: users[0].id,
      viewCount: 45,
      likeCount: 8,
    },
    {
      title: '나이키 에어맥스 270 (280mm)',
      description: '나이키 에어맥스 270 280mm입니다. 몇 번 신지 않아서 거의 새것 같습니다. 박스 포함해서 드립니다. 깔끔한 화이트 컬러입니다.',
      price: 85000,
      images: [
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop'
      ],
      category: ProductCategory.FASHION,
      condition: ProductCondition.LIKE_NEW,
      location: '서울시 서초구',
      sellerId: users[1].id,
      viewCount: 123,
      likeCount: 22,
    },
    {
      title: '이케아 MALM 서랍장 6칸 화이트',
      description: '이케아 말름 서랍장 6칸 화이트입니다. 이사로 인해 판매합니다. 사용감 있지만 기능상 문제없고, 분해해서 드립니다. 직거래만 가능합니다.',
      price: 45000,
      images: [
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop'
      ],
      category: ProductCategory.HOME,
      condition: ProductCondition.GOOD,
      location: '서울시 송파구',
      sellerId: users[2].id,
      viewCount: 67,
      likeCount: 5,
    },
    {
      title: '해리포터 전집 (영문판)',
      description: '해리포터 전집 영문판입니다. 1-7권 모두 있고, 하드커버 에디션입니다. 영어 공부용으로 구매했는데 잘 안 봐서 판매합니다. 상태 매우 좋습니다.',
      price: 120000,
      images: [
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop'
      ],
      category: ProductCategory.BOOKS,
      condition: ProductCondition.LIKE_NEW,
      location: '서울시 마포구',
      sellerId: users[3].id,
      viewCount: 34,
      likeCount: 7,
    },
  ];

  console.log('📦 상품 생성 중...');
  const products = [];

  for (const productData of productsData) {
    const product = await prisma.product.create({
      data: productData,
    });
    products.push(product);
  }

  console.log(`✅ ${products.length}개의 상품이 생성되었습니다.`);

  // 찜하기 데이터 생성
  console.log('❤️  찜하기 데이터 생성 중...');
  const favorites = await Promise.all([
    prisma.favorite.create({
      data: {
        userId: users[1].id,
        productId: products[0].id,
      },
    }),
    prisma.favorite.create({
      data: {
        userId: users[2].id,
        productId: products[0].id,
      },
    }),
    prisma.favorite.create({
      data: {
        userId: users[0].id,
        productId: products[2].id,
      },
    }),
    prisma.favorite.create({
      data: {
        userId: users[3].id,
        productId: products[4].id,
      },
    }),
  ]);

  console.log(`✅ ${favorites.length}개의 찜하기가 생성되었습니다.`);

  console.log('🎉 시딩 완료!');
  console.log(`
📊 생성된 데이터:
- 사용자: ${users.length}명
- 상품: ${products.length}개
- 찜하기: ${favorites.length}개

🔑 테스트 계정 정보:
- 이메일: seller1@example.com
- 비밀번호: password123

📚 Swagger 문서: http://localhost:3001/api/docs
  `);
}

main()
  .catch((e) => {
    console.error('❌ 시딩 중 오류 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 