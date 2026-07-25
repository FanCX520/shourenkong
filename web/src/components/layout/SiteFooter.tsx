import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[var(--bg-sidebar)]">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-4 py-8 text-[13px] text-[var(--text-secondary)] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium text-[var(--text-primary)]">兽人控.com</p>
          <p className="mt-1">中文圈兽人 / furry / kemono 游戏索引</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/explore/" className="hover:text-[var(--text-primary)]">探索</Link>
          <Link href="/tags/" className="hover:text-[var(--text-primary)]">标签</Link>
          <Link href="/about/" className="hover:text-[var(--text-primary)]">关于与贡献</Link>
          <a href="https://github.com/FanCX520/shourenkong" target="_blank" rel="noreferrer" className="hover:text-[var(--text-primary)]">GitHub</a>
        </div>
      </div>
    </footer>
  );
}
