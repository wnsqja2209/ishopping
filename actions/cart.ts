"use server";

import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

/**
 * 장바구니에 상품을 추가하는 Server Action
 *
 * - 이미 장바구니에 있는 상품은 수량을 업데이트합니다.
 * - 재고를 확인하여 재고보다 많은 수량은 추가할 수 없습니다.
 * - 인증된 사용자만 사용 가능합니다.
 *
 * @param productId - 추가할 상품의 ID (UUID)
 * @param quantity - 추가할 수량 (기본값: 1)
 * @returns 성공 여부 및 메시지
 */
export async function addToCart(
  productId: string,
  quantity: number = 1
): Promise<{ success: boolean; message: string }> {
  // Clerk 인증 확인
  const { userId } = await auth();

  if (!userId) {
    return {
      success: false,
      message: "로그인이 필요합니다.",
    };
  }

  // 수량 유효성 검사
  if (quantity < 1) {
    return {
      success: false,
      message: "수량은 최소 1개 이상이어야 합니다.",
    };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      success: false,
      message: "서버 설정 오류가 발생했습니다.",
    };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // 1. 상품 정보 조회 (재고 확인)
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, name, stock_quantity, is_active")
      .eq("id", productId)
      .eq("is_active", true)
      .single();

    if (productError || !product) {
      return {
        success: false,
        message: "상품을 찾을 수 없습니다.",
      };
    }

    // 재고 확인
    if (product.stock_quantity < quantity) {
      return {
        success: false,
        message: `재고가 부족합니다. (재고: ${product.stock_quantity}개)`,
      };
    }

    // 2. 기존 장바구니 아이템 확인
    const { data: existingItem, error: checkError } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("clerk_id", userId)
      .eq("product_id", productId)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116은 "no rows returned" 에러 (아이템이 없는 경우)
      console.error("장바구니 확인 오류:", checkError);
      return {
        success: false,
        message: "장바구니 조회에 실패했습니다.",
      };
    }

    // 3. 장바구니 아이템 추가 또는 업데이트
    if (existingItem) {
      // 기존 아이템이 있는 경우 수량 업데이트
      const newQuantity = existingItem.quantity + quantity;

      // 재고 확인 (업데이트 후 총 수량)
      if (product.stock_quantity < newQuantity) {
        return {
          success: false,
          message: `재고가 부족합니다. 장바구니에 ${existingItem.quantity}개가 이미 있습니다. (재고: ${product.stock_quantity}개)`,
        };
      }

      const { error: updateError } = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity })
        .eq("id", existingItem.id);

      if (updateError) {
        console.error("장바구니 업데이트 오류:", updateError);
        return {
          success: false,
          message: "장바구니 업데이트에 실패했습니다.",
        };
      }

      return {
        success: true,
        message: "장바구니에 추가되었습니다.",
      };
    } else {
      // 새 아이템 추가
      const { error: insertError } = await supabase
        .from("cart_items")
        .insert({
          clerk_id: userId,
          product_id: productId,
          quantity: quantity,
        });

      if (insertError) {
        console.error("장바구니 추가 오류:", insertError);
        return {
          success: false,
          message: "장바구니 추가에 실패했습니다.",
        };
      }

      return {
        success: true,
        message: "장바구니에 추가되었습니다.",
      };
    }
  } catch (error) {
    console.error("장바구니 추가 처리 오류:", error);
    return {
      success: false,
      message: "예상치 못한 오류가 발생했습니다.",
    };
  }
}

