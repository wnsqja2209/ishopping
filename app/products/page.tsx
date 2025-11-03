import { Suspense } from "react";
import Link from "next/link";
import { getProductsByCategory } from "@/actions/get-products";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "전체",
  "electronics",
  "clothing",
  "books",
  "food",
  "sports",
  "beauty",
  "home",
];

const CATEGORY_LABELS: Record<string, string> = {
  전체: "전체",
  electronics: "전자제품",
  clothing: "의류",
  books: "도서",
  food: "식품",
  sports: "스포츠",
  beauty: "뷰티",
  home: "생활/가정",
};

type ProductsPageProps = {
  searchParams: Promise<{
    category?: string;
    page?: string;
  }>;
};

function ProductsContent({ category, page }: { category?: string; page: number }) {
  const productsData = getProductsByCategory(
    category || null,
    page,
    12
  );

  return (
    <ProductsList
      productsPromise={productsData}
      currentCategory={category}
      currentPage={page}
    />
  );
}

async function ProductsList({
  productsPromise,
  currentCategory,
  currentPage,
}: {
  productsPromise: Promise<{
    products: Array<{
      id: string;
      name: string;
      description: string | null;
      price: number;
      category: string | null;
      stock_quantity: number;
    }>;
    total: number;
    page: number;
    totalPages: number;
  }>;
  currentCategory?: string;
  currentPage: number;
}) {
  const { products, total, totalPages } = await productsPromise;
  const selectedCategory = currentCategory || "전체";

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* 제목 */}
      <h1 className="text-3xl font-bold mb-8">상품 목록</h1>

      {/* 카테고리 필터 버튼 */}
      <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((category) => {
          const isActive = selectedCategory === category;
          const href = category === "전체" ? "/products" : `/products?category=${category}`;

          return (
            <Link key={category} href={href}>
              <Button
                variant={isActive ? "default" : "outline"}
                size="sm"
                className={cn(
                  "shrink-0 whitespace-nowrap",
                  isActive && "bg-primary text-primary-foreground"
                )}
              >
                {CATEGORY_LABELS[category] || category}
              </Button>
            </Link>
          );
        })}
      </div>

      {/* 상품 그리드 */}
      {products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">
            {selectedCategory === "전체"
              ? "상품이 없습니다."
              : `${CATEGORY_LABELS[selectedCategory]} 카테고리에 상품이 없습니다.`}
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            총 {total}개의 상품
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                description={product.description}
                price={product.price}
                category={product.category}
                stockQuantity={product.stock_quantity}
              />
            ))}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {/* 이전 페이지 */}
              {currentPage > 1 && (
                <Link
                  href={
                    selectedCategory === "전체"
                      ? `/products?page=${currentPage - 1}`
                      : `/products?category=${selectedCategory}&page=${currentPage - 1}`
                  }
                >
                  <Button variant="outline" size="sm">
                    이전
                  </Button>
                </Link>
              )}

              {/* 페이지 번호 */}
              {(() => {
                const pages: (number | string)[] = [];
                const startPage = Math.max(1, currentPage - 2);
                const endPage = Math.min(totalPages, currentPage + 2);

                // 첫 페이지
                if (startPage > 1) {
                  pages.push(1);
                  if (startPage > 2) pages.push("...");
                }

                // 현재 페이지 주변 페이지들
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(i);
                }

                // 마지막 페이지
                if (endPage < totalPages) {
                  if (endPage < totalPages - 1) pages.push("...");
                  pages.push(totalPages);
                }

                return pages.map((pageNum, index) => {
                  if (pageNum === "...") {
                    return (
                      <span key={`ellipsis-${index}`} className="text-muted-foreground">
                        ...
                      </span>
                    );
                  }

                  const page = pageNum as number;
                  const href =
                    selectedCategory === "전체"
                      ? `/products?page=${page}`
                      : `/products?category=${selectedCategory}&page=${page}`;

                  return (
                    <Link key={page} href={href}>
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          currentPage === page &&
                            "bg-primary text-primary-foreground"
                        )}
                      >
                        {page}
                      </Button>
                    </Link>
                  );
                });
              })()}

              {/* 다음 페이지 */}
              {currentPage < totalPages && (
                <Link
                  href={
                    selectedCategory === "전체"
                      ? `/products?page=${currentPage + 1}`
                      : `/products?category=${selectedCategory}&page=${currentPage + 1}`
                  }
                >
                  <Button variant="outline" size="sm">
                    다음
                  </Button>
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const category = params.category || "전체";
  const page = parseInt(params.page || "1", 10);

  return (
    <main className="min-h-[calc(100vh-80px)] px-8 py-16 lg:py-24">
      <Suspense
        fallback={
          <div className="w-full max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">상품 목록</h1>
            <div className="text-center py-16">
              <p className="text-muted-foreground">상품을 불러오는 중...</p>
            </div>
          </div>
        }
      >
        <ProductsContent category={category} page={page} />
      </Suspense>
    </main>
  );
}

