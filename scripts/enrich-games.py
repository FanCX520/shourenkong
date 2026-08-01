#!/usr/bin/env python3
"""Enrich existing games with full description, gallery and external links.

遍历 data/games/*.yaml，按 itch.io 链接重抓并补齐：
- description_full：完整简介（formatted_description 全文，保留段落）
- gallery：画廊截图原图 URL 列表（data-image_lightbox 链接）
- links：识别并追加 Steam / 官网 / Patreon / Discord 等外链

用法：
  python scripts/enrich-games.py            # 全部 games
  python scripts/enrich-games.py atlyss     # 只补指定 id
  python scripts/enrich-games.py --dry      # 只打印不落盘
"""
from __future__ import annotations

import argparse
import html as _html
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

try:
    import yaml
except ImportError:
    print("pip install pyyaml", file=sys.stderr)
    sys.exit(1)

ROOT = Path(__file__).resolve().parent.parent
GAMES = ROOT / "data" / "games"
UA = "shourenkong-bot/0.2 (+https://github.com/FanCX520/shourenkong)"

# 外链识别规则：type -> (显示名, 域名特征)
LINK_RULES = [
    ("steam", "Steam", ("store.steampowered.com", "steamcommunity.com", "s.team")),
    ("patreon", "Patreon", ("patreon.com",)),
    ("discord", "Discord", ("discord.gg", "discord.com/invite", "discordapp.com/invite")),
    ("kofi", "Ko-fi", ("ko-fi.com",)),
    ("telegram", "Telegram", ("t.me", "telegram.me")),
    ("fanbox", "Fanbox", ("fanbox.cc",)),
    ("official", "官网", ()),
]
# 这些域名不当作官网候选
EXCLUDE_HOSTS = (
    "itch.io", "img.itch.zone", "twitter.com", "x.com", "facebook.com",
    "youtube.com", "youtu.be", "google.com", "github.com", "steamcommunity.com",
    "store.steampowered.com", "patreon.com", "discord.gg", "discord.com",
    "ko-fi.com", "t.me", "telegram.me", "fanbox.cc", "reddit.com",
    "translate.google.com", "web.archive.org",
)


def get(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "text/html"})
    with urllib.request.urlopen(req, timeout=25) as r:
        return r.read().decode(r.headers.get_content_charset() or "utf-8", "replace")


def meta(h: str, prop: str) -> str | None:
    m = re.search(r'<meta[^>]*?(?:name|property)=["\']' + re.escape(prop) + r'["\'][^>]*>', h, re.I)
    if not m:
        return None
    cm = re.search(r'content=["\']([^"\']*)["\']', m.group(0), re.I)
    return _html.unescape(cm.group(1)).strip() if cm else None


def full_description(h: str) -> str:
    """完整简介：formatted_description 容器全文，保留段落结构。"""
    m = re.search(
        r'<div[^>]*class=["\'][^"\']*formatted_description[^"\']*["\'][^>]*>(.*?)</div>\s*(?:<div|<section|<footer|$)',
        h, re.I | re.S,
    )
    if not m:
        m = re.search(r'<div[^>]*class=["\'][^"\']*formatted_description[^"\']*["\'][^>]*>(.*?)$', h, re.I | re.S)
    if not m:
        return ""
    seg = m.group(1)
    # 段落/换行还原：p/br/li/div 边界转为换行
    seg = re.sub(r'<\s*/\s*(p|div|li|h[1-6])\s*>', "\n", seg, flags=re.I)
    seg = re.sub(r'<\s*br\s*/?\s*>', "\n", seg, flags=re.I)
    seg = re.sub(r'<\s*(p|div|li|h[1-6])[^>]*>', "\n", seg, flags=re.I)
    seg = re.sub(r"<[^>]+>", " ", seg)
    seg = _html.unescape(seg)
    seg = re.sub(r"[ \t]+", " ", seg)
    seg = re.sub(r"\n\s*\n+", "\n\n", seg)
    seg = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", "", seg)
    return seg.strip()[:8000]


