# 候选游戏（candidates）

由 `scripts/scrape-itch.py` 自动写入的**待审核**条目。

## 流程

1. `python3 scripts/scrape-itch.py --tag furry --pages 1`
2. 检查本目录 YAML
3. 补全 species / rating / 中文简介 / genres
4. 移动到 `data/games/<id>.yaml`
5. `python3 scripts/validate-games.py`
6. 提交 PR
