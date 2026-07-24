import Link from "next/link";

export function TagBadge({
  tag,
  href,
}: {
  tag: string;
  href?: string;
}) {
  const className =
    "badge border border-[var(--border)] bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:border-[color-mix(in_srgb,var(--primary)_40%,var(--border))] hover:text-[var(--text-primary)] transition-colors";

  if (href) {
    return (
      <Link href={href} className={className}>
        {tag}
      </Link>
    );
  }
  return <span className={className}>{tag}</span>;
}
