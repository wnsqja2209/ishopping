/**
 * @file categories.ts
 * @description 카테고리 상수 정의
 * 
 * update_shopping_mall_schema.sql의 TEXT 타입 category 값들을 사용합니다.
 */

export const CATEGORY_SLUGS = {
  ELECTRONICS: "electronics",
  CLOTHING: "clothing",
  BOOKS: "books",
  FOOD: "food",
  SPORTS: "sports",
  BEAUTY: "beauty",
  HOME: "home",
} as const;

export const CATEGORY_NAMES = {
  [CATEGORY_SLUGS.ELECTRONICS]: "전자제품",
  [CATEGORY_SLUGS.CLOTHING]: "의류",
  [CATEGORY_SLUGS.BOOKS]: "도서",
  [CATEGORY_SLUGS.FOOD]: "식품",
  [CATEGORY_SLUGS.SPORTS]: "스포츠",
  [CATEGORY_SLUGS.BEAUTY]: "뷰티",
  [CATEGORY_SLUGS.HOME]: "생활/가정",
} as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[keyof typeof CATEGORY_SLUGS];

export const SIZE_OPTIONS = ["S", "M", "L", "XL", "FREE"] as const;

export type SizeOption = (typeof SIZE_OPTIONS)[number];

