import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "모여 (Moyeo) — 우리의 중간 지점은?",
  description: "친구들과의 약속 장소를 정하는 가장 쉬운 방법, 모여",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          // eslint-disable-next-line @next/next/no-page-custom-font
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="bg-neutral-100 font-sans antialiased">
        <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background shadow-sm">
          {children}
        </div>
      </body>
    </html>
  );
}
