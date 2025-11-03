/**
 * @file category-filter.tsx
 * @description 카테고리 필터 컴포넌트
 *
 * 버튼 형태의 카테고리 필터링 UI입니다.
 */

"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

interface CategoryInfo {
  slug: string;
  name: string;
}

interface CategoryFilterProps {
  categories: CategoryInfo[];
  selectedCategory?: string;
}

export function CategoryFilter({
  categories,
  selectedCategory,
}: CategoryFilterProps) {
  const searchParams = useSearchParams();

  return (
    <div className="flex gap-2 flex-wrap">
      {/* 전체 버튼 */}
      <Link href="/" scroll={false}>
        <Button
          variant={!selectedCategory ? "default" : "outline"}
          size="sm"
          className="transition-colors"
        >
          전체
        </Button>
      </Link>

      {/* 카테고리 버튼들 */}
      {categories.map((category) => {
        const isSelected = selectedCategory === category.slug;
        const params = new URLSearchParams(searchParams.toString());
        params.set("category", category.slug);

        return (
          <Link
            key={category.slug}
            href={`/?category=${category.slug}`}
            scroll={false}
          >
            <Button
              variant={isSelected ? "default" : "outline"}
              size="sm"
              className="transition-colors"
            >
              {category.name}
            </Button>
          </Link>
        );
      })}
    </div>
  );
}

