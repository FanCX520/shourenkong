import { RandomRedirect } from "@/components/random/RandomRedirect";
import { getAllGames } from "@/lib/games";

export const metadata = {
  title: "随机发现",
  description: "随机跳转到一部收录的游戏",
};

export default function RandomPage() {
  const ids = getAllGames().map((g) => g.id);
  return <RandomRedirect ids={ids} />;
}
