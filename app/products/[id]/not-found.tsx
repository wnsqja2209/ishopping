import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * 상품 상세 페이지 404 에러 페이지
 */
export default function ProductNotFound() {
  return (
    <main className="min-h-[calc(100vh-80px)] flex items-center justify-center px-8">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold mb-4">상품을 찾을 수 없습니다</h2>
        <p className="text-muted-foreground mb-6">
          요청하신 상품이 존재하지 않거나 삭제되었습니다.
        </p>
        <Link href="/products">
          <Button>상품 목록으로 돌아가기</Button>
        </Link>
      </div>
    </main>
  );
}

