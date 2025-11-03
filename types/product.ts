/**
 * @file product.ts
 * @description 상품 관련 TypeScript 타입 정의
 *
 * 의류 쇼핑몰의 상품, 카테고리, 상품 변형 등의 타입을 정의합니다.
 */

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category_id?: string; // 새 스키마용 (categories 테이블 사용)
  category?: string; // update_shopping_mall_schema.sql용 (TEXT 타입)
  image_url?: string | null;
  stock_quantity?: number; // update_shopping_mall_schema.sql용
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // 조인된 데이터
  category_relation?: Category; // 조인된 categories 테이블 데이터
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string;
  color: string;
  stock_quantity: number;
  price_adjustment: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // 조인된 데이터
  product?: Product;
}

export interface ProductWithVariants extends Product {
  variants: ProductVariant[];
}

export interface CartItem {
  id: string;
  clerk_id: string;
  variant_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  // 조인된 데이터
  variant?: ProductVariant & { product?: Product };
}

export interface Order {
  id: string;
  clerk_id: string;
  order_number: string;
  total_amount: number;
  status: OrderStatus;
  shipping_address: ShippingAddress;
  order_note: string | null;
  payment_id: string | null;
  payment_method: string | null;
  created_at: string;
  updated_at: string;
}

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled';

export interface ShippingAddress {
  recipient_name: string;
  phone: string;
  address: string;
  detail_address: string;
  postal_code?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  variant_id: string;
  product_name: string;
  product_size: string;
  product_color: string;
  quantity: number;
  price: number;
  created_at: string;
  // 조인된 데이터
  variant?: ProductVariant;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

