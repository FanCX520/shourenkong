export type Rating = "全年龄" | "软色情" | "R18" | "R18G";
export type Status = "完结" | "进行中" | "停更";

export type LinkType =
  | "itch"
  | "steam"
  | "official"
  | "patreon"
  | "discord"
  | "kofi"
  | "telegram"
  | "fanbox"
  | "qq"
  | "other";

export type GameLink = {
  name: string;
  url: string;
  /** 链接类型，决定图标与分组展示 */
  type?: LinkType;
};

/** image / gif 用 img；video 用 video 或外链 embed */
export type GameMedia = {
  type: "image" | "gif" | "video" | "embed";
  url: string;
  poster?: string;
  caption?: string;
};

export type Game = {
  id: string;
  title: string;
  title_en?: string;
  title_jp?: string;
  /** 封面：支持 jpg/png/webp/gif 动图 URL */
  cover?: string;
  description: string;
  description_en?: string;
  /** 完整简介（itch 页面全文，保留段落） */
  description_full?: string;
  /** 画廊截图 URL 列表（原图） */
  gallery?: string[];
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
  /** 预览媒体：动图 / 视频 / B站YouTube embed */
  media?: GameMedia[];
  /** 预告片 embed 页地址，如 https://www.youtube.com/embed/... 或 player.bilibili.com */
  trailer?: string;
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
