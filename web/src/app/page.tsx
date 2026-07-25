import Link from "next/link";
import { getAllGames, countTags } from "@/lib/games";
import { GameGrid } from "@/components/game/GameCard";
import { TagBadge } from "@/components/game/TagBadge";
import { TAG_GROUPS } from "@/lib/tags";

export default function HomePage() {
  const games = getAllGames();
  const latest = games.slice(0, 6);
  const counts = countTags(games);

  const hotTags = [
    ...TAG_GROUPS.species.slice(0, 8),
    ...TAG_GROUPS.genres.slice(0, 4),
    ...TAG_GROUPS.features.filter((t) => ["中文支持", "免费", "bara", "多结局"].includes(t)),
  ]
    .filter((t, i, arr) => arr.indexOf(t) === i)
    .slice(0, 16);

  const channels = [
    { href: "/explore/?safe=1", title: "全年龄", desc: "适合公开场合浏览" },
    { href: "/explore/?rating=R18", title: "R18", desc: "成人向作品" },
    { href: "/explore/?features=%E4%B8%AD%E6%96%87%E6%94%AF%E6%8C%81", title: "中文", desc: "官方或汉化支持" },
    { href: "/explore/?features=%E5%85%8D%E8%B4%B9", title: "免费", desc: "无需付费即可体验" },
  ];

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8">
      <section className="card mb-6 overflow-hidden">
        <div className="hero-pattern px-6 py-9 sm:px-9 sm:py-11">
          <p className="text-[13px] font-medium text-[var(--primary)]">兽人控.com</p>
          <h1 className="mt-2 max-w-xl text-[28px] font-semibold tracking-tight sm:text-[34px]">
            找一部合口味的兽人游戏
          </h1>
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-[var(--text-secondary)]">
            按物种、分级、平台筛选，一键随机发现。数据开源，条目写在 Git 里，人人可贡献。
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/explore/" className="btn btn-primary">
              开始探索
            </Link>
            <Link href="/random/" className="btn btn-secondary">
              随机一部
            </Link>
            <Link href="/tags/" className="btn btn-ghost">
              浏览标签
            </Link>
          </div>
          <p className="mt-4 text-[12px] text-[var(--text-tertiary)]">
            当前收录 {games.length} 部 · 以 GitHub 仓库为准
          </p>
        </div>
      </section>

      <section className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {channels.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="card block px-3.5 py-3 transition-colors hover:border-[color-mix(in_srgb,var(--primary)_35%,var(--border))]"
          >
            <p className="text-[14px] font-semibold text-[var(--text-primary)]">{c.title}</p>
            <p className="mt-0.5 text-[12px] text-[var(--text-tertiary)]">{c.desc}</p>
          </Link>
        ))}
      </section>

      <section className="mb-8">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-[16px] font-semibold">热门标签</h2>
          <Link href="/tags/" className="text-[13px] text-[var(--primary)]">
            全部标签
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {hotTags.map((t) => (
            <TagBadge
              key={t}
              tag={`${t}${counts[t] ? ` · ${counts[t]}` : ""}`}
              href={`/explore/?species=${encodeURIComponent(t)}`}
            />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-[16px] font-semibold">最新入库</h2>
            <p className="text-[13px] text-[var(--text-secondary)]">按更新时间排序</p>
          </div>
          <Link href="/explore/" className="text-[13px] text-[var(--primary)]">
            查看全部
          </Link>
        </div>
        <GameGrid games={latest} />
      </section>
    </div>
  );
}
