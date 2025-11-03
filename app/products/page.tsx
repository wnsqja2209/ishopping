/**
 * @file page.tsx
 * @description 상품 목록 페이지
 *
 * 카테고리 필터링을 지원하는 상품 목록 페이지입니다.
 */

import { Suspense } from "react";
import { ProductCard } from "@/components/product-card";
import { getProducts } from "@/actions/product/get-products";
import { getCategories } from "@/actions/product/get-categories";
import type { Category } from "@/types/product";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
  }>;
}

async function ProductList({ categorySlug }: { categorySlug?: string }) {
  const categories = await getCategories();
  
  let categoryId: string | undefined;
  if (categorySlug) {
    const category = categories.find((c) => c.slug === categorySlug);
    categoryId = category?.id;
  }

  const products = await getProducts({ categoryId });

  return (
    <div className="space-y-8">
      {/* 카테고리 필터 */}
      <div className="flex gap-2 flex-wrap">
        <Link href="/products">
          <Button
            variant={!categorySlug ? "default" : "outline"}
            size="sm"
          >
            전체
          </Button>
        </Link>
        {categories.map((category) => (
          <Link key={category.id} href={`/products?category=${category.slug}`}>
            <Button
              variant={categorySlug === category.slug ? "default" : "outline"}
              size="sm"
            >
              {category.name}
            </Button>
          </Link>
        ))}
      </div>

      {/* 상품 목록 */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>해당 카테고리에 등록된 상품이 없습니다.</p>
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="border rounded-lg overflow-hidden animate-pulse"
        >
          <div className="aspect-square bg-muted" />
          <div className="p-4 space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const categorySlug = params.category;

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">상품 목록</h1>
        <p className="text-muted-foreground">
          원하는 카테고리를 선택하여 상품을 둘러보세요.
        </p>
      </div>
      <Suspense fallback={<LoadingSkeleton />}>
        <ProductList categorySlug={categorySlug} />
      </Suspense>
    </main>
  );
}

