"use server";

import { createClient } from "@supabase/supabase-js";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
};

/**
 * 상품 ID로 단일 상품을 조회하는 Server Action
 *
 * 공개 데이터이므로 인증 없이 접근 가능합니다.
 * is_active = true인 상품만 조회합니다.
 * 상품이 존재하지 않거나 비활성화된 경우 null을 반환합니다.
 *
 * @param productId - 조회할 상품의 ID (UUID)
 * @returns 상품 정보 또는 null (상품이 없는 경우)
 */
export async function getProduct(
  productId: string
): Promise<Product | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase 환경 변수가 설정되지 않았습니다.");
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data, error } = await supabase
    .from("products")
    .select("id, name, description, price, category, stock_quantity, created_at, updated_at")
    .eq("id", productId)
    .eq("is_active", true)
    .single();

  if (error) {
    // 상품이 없는 경우 (PGRST116) 또는 기타 에러
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("상품 조회 오류:", error);
    throw new Error("상품 조회에 실패했습니다.");
  }

  return data;
}

