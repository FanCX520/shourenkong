#!/usr/bin/env python3
"""Promote candidate games into the official collection.

用法：
  python scripts/promote-candidates.py                 # 全部候选转正式
  python scripts/promote-candidates.py atlyss tunic    # 只转指定 id

会把 data/candidates/<id>.yaml 移动到 data/games/<id>.yaml，
并更新 notes 字段标记转正时间。
"""
from __future__ import annotations

import sys
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


def promote(path: Path) -> str | None:
    try:
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
    except Exception as e:
        print(f"跳过（解析失败）{path.name}: {e}", file=sys.stderr)
        return None
    if not isinstance(data, dict) or not data.get("id"):
        print(f"跳过（缺 id）{path.name}", file=sys.stderr)
        return None

    gid = str(data["id"])
    target = GAMES / f"{gid}.yaml"
    if target.exists():
        print(f"跳过（已存在正式条目）{gid}")
        return None

    data["notes"] = f"promoted from candidates on {date.today().isoformat()}"
    GAMES.mkdir(parents=True, exist_ok=True)
    target.write_text(
        yaml.safe_dump(data, allow_unicode=True, sort_keys=False, default_flow_style=False),
        encoding="utf-8",
    )
    try:
        path.unlink()
    except OSError as e:
        # 本地沙箱可能拦截删除（Windows 回收站不可用）；CI 上正常。
        print(f"警告：已写入 {target.name} 但删除候选失败: {e}", file=sys.stderr)
    return gid


def main() -> None:
    ids = [a for a in sys.argv[1:] if a.strip()]
    if not CANDIDATES.exists():
        print("没有候选目录，无事可做")
        return

    files = sorted(CANDIDATES.glob("*.yaml")) + sorted(CANDIDATES.glob("*.yml"))
    files = [p for p in files if not p.name.startswith("_")]
    if ids:
        wanted = set(ids)
        files = [p for p in files if p.stem in wanted]
        missing = wanted - {p.stem for p in files}
        for m in sorted(missing):
            print(f"未找到候选：{m}", file=sys.stderr)

    if not files:
        print("没有匹配的候选，无事可做")
        return

    promoted = [gid for p in files if (gid := promote(p))]
    print(f"转正 {len(promoted)} 个：{', '.join(promoted) if promoted else '无'}")


if __name__ == "__main__":
    main()
