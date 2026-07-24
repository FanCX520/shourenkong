#!/usr/bin/env python3
"""简单本地校验脚本：检查 data/games/*.yaml 是否符合基本规范"""

import sys
from pathlib import Path

try:
    import yaml
except ImportError:
    print("请先安装 PyYAML: pip install pyyaml")
    sys.exit(1)

GAMES_DIR = Path(__file__).parent.parent / "data" / "games"
REQUIRED = ["id", "title", "rating", "species", "status", "links"]
VALID_RATINGS = {"全年龄", "软色情", "R18", "R18G"}
VALID_STATUS = {"完结", "进行中", "停更"}

def validate_file(path: Path) -> list[str]:
    errors = []
    try:
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
    except Exception as e:
        return [f"YAML 解析失败: {e}"]

    if not isinstance(data, dict):
        return ["根节点必须是对象"]

    for key in REQUIRED:
        if key not in data or data[key] in (None, "", []):
            errors.append(f"缺少必填字段: {key}")

    if "rating" in data and data["rating"] not in VALID_RATINGS:
        errors.append(f"rating 不合法: {data.get('rating')}")

    if "status" in data and data["status"] not in VALID_STATUS:
        errors.append(f"status 不合法: {data.get('status')}")

    if "id" in data and path.stem != data["id"]:
        errors.append(f"文件名 ({path.stem}) 与 id 字段 ({data['id']}) 不一致")

    if "links" in data:
        if not isinstance(data["links"], list) or len(data["links"]) == 0:
            errors.append("links 必须是非空数组")
        else:
            for i, link in enumerate(data["links"]):
                if not isinstance(link, dict) or "name" not in link or "url" not in link:
                    errors.append(f"links[{i}] 缺少 name 或 url")

    return errors

def main():
    if not GAMES_DIR.exists():
        print("data/games 目录不存在")
        sys.exit(1)

    files = list(GAMES_DIR.glob("*.yaml")) + list(GAMES_DIR.glob("*.yml"))
    if not files:
        print("没有找到游戏文件")
        return

    total_errors = 0
    for f in sorted(files):
        errs = validate_file(f)
        if errs:
            total_errors += len(errs)
            print(f"\n❌ {f.name}")
            for e in errs:
                print(f"   - {e}")
        else:
            print(f"✅ {f.name}")

    print(f"\n检查完成，共 {len(files)} 个文件，{total_errors} 个错误")
    sys.exit(1 if total_errors else 0)

if __name__ == "__main__":
    main()
