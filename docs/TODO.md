# 의류 쇼핑몰 MVP 개발 TODO

## 📋 프로젝트 초기 설정

- [ ] 프로젝트 기본 구조 설정
  - [ ] `.cursor/` 디렉토리 및 관련 파일
  - [ ] `.github/` 디렉토리 (워크플로우, 이슈 템플릿 등)
  - [ ] `.husky/` 디렉토리 (Git hooks)
  - [ ] `public/` 디렉토리 (아이콘, 로고, og-image 등)
  - [ ] 기본 설정 파일 (`.gitignore`, `.prettierrc`, `tsconfig.json`, `eslint.config.mjs` 등)
  - [ ] `AGENTS.md` 파일 업데이트

---

## 🚀 Phase 1: 기본 인프라 (1주)

### 1.1 Next.js 프로젝트 셋업

- [x] Next.js 프로젝트 초기화
- [x] 기본 디렉토리 구조 생성 (`app/`, `components/`, `lib/`, `hooks/` 등)
- [x] Tailwind CSS 설정
- [x] 기본 레이아웃 컴포넌트 (`app/layout.tsx`)
- [x] 기본 페이지 (`app/page.tsx`)
- [x] 메타데이터 설정 (`favicon.ico`)
- [ ] 메타데이터 설정 (`robots.ts`, `sitemap.ts`, `manifest.ts`)
- [ ] `not-found.tsx` 페이지

### 1.2 Supabase 프로젝트 생성 및 테이블 스키마 작성

- [x] Supabase 프로젝트 생성 및 연결
- [x] 데이터베이스 스키마 설계
  - [x] `users` 테이블 (Clerk 사용자 동기화)
  - [x] `products` 테이블 (상품 정보)
  - [x] `categories` 테이블 (상품 카테고리)
  - [x] `product_variants` 테이블 (상품 변형)
  - [x] `cart_items` 테이블 (장바구니)
  - [x] `orders` 테이블 (주문)
  - [x] `order_items` 테이블 (주문 상품)
- [x] 마이그레이션 파일 작성
- [x] RLS 비활성화 (개발 환경)
- [x] TypeScript 타입 생성 (`types/product.ts`)

### 1.3 Clerk 연동 (회원가입/로그인)

- [x] Clerk 프로젝트 생성 및 설정
- [x] Clerk 환경 변수 설정
- [x] `ClerkProvider` 설정 (`app/layout.tsx`)
- [x] `middleware.ts` 설정 (라우트 보호)
- [x] 로그인 페이지 (Clerk 모달 사용, 별도 페이지 불필요)
- [x] 회원가입 페이지 (Clerk 모달 사용, 별도 페이지 불필요)
- [x] Clerk → Supabase 사용자 동기화 로직
  - [x] `hooks/use-sync-user.ts` 훅
  - [x] `components/providers/sync-user-provider.tsx`
  - [x] `app/api/sync-user/route.ts` API 라우트

### 1.4 기본 레이아웃 및 라우팅

- [x] 헤더 컴포넌트 (`components/header.tsx`)
- [x] 푸터 컴포넌트 (`components/footer.tsx`)
- [x] 네비게이션 메뉴 (홈, 상품목록, 마이페이지 등)
- [x] 인증 상태에 따른 메뉴 표시
- [x] 기본 라우팅 구조 설정

---

## 🛍️ Phase 2: 상품 기능 (1주)

### 2.1 홈페이지

- [ ] 홈페이지 레이아웃 (`app/page.tsx`)
- [ ] 히어로 섹션 (메인 배너)
- [ ] 인기 상품 섹션 (최신 상품 또는 베스트 상품 표시)
- [ ] 카테고리 미리보기

### 2.2 상품 목록 페이지

- [ ] 상품 목록 페이지 (`app/products/page.tsx`)
- [ ] 상품 카드 컴포넌트 (`components/product-card.tsx`)
- [ ] 상품 그리드 레이아웃
- [ ] 페이지네이션 또는 무한 스크롤
- [ ] 로딩 상태 UI
- [ ] 에러 처리

### 2.3 카테고리 필터링

- [ ] 카테고리 목록 조회
- [ ] 카테고리별 필터링 기능
- [ ] URL 쿼리 파라미터 연동 (`/products?category=shirts`)
- [ ] 카테고리 필터 UI 컴포넌트

### 2.4 상품 상세 페이지

- [ ] 상품 상세 페이지 (`app/products/[id]/page.tsx`)
- [ ] 상품 이미지 갤러리
- [ ] 상품 정보 표시 (이름, 가격, 설명, 사이즈, 색상 등)
- [ ] 장바구니 추가 버튼
- [ ] 즉시 구매 버튼 (선택사항)
- [ ] 관련 상품 추천

### 2.5 어드민 상품 등록 (Supabase 직접)

- [ ] Supabase 대시보드에서 상품 데이터 수동 입력 가이드 문서 작성
- [ ] 테스트용 샘플 상품 데이터 생성

---

## 🛒 Phase 3: 장바구니 & 주문 (1주)

### 3.1 장바구니 기능

