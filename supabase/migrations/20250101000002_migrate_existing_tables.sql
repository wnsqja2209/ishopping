-- ==========================================
-- 기존 테이블을 의류 쇼핑몰 스키마로 마이그레이션
-- 기존 데이터가 있다면 백업 후 실행해야 함
-- ==========================================

-- 기존 cart_items 테이블이 있다면 데이터 백업 후 삭제
-- (product_id 기반에서 variant_id 기반으로 변경되므로 기존 데이터와 호환 불가)
DROP TABLE IF EXISTS public.cart_items CASCADE;

-- 기존 order_items 테이블도 variant_id 추가를 위해 재생성 필요
-- 하지만 기존 주문 데이터가 있을 수 있으므로 주의 필요
-- 여기서는 기존 컬럼 유지하고 variant_id를 nullable로 추가
DO $$
BEGIN
    -- order_items에 variant_id 컬럼 추가 (기존 데이터가 있다면 nullable)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'order_items' 
        AND column_name = 'variant_id'
    ) THEN
        ALTER TABLE public.order_items 
        ADD COLUMN variant_id UUID REFERENCES product_variants(id) ON DELETE RESTRICT;
    END IF;
END $$;

-- 기존 products 테이블 변경 (category TEXT -> category_id UUID)
-- 기존 데이터가 있다면 category 값을 categories 테이블의 slug와 매칭하여 변환 필요
DO $$
BEGIN
    -- category_id 컬럼이 없다면 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'category_id'
    ) THEN
        -- category_id 컬럼 추가 (nullable)
        ALTER TABLE public.products 
        ADD COLUMN category_id UUID REFERENCES categories(id);
        
        -- 기존 category TEXT 값을 categories 테이블과 매칭하여 category_id 설정
        UPDATE public.products p
        SET category_id = c.id
        FROM public.categories c
        WHERE p.category = c.slug
        AND p.category_id IS NULL;
        
        -- 기존 category 컬럼 삭제
        ALTER TABLE public.products DROP COLUMN IF EXISTS category;
    END IF;
    
    -- image_url 컬럼이 없다면 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'image_url'
    ) THEN
        ALTER TABLE public.products 
        ADD COLUMN image_url TEXT;
    END IF;
    
    -- stock_quantity 컬럼이 있다면 삭제 (product_variants로 이동)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'stock_quantity'
    ) THEN
        ALTER TABLE public.products 
        DROP COLUMN stock_quantity;
    END IF;
END $$;

-- 기존 products 테이블의 category_id를 NOT NULL로 변경
-- (기존 데이터가 모두 매칭된 후에만 실행 가능)
DO $$
BEGIN
    -- category_id가 null인 데이터가 없을 때만 NOT NULL 제약 추가
    IF NOT EXISTS (
        SELECT 1 FROM public.products WHERE category_id IS NULL
    ) THEN
        ALTER TABLE public.products 
        ALTER COLUMN category_id SET NOT NULL;
    END IF;
END $$;

-- orders 테이블에 order_number, payment_id, payment_method 컬럼 추가
DO $$
BEGIN
    -- order_number 컬럼 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'order_number'
    ) THEN
        ALTER TABLE public.orders 
        ADD COLUMN order_number TEXT;
        
        -- 기존 주문에 대해 주문 번호 생성 (UUID 기반)
        UPDATE public.orders 
        SET order_number = 'ORD-' || UPPER(REPLACE(id::TEXT, '-', ''))
        WHERE order_number IS NULL;
        
        -- UNIQUE 제약 추가
        ALTER TABLE public.orders 
        ADD CONSTRAINT orders_order_number_unique UNIQUE (order_number);
    END IF;
    
    -- payment_id 컬럼 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'payment_id'
    ) THEN
        ALTER TABLE public.orders 
        ADD COLUMN payment_id TEXT;
    END IF;
    
    -- payment_method 컬럼 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'payment_method'
    ) THEN
        ALTER TABLE public.orders 
        ADD COLUMN payment_method TEXT;
    END IF;
END $$;

-- 인덱스 재생성
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_order_items_variant_id ON order_items(variant_id);

