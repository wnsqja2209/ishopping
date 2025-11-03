import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProduct } from "@/actions/get-product";
import { AddToCart } from "@/components/add-to-cart";

const CATEGORY_LABELS: Record<string, string> = {
  electronics: "전자제품",
  clothing: "의류",
  books: "도서",
  food: "식품",
  sports: "스포츠",
  beauty: "뷰티",
  home: "생활/가정",
};

type ProductDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * 상품 상세 정보를 표시하는 컴포넌트
 */
async function ProductDetail({ productId }: { productId: string }) {
  const product = await getProduct(productId);

  if (!product) {
    notFound();
  }

  const formattedPrice = new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(Number(product.price));

  const formattedCreatedAt = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Seoul",
  }).format(new Date(product.created_at));

  const categoryLabel = product.category
    ? CATEGORY_LABELS[product.category] || product.category
    : null;

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* 2열 그리드 레이아웃 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 왼쪽 열: 제품 이미지 */}
        <div>
          <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted border">
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <span>이미지 없음</span>
            </div>
          </div>
        </div>

        {/* 오른쪽 열: 제품 정보 및 장바구니 */}
        <div className="space-y-6">
          {/* 제품 이름 */}
          <h1 className="text-4xl font-bold">{product.name}</h1>

          {/* 가격 및 재고 상태 */}
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-primary">
              {formattedPrice}
            </span>
            {product.stock_quantity > 0 ? (
              <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">
                재고 있음 ({product.stock_quantity}개)
              </span>
            ) : (
              <span className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-full">
                품절
              </span>
            )}
          </div>

          {/* 카테고리 정보 */}
          {categoryLabel && (
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">카테고리</h2>
              <div>
                <span className="inline-block px-3 py-1 text-sm bg-muted rounded-md uppercase">
                  {categoryLabel}
                </span>
              </div>
            </div>
          )}

          {/* 상품 설명 */}
          {product.description && (
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">상품 설명</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          )}

          {/* 등록일 */}
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">등록일: </span>
            <span>{formattedCreatedAt}</span>
          </div>

          {/* 장바구니 UI */}
          <div className="border-t pt-6 mt-6">
            <div className="border rounded-lg p-6 bg-card">
              <h2 className="text-xl font-semibold mb-4">구매하기</h2>
              <AddToCart
                productId={product.id}
                stockQuantity={product.stock_quantity}
                price={product.price}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 상품 상세 페이지
 *
 * Server Component로 구현되어 있으며, 상품 정보를 서버에서 조회합니다.
 * 상품이 존재하지 않으면 404 페이지를 표시합니다.
 */
export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;

  return (
    <main className="min-h-[calc(100vh-80px)] px-8 py-16 lg:py-24">
      <Suspense
        fallback={
          <div className="w-full max-w-7xl mx-auto">
            <div className="text-center py-16">
              <p className="text-muted-foreground">상품 정보를 불러오는 중...</p>
            </div>
          </div>
        }
      >
        <ProductDetail productId={id} />
      </Suspense>
    </main>
  );
}

