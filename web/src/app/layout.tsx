import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "兽人控.com — 兽人 / Furry / Kemono 游戏索引",
    template: "%s · 兽人控.com",
  },
  description: "中文圈最实用的兽人、furry、kemono 游戏资源索引。支持标签筛选、随机发现与双主题。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('shourenkong-theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}else{document.documentElement.setAttribute('data-theme','dark');}var p=localStorage.getItem('shourenkong-palette');if(p){document.documentElement.setAttribute('data-palette',p);}else{document.documentElement.setAttribute('data-palette','gold');}}catch(e){document.documentElement.setAttribute('data-theme','dark');document.documentElement.setAttribute('data-palette','gold');}})();`,
          }}
        />
      </head>
      <body className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
