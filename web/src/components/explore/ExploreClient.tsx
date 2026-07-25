"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Game, FilterState } from "@/lib/types";
import { filterGames, filterToQuery, emptyFilter, parseFilterFromSearchParams } from "@/lib/games";
import { FilterSidebar } from "@/components/layout/FilterSidebar";
import { GameGrid } from "@/components/game/GameCard";
import { FilterIcon, ShuffleIcon } from "@/components/ui/Icons";

export function ExploreClient({ games }: { games: Game[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterState>(() => emptyFilter());
  const [ready, setReady] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setFilter(parseFilterFromSearchParams(params));
    setReady(true);
  }, []);

  const results = useMemo(() => filterGames(games, filter), [games, filter]);

  const syncUrl = useCallback(
    (next: FilterState) => {
      setFilter(next);
      const qs = filterToQuery(next);
      router.replace(`/explore/${qs}`, { scroll: false });
    },
    [router]
  );

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
              {ready ? `共 ${results.length} 部游戏` : "加载中…"}
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
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onRandom}
              disabled={!results.length}
            >
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
