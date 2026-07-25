"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Game, FilterState } from "@/lib/types";
import { filterGames, filterToQuery, emptyFilter, parseFilterFromSearchParams } from "@/lib/games";
import { FilterSidebar } from "@/components/layout/FilterSidebar";
import { GameGrid } from "@/components/game/GameCard";
import { FilterIcon, ShuffleIcon } from "@/components/ui/Icons";

export function ExploreClient({
  games,
  initialQuery,
}: {
  games: Game[];
  initialQuery?: string;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterState>(() => {
    if (typeof window === "undefined") {
      const base = emptyFilter();
      if (initialQuery) base.q = initialQuery;
      return base;
    }
    const params = new URLSearchParams(window.location.search);
    const f = parseFilterFromSearchParams(params);
    if (initialQuery && !f.q) f.q = initialQuery;
    return f;
  });
  const [showFilters, setShowFilters] = useState(false);

  const results = useMemo(() => filterGames(games, filter), [games, filter]);

  const syncUrl = useCallback(
    (next: FilterState) => {
      setFilter(next);
      const qs = filterToQuery(next);
      router.replace(`/explore/${qs}`, { scroll: false });
    },
    [router]
  );

  useEffect(() => {
    // URL params handled in useState
  }, []);

  const onRandom = () => {
    if (!results.length) return;
    const g = results[Math.floor(Math.random() * results.length)];
    router.push(`/game/${g.id}/`);
  };

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-5 px-4 py-6 lg:flex-row">
      <div className={`lg:block ${showFilters ? "block" : "hidden"}`}>
        <FilterSidebar value={filter} onChange={syncUrl} resultCount={results.length} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div>
            <h1 className="text-[20px] font-semibold tracking-tight">探索</h1>
            <p className="text-[13px] text-[var(--text-secondary)]">
              共 {results.length} 部游戏
              {filter.q ? ` · 搜索「${filter.q}」` : ""}
            </p>
          </div>
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              className="btn btn-secondary lg:hidden"
              onClick={() => setShowFilters((v) => !v)}
            >
              <FilterIcon size={15} />
              筛选
            </button>
            <button type="button" className="btn btn-secondary" onClick={onRandom} disabled={!results.length}>
              <ShuffleIcon size={15} />
              在结果中随机
            </button>
          </div>
        </div>

        <div className="mb-4">
          <input
            className="input !pl-3"
            placeholder="在结果中搜索标题 / 简介…"
            value={filter.q}
            onChange={(e) => syncUrl({ ...filter, q: e.target.value })}
          />
        </div>

        <GameGrid games={results} />
      </div>
    </div>
  );
}
