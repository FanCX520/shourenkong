"use client";

import type { FilterState } from "@/lib/types";
import { TAG_GROUPS, TAG_GROUP_LABELS } from "@/lib/tags";

type Props = {
  value: FilterState;
  onChange: (next: FilterState) => void;
  resultCount: number;
};

export function FilterSidebar({ value, onChange, resultCount }: Props) {
  const toggle = (key: keyof FilterState, tag: string) => {
    if (key === "q" || key === "safeOnly" || key === "sort") return;
    const list = value[key] as string[];
    const next = list.includes(tag) ? list.filter((t) => t !== tag) : [...list, tag];
    onChange({ ...value, [key]: next });
  };

  const clear = () => {
    onChange({
      ...value,
      q: "",
      species: [],
      rating: [],
      genres: [],
      platforms: [],
      engines: [],
      features: [],
      safeOnly: false,
    });
  };

  const groups: (keyof typeof TAG_GROUPS)[] = [
    "species",
    "rating",
    "genres",
    "platforms",
    "engines",
    "features",
  ];

  return (
    <aside className="flex w-full flex-col gap-4 lg:w-[var(--sidebar-width)] lg:shrink-0">
      <div className="card p-3.5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[13px] font-semibold">筛选</p>
          <span className="text-[12px] text-[var(--text-tertiary)]">{resultCount} 部</span>
        </div>

        <label className="mb-3 flex cursor-pointer items-center gap-2 text-[13px] text-[var(--text-secondary)]">
          <input
            type="checkbox"
            checked={value.safeOnly}
            onChange={(e) => onChange({ ...value, safeOnly: e.target.checked, rating: [] })}
            className="accent-[var(--primary)]"
          />
          仅全年龄
        </label>

        <div className="mb-3 flex gap-2">
          <button
            type="button"
            className={`btn flex-1 ${value.sort === "latest" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => onChange({ ...value, sort: "latest" })}
          >
            最新
          </button>
          <button
            type="button"
            className={`btn flex-1 ${value.sort === "title" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => onChange({ ...value, sort: "title" })}
          >
            名称
          </button>
        </div>

        <button type="button" className="btn btn-ghost w-full" onClick={clear}>
          清除筛选
        </button>
      </div>

      {groups.map((key) => (
        <div key={key} className="card p-3.5">
          <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">
            {TAG_GROUP_LABELS[key]}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {TAG_GROUPS[key].map((tag) => {
              const selected = (value[key] as string[]).includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggle(key, tag)}
                  className={`badge border transition-colors ${
                    selected
                      ? "border-[color-mix(in_srgb,var(--primary)_45%,var(--border))] bg-[var(--bg-selected)] text-[var(--primary)]"
                      : "border-[var(--border)] bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </aside>
  );
}
