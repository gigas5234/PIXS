import type { Metadata } from "next";
import { Noto_Sans_KR, Noto_Serif_KR, Dancing_Script, Nanum_Pen_Script } from "next/font/google";
import "./globals.css";

const notoSans = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500"],
});

const notoSerif = Noto_Serif_KR({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["500", "600", "700"],
});

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-signature",
  weight: ["400", "500", "600", "700"],
});

const nanumPen = Nanum_Pen_Script({
  subsets: ["latin"],
  variable: "--font-signature-kr",
  weight: ["400"],
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
      <body className={`${notoSans.variable} ${notoSerif.variable} ${dancingScript.variable} ${nanumPen.variable} bg-[#121212] text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
