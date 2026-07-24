#!/usr/bin/env python3
"""Build public/data/games.json from data/games/*.yaml for the frontend."""

from __future__ import annotations

import json
import sys
from datetime import date, datetime
from pathlib import Path

try:
    import yaml
except ImportError:
    print("请安装 PyYAML: pip install pyyaml", file=sys.stderr)
    sys.exit(1)

ROOT = Path(__file__).resolve().parent.parent
GAMES_DIR = ROOT / "data" / "games"
OUT_DIR = ROOT / "web" / "public" / "data"
OUT_FILE = OUT_DIR / "games.json"
SRC_OUT = ROOT / "web" / "src" / "data" / "games.json"


def normalize(obj):
    if isinstance(obj, (date, datetime)):
        return obj.isoformat()
    if isinstance(obj, dict):
        return {k: normalize(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [normalize(v) for v in obj]
    return obj


def load_games() -> list[dict]:
    games: list[dict] = []
    files = sorted(GAMES_DIR.glob("*.yaml")) + sorted(GAMES_DIR.glob("*.yml"))
    for path in files:
        try:
            data = yaml.safe_load(path.read_text(encoding="utf-8"))
        except Exception as e:
            print(f"跳过 {path.name}: {e}", file=sys.stderr)
            continue
        if not isinstance(data, dict) or not data.get("id"):
            print(f"跳过 {path.name}: 无效数据", file=sys.stderr)
            continue
        data.pop("notes", None)
        games.append(normalize(data))
    games.sort(key=lambda g: g.get("updated_at") or g.get("release_date") or "", reverse=True)
    return games


def main() -> None:
    if not GAMES_DIR.exists():
        print(f"目录不存在: {GAMES_DIR}", file=sys.stderr)
        sys.exit(1)

    games = load_games()
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    SRC_OUT.parent.mkdir(parents=True, exist_ok=True)

    payload = json.dumps(games, ensure_ascii=False, indent=2)
    OUT_FILE.write_text(payload + "\n", encoding="utf-8")
    SRC_OUT.write_text(payload + "\n", encoding="utf-8")
    print(f"已写入 {len(games)} 条游戏 → {OUT_FILE.relative_to(ROOT)}")
    print(f"已写入 {len(games)} 条游戏 → {SRC_OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
