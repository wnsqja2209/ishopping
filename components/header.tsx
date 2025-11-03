/**
 * @file header.tsx
 * @description 쇼핑몰 헤더 컴포넌트
 *
 * 네비게이션 메뉴, 장바구니, 사용자 메뉴를 포함하는 헤더입니다.
 */

"use client";

import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu } from "lucide-react";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { useEffect, useState } from "react";

export function Header() {
  const [cartCount, setCartCount] = useState<number>(0);
  const supabase = useClerkSupabaseClient();

  useEffect(() => {
    async function fetchCartCount() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCartCount(0);
        return;
      }

      const { count } = await supabase
        .from("cart_items")
        .select("*", { count: "exact", head: true })
        .eq("clerk_id", user.id);

      setCartCount(count ?? 0);
    }

    fetchCartCount();

    // 실시간 구독 (선택사항 - 나중에 구현 가능)
    const channel = supabase
      .channel("cart_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cart_items",
        },
        () => {
          fetchCartCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <header className="border-b sticky top-0 z-50 bg-background">
      <div className="flex justify-between items-center p-4 gap-4 h-16 max-w-7xl mx-auto">
        <Link href="/" className="text-2xl font-bold">
          의류 쇼핑몰
        </Link>

        <nav className="hidden md:flex gap-6 items-center">
          <Link
            href="/"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            홈
          </Link>
          <Link
            href="/products"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            상품목록
          </Link>
          <SignedIn>
            <Link
              href="/my-page"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              마이페이지
            </Link>
          </SignedIn>
        </nav>

        <div className="flex gap-4 items-center">
          <SignedIn>
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Button>
            </Link>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button>로그인</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}

