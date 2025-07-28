# 🛍️ 마켓플레이스 백엔드 API

Node.js + Nest.js + PostgreSQL + Prisma로 구축된 현대적인 중고거래 플랫폼 백엔드 API

## 🚀 기술 스택

- **Framework**: Nest.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + Passport
- **Documentation**: Swagger
- **Validation**: class-validator

## 📋 주요 기능

- 🔐 JWT 기반 사용자 인증/인가
- 👤 사용자 관리 (회원가입, 로그인, 프로필)
- 📦 상품 CRUD 및 검색
- 💬 실시간 채팅 시스템
- 📁 파일 업로드 (이미지)
- ⭐ 사용자 평점 시스템
- 🛡️ 신고 및 관리 기능

## 🛠️ 개발 환경 설정

### 1. 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 입력하세요:

\`\`\`env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/marketplace_db?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV="development"

# File Upload
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_PATH="./uploads"

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:3000"
\`\`\`

### 2. PostgreSQL 데이터베이스 설정

#### 로컬에서 PostgreSQL 실행하기:

**Option A: Docker 사용 (권장)**
\`\`\`bash
docker run --name marketplace-postgres \\
  -e POSTGRES_USER=username \\
  -e POSTGRES_PASSWORD=password \\
  -e POSTGRES_DB=marketplace_db \\
  -p 5432:5432 \\
  -d postgres:15
\`\`\`

**Option B: PostgreSQL 직접 설치**
1. PostgreSQL 설치
2. 데이터베이스 생성: \`CREATE DATABASE marketplace_db;\`

### 3. 데이터베이스 스키마 설정

\`\`\`bash
# Prisma 클라이언트 생성 및 데이터베이스 스키마 동기화
npm run db:setup

# 또는 단계별로
npm run prisma:generate
npm run prisma:push
\`\`\`

### 4. 개발 서버 실행

\`\`\`bash
npm run start:dev
\`\`\`

서버가 성공적으로 실행되면:
- 🚀 API: http://localhost:3001
- 📚 Swagger 문서: http://localhost:3001/api/docs

## 📡 API 엔드포인트

### 인증 (Auth)
- \`POST /api/v1/auth/register\` - 회원가입
- \`POST /api/v1/auth/login\` - 로그인
- \`GET /api/v1/auth/profile\` - 프로필 조회
- \`POST /api/v1/auth/refresh\` - 토큰 갱신
- \`POST /api/v1/auth/logout\` - 로그아웃

### 사용자 (Users)
- \`GET /api/v1/users\` - 사용자 목록
- \`GET /api/v1/users/me\` - 내 정보
- \`GET /api/v1/users/:id\` - 사용자 상세
- \`PATCH /api/v1/users/:id\` - 사용자 정보 수정
- \`DELETE /api/v1/users/:id\` - 사용자 삭제 (비활성화)

## 🗂️ 프로젝트 구조

\`\`\`
src/
├── auth/                 # 인증 모듈
│   ├── dto/             # 데이터 전송 객체
│   ├── guards/          # 인증 가드
│   ├── interfaces/      # 인터페이스
│   └── strategies/      # Passport 전략
├── users/               # 사용자 모듈
├── database/            # 데이터베이스 설정
├── common/              # 공통 유틸리티
└── main.ts             # 애플리케이션 엔트리포인트

prisma/
├── schema.prisma       # 데이터베이스 스키마
└── migrations/         # 마이그레이션 파일
\`\`\`

## 🎯 유용한 명령어

### 개발
\`\`\`bash
npm run start:dev        # 개발 서버 (watch mode)
npm run start:debug      # 디버그 모드
npm run build           # 프로덕션 빌드
npm run start:prod      # 프로덕션 실행
\`\`\`

### 데이터베이스
\`\`\`bash
npm run prisma:studio   # Prisma Studio (DB GUI)
npm run prisma:migrate  # 마이그레이션 생성/실행
npm run prisma:reset    # 데이터베이스 초기화
npm run prisma:seed     # 시드 데이터 생성
\`\`\`

### 테스트 & 린트
\`\`\`bash
npm run test           # 단위 테스트
npm run test:e2e       # E2E 테스트
npm run lint           # ESLint 실행
npm run format         # Prettier 포맷팅
\`\`\`

## 📊 데이터베이스 스키마

주요 엔티티:
- **User**: 사용자 정보
- **Product**: 상품 정보
- **ChatRoom**: 채팅방
- **ChatMessage**: 채팅 메시지
- **Favorite**: 찜하기
- **Review**: 사용자 리뷰
- **Report**: 신고

## 🔧 개발 도구

- **Swagger UI**: API 문서화 및 테스트
- **Prisma Studio**: 데이터베이스 GUI
- **ESLint + Prettier**: 코드 품질 관리
- **Jest**: 테스트 프레임워크

## 🤝 기여하기

1. 이슈 확인 및 생성
2. 브랜치 생성: \`git checkout -b feature/amazing-feature\`
3. 커밋: \`git commit -m 'Add amazing feature'\`
4. 푸시: \`git push origin feature/amazing-feature\`
5. Pull Request 생성

---
**Portfolio Project** - Modern Marketplace Platform Backend
