#!/usr/bin/env node
/**
 * Build web/src/data/games.json + web/public/data/games.json from data/games/*.yaml
 * Pure Node — no Python/PyYAML required on Cloudflare Pages.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const GAMES_DIR = path.join(ROOT, "data", "games");
const CANDIDATES_DIR = path.join(ROOT, "data", "candidates");
const OUT_PUBLIC = path.join(ROOT, "web", "public", "data", "games.json");
const OUT_SRC = path.join(ROOT, "web", "src", "data", "games.json");
const OUT_STATS_PUBLIC = path.join(ROOT, "web", "public", "data", "stats.json");
const OUT_STATS_SRC = path.join(ROOT, "web", "src", "data", "stats.json");

function loadGames() {
  if (!fs.existsSync(GAMES_DIR)) {
    console.error("missing", GAMES_DIR);
    process.exit(1);
  }
  const files = fs
    .readdirSync(GAMES_DIR)
    .filter((f) => /\.ya?ml$/i.test(f))
    .sort();

  const games = [];
  for (const file of files) {
    const full = path.join(GAMES_DIR, file);
    try {
      const raw = fs.readFileSync(full, "utf8");
      const data = yaml.load(raw);
      if (!data || typeof data !== "object" || !data.id) {
        console.warn("skip invalid", file);
        continue;
      }
      delete data.notes;
      games.push(data);
    } catch (e) {
      console.warn("skip", file, e.message);
    }
  }

  games.sort((a, b) => {
    const da = a.updated_at || a.release_date || "";
    const db = b.updated_at || b.release_date || "";
    return String(db).localeCompare(String(da));
  });
  return games;
}

const games = loadGames();
const payload = JSON.stringify(games, null, 2) + "\n";

fs.mkdirSync(path.dirname(OUT_PUBLIC), { recursive: true });
fs.mkdirSync(path.dirname(OUT_SRC), { recursive: true });

// Windows 下已存在的产物文件可能被文件监视器/杀软占用写锁，
// 先 unlink 再写新文件可稳定绕过 EPERM。
function safeWrite(target, content) {
  try {
    fs.unlinkSync(target);
  } catch {
    /* 文件不存在或被占用时忽略，下面 writeFileSync 会报错 */
  }
  fs.writeFileSync(target, content, "utf8");
}

safeWrite(OUT_PUBLIC, payload);
safeWrite(OUT_SRC, payload);

// 站点统计（数据看板用）：正式数 + 候选数 + 生成时间
function countCandidates() {
  if (!fs.existsSync(CANDIDATES_DIR)) return 0;
  return fs
    .readdirSync(CANDIDATES_DIR)
    .filter((f) => /\.ya?ml$/i.test(f) && !f.startsWith("_")).length;
}
const stats = {
  games: games.length,
  candidates: countCandidates(),
  nsfw: games.filter((g) => g.nsfw === true).length,
  generatedAt: new Date().toISOString(),
};
safeWrite(OUT_STATS_PUBLIC, JSON.stringify(stats, null, 2) + "\n");
safeWrite(OUT_STATS_SRC, JSON.stringify(stats, null, 2) + "\n");

console.log(`synced ${games.length} games → web/src/data/games.json + public; stats: ${stats.candidates} candidates`);
