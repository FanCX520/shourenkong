import Link from "next/link";
import type { CSSProperties } from "react";
import { getAllGames, countTags } from "@/lib/games";
import { GameGrid } from "@/components/game/GameCard";
import { TAG_GROUPS } from "@/lib/tags";
import { ShuffleIcon } from "@/components/ui/Icons";

/** 确定性伪随机（静态构建时每天变化一次） */
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed || 1;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function SectionHead({
  title,
  desc,
  more,
}: {
  title: string;
  desc?: string;
  more?: { href: string; label: string };
}) {
  return (
    <div className="mb-3 flex items-end justify-between">
      <div>
        <h2 className="text-[16px] font-semibold">{title}</h2>
        {desc && <p className="mt-0.5 text-[13px] text-[var(--text-secondary)]">{desc}</p>}
      </div>
      {more && (
        <Link
          href={more.href}
          className="shrink-0 text-[13px] text-[var(--primary-strong)] transition-colors hover:text-[var(--primary)]"
        >
          {more.label} →
        </Link>
      )}
    </div>
  );
}

export default function HomePage() {
  const games = getAllGames();
  const counts = countTags(games);

  const byUpdated = [...games].sort((a, b) =>
    (b.updated_at || b.release_date || "").localeCompare(a.updated_at || a.release_date || "")
  );
  const hot = byUpdated.slice(0, 6);

  const seed = Number(new Date().toISOString().slice(0, 10).replace(/-/g, ""));
  const randomPick = seededShuffle(games, seed).slice(0, 6);

  const speciesCloud = TAG_GROUPS.species
    .map((name) => ({ name, n: counts[name] || 0 }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n);

  const latest = byUpdated.slice(0, 9);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6">
      {/* 精简 hero */}
      <section
        className="card anim-fade-up mb-8 overflow-hidden"
        style={{ "--index": 0 } as CSSProperties}
      >
        <div className="hero-pattern px-6 py-8 sm:px-9 sm:py-10">
          <p className="text-[13px] font-medium text-[var(--primary-strong)]">兽人控.com</p>
          <h1 className="mt-2 max-w-xl text-[26px] font-semibold tracking-tight sm:text-[32px]">
            找一部合口味的兽人游戏
          </h1>
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-[var(--text-secondary)]">
            中文圈兽人 / Furry / Kemono 游戏索引。按物种、分级、平台筛选，一键随机发现。数据开源，人人可贡献。
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/explore/" className="btn btn-primary">
              开始探索
            </Link>
            <Link href="/random/" className="btn btn-secondary">
              <ShuffleIcon size={14} />
              随机一部
            </Link>
          </div>
          <p className="mt-4 text-[12px] text-[var(--text-tertiary)]">
            当前收录 {games.length} 部 · 以 GitHub 仓库为准
          </p>
        </div>
      </section>

      {/* 热门游戏 */}
      {hot.length > 0 && (
        <section className="anim-fade-up mb-9" style={{ "--index": 1 } as CSSProperties}>
          <SectionHead
            title="热门游戏"
            desc="最近更新的人气作品"
            more={{ href: "/explore/", label: "更多" }}
          />
          <GameGrid games={hot} />
        </section>
      )}

      {/* 随机发现 */}
      {randomPick.length > 0 && (
        <section className="anim-fade-up mb-9" style={{ "--index": 2 } as CSSProperties}>
          <SectionHead
            title="随机发现"
            desc="每日换一批，撞见惊喜"
            more={{ href: "/random/", label: "再来一部" }}
          />
          <GameGrid games={randomPick} />
        </section>
      )}

      {/* 物种分类 */}
      {speciesCloud.length > 0 && (
        <section className="anim-fade-up mb-9" style={{ "--index": 3 } as CSSProperties}>
          <SectionHead
            title="物种分类"
            desc="按主角物种浏览"
            more={{ href: "/tags/", label: "全部标签" }}
          />
          <div className="flex flex-wrap gap-2">
            {speciesCloud.map((s) => (
              <Link
                key={s.name}
                href={`/explore/?species=${encodeURIComponent(s.name)}`}
                className="badge border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-secondary)] transition-colors hover:border-[color-mix(in_srgb,var(--primary)_45%,var(--border))] hover:text-[var(--primary-strong)]"
              >
                {s.name}
                <span className="ml-1 text-[var(--text-tertiary)]">({s.n})</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 最近更新 */}
      {latest.length > 0 && (
        <section className="anim-fade-up" style={{ "--index": 4 } as CSSProperties}>
          <SectionHead
            title="最近更新"
            desc="按更新时间排序"
            more={{ href: "/explore/", label: "查看全部" }}
          />
          <GameGrid games={latest} />
        </section>
      )}
    </div>
  );
}
