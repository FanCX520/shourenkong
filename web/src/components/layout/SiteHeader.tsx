"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { GamepadIcon, SearchIcon, ShuffleIcon } from "@/components/ui/Icons";
import { getAllGames } from "@/lib/games";

const NAV = [
  { href: "/", label: "首页" },
  { href: "/explore/", label: "探索" },
  { href: "/tags/", label: "标签" },
  { href: "/about/", label: "关于" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [q, setQ] = useState("");

  const games = useMemo(() => getAllGames(), []);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    router.push(query ? `/explore/?q=${encodeURIComponent(query)}` : "/explore/");
  };

  const onRandom = () => {
    if (!games.length) return;
    const g = games[Math.floor(Math.random() * games.length)];
    router.push(`/game/${g.id}/`);
  };

  return (
    <header
      className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg-surface)_92%,transparent)] backdrop-blur-md"
      style={{ height: "var(--header-height)" }}
    >
      <div className="mx-auto flex h-full max-w-[1200px] items-center gap-3 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[var(--bg-selected)] text-[var(--primary)]">
            <GamepadIcon size={18} />
          </span>
          <span className="hidden sm:inline">兽人控</span>
        </Link>

        <nav className="ml-1 hidden items-center gap-0.5 md:flex">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href.replace(/\/$/, ""));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-[8px] px-2.5 py-1.5 text-[13px] transition-colors ${
                  active
                    ? "bg-[var(--bg-selected)] font-medium text-[var(--primary)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <form onSubmit={onSearch} className="relative ml-auto min-w-0 max-w-[280px] flex-1">
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">
            <SearchIcon size={15} />
          </span>
          <input
            className="input"
            placeholder="搜索游戏…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="搜索游戏"
          />
        </form>

        <button type="button" className="btn btn-secondary shrink-0" onClick={onRandom} title="随机发现">
          <ShuffleIcon size={15} />
          <span className="hidden sm:inline">随机</span>
        </button>

        <ThemeToggle />
      </div>
    </header>
  );
}
