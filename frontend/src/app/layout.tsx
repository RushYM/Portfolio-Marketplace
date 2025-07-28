import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { Toaster } from 'react-hot-toast';
import AuthProvider from '@/components/auth/AuthProvider';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import "./globals.css";

const pretendard = Noto_Sans_KR({
  variable: "--font-pretendard",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "마켓플레이스 - 믿고 사는 중고거래",
  description: "우리 동네 중고거래의 새로운 경험. 안전하고 편리한 거래를 시작해보세요.",
  keywords: ["중고거래", "마켓플레이스", "당근마켓", "중고나라", "안전거래"],
  authors: [{ name: "Marketplace Team" }],
  openGraph: {
    title: "마켓플레이스 - 믿고 사는 중고거래",
    description: "우리 동네 중고거래의 새로운 경험",
    type: "website",
    locale: "ko_KR",
  },
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${pretendard.variable} antialiased`}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#333',
              fontSize: '14px',
              borderRadius: '12px',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
              border: '1px solid #f3f4f6',
            },
            success: {
              iconTheme: {
                primary: '#ff6f0f',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#f44336',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
