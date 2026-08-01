"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Game, FilterState } from "@/lib/types";
import { filterGames, filterToQuery, emptyFilter, parseFilterFromSearchParams } from "@/lib/games";
import { FilterSidebar } from "@/components/layout/FilterSidebar";
import { GameGrid } from "@/components/game/GameCard";
import { FilterIcon, ShuffleIcon } from "@/components/ui/Icons";

function activeChips(filter: FilterState): { key: string; label: string; clear: () => FilterState }[] {
  const chips: { key: string; label: string; clear: () => FilterState }[] = [];
  if (filter.q.trim()) {
    chips.push({
      key: "q",
      label: `搜索：${filter.q.trim()}`,
      clear: () => ({ ...filter, q: "" }),
    });
  }
  if (filter.safeOnly) {
    chips.push({
      key: "safe",
      label: "仅全年龄",
      clear: () => ({ ...filter, safeOnly: false }),
    });
  }
  const groups: (keyof FilterState)[] = ["species", "rating", "genres", "platforms", "engines", "features"];
  for (const g of groups) {
    const list = filter[g];
    if (!Array.isArray(list)) continue;
    for (const tag of list) {
      chips.push({
        key: `${String(g)}:${tag}`,
        label: tag,
        clear: () => ({
          ...filter,
          [g]: (filter[g] as string[]).filter((t) => t !== tag),
        }),
      });
    }
  }
  return chips;
}

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
  const chips = useMemo(() => activeChips(filter), [filter]);

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
      <div className={`lg:block ${showFilters ? "anim-fade-up block" : "hidden"}`}>
        <FilterSidebar value={filter} onChange={syncUrl} resultCount={results.length} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div>
            <h1 className="text-[20px] font-semibold tracking-tight">探索</h1>
            <p className="text-[13px] text-[var(--text-secondary)]">
              {ready ? `共 ${results.length} 部游戏` : "加载中…"}
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

        <div className="mb-3">
          <input
            className="input !pl-3"
            placeholder="在结果中搜索标题 / 简介…"
            value={filter.q}
            onChange={(e) => syncUrl({ ...filter, q: e.target.value })}
          />
        </div>

        {chips.length > 0 && (
          <div className="anim-fade-in mb-4 flex flex-wrap items-center gap-1.5">
            {chips.map((c) => (
              <button
                key={c.key}
                type="button"
                className="badge chip-active border cursor-pointer"
                onClick={() => syncUrl(c.clear())}
                title="点击移除"
              >
                {c.label} ×
              </button>
            ))}
            <button
              type="button"
              className="btn btn-ghost h-7 px-2 text-[12px]"
              onClick={() => syncUrl(emptyFilter())}
            >
              清除全部
            </button>
          </div>
        )}

        <GameGrid games={results} />
      </div>
    </div>
  );
}
