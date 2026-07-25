#!/usr/bin/env python3
"""itch.io 候选游戏抓取 → data/candidates/*.yaml

用法:
  python3 scripts/scrape-itch.py --tag furry --pages 1
  python3 scripts/scrape-itch.py --tag kemono --pages 2 --delay 1.5
  python3 scripts/scrape-itch.py --url https://example.itch.io/my-game
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

try:
    import yaml
except ImportError:
    print("请安装 PyYAML: pip install pyyaml", file=sys.stderr)
    sys.exit(1)

ROOT = Path(__file__).resolve().parent.parent
CANDIDATES_DIR = ROOT / "data" / "candidates"
GAMES_DIR = ROOT / "data" / "games"
USER_AGENT = "shourenkong-bot/0.1 (+https://github.com/FanCX520/shourenkong; research/index)"


def http_get(url: str, timeout: int = 25) -> str:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.8,zh;q=0.5",
        },
        method="GET",
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        charset = resp.headers.get_content_charset() or "utf-8"
        return resp.read().decode(charset, errors="replace")


def slugify(text: str) -> str:
    text = text.strip().lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    text = re.sub(r"-+", "-", text).strip("-")
    return text[:80] or "untitled"


def existing_ids() -> set[str]:
    ids: set[str] = set()
    for d in (GAMES_DIR, CANDIDATES_DIR):
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


def extract_game_links_from_list(html: str) -> list[str]:
    pattern = r"https?://([a-zA-Z0-9-]+)\.itch\.io/([a-zA-Z0-9._-]+)"
    found, seen = [], set()
    for m in re.finditer(pattern, html):
        user, game = m.group(1), m.group(2)
        if game in {"login", "register", "community", "feed", "jobs", "support"}:
            continue
        url = f"https://{user}.itch.io/{game}"
        if url not in seen:
            seen.add(url)
            found.append(url)
    return found


def html_unescape(s: str) -> str:
    return (
        s.replace("&", "&")
        .replace("<", "<")
        .replace(">", ">")
        .replace(""", '"')
        .replace("&#39;", "'")
        .replace("&nbsp;", " ")
    )


def meta_content(html: str, prop: str) -> str | None:
    patterns = [
        rf'<meta[^>]+property=["\']{re.escape(prop)}["\'][^>]+content=["\']([^"\']+)["\']',
        rf'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']{re.escape(prop)}["\']',
        rf'<meta[^>]+name=["\']{re.escape(prop)}["\'][^>]+content=["\']([^"\']+)["\']',
        rf'<meta[^>]+content=["\']([^"\']+)["\'][^>]+name=["\']{re.escape(prop)}["\']',
    ]
    for p in patterns:
        m = re.search(p, html, re.I)
        if m:
            return html_unescape(m.group(1)).strip()
    return None


def parse_game_page(url: str, html: str) -> dict:
    title = meta_content(html, "og:title") or meta_content(html, "twitter:title")
    if not title:
        m = re.search(r"<title>([^<]+)</title>", html, re.I)
        title = html_unescape(m.group(1)).strip() if m else "Untitled"
    title = re.sub(r"\s+by\s+.+$