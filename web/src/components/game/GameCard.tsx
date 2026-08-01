import Link from "next/link";
import type { CSSProperties } from "react";
import type { Game } from "@/lib/types";
import { RatingBadge } from "./RatingBadge";
import { TagBadge } from "./TagBadge";
import { GamepadIcon } from "@/components/ui/Icons";

export function GameCard({
  game,
  index = 0,
}: {
  game: Game;
  index?: number;
}) {
  const tags = [...(game.species || []).slice(0, 2), ...(game.genres || []).slice(0, 1)];

  return (
    <Link
      href={`/game/${game.id}/`}
      className="card card-lift anim-fade-up group flex flex-col overflow-hidden"
      style={{ "--index": index } as CSSProperties}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--bg-muted)]">
        {game.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={game.cover}
            alt={game.title}
            className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-[var(--text-tertiary)]">
            <GamepadIcon size={28} />
            <span className="text-[12px]">暂无封面</span>
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
      <div className="card anim-fade-in flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
        <GamepadIcon size={30} />
        <p className="text-[15px] font-medium text-[var(--text-primary)]">没有匹配的游戏</p>
        <p className="text-[13px] text-[var(--text-secondary)]">试试清除筛选或换个关键词</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {games.map((g, i) => (
        <GameCard key={g.id} game={g} index={i} />
      ))}
    </div>
  );
}
