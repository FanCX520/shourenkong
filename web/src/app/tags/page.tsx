import Link from "next/link";
import { getAllGames, countTags } from "@/lib/games";
import { TAG_GROUPS, TAG_GROUP_LABELS } from "@/lib/tags";

export const metadata = {
  title: "标签",
  description: "按物种、分级、类型等浏览全部标签",
};

export default function TagsPage() {
  const counts = countTags(getAllGames());
  const groups = Object.keys(TAG_GROUPS) as (keyof typeof TAG_GROUPS)[];

  return (
    <div className="mx-auto max-w-[960px] px-4 py-8">
      <h1 className="text-[22px] font-semibold tracking-tight">全部标签</h1>
      <p className="mt-1 text-[13px] text-[var(--text-secondary)]">点击标签进入探索页筛选</p>

      <div className="mt-6 space-y-5">
        {groups.map((key) => (
          <section key={key} className="card p-4 sm:p-5">
            <h2 className="mb-3 text-[14px] font-semibold text-[var(--text-primary)]">
              {TAG_GROUP_LABELS[key]}
            </h2>
            <div className="flex flex-wrap gap-2">
              {TAG_GROUPS[key].map((tag) => {
                const n = counts[tag] || 0;
                const param =
                  key === "rating"
                    ? `rating=${encodeURIComponent(tag)}`
                    : key === "species"
                      ? `species=${encodeURIComponent(tag)}`
                      : key === "genres"
                        ? `genres=${encodeURIComponent(tag)}`
                        : key === "platforms"
                          ? `platforms=${encodeURIComponent(tag)}`
                          : key === "engines"
                            ? `engines=${encodeURIComponent(tag)}`
                            : `features=${encodeURIComponent(tag)}`;
                return (
                  <Link
                    key={tag}
                    href={`/explore/?${param}`}
                    className="badge border border-[var(--border)] bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:bg-[var(--bg-selected)] hover:text-[var(--primary)]"
                  >
                    {tag}
                    {n > 0 ? ` · ${n}` : ""}
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
