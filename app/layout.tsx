import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "PIXS | AI Pet Art Studio",
  description: "우리 아이의 가장 빛나는 순간, 영원한 예술이 되다",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className={`${inter.variable} ${playfair.variable} bg-[#121212] text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
