-- ==========================================
-- 의류 쇼핑몰 스키마 마이그레이션
-- Clerk + Supabase 통합
-- RLS 없이 애플리케이션 레벨에서 clerk_id로 필터링
-- ==========================================

-- 1. 카테고리 테이블 생성
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 2. 상품 테이블 생성 (의류 쇼핑몰용)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    image_url TEXT, -- Supabase Storage URL
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 3. 상품 변형 테이블 (사이즈, 색상별 재고 관리)
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size TEXT NOT NULL, -- S, M, L, XL 등
    color TEXT NOT NULL, -- 빨강, 파랑 등
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    price_adjustment DECIMAL(10,2) DEFAULT 0, -- 기본 가격 대비 추가/할인 금액
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(product_id, size, color)
);

-- 4. 장바구니 테이블 (variant_id 사용)
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clerk_id TEXT NOT NULL,
    variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(clerk_id, variant_id)
);

-- 5. 주문 테이블
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clerk_id TEXT NOT NULL,
    order_number TEXT NOT NULL UNIQUE, -- 주문 번호 (읽기 쉬운 형식)
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    shipping_address JSONB NOT NULL, -- 수신자 정보 저장
    order_note TEXT,
    payment_id TEXT, -- Toss Payments 결제 ID
    payment_method TEXT, -- 결제 수단
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 6. 주문 상세 테이블
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
    product_name TEXT NOT NULL,
    product_size TEXT NOT NULL,
    product_color TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 7. updated_at 자동 갱신 함수 (이미 존재할 수 있으므로 CREATE OR REPLACE)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. updated_at 트리거 등록
DROP TRIGGER IF EXISTS set_updated_at_products ON products;
CREATE TRIGGER set_updated_at_products
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_product_variants ON product_variants;
CREATE TRIGGER set_updated_at_product_variants
    BEFORE UPDATE ON product_variants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_cart_items
    BEFORE UPDATE ON cart_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_orders
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_is_active ON product_variants(is_active);
CREATE INDEX IF NOT EXISTS idx_cart_items_clerk_id ON cart_items(clerk_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_variant_id ON cart_items(variant_id);
CREATE INDEX IF NOT EXISTS idx_orders_clerk_id ON orders(clerk_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_variant_id ON order_items(variant_id);

-- 10. RLS 비활성화 (개발 환경)
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;

-- 11. 테이블 소유자 설정
ALTER TABLE public.categories OWNER TO postgres;
ALTER TABLE public.products OWNER TO postgres;
ALTER TABLE public.product_variants OWNER TO postgres;
ALTER TABLE public.cart_items OWNER TO postgres;
ALTER TABLE public.orders OWNER TO postgres;
ALTER TABLE public.order_items OWNER TO postgres;

-- 12. 권한 부여
GRANT ALL ON TABLE public.categories TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.products TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.product_variants TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.cart_items TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.orders TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.order_items TO anon, authenticated, service_role;

-- 13. 샘플 카테고리 데이터 (의류)
INSERT INTO categories (name, slug, description) VALUES
('상의', 'tops', '티셔츠, 셔츠, 후드티 등 상의류'),
('하의', 'bottoms', '바지, 치마, 반바지 등 하의류'),
('아우터', 'outerwear', '자켓, 코트, 패딩 등 아우터'),
('액세서리', 'accessories', '모자, 가방, 벨트 등 액세서리')
ON CONFLICT (slug) DO NOTHING;

-- 14. 샘플 상품 데이터 (의류 - 실제 이미지는 나중에 추가)
-- 카테고리 ID를 동적으로 가져오기 위해 서브쿼리 사용
INSERT INTO products (name, description, price, category_id, image_url, is_active)
SELECT 
    p.name,
    p.description,
    p.price,
    c.id as category_id,
    p.image_url,
    true as is_active
FROM (VALUES
    ('베이직 라운드 티셔츠', '면 100% 기본 티셔츠, 편안한 착용감', 25000, 'tops', NULL),
    ('오버핏 후드티', '부드러운 원단, 캐주얼 스타일', 45000, 'tops', NULL),
    ('슬림핏 청바지', '신축성 좋은 데님, 슬림핏 디자인', 79000, 'bottoms', NULL),
    ('트레이닝 조거 팬츠', '운동과 일상 모두 활용 가능', 55000, 'bottoms', NULL),
    ('후드 집업 자켓', '따뜻한 안감, 세련된 디자인', 98000, 'outerwear', NULL),
    ('니트 카디건', '부드러운 니트 소재, 여유로운 핏', 68000, 'outerwear', NULL),
    ('볼캡', '심플한 디자인의 볼캡', 32000, 'accessories', NULL),
    ('크로스백', '실용적인 수납공간, 가볍고 편리', 85000, 'accessories', NULL)
) AS p(name, description, price, category_slug, image_url)
INNER JOIN categories c ON c.slug = p.category_slug
ON CONFLICT DO NOTHING;

-- 15. 샘플 상품 변형 데이터 (사이즈와 색상 조합)
-- 각 상품에 대해 기본 사이즈(S, M, L, XL)와 색상(블랙, 화이트, 네이비) 조합 생성
INSERT INTO product_variants (product_id, size, color, stock_quantity, price_adjustment, is_active)
SELECT 
    p.id as product_id,
    s.size,
    c.color,
    50 as stock_quantity, -- 기본 재고
    0 as price_adjustment,
    true as is_active
FROM products p
CROSS JOIN (VALUES ('S'), ('M'), ('L'), ('XL')) AS s(size)
CROSS JOIN (VALUES ('블랙'), ('화이트'), ('네이비')) AS c(color)
WHERE p.name IN (
    '베이직 라운드 티셔츠',
    '오버핏 후드티',
    '슬림핏 청바지',
    '트레이닝 조거 팬츠',
    '후드 집업 자켓',
    '니트 카디건'
)
ON CONFLICT (product_id, size, color) DO NOTHING;

-- 액세서리 상품은 사이즈/색상 없이 단일 변형으로 추가
INSERT INTO product_variants (product_id, size, color, stock_quantity, price_adjustment, is_active)
SELECT 
    p.id as product_id,
    'FREE' as size,
    c.color,
    30 as stock_quantity,
    0 as price_adjustment,
    true as is_active
FROM products p
CROSS JOIN (VALUES ('블랙'), ('화이트')) AS c(color)
WHERE p.name IN ('볼캡', '크로스백')
ON CONFLICT (product_id, size, color) DO NOTHING;

