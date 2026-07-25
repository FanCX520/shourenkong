import { getAllGames } from "@/lib/games";
import { ExploreClient } from "@/components/explore/ExploreClient";

export const metadata = {
  title: "探索",
  description: "按标签筛选兽人 / furry / kemono 游戏",
};

export default async function ExplorePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const games = getAllGames();
  const sp = searchParams ? await searchParams : {};
  const q = typeof sp.q === "string" ? sp.q : "";
  return <ExploreClient games={games} initialQuery={q} />;
}
