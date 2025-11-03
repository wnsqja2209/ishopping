/**
 * @file add-item.ts
 * @description 장바구니에 상품 추가 Server Action
 */

"use server";

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export interface AddCartItemParams {
  variantId: string;
  quantity: number;
}

export async function addCartItem(params: AddCartItemParams) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("로그인이 필요합니다.");
  }

  if (params.quantity <= 0) {
    throw new Error("수량은 1개 이상이어야 합니다.");
  }

  const supabase = await createClerkSupabaseClient();

  // variant 존재 및 재고 확인
  const { data: variant, error: variantError } = await supabase
    .from("product_variants")
    .select("stock_quantity, is_active")
    .eq("id", params.variantId)
    .single();

  if (variantError || !variant) {
    throw new Error("상품을 찾을 수 없습니다.");
  }

  if (!variant.is_active) {
    throw new Error("판매 중인 상품이 아닙니다.");
  }

  if (variant.stock_quantity < params.quantity) {
    throw new Error(`재고가 부족합니다. (현재 재고: ${variant.stock_quantity}개)`);
  }

  // 기존 장바구니 아이템 확인
  const { data: existingItem, error: existingError } = await supabase
    .from("cart_items")
    .select("*")
    .eq("clerk_id", userId)
    .eq("variant_id", params.variantId)
    .single();

  if (existingItem) {
    // 기존 아이템이 있으면 수량 업데이트
    const newQuantity = existingItem.quantity + params.quantity;

    if (variant.stock_quantity < newQuantity) {
      throw new Error(`재고가 부족합니다. (현재 재고: ${variant.stock_quantity}개)`);
    }

    const { error: updateError } = await supabase
      .from("cart_items")
      .update({ quantity: newQuantity })
      .eq("id", existingItem.id);

    if (updateError) {
      console.error("Error updating cart item:", updateError);
      throw new Error("장바구니에 추가하는데 실패했습니다.");
    }
  } else {
    // 새 아이템 추가
    const { error: insertError } = await supabase
      .from("cart_items")
      .insert({
        clerk_id: userId,
        variant_id: params.variantId,
        quantity: params.quantity,
      });

    if (insertError) {
      console.error("Error adding cart item:", insertError);
      throw new Error("장바구니에 추가하는데 실패했습니다.");
    }
  }

  revalidatePath("/cart");
  revalidatePath("/");

  return { success: true };
}

