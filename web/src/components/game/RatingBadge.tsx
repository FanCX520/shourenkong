import { RATING_COLORS } from "@/lib/tags";

export function RatingBadge({ rating }: { rating: string }) {
  const cls = RATING_COLORS[rating] || "bg-gray-500/10 text-[var(--text-secondary)] border-[var(--border)]";
  return <span className={`badge border ${cls}`}>{rating}</span>;
}
