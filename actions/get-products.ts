"use server";

import { createClient } from "@supabase/supabase-js";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  stock_quantity: number;
};

type ProductsResponse = {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
};

/**
 * 모든 활성 상품을 조회하는 Server Action
 *
 * 공개 데이터이므로 인증 없이 접근 가능합니다.
 * is_active = true인 상품만 조회합니다.
 */
export async function getProducts(): Promise<Product[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase 환경 변수가 설정되지 않았습니다.");
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data, error } = await supabase
    .from("products")
    .select("id, name, description, price, category, stock_quantity")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("상품 조회 오류:", error);
    throw new Error("상품 조회에 실패했습니다.");
  }

  return data || [];
}

/**
 * 카테고리별 상품을 조회하는 Server Action (페이지네이션 지원)
 *
 * @param category - 카테고리 필터 (전체/all인 경우 null 또는 undefined)
 * @param page - 페이지 번호 (1부터 시작)
 * @param limit - 한 페이지당 상품 수 (기본값: 12)
 * @returns 상품 목록, 총 개수, 페이지 정보
 */
export async function getProductsByCategory(
  category?: string | null,
  page: number = 1,
  limit: number = 12
): Promise<ProductsResponse> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase 환경 변수가 설정되지 않았습니다.");
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // 페이지네이션 계산
  const offset = (page - 1) * limit;

  // 쿼리 빌더
  let query = supabase
    .from("products")
    .select("id, name, description, price, category, stock_quantity", {
      count: "exact",
    })
    .eq("is_active", true);

  // 카테고리 필터 적용
  if (category && category !== "전체" && category !== "all") {
    query = query.eq("category", category);
  }

  // 정렬 및 페이지네이션
  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("상품 조회 오류:", error);
    throw new Error("상품 조회에 실패했습니다.");
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  return {
    products: data || [],
    total,
    page,
    totalPages,
  };
}

