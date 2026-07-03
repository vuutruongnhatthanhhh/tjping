import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TJPing - Reminder automation đa kênh",
  description: "Nền tảng tạo lời nhắc qua Email và Telegram cho người Việt",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
