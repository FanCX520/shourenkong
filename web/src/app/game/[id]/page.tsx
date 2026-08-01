import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllGames, getGameById, getRelatedGames } from "@/lib/games";
import { RatingBadge } from "@/components/game/RatingBadge";
import { TagBadge } from "@/components/game/TagBadge";
import { GameGrid } from "@/components/game/GameCard";
import { ExternalIcon, GamepadIcon } from "@/components/ui/Icons";

export function generateStaticParams() {
  return getAllGames().map((g) => ({ id: g.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const game = getGameById(id);
  if (!game) return { title: "未找到" };
  return {
    title: game.title,
    description: game.description.slice(0, 120),
  };
}

export default async function GamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const game = getGameById(id);
  if (!game) notFound();

  const related = getRelatedGames(game);
  const allTags = [
    ...(game.species || []),
    ...(game.genres || []),
    ...(game.platforms || []),
    ...(game.engines || []),
    ...(game.features || []),
  ];

  return (
    <div className="mx-auto max-w-[960px] px-4 py-8">
      <nav className="mb-4 text-[13px] text-[var(--text-tertiary)]">
        <Link href="/explore/" className="hover:text-[var(--text-primary)]">
          探索
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-[var(--text-secondary)]">{game.title}</span>
      </nav>

      <article className="card anim-fade-up overflow-hidden">
        <div className="grid gap-0 md:grid-cols-[1.1fr_1fr]">
          <div className="aspect-[16/10] bg-[var(--bg-muted)] md:aspect-auto md:min-h-[280px]">
            {game.cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={game.cover} alt={game.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2 text-[var(--text-tertiary)]">
                <GamepadIcon size={32} />
                <span className="text-[12px]">暂无封面</span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-4 p-5 sm:p-6">
            <div>
              <div className="mb-2">
                <RatingBadge rating={game.rating} />
              </div>
              <h1 className="text-[22px] font-semibold tracking-tight">{game.title}</h1>
              {(game.title_en || game.title_jp) && (
                <p className="mt-1 text-[13px] text-[var(--text-tertiary)]">
                  {[game.title_en, game.title_jp].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>

            <p className="whitespace-pre-line text-[14px] leading-relaxed text-[var(--text-secondary)]">
              {game.description}
            </p>

            <dl className="grid grid-cols-2 gap-2 text-[13px]">
              <div>
                <dt className="text-[var(--text-tertiary)]">状态</dt>
                <dd className="font-medium">{game.status}</dd>
              </div>
              {game.release_date && (
                <div>
                  <dt className="text-[var(--text-tertiary)]">发布</dt>
                  <dd className="font-medium">{game.release_date}</dd>
                </div>
              )}
            </dl>

            <div className="flex flex-wrap gap-1.5">
              {allTags.map((t) => (
                <TagBadge key={t} tag={t} href={`/explore/?species=${encodeURIComponent(t)}`} />
              ))}
            </div>

            <div className="mt-auto flex flex-wrap gap-2 pt-2">
              {game.links.map((link) => (
                <a key={link.url} href={link.url} target="_blank" rel="noreferrer" className="btn btn-primary">
                  {link.name}
                  <ExternalIcon size={13} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-[16px] font-semibold">相关推荐</h2>
          <GameGrid games={related} />
        </section>
      )}
    </div>
  );
}
