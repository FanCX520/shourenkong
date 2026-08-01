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
    """从 meta 标签提取 content，兼容 name=/property= 两种写法与任意属性顺序。"""
    m = re.search(r'<meta[^>]*?(?:name|property)=["\']' + re.escape(prop) + r'["\'][^>]*>', html, re.I)
    if not m:
        return None
    cm = re.search(r'content=["\']([^"\']*)["\']', m.group(0), re.I)
    if not cm:
        return None
    return cm.group(1).replace("&amp;", "&").strip()

def meta_title(html):
    """标题：优先 <title> 标签（去掉作者后缀），fallback 到 og:title / twitter:title。"""
    t = re.search(r"<title[^>]*>(.*?)</title>", html, re.I | re.S)
    if t:
        title = re.sub(r"\s+", " ", t.group(1)).strip()
        if title and not title.lower() in ("itch.io", "untitled"):
            return re.sub(r"\s+by\s+[^|<>]+$", "", title).strip()
    return meta(html, "og:title") or meta(html, "twitter:title")

def list_game_urls(html):
    out, seen = [], set()
    for m in re.finditer("https://([a-zA-Z0-9-]+)[.]itch[.]io/([a-zA-Z0-9._-]+)", html):
        user, game = m.group(1), m.group(2)
        if game in ("login", "register", "community", "feed", "jobs", "support"):
            continue
        # 排除静态资源：js/css 等带扩展名的文件
        if re.search(r"[.](?:js|css|json|png|jpg|jpeg|gif|webp|svg|ico|woff2?|ttf|txt|map)$", game, re.I):
            continue
        url = "https://" + user + ".itch.io/" + game
        if url not in seen:
            seen.add(url)
            out.append(url)
    return out

def parse_game(url, html):
    title = meta_title(html) or "Untitled"
    desc = meta(html, "og:description") or meta(html, "twitter:description") or meta(html, "description") or ""
    if not desc:
        # itch 正文描述容器：<div class="formatted_description user_formatted">...</div>
        m = re.search(r'<div[^>]*class=["\'][^"\']*formatted_description[^"\']*["\'][^>]*>(.*?)</div>', html, re.I | re.S)
        if m:
            desc = re.sub(r"<[^>]+>", " ", m.group(1))
            desc = re.sub(r"\s+", " ", desc).strip()
    if desc:
        import html as _html
        desc = _html.unescape(desc)
        desc = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", "", desc)
        desc = desc.strip()
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
    # 先删后写，绕过 Windows 对已存在文件的写锁（本地 IDE/沙箱）
    try:
        path.unlink()
    except OSError:
        pass
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
    idx = CANDIDATES / "_index.json"
    try:
        idx.unlink()
    except OSError:
        pass
    idx.write_text(json.dumps(items, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
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