def gallery_urls(h: str, limit: int = 8) -> list[str]:
    """画廊原图：data-image_lightbox 链接的 href。去重、限量。"""
    out, seen = [], set()
    for m in re.finditer(r'<a[^>]*data-image_lightbox=["\']true["\'][^>]*href=["\']([^"\']+)["\']', h, re.I):
        u = _html.unescape(m.group(1)).strip()
        if u.startswith("https://img.itch.zone/") and u not in seen:
            seen.add(u)
            out.append(u)
            if len(out) >= limit:
                break
    return out


def external_links(h: str, gid: str) -> list[dict]:
    """从整页找外链，按规则分类。跳过 itch 自身与社交平台分享链接。"""
    found: dict[str, dict] = {}
    for m in re.finditer(r'href=["\'](https?://[^"\']+)["\']', h, re.I):
        url = _html.unescape(m.group(1)).strip()
        if len(url) > 300:
            continue
        host = urllib.parse.urlparse(url).netloc.lower()
        for ltype, name, hosts in LINK_RULES:
            if any(k in host for k in hosts):
                if ltype not in found:
                    found[ltype] = {"name": name, "url": url, "type": ltype}
                break
        else:
            if not any(x in host for x in EXCLUDE_HOSTS):
                if "official" not in found and re.match(r"^[a-z0-9.-]+\.[a-z]{2,}$", host):
                    found["official"] = {"name": "官网", "url": url, "type": "official"}
    return list(found.values())


def itch_url(game: dict) -> str | None:
    for link in game.get("links") or []:
        u = link.get("url", "") if isinstance(link, dict) else ""
        if "itch.io" in u:
            return u
    return None


def enrich(path: Path, dry: bool = False, out_dir: Path | None = None) -> str:
    try:
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
    except Exception as e:
        return f"skip(parse) {path.name}: {e}"
    if not isinstance(data, dict) or not data.get("id"):
        return f"skip(noid) {path.name}"
    url = itch_url(data)
    if not url:
        return f"skip(no-itch) {path.name}"

    gid = str(data["id"])
    try:
        h = get(url)
    except Exception as e:
        return f"fail(fetch) {gid}: {e}"

    changed = []
    fd = full_description(h)
    if fd and len(fd) > len(data.get("description") or "") + 40:
        data["description_full"] = fd
        changed.append("desc_full")

    gal = gallery_urls(h)
    if gal:
        data["gallery"] = gal
        changed.append(f"gallery:{len(gal)}")

    # 外链：与已有 links 合并去重（按 url）
    new_links = external_links(h, gid)
    existing = data.get("links") or []
    for l in existing:
        if isinstance(l, dict) and "type" not in l:
            l["type"] = "itch" if "itch.io" in l.get("url", "") else "other"
    have = {l.get("url") for l in existing if isinstance(l, dict)}
    added = 0
    for nl in new_links:
        if nl["url"] not in have:
            existing.append(nl)
            have.add(nl["url"])
            added += 1
    if added:
        data["links"] = existing
        changed.append(f"links+{added}")

    if not changed:
        return f"ok(no-change) {gid}"

    if not dry:
        # 输出目录优先（避开本地 data/games 写锁），否则回写原路径
        target = (out_dir / path.name) if out_dir else path
        target.parent.mkdir(parents=True, exist_ok=True)
        try:
            target.unlink()
        except OSError:
            pass
        target.write_text(
            yaml.safe_dump(data, allow_unicode=True, sort_keys=False, default_flow_style=False),
            encoding="utf-8",
        )
    return f"enriched {gid} [{', '.join(changed)}]"


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("ids", nargs="*")
    ap.add_argument("--dry", action="store_true")
    ap.add_argument("--delay", type=float, default=1.2)
    ap.add_argument("--out", type=str, default="", help="输出目录（默认回写 data/games）")
    args = ap.parse_args()

    out_dir = Path(args.out).resolve() if args.out else None
    files = sorted(GAMES.glob("*.yaml")) + sorted(GAMES.glob("*.yml"))
    if args.ids:
        wanted = set(args.ids)
        files = [p for p in files if p.stem in wanted]
    print("targets", len(files), "| out:", out_dir or "in-place")

    done = 0
    for p in files:
        if p.name.startswith("_"):
            continue
        time.sleep(args.delay)
        print(enrich(p, dry=args.dry, out_dir=out_dir))
        done += 1
    print("processed", done)


if __name__ == "__main__":
    main()
