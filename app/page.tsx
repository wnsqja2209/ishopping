"use client";

import { useState, useEffect } from "react";
import { getProducts } from "@/actions/get-products";
import { getPopularProducts } from "@/actions/get-popular-products";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  stock_quantity: number;
};

const CATEGORIES = [
  "전체",
  "electronics",
  "clothing",
  "books",
  "food",
  "sports",
  "beauty",
  "home",
];

const CATEGORY_LABELS: Record<string, string> = {
  전체: "전체",
  electronics: "전자제품",
  clothing: "의류",
  books: "도서",
  food: "식품",
  sports: "스포츠",
  beauty: "뷰티",
  home: "생활/가정",
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [loading, setLoading] = useState(true);
  const [popularLoading, setPopularLoading] = useState(true);

  // 상품 데이터 로드
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts();
        setProducts(data as Product[]);
        setFilteredProducts(data as Product[]);
      } catch (error) {
        console.error("상품 로드 오류:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // 인기 상품 데이터 로드
  useEffect(() => {
    const loadPopularProducts = async () => {
      try {
        setPopularLoading(true);
        const data = await getPopularProducts(8);
        setPopularProducts(data as Product[]);
      } catch (error) {
        console.error("인기 상품 로드 오류:", error);
      } finally {
        setPopularLoading(false);
      }
    };

    loadPopularProducts();
  }, []);

  // 카테고리 필터링
  useEffect(() => {
    if (selectedCategory === "전체") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(
        products.filter((product) => product.category === selectedCategory),
      );
    }
  }, [selectedCategory, products]);

  return (
    <main className="min-h-[calc(100vh-80px)] px-8 py-16 lg:py-24">
      <section className="w-full max-w-7xl mx-auto">
        {/* 인기 상품 섹션 */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8">인기 상품</h2>
          {popularLoading ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">
                인기 상품을 불러오는 중...
              </p>
            </div>
          ) : popularProducts.length > 0 ? (
            <div className="flex overflow-x-auto gap-6 pb-4 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {popularProducts.map((product) => (
                <div key={product.id} className="min-w-[280px] shrink-0">
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    description={product.description}
                    price={product.price}
                    category={product.category}
                    stockQuantity={product.stock_quantity}
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* 제목 */}
        <h1 className="text-3xl font-bold mb-8">전체 상품</h1>

        {/* 카테고리 필터 버튼 */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map((category) => (
            <Button
              key={category}
              onClick={() => setSelectedCategory(category)}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              className={cn(
                "shrink-0 whitespace-nowrap",
                selectedCategory === category &&
                  "bg-primary text-primary-foreground",
              )}
            >
              {CATEGORY_LABELS[category] || category}
            </Button>
          ))}
        </div>

        {/* 상품 그리드 */}
        {loading ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">상품을 불러오는 중...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">
              {selectedCategory === "전체"
                ? "상품이 없습니다."
                : `${CATEGORY_LABELS[selectedCategory]} 카테고리에 상품이 없습니다.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                description={product.description}
                price={product.price}
                category={product.category}
                stockQuantity={product.stock_quantity}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
