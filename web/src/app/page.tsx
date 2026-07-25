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

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8">
      <section className="card mb-8 overflow-hidden">
        <div
          className="px-6 py-8 sm:px-8 sm:py-10"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--primary) 10%, var(--bg-surface)), var(--bg-surface))",
          }}
        >
          <p className="text-[13px] font-medium text-[var(--primary)]">兽人控.com</p>
          <h1 className="mt-2 max-w-xl text-[28px] font-semibold tracking-tight sm:text-[32px]">
            中文圈兽人 / Furry / Kemono 游戏索引
          </h1>
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-[var(--text-secondary)]">
            按物种、分级、平台筛选，支持随机发现。数据开源，欢迎通过 GitHub 贡献条目。
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/explore/" className="btn btn-primary">
              开始探索
            </Link>
            <Link href="/tags/" className="btn btn-secondary">
              浏览标签
            </Link>
            <Link href="/about/" className="btn btn-ghost">
              如何贡献
            </Link>
          </div>
          <p className="mt-4 text-[12px] text-[var(--text-tertiary)]">
            当前收录 {games.length} 部 · 数据以 Git 仓库为准
          </p>
        </div>
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
              tag={`${t}${counts[t] ? ` ${counts[t]}` : ""}`}
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