- [ ] 장바구니 페이지 (`app/cart/page.tsx`)
- [ ] 장바구니 아이템 컴포넌트 (`components/cart-item.tsx`)
- [ ] 장바구니 추가 기능
  - [ ] Server Action: `actions/cart/add-item.ts`
  - [ ] 장바구니에 상품 추가 로직
- [ ] 장바구니 삭제 기능
  - [ ] Server Action: `actions/cart/remove-item.ts`
- [ ] 장바구니 수량 변경 기능
  - [ ] Server Action: `actions/cart/update-quantity.ts`
- [ ] 장바구니 총액 계산
- [ ] 빈 장바구니 UI
- [ ] 장바구니 아이콘 및 카운터 (헤더)

### 3.2 주문 프로세스 구현

- [ ] 주문 페이지 (`app/checkout/page.tsx`)
- [ ] 주문자 정보 입력 폼
  - [ ] 배송지 정보 (이름, 연락처, 주소)
  - [ ] 폼 유효성 검사 (react-hook-form + Zod)
- [ ] 주문 상품 요약
- [ ] 결제 수단 선택 (Toss Payments)
- [ ] 주문 확인 단계

### 3.3 주문 테이블 연동

- [ ] 주문 생성 Server Action (`actions/order/create-order.ts`)
- [ ] 주문 아이템 저장
- [ ] 주문 번호 생성 로직
- [ ] 주문 상태 관리 (대기, 결제완료, 주문확인 등)

---

## 💳 Phase 4: 결제 통합 (1주)

### 4.1 Toss Payments MCP 연동

- [ ] Toss Payments 프로젝트 생성 및 설정
- [ ] Toss Payments MCP 서버 설정 (`.cursor/mcp.json`)
- [ ] Toss Payments API 키 설정 (환경 변수)
- [ ] 결제 위젯 연동 문서 확인

### 4.2 테스트 결제 구현

- [ ] 결제 위젯 컴포넌트 (`components/payment-widget.tsx`)
- [ ] 결제 요청 API (`app/api/payments/request/route.ts`)
- [ ] 결제 승인 처리 API (`app/api/payments/confirm/route.ts`)
- [ ] 결제 실패 처리
- [ ] 결제 진행 상태 UI

### 4.3 결제 완료 후 주문 저장

- [ ] 결제 성공 후 주문 상태 업데이트
- [ ] 결제 정보 저장 (결제 ID, 금액, 결제 방법 등)
- [ ] 장바구니 비우기
- [ ] 주문 완료 페이지 (`app/orders/complete/page.tsx`)
  - [ ] 주문 번호 표시
  - [ ] 주문 상세 정보 표시
  - [ ] 마이페이지 이동 버튼

---

## 👤 Phase 5: 마이페이지 (0.5주)

### 5.1 주문 내역 조회

- [ ] 마이페이지 레이아웃 (`app/my-page/page.tsx`)
- [ ] 주문 목록 조회
  - [ ] Server Component로 주문 데이터 fetching
  - [ ] 주문 카드 컴포넌트 (`components/order-card.tsx`)
  - [ ] 주문 상태별 표시 (결제완료, 배송준비 등)
- [ ] 주문 목록 정렬 (최신순)

### 5.2 주문 상세 보기

- [ ] 주문 상세 페이지 (`app/my-page/orders/[orderId]/page.tsx`)
- [ ] 주문 정보 표시 (주문 번호, 주문일, 배송지 등)
- [ ] 주문 상품 목록
- [ ] 결제 정보 표시
- [ ] 주문 상태 표시

---

## ✅ Phase 6: 테스트 & 배포 (0.5주)

### 6.1 전체 플로우 테스트

- [ ] 회원가입 → 로그인 플로우 테스트
- [ ] 상품 조회 → 장바구니 추가 플로우 테스트
- [ ] 장바구니 → 주문 → 결제 플로우 테스트
- [ ] 결제 완료 → 마이페이지 조회 플로우 테스트
- [ ] 에러 케이스 테스트 (네트워크 오류, 결제 실패 등)
- [ ] 반응형 디자인 테스트 (모바일, 태블릿, 데스크톱)

### 6.2 버그 수정

- [ ] 발견된 버그 목록 정리
- [ ] 우선순위별 버그 수정
- [ ] 코드 리뷰 및 리팩토링
- [ ] 성능 최적화 (필요시)

### 6.3 Vercel 배포

- [ ] Vercel 프로젝트 생성
- [ ] 환경 변수 설정
  - [ ] Clerk 환경 변수
  - [ ] Supabase 환경 변수
  - [ ] Toss Payments 환경 변수
- [ ] 프로덕션 빌드 테스트
- [ ] 도메인 연결 (선택사항)
- [ ] 배포 후 검증 테스트

---

## 📝 기타 작업

- [ ] README.md 작성 (프로젝트 설명, 설치 방법, 실행 방법)
- [ ] 환경 변수 예시 파일 (`.env.example`) 업데이트
- [ ] 코드 주석 및 문서화
- [ ] 로그 및 에러 처리 개선
