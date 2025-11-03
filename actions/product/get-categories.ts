/**
 * @file get-categories.ts
 * @description 카테고리 목록 조회 Server Action
 * 
 * update_shopping_mall_schema.sql의 TEXT 타입 category를 사용하는 경우,
 * products 테이블에서 고유한 category 값을 가져옵니다.
 */

"use server";

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { CATEGORY_SLUGS, CATEGORY_NAMES } from "@/lib/constants/categories";

export interface CategoryInfo {
  slug: string;
  name: string;
}

/**
 * products 테이블에서 고유한 category 값들을 가져옵니다.
 * 또는 하드코딩된 카테고리 목록을 반환합니다.
 */
export async function getCategories(): Promise<CategoryInfo[]> {
  const supabase = await createClerkSupabaseClient();

  // products 테이블에서 고유한 category 값 조회
  const { data, error } = await supabase
    .from("products")
    .select("category")
    .not("category", "is", null)
    .eq("is_active", true);

  if (error) {
    console.error("Error fetching categories:", error);
    // 에러 발생 시 하드코딩된 카테고리 목록 반환
    return getHardcodedCategories();
  }

  // 고유한 category 값 추출
  const uniqueCategories = Array.from(
    new Set(data.map((item) => item.category).filter(Boolean))
  );

  // 카테고리 정보 매핑
  const categories: CategoryInfo[] = uniqueCategories
    .map((category) => {
      // CATEGORY_SLUGS에 해당하는 경우 한글 이름 반환
      if (category && category in CATEGORY_NAMES) {
        return {
          slug: category,
          name: CATEGORY_NAMES[category as keyof typeof CATEGORY_NAMES],
        };
      }
      // 매핑되지 않은 경우 원본 값 사용
      return {
        slug: category || "",
        name: category || "",
      };
    })
    .filter((cat) => cat.slug); // 빈 값 제거

  // 알파벳 순으로 정렬
  return categories.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * 하드코딩된 카테고리 목록을 반환합니다.
 * products 테이블에서 조회가 실패하거나 카테고리가 없을 때 사용됩니다.
 */
function getHardcodedCategories(): CategoryInfo[] {
  return Object.entries(CATEGORY_SLUGS).map(([key, slug]) => ({
    slug,
    name: CATEGORY_NAMES[slug],
  }));
}

