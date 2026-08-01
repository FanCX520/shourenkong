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
const OUT_PUBLIC = path.join(ROOT, "web", "public", "data", "games.json");
const OUT_SRC = path.join(ROOT, "web", "src", "data", "games.json");

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
console.log(`synced ${games.length} games → web/src/data/games.json + public`);
