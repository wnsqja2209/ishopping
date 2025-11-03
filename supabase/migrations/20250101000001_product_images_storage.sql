-- ==========================================
-- 상품 이미지 Storage 버킷 생성
-- 공개 버킷 (누구나 조회 가능, 관리자만 업로드)
-- ==========================================

-- 1. product-images 버킷 생성 (공개 버킷)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,  -- public bucket (누구나 조회 가능)
  5242880,  -- 5MB 제한 (5 * 1024 * 1024)
  ARRAY['image/jpeg', 'image/png', 'image/webp']  -- 이미지 파일만 허용
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- 참고: 개발 환경에서는 RLS를 비활성화하거나 간단한 정책을 사용합니다.
-- 프로덕션에서는 관리자만 업로드 가능하도록 정책을 설정해야 합니다.

-- 2. 공개 읽기 정책 (모든 사용자가 이미지 조회 가능)
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- 3. 인증된 사용자 업로드 정책 (개발용 - 나중에 관리자만 업로드하도록 제한 필요)
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');

