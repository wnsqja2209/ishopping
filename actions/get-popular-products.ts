"use server";

import { createClient } from "@supabase/supabase-js";

type PopularProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  stock_quantity: number;
  total_sold: number;
};

/**
 * 인기 상품을 조회하는 Server Action
 *
 * 판매량(주문량) 기준으로 상위 상품을 조회합니다.
 * 취소되지 않은 주문만 포함하며, 최대 8개까지 반환합니다.
 */
export async function getPopularProducts(limit: number = 8): Promise<PopularProduct[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase 환경 변수가 설정되지 않았습니다.");
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // 1. 취소되지 않은 주문 ID 목록 조회
  const { data: validOrders, error: ordersError } = await supabase
    .from("orders")
    .select("id")
    .neq("status", "cancelled");

  if (ordersError) {
    console.error("주문 조회 오류:", ordersError);
    throw new Error("인기 상품 조회에 실패했습니다.");
  }

  // 주문이 없으면 재고가 많은 최신 상품을 fallback으로 반환
  if (!validOrders || validOrders.length === 0) {
    const { data: fallbackProducts, error: fallbackError } = await supabase
      .from("products")
      .select("id, name, description, price, category, stock_quantity")
      .eq("is_active", true)
      .gt("stock_quantity", 0)
      .order("stock_quantity", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (fallbackError) {
      console.error("Fallback 상품 조회 오류:", fallbackError);
      throw new Error("인기 상품 조회에 실패했습니다.");
    }

    return (
      (fallbackProducts || []).map((product) => ({
        ...product,
        total_sold: 0,
      })) || []
    );
  }

  const orderIds = validOrders.map((order) => order.id);

  // 2. 취소되지 않은 주문의 order_items 조회
  const { data: orderItems, error: orderItemsError } = await supabase
    .from("order_items")
    .select("product_id, quantity")
    .in("order_id", orderIds);

  if (orderItemsError) {
    console.error("주문 아이템 조회 오류:", orderItemsError);
    throw new Error("인기 상품 조회에 실패했습니다.");
  }

  // 3. 상품별 판매량 합계 계산
  const salesMap = new Map<string, number>();
  if (orderItems) {
    for (const item of orderItems) {
      const productId = item.product_id;
      const quantity = item.quantity || 0;
      salesMap.set(
        productId,
        (salesMap.get(productId) || 0) + quantity
      );
    }
  }

  // 판매량이 0인 경우 재고가 많은 최신 상품을 fallback으로 반환
  if (salesMap.size === 0) {
    const { data: fallbackProducts, error: fallbackError } = await supabase
      .from("products")
      .select("id, name, description, price, category, stock_quantity")
      .eq("is_active", true)
      .gt("stock_quantity", 0)
      .order("stock_quantity", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (fallbackError) {
      console.error("Fallback 상품 조회 오류:", fallbackError);
      throw new Error("인기 상품 조회에 실패했습니다.");
    }

    return (
      (fallbackProducts || []).map((product) => ({
        ...product,
        total_sold: 0,
      })) || []
    );
  }

  // 4. 상품 정보 조회 (활성 상품만)
  const productIds = Array.from(salesMap.keys());
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, description, price, category, stock_quantity")
    .in("id", productIds)
    .eq("is_active", true);

  if (productsError) {
    console.error("상품 조회 오류:", productsError);
    throw new Error("인기 상품 조회에 실패했습니다.");
  }

  // 5. 상품 정보와 판매량 결합 후 정렬
  const popularProducts: PopularProduct[] =
    (products || [])
      .map((product) => ({
        ...product,
        total_sold: salesMap.get(product.id) || 0,
      }))
      .filter((product) => product.total_sold > 0)
      .sort((a, b) => b.total_sold - a.total_sold)
      .slice(0, limit);

  return popularProducts;
}

