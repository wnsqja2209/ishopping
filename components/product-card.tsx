"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  category?: string | null;
  stockQuantity: number;
}

/**
 * 상품 카드 컴포넌트
 *
 * 상품 정보를 카드 형태로 표시하고,
 * 클릭 시 상품 상세 페이지로 이동합니다.
 */
export function ProductCard({
  id,
  name,
  description,
  price,
  category,
  stockQuantity,
}: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(Number(price));

  return (
    <Link
      href={`/products/${id}`}
      className="group block rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md hover:scale-[1.02]"
    >
      <div className="p-4">
        {/* 이미지 플레이스홀더 */}
        <div className="mb-4 aspect-square w-full overflow-hidden rounded-lg bg-muted">
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <span className="text-sm">이미지 없음</span>
          </div>
        </div>

        {/* 상품 정보 */}
        <div className="space-y-2">
          {/* 카테고리 */}
          {category && (
            <span className="text-xs text-muted-foreground uppercase">
              {category}
            </span>
          )}

          {/* 상품명 */}
          <h3 className="line-clamp-2 font-semibold leading-tight group-hover:text-primary transition-colors">
            {name}
          </h3>

          {/* 설명 */}
          {description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {description}
            </p>
          )}

          {/* 가격 및 재고 */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-lg font-bold text-primary">
              {formattedPrice}
            </span>
            {stockQuantity > 0 ? (
              <span className="text-xs text-muted-foreground">
                재고 {stockQuantity}개
              </span>
            ) : (
              <span className="text-xs text-destructive">품절</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

