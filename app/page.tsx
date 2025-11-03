/**
 * @file page.tsx
 * @description 쇼핑몰 홈페이지
 *
 * 히어로 섹션, 카테고리 필터링이 있는 전체 상품 섹션을 포함합니다.
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { getProducts } from "@/actions/product/get-products";
import { getCategories } from "@/actions/product/get-categories";
import { ArrowRight } from "lucide-react";
import { CategoryFilter } from "@/components/category-filter";

interface HomePageProps {
  searchParams: Promise<{
    category?: string;
  }>;
}

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const selectedCategory = params.category;

  // 카테고리 목록 조회
  const categories = await getCategories();

  // 선택된 카테고리에 따라 상품 조회
  const products = await getProducts({
    category: selectedCategory,
    limit: selectedCategory ? undefined : 8, // 카테고리 선택 시 제한 없음
  });

  return (
    <main className="space-y-16 py-8 px-4">
      {/* 히어로 섹션 */}
      <section className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              세련된 의류를 만나보세요
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              트렌디한 디자인과 편안한 착용감을 모두 만족시키는 의류 컬렉션을
              선보입니다. 빠른 로그인과 간편한 결제로 쇼핑을 즐기세요.
            </p>
            <div className="flex gap-4">
              <Link href="/products">
                <Button size="lg" className="gap-2">
                  상품 둘러보기
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
            {/* TODO: 메인 배너 이미지 추가 */}
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <p className="text-lg">메인 배너 이미지</p>
            </div>
          </div>
        </div>
      </section>

      {/* 전체 상품 섹션 */}
      <section className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">전체 상품</h1>

        {/* 카테고리 필터 */}
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
        />

        {/* 상품 목록 */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground mt-8">
            <p>
              {selectedCategory
                ? "해당 카테고리에 등록된 상품이 없습니다."
                : "상품이 아직 등록되지 않았습니다."}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
