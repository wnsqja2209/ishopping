/**
 * @file get-products.ts
 * @description 상품 목록 조회 Server Action
 */

"use server";

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import type { Product } from "@/types/product";

export interface GetProductsParams {
  categoryId?: string;
  category?: string; // TEXT 타입 category 필터링 (update_shopping_mall_schema.sql 사용 시)
  limit?: number;
  offset?: number;
}

export async function getProducts(
  params?: GetProductsParams
): Promise<Product[]> {
  const supabase = await createClerkSupabaseClient();

  let query = supabase
    .from("products")
    .select("*")
    .eq("is_active", true);

  // category_id 필터링 (새 스키마용)
  if (params?.categoryId) {
    query = query.eq("category_id", params.categoryId);
  }

  // category TEXT 필터링 (update_shopping_mall_schema.sql용)
  if (params?.category) {
    query = query.eq("category", params.category);
  }

  query = query.order("created_at", { ascending: false });

  if (params?.limit) {
    query = query.limit(params.limit);
  }

  if (params?.offset) {
    query = query.range(params.offset, params.offset + (params.limit ?? 10) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching products:", error);
    throw new Error("상품을 불러오는데 실패했습니다.");
  }

  return data ?? [];
}

