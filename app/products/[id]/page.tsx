/**
 * @file page.tsx
 * @description 상품 상세 페이지
 *
 * 상품 정보, 이미지, 사이즈/색상 선택, 장바구니 추가 기능을 포함합니다.
 */

import { notFound } from "next/navigation";
import Image from "next/image";
import { getProductById } from "@/actions/product/get-product-by-id";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { SIZE_OPTIONS } from "@/lib/constants/categories";

interface ProductDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const imageUrl = product.image_url || "/logo.png";

  // 사용 가능한 사이즈와 색상 추출
  const availableSizes = Array.from(
    new Set(product.variants.map((v) => v.size))
  ).sort();
  const availableColors = Array.from(
    new Set(product.variants.map((v) => v.color))
  );

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* 상품 이미지 */}
        <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>

        {/* 상품 정보 */}
        <div className="space-y-6">
          <div>
            {product.category && (
              <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                {product.category.name}
              </span>
            )}
            <h1 className="text-3xl md:text-4xl font-bold mt-4 mb-2">
              {product.name}
            </h1>
            <p className="text-2xl md:text-3xl font-bold text-primary">
              {product.price.toLocaleString()}원
            </p>
          </div>

          {product.description && (
            <div>
              <h2 className="text-lg font-semibold mb-2">상품 설명</h2>
              <p className="text-muted-foreground whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* 사이즈 및 색상 선택 */}
          <AddToCartButton
            productId={product.id}
            variants={product.variants}
            basePrice={product.price}
          />

          {/* 상품 상세 정보 (추가 정보 필요 시) */}
          <div className="pt-8 border-t">
            <h2 className="text-lg font-semibold mb-4">배송 안내</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• 배송비: 무료 (주문 금액 50,000원 이상)</li>
              <li>• 배송 기간: 주문일 기준 2-3일 소요</li>
              <li>• 교환/반품: 수령 후 7일 이내 가능</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}

