/**
 * @file add-to-cart-button.tsx
 * @description 장바구니 추가 버튼 컴포넌트
 *
 * 사이즈와 색상을 선택하고 장바구니에 추가하는 기능을 제공합니다.
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { addCartItem } from "@/actions/cart/add-item";
import type { ProductVariant } from "@/types/product";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface AddToCartButtonProps {
  productId: string;
  variants: ProductVariant[];
  basePrice: number;
}

export function AddToCartButton({
  productId,
  variants,
  basePrice,
}: AddToCartButtonProps) {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);

  // 선택된 사이즈와 색상에 맞는 variant 찾기
  const selectedVariant = variants.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  );

  // 사용 가능한 사이즈와 색상 추출
  const availableSizes = Array.from(
    new Set(variants.map((v) => v.size))
  ).sort();
  const availableColors = Array.from(
    new Set(
      selectedSize
        ? variants
            .filter((v) => v.size === selectedSize)
            .map((v) => v.color)
        : variants.map((v) => v.color)
    )
  );

  const handleAddToCart = async () => {
    if (!selectedSize || !selectedColor) {
      toast.error("사이즈와 색상을 선택해주세요.");
      return;
    }

    if (!selectedVariant) {
      toast.error("선택하신 옵션의 상품을 찾을 수 없습니다.");
      return;
    }

    if (selectedVariant.stock_quantity < quantity) {
      toast.error(
        `재고가 부족합니다. (현재 재고: ${selectedVariant.stock_quantity}개)`
      );
      return;
    }

    setIsLoading(true);

    try {
      await addCartItem({
        variantId: selectedVariant.id,
        quantity,
      });
      toast.success("장바구니에 추가되었습니다.");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "장바구니 추가에 실패했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const finalPrice = selectedVariant
    ? basePrice + selectedVariant.price_adjustment
    : basePrice;

  return (
    <div className="space-y-4 pt-4 border-t">
      {/* 사이즈 선택 */}
      <div className="space-y-2">
        <Label htmlFor="size">사이즈</Label>
        <Select value={selectedSize} onValueChange={setSelectedSize}>
          <SelectTrigger id="size">
            <SelectValue placeholder="사이즈를 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            {availableSizes.map((size) => (
              <SelectItem key={size} value={size}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 색상 선택 */}
      <div className="space-y-2">
        <Label htmlFor="color">색상</Label>
        <Select
          value={selectedColor}
          onValueChange={setSelectedColor}
          disabled={!selectedSize}
        >
          <SelectTrigger id="color">
            <SelectValue placeholder="색상을 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            {availableColors.map((color) => (
              <SelectItem key={color} value={color}>
                {color}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 수량 선택 */}
      {selectedVariant && (
        <div className="space-y-2">
          <Label htmlFor="quantity">수량</Label>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 border rounded-md">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </Button>
              <span className="w-12 text-center">{quantity}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() =>
                  setQuantity(
                    Math.min(selectedVariant.stock_quantity, quantity + 1)
                  )
                }
                disabled={quantity >= selectedVariant.stock_quantity}
              >
                +
              </Button>
            </div>
            <span className="text-sm text-muted-foreground">
              재고: {selectedVariant.stock_quantity}개
            </span>
          </div>
        </div>
      )}

      {/* 가격 및 장바구니 추가 버튼 */}
      {selectedVariant && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">총 상품금액</span>
            <span className="text-2xl font-bold text-primary">
              {(finalPrice * quantity).toLocaleString()}원
            </span>
          </div>
          <Button
            onClick={handleAddToCart}
            disabled={isLoading || !selectedVariant}
            className="w-full"
            size="lg"
          >
            {isLoading ? "처리 중..." : "장바구니에 추가"}
          </Button>
        </div>
      )}
    </div>
  );
}

