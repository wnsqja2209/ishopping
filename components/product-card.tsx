/**
 * @file product-card.tsx
 * @description 상품 카드 컴포넌트
 *
 * 상품 목록에서 사용되는 상품 카드 UI 컴포넌트입니다.
 */

import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types/product";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.image_url || "/logo.png"; // 기본 이미지

  return (
    <Link href={`/products/${product.id}`}>
      <div className="group relative flex flex-col border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative aspect-square bg-muted overflow-hidden">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="p-4 flex flex-col gap-2">
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          )}
          <div className="flex items-center justify-between mt-auto pt-2">
            <span className="font-bold text-lg">
              {product.price.toLocaleString()}원
            </span>
            {(product.category_relation || product.category) && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                {product.category_relation?.name || product.category || ""}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

