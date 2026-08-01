import Link from "next/link";
import type { CSSProperties } from "react";
import { getAllGames, countTags } from "@/lib/games";
import statsData from "@/data/stats.json";
import { TAG_GROUPS } from "@/lib/tags";

export const metadata = {
  title: "站点数据",
  description: "收录统计、标签分布与最近更新",
};

function StatCard({
  label,
  value,
  sub,
  index,
}: {
  label: string;
  value: string | number;
  sub?: string;
  index: number;
}) {
  return (
    <div
      className="card anim-fade-up px-4 py-4"
      style={{ "--index": index } as CSSProperties}
    >
      <p className="text-[12px] text-[var(--text-tertiary)]">{label}</p>
      <p className="mt-1 text-[26px] font-semibold tracking-tight text-[var(--text-primary)]">
        {value}
      </p>
      {sub && <p className="mt-0.5 text-[12px] text-[var(--text-secondary)]">{sub}</p>}
    </div>
  );
}

function BarRow({
  label,
  count,
  max,
  href,
}: {
  label: string;
  count: number;
  max: number;
  href?: string;
}) {
  const pct = max > 0 ? Math.max(6, Math.round((count / max) * 100)) : 6;
  const inner = (
    <>
      <span className="w-16 shrink-0 text-[12px] text-[var(--text-secondary)]">{label}</span>
      <span className="relative h-5 flex-1 overflow-hidden rounded-[6px] bg-[var(--bg-muted)]">
        <span
          className="absolute inset-y-0 left-0 rounded-[6px] bg-[color-mix(in_srgb,var(--primary)_55%,transparent)]"
          style={{ width: `${pct}%` }}
        />
      </span>
      <span className="w-8 shrink-0 text-right text-[12px] font-medium text-[var(--text-primary)]">
        {count}
      </span>
    </>
  );
  const cls =
    "flex items-center gap-3 rounded-[6px] px-1 py-1 transition-colors hover:bg-[var(--bg-hover)]";
  return href ? (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

export default function StatsPage() {
  const games = getAllGames();
  const counts = countTags(games);

  const total = statsData.games ?? games.length;
  const nsfw = games.filter((g) => g.nsfw).length;
  const sfw = total - nsfw;
  const candidates = statsData.candidates ?? 0;

  const speciesTop = TAG_GROUPS.species
    .map((name) => ({ name, n: counts[name] || 0 }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n)
    .slice(0, 8);
  const speciesMax = speciesTop[0]?.n || 1;

  const ratings = ["全年龄", "软色情", "R18", "R18G"]
    .map((name) => ({ name, n: counts[name] || 0 }))
    .filter((x) => x.n > 0);
  const ratingMax = Math.max(1, ...ratings.map((x) => x.n));

  const latest = [...games]
    .sort((a, b) =>
      (b.updated_at || b.release_date || "").localeCompare(a.updated_at || a.release_date || "")
    )
    .slice(0, 10);

  return (
    <div className="mx-auto max-w-[960px] px-4 py-8">
      <h1 className="text-[22px] font-semibold tracking-tight">站点数据</h1>
      <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
        数据来源于 GitHub 仓库 YAML，每次部署时生成
      </p>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatCard label="已收录" value={total} sub="正式条目" index={0} />
        <StatCard label="待审核候选" value={candidates} sub="itch 自动采集" index={1} />
        <StatCard label="全年龄" value={sfw} sub={`${total ? Math.round((sfw / total) * 100) : 0}%`} index={2} />
        <StatCard label="成人向" value={nsfw} sub={`${total ? Math.round((nsfw / total) * 100) : 0}%`} index={3} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <section className="card anim-fade-up p-4 sm:p-5" style={{ "--index": 2 } as CSSProperties}>
          <h2 className="mb-3 text-[14px] font-semibold">物种分布 TOP</h2>
          <div className="flex flex-col gap-1">
            {speciesTop.map((s) => (
              <BarRow
                key={s.name}
                label={s.name}
                count={s.n}
                max={speciesMax}
                href={`/explore/?species=${encodeURIComponent(s.name)}`}
              />
            ))}
            {speciesTop.length === 0 && (
              <p className="text-[13px] text-[var(--text-tertiary)]">暂无数据</p>
            )}
          </div>
        </section>

        <section className="card anim-fade-up p-4 sm:p-5" style={{ "--index": 3 } as CSSProperties}>
          <h2 className="mb-3 text-[14px] font-semibold">分级分布</h2>
          <div className="flex flex-col gap-1">
            {ratings.map((r) => (
              <BarRow
                key={r.name}
                label={r.name}
                count={r.n}
                max={ratingMax}
                href={`/explore/?rating=${encodeURIComponent(r.name)}`}
              />
            ))}
          </div>
          <h2 className="mb-3 mt-6 text-[14px] font-semibold">管理入口</h2>
          <div className="flex flex-col gap-1 text-[13px]">
            <a href="/admin/" className="rounded-[6px] px-1 py-1.5 text-[var(--primary-strong)] transition-colors hover:bg-[var(--bg-hover)]">
              内容后台（Decap CMS）→
            </a>
            <a
              href="https://github.com/FanCX520/shourenkong/actions"
              target="_blank"
              rel="noreferrer"
              className="rounded-[6px] px-1 py-1.5 text-[var(--primary-strong)] transition-colors hover:bg-[var(--bg-hover)]"
            >
              GitHub Actions（批量扫描 / 批量转正）→
            </a>
            <a
              href="https://github.com/FanCX520/shourenkong/issues/new/choose"
              target="_blank"
              rel="noreferrer"
              className="rounded-[6px] px-1 py-1.5 text-[var(--primary-strong)] transition-colors hover:bg-[var(--bg-hover)]"
            >
              投稿新游戏（Issue 表单）→
            </a>
          </div>
        </section>
      </div>

      <section className="card anim-fade-up mt-4 p-4 sm:p-5" style={{ "--index": 4 } as CSSProperties}>
        <h2 className="mb-3 text-[14px] font-semibold">最近更新</h2>
        <div className="divide-y divide-[var(--border)]">
          {latest.map((g) => (
            <Link
              key={g.id}
              href={`/game/${g.id}/`}
              className="flex items-center gap-3 py-2 transition-colors hover:bg-[var(--bg-hover)]"
            >
              <span className="min-w-0 flex-1 truncate text-[13px] text-[var(--text-primary)]">
                {g.title}
              </span>
              <span className="shrink-0 text-[12px] text-[var(--text-tertiary)]">
                {g.updated_at || g.release_date || "—"}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
