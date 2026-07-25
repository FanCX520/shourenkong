import { getAllGames } from "@/lib/games";
import { ExploreClient } from "@/components/explore/ExploreClient";

export const metadata = {
  title: "探索",
  description: "按标签筛选兽人 / furry / kemono 游戏",
};

/** Static export: query string is read only on the client. */
export default function ExplorePage() {
  const games = getAllGames();
  return <ExploreClient games={games} />;
}
