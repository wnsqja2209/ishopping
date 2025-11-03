/**
 * @file footer.tsx
 * @description 쇼핑몰 푸터 컴포넌트
 */

import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-lg mb-4">의류 쇼핑몰</h3>
            <p className="text-sm text-muted-foreground">
              세련된 의류를 합리적인 가격으로 만나보세요.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">고객센터</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-primary">
                  문의하기
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-primary">
                  배송 안내
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-primary">
                  교환/반품 안내
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">회사 정보</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-primary">
                  이용약관
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-primary">
                  개인정보처리방침
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} 의류 쇼핑몰. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

