export type Rating = "全年龄" | "软色情" | "R18" | "R18G";
export type Status = "完结" | "进行中" | "停更";

export type GameLink = {
  name: string;
  url: string;
};

export type Game = {
  id: string;
  title: string;
  title_en?: string;
  title_jp?: string;
  cover?: string;
  description: string;
  description_en?: string;
  species: string[];
  rating: Rating;
  genres?: string[];
  platforms?: string[];
  engines?: string[];
  features?: string[];
  links: GameLink[];
  status: Status;
  release_date?: string;
  updated_at?: string;
  source?: string;
  nsfw?: boolean;
};

export type FilterState = {
  q: string;
  species: string[];
  rating: string[];
  genres: string[];
  platforms: string[];
  engines: string[];
  features: string[];
  safeOnly: boolean;
  sort: "latest" | "title";
};
