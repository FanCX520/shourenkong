"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { PalettePicker } from "@/components/ui/PalettePicker";
import { CloseIcon, GamepadIcon, MenuIcon, SearchIcon, ShuffleIcon } from "@/components/ui/Icons";
import { getAllGames } from "@/lib/games";
import siteConfig from "@/data/site.json";

const NAV = [
  { href: "/", label: "首页" },
  { href: "/explore/", label: "探索" },
  { href: "/tags/", label: "标签" },
  { href: "/stats/", label: "数据" },
  { href: "/about/", label: "关于" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const games = useMemo(() => getAllGames(), []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    router.push(query ? `/explore/?q=${encodeURIComponent(query)}` : "/explore/");
    setMenuOpen(false);
  };

  const onRandom = () => {
    if (!games.length) return;
    const g = games[Math.floor(Math.random() * games.length)];
    router.push(`/game/${g.id}/`);
    setMenuOpen(false);
  };

  return (
    <header
      className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg-surface)_92%,transparent)] backdrop-blur-md"
      style={{ height: "var(--header-height)" }}
    >
      <div className="mx-auto flex h-full max-w-[1200px] items-center gap-2 px-4 sm:gap-3">
        <button
          type="button"
          className="btn btn-ghost -ml-1 md:hidden"
          aria-label={menuOpen ? "关闭菜单" : "打开菜单"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

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
          <span className="hidden xs:inline sm:inline">随机</span>
        </button>

        <PalettePicker defaultPalette={siteConfig.defaultPalette} />
        <ThemeToggle />
      </div>

      {menuOpen && (
        <div className="anim-fade-up absolute inset-x-0 top-full border-b border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 shadow-[var(--shadow-pop)] md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href.replace(/\/$/, ""));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-[8px] px-3 py-2.5 text-[14px] ${
                    active
                      ? "bg-[var(--bg-selected)] font-medium text-[var(--primary)]"
                      : "text-[var(--text-secondary)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <button
              type="button"
              className="flex items-center gap-2 rounded-[8px] px-3 py-2.5 text-left text-[14px] text-[var(--text-secondary)]"
              onClick={onRandom}
            >
              <ShuffleIcon size={15} />
              随机发现
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
