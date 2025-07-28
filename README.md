# 중고거래 플랫폼

Next.js와 NestJS를 사용한 풀스택 중고거래 웹 애플리케이션입니다.

## 🚀 기술 스택

### Frontend
- **Next.js 15** - React 프레임워크
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 스타일링
- **Zustand** - 상태 관리
- **React Query** - 서버 상태 관리
- **Socket.io Client** - 실시간 채팅

### Backend
- **NestJS** - Node.js 프레임워크
- **TypeScript** - 타입 안전성
- **Prisma** - ORM
- **PostgreSQL** - 데이터베이스
- **JWT** - 인증
- **Socket.io** - 실시간 통신
- **Multer** - 파일 업로드

## 📁 프로젝트 구조

```
├── frontend/          # Next.js 프론트엔드
├── backend/           # NestJS 백엔드
├── shared/            # 공유 타입 및 유틸리티
└── README.md
```

## 🛠️ 로컬 개발 환경 설정

### 1. 저장소 클론
```bash
git clone <repository-url>
cd <project-name>
```

### 2. 백엔드 설정
```bash
cd backend
npm install
cp env.example .env
# .env 파일에서 환경 변수 설정
npm run db:setup
npm run start:dev
```

### 3. 프론트엔드 설정
```bash
cd frontend
npm install
cp env.example .env.local
# .env.local 파일에서 환경 변수 설정
npm run dev
```

## 🌐 배포

### 프론트엔드 (Vercel)
1. [Vercel](https://vercel.com)에 가입
2. GitHub 저장소 연결
3. 환경 변수 설정:
   - `NEXT_PUBLIC_API_URL`: 백엔드 API URL

### 백엔드 (Railway)
1. [Railway](https://railway.app)에 가입
2. GitHub 저장소 연결
3. PostgreSQL 데이터베이스 추가
4. 환경 변수 설정:
   - `DATABASE_URL`: PostgreSQL 연결 문자열
   - `JWT_SECRET`: JWT 시크릿 키
   - `CORS_ORIGIN`: 프론트엔드 URL

### 데이터베이스 (Railway PostgreSQL)
1. Railway에서 PostgreSQL 서비스 생성
2. 백엔드 서비스와 연결
3. `DATABASE_URL` 환경 변수 자동 설정

## 🔧 주요 기능

- 👤 사용자 인증 (회원가입/로그인)
- 📦 상품 등록/수정/삭제
- 🔍 상품 검색 및 필터링
- 💬 실시간 채팅
- ❤️ 찜하기 기능
- 📱 반응형 디자인
- 🖼️ 이미지 업로드

## 📝 API 문서

개발 서버 실행 후 `http://localhost:3001/api`에서 Swagger 문서를 확인할 수 있습니다.

