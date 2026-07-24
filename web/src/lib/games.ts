import type { FilterState, Game } from "./types";
import gamesData from "@/data/games.json";

export function getAllGames(): Game[] {
  return gamesData as Game[];
}

export function getGameById(id: string): Game | undefined {
  return getAllGames().find((g) => g.id === id);
}

export function getRelatedGames(game: Game, limit = 6): Game[] {
  const all = getAllGames().filter((g) => g.id !== game.id);
  const scored = all.map((g) => {
    let score = 0;
    for (const s of game.species || []) {
      if (g.species?.includes(s)) score += 3;
    }
    for (const x of game.genres || []) {
      if (g.genres?.includes(x)) score += 2;
    }
    if (g.rating === game.rating) score += 1;
    return { g, score };
  });
  return scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.g);
}

export function countTags(games: Game[]) {
  const counts: Record<string, number> = {};
  const bump = (arr?: string[]) => {
    for (const t of arr || []) {
      counts[t] = (counts[t] || 0) + 1;
    }
  };
  for (const g of games) {
    bump(g.species);
    bump(g.genres);
    bump(g.platforms);
    bump(g.engines);
    bump(g.features);
    if (g.rating) counts[g.rating] = (counts[g.rating] || 0) + 1;
  }
  return counts;
}

export function filterGames(games: Game[], f: FilterState): Game[] {
  let list = [...games];

  if (f.safeOnly) {
    list = list.filter((g) => g.rating === "全年龄");
  }

  if (f.q.trim()) {
    const q = f.q.trim().toLowerCase();
    list = list.filter((g) => {
      const hay = [g.title, g.title_en, g.title_jp, g.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }

  const matchAll = (selected: string[], values?: string[]) => {
    if (!selected.length) return true;
    const set = new Set(values || []);
    return selected.every((s) => set.has(s));
  };

  if (f.species.length) list = list.filter((g) => matchAll(f.species, g.species));
  if (f.rating.length && !f.safeOnly) list = list.filter((g) => f.rating.includes(g.rating));
  if (f.genres.length) list = list.filter((g) => matchAll(f.genres, g.genres));
  if (f.platforms.length) list = list.filter((g) => matchAll(f.platforms, g.platforms));
  if (f.engines.length) list = list.filter((g) => matchAll(f.engines, g.engines));
  if (f.features.length) list = list.filter((g) => matchAll(f.features, g.features));

  if (f.sort === "title") {
    list.sort((a, b) => a.title.localeCompare(b.title, "zh"));
  } else {
    list.sort((a, b) => {
      const da = a.updated_at || a.release_date || "";
      const db = b.updated_at || b.release_date || "";
      return db.localeCompare(da);
    });
  }

  return list;
}

export function emptyFilter(): FilterState {
  return {
    q: "",
    species: [],
    rating: [],
    genres: [],
    platforms: [],
    engines: [],
    features: [],
    safeOnly: false,
    sort: "latest",
  };
}

export function parseFilterFromSearchParams(
  params: URLSearchParams | Record<string, string | string[] | undefined>
): FilterState {
  const get = (key: string): string[] => {
    if (params instanceof URLSearchParams) {
      const v = params.get(key);
      return v ? v.split(",").filter(Boolean) : [];
    }
    const raw = params[key];
    if (!raw) return [];
    const s = Array.isArray(raw) ? raw.join(",") : raw;
    return s.split(",").filter(Boolean);
  };
  const one = (key: string): string => {
    if (params instanceof URLSearchParams) return params.get(key) || "";
    const raw = params[key];
    if (!raw) return "";
    return Array.isArray(raw) ? raw[0] || "" : raw;
  };

  return {
    q: one("q"),
    species: get("species"),
    rating: get("rating"),
    genres: get("genres"),
    platforms: get("platforms"),
    engines: get("engines"),
    features: get("features"),
    safeOnly: one("safe") === "1",
    sort: one("sort") === "title" ? "title" : "latest",
  };
}

export function filterToQuery(f: FilterState): string {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.species.length) p.set("species", f.species.join(","));
  if (f.rating.length) p.set("rating", f.rating.join(","));
  if (f.genres.length) p.set("genres", f.genres.join(","));
  if (f.platforms.length) p.set("platforms", f.platforms.join(","));
  if (f.engines.length) p.set("engines", f.engines.join(","));
  if (f.features.length) p.set("features", f.features.join(","));
  if (f.safeOnly) p.set("safe", "1");
  if (f.sort !== "latest") p.set("sort", f.sort);
  const s = p.toString();
  return s ? `?${s}` : "";
}
