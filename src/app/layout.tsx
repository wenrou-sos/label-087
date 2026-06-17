import type { Metadata } from "next";
import "./globals.css";
import { HydrateProvider } from "@/components/provider/HydrateProvider";

export const metadata: Metadata = {
  title: "消防救援作战指挥平台",
  description: "消防救援队伍作战指挥平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-bg-primary text-text-primary" style={{ fontFamily: "'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', system-ui, -apple-system, sans-serif" }}>
        <HydrateProvider>{children}</HydrateProvider>
      </body>
    </html>
  );
}
