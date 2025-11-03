"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/actions/cart";
import { ShoppingCart } from "lucide-react";

interface AddToCartProps {
  productId: string;
  stockQuantity: number;
  price: number;
}

/**
 * 장바구니 추가 컴포넌트
 *
 * 수량 선택 및 장바구니 추가 기능을 제공합니다.
 * 재고 확인 및 로그인 상태 확인을 포함합니다.
 */
export function AddToCart({
  productId,
  stockQuantity,
  price,
}: AddToCartProps) {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) {
      setQuantity(1);
      return;
    }
    if (newQuantity > stockQuantity) {
      setQuantity(stockQuantity);
      return;
    }
    setQuantity(newQuantity);
  };

  const handleAddToCart = async () => {
    if (quantity < 1 || quantity > stockQuantity) {
      setMessage({
        type: "error",
        text: "유효하지 않은 수량입니다.",
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const result = await addToCart(productId, quantity);

      if (result.success) {
        setMessage({
          type: "success",
          text: result.message,
        });
        // 성공 메시지 3초 후 자동 제거
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({
          type: "error",
          text: result.message,
        });
      }
    } catch (error) {
      console.error("장바구니 추가 오류:", error);
      setMessage({
        type: "error",
        text: "장바구니 추가 중 오류가 발생했습니다.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isOutOfStock = stockQuantity === 0;
  const canAddToCart = !isOutOfStock && quantity > 0 && !isLoading;

  return (
    <div className="space-y-4">
      {/* 수량 선택 */}
      <div className="space-y-2">
        <label htmlFor="quantity" className="text-sm font-medium">
          수량
        </label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1 || isOutOfStock}
            className="h-10 w-10"
          >
            -
          </Button>
          <input
            id="quantity"
            type="number"
            min="1"
            max={stockQuantity}
            value={quantity}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
            disabled={isOutOfStock}
            className="w-20 text-center border rounded-md px-3 py-2 disabled:bg-muted disabled:cursor-not-allowed"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={quantity >= stockQuantity || isOutOfStock}
            className="h-10 w-10"
          >
            +
          </Button>
          <span className="text-sm text-muted-foreground">
            (재고: {stockQuantity}개)
          </span>
        </div>
      </div>

      {/* 장바구니 추가 버튼 */}
      <Button
        onClick={handleAddToCart}
        disabled={!canAddToCart}
        className="w-full"
        size="lg"
      >
        <ShoppingCart className="mr-2 h-4 w-4" />
        {isOutOfStock ? "품절" : isLoading ? "추가 중..." : "장바구니에 추가"}
      </Button>

      {/* 총 가격 표시 */}
      <div className="pt-4 border-t">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">총 가격</span>
          <span className="text-xl font-bold">
            {new Intl.NumberFormat("ko-KR", {
              style: "currency",
              currency: "KRW",
            }).format(price * quantity)}
          </span>
        </div>
      </div>

      {/* 메시지 표시 */}
      {message && (
        <div
          className={`p-3 rounded-md text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* 품절 안내 */}
      {isOutOfStock && (
        <div className="p-3 rounded-md text-sm bg-yellow-50 text-yellow-800 border border-yellow-200">
          현재 재고가 없습니다.
        </div>
      )}
    </div>
  );
}

