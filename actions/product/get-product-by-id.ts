/**
 * @file get-product-by-id.ts
 * @description 상품 상세 조회 Server Action (변형 포함)
 */

"use server";

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import type { ProductWithVariants } from "@/types/product";

export async function getProductById(
  productId: string
): Promise<ProductWithVariants | null> {
  const supabase = await createClerkSupabaseClient();

  // 상품 정보 조회
  const { data: product, error: productError } = await supabase
    .from("products")
    .select(`
      *,
      category:categories(*)
    `)
    .eq("id", productId)
    .eq("is_active", true)
    .single();

  if (productError || !product) {
    console.error("Error fetching product:", productError);
    return null;
  }

  // 상품 변형 조회
  const { data: variants, error: variantsError } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", productId)
    .eq("is_active", true)
    .order("size", { ascending: true })
    .order("color", { ascending: true });

  if (variantsError) {
    console.error("Error fetching product variants:", variantsError);
  }

  return {
    ...product,
    variants: variants ?? [],
  };
}

