import Link from "next/link";
import type { Game } from "@/lib/types";
import { RatingBadge } from "./RatingBadge";
import { TagBadge } from "./TagBadge";

export function GameCard({ game }: { game: Game }) {
  const tags = [...(game.species || []).slice(0, 2), ...(game.genres || []).slice(0, 1)];

  return (
    <Link
      href={`/game/${game.id}/`}
      className="card group flex flex-col overflow-hidden transition-[border-color,transform] duration-150 hover:border-[color-mix(in_srgb,var(--primary)_35%,var(--border))]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--bg-muted)]">
        {game.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={game.cover}
            alt={game.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[var(--text-tertiary)] text-sm">
            暂无封面
          </div>
        )}
        <div className="absolute left-2 top-2">
          <RatingBadge rating={game.rating} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <div>
          <h3 className="text-[14px] font-semibold leading-snug text-[var(--text-primary)] line-clamp-2">
            {game.title}
          </h3>
          {game.title_en && (
            <p className="mt-0.5 text-[12px] text-[var(--text-tertiary)] line-clamp-1">
              {game.title_en}
            </p>
          )}
        </div>
        <p className="text-[12.5px] leading-relaxed text-[var(--text-secondary)] line-clamp-2">
          {game.description}
        </p>
        <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
          {tags.map((t) => (
            <TagBadge key={t} tag={t} />
          ))}
        </div>
      </div>
    </Link>
  );
}

export function GameGrid({ games }: { games: Game[] }) {
  if (!games.length) {
    return (
      <div className="card flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
        <p className="text-[15px] font-medium text-[var(--text-primary)]">没有匹配的游戏</p>
        <p className="text-[13px] text-[var(--text-secondary)]">试试清除筛选或换个关键词</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {games.map((g) => (
        <GameCard key={g.id} game={g} />
      ))}
    </div>
  );
}
