#!/usr/bin/env python3
"""Fetch itch.io games into data/candidates/"""
from __future__ import annotations
import argparse
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

try:
    import yaml
except ImportError:
    print("pip install pyyaml", file=sys.stderr)
    sys.exit(1)

ROOT = Path(__file__).resolve().parent.parent
CANDIDATES = ROOT / "data" / "candidates"
GAMES = ROOT / "data" / "games"
UA = "shourenkong-bot/0.1 (+https://github.com/FanCX520/shourenkong)"

def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "text/html"})
    with urllib.request.urlopen(req, timeout=25) as r:
        return r.read().decode(r.headers.get_content_charset() or "utf-8", "replace")

def slugify(s):
    s = re.sub("[^a-z0-9]+", "-", s.strip().lower())
    return re.sub("-+", "-", s).strip("-")[:80] or "untitled"

def known_ids():
    ids = set()
    for d in (GAMES, CANDIDATES):
        if not d.exists():
            continue
        for p in list(d.glob("*.yaml")) + list(d.glob("*.yml")):
            if p.name.startswith("_"):
                continue
            try:
                data = yaml.safe_load(p.read_text(encoding="utf-8"))
                if isinstance(data, dict) and data.get("id"):
                    ids.add(str(data["id"]))
            except Exception:
                ids.add(p.stem)
    return ids

def meta(html, prop):
    needle = 'property="' + prop + '"'
    i = html.find(needle)
    if i < 0:
        needle = "property='" + prop + "'"
        i = html.find(needle)
    if i < 0:
        return None
    chunk = html[i:i+400]
    for mark in ('content="', "content='"):
        j = chunk.find(mark)
        if j >= 0:
            start = j + len(mark)
            end = chunk.find(mark[-1], start)
            if end > start:
                return chunk[start:end].replace("&amp;", "&").strip()
    return None

def list_game_urls(html):
    out, seen = [], set()
    for m in re.finditer("https://([a-zA-Z0-9-]+)[.]itch[.]io/([a-zA-Z0-9._-]+)", html):
        user, game = m.group(1), m.group(2)
        if game in ("login", "register", "community", "feed", "jobs", "support"):
            continue
        url = "https://" + user + ".itch.io/" + game
        if url not in seen:
            seen.add(url)
            out.append(url)
    return out

def parse_game(url, html):
    title = meta(html, "og:title") or meta(html, "twitter:title") or "Untitled"
    if " by " in title:
        title = title.split(" by ")[0].strip()
    desc = meta(html, "og:description") or meta(html, "description") or ""
    cover = meta(html, "og:image") or meta(html, "twitter:image")
    path = urllib.parse.urlparse(url).path.strip("/")
    gid = slugify(path.split("/")[-1] if path else title)
    low = html.lower()
    nsfw = any(k in low for k in ("nsfw", "adult content", "18+", "erotic"))
    platforms = ["itch.io"]
    for label, key in (("Windows", "windows"), ("macOS", "macos"), ("Linux", "linux"), ("Android", "android"), ("Web", "html5")):
        if key in low and label not in platforms:
            platforms.append(label)
    return {
        "id": gid,
        "title": title[:120],
        "title_en": title[:120],
        "cover": cover,
        "description": (desc or "(itch auto-fetch)")[:2000],
        "species": ["其他"],
        "rating": "R18" if nsfw else "全年龄",
        "genres": ["其他"],
        "platforms": platforms,
        "engines": [],
        "features": [],
        "links": [{"name": "itch.io", "url": url}],
        "status": "进行中",
        "release_date": None,
        "updated_at": date.today().isoformat(),
        "source": "itch",
        "nsfw": nsfw,
        "notes": "candidate from itch; review then move to data/games/",
    }

def save(game):
    CANDIDATES.mkdir(parents=True, exist_ok=True)
    path = CANDIDATES / (game["id"] + ".yaml")
    path.write_text(yaml.safe_dump(game, allow_unicode=True, sort_keys=False, default_flow_style=False), encoding="utf-8")
    return path

def write_index():
    CANDIDATES.mkdir(parents=True, exist_ok=True)
    items = []
    for p in sorted(CANDIDATES.glob("*.yaml")):
        if p.name.startswith("_"):
            continue
        try:
            d = yaml.safe_load(p.read_text(encoding="utf-8"))
            if isinstance(d, dict):
                items.append({"id": d.get("id"), "title": d.get("title"), "file": p.name})
        except Exception:
            pass
    (CANDIDATES / "_index.json").write_text(json.dumps(items, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("index", len(items))

def scrape_tag(tag, pages, delay, known):
    n = 0
    for page in range(1, pages + 1):
        list_url = "https://itch.io/games/tag-%s?page=%d" % (urllib.parse.quote(tag), page)
        print("list", list_url)
        try:
            html = get(list_url)
        except Exception as e:
            print("list fail", e, file=sys.stderr)
            break
        links = list_game_urls(html)
        print("links", len(links))
        if not links:
            break
        for url in links:
            gid = slugify(urllib.parse.urlparse(url).path.strip("/").split("/")[-1])
            if gid in known:
                continue
            try:
                time.sleep(delay)
                game = parse_game(url, get(url))
                if game["id"] in known:
                    continue
                save(game)
                known.add(game["id"])
                n += 1
                print("+", game["id"])
            except Exception as e:
                print("fail", url, e, file=sys.stderr)
        time.sleep(delay)
    return n

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--tag", action="append")
    ap.add_argument("--pages", type=int, default=1)
    ap.add_argument("--delay", type=float, default=1.2)
    ap.add_argument("--url", action="append")
    args = ap.parse_args()
    known = known_ids()
    print("known", len(known))
    added = 0
    if args.url:
        for url in args.url:
            time.sleep(args.delay)
            try:
                game = parse_game(url, get(url))
                if game["id"] in known:
                    print("skip", game["id"])
                    continue
                save(game)
                known.add(game["id"])
                added += 1
                print("+", game["id"])
            except Exception as e:
                print("fail", url, e, file=sys.stderr)
    else:
        for tag in args.tag or ["furry"]:
            added += scrape_tag(tag, args.pages, args.delay, known)
    write_index()
    print("added", added)

if __name__ == "__main__":
    main()
