# 构建与上线计划 · 2026-07-25

## 现状
- 前端源码已在 GitHub `web/`
- `games.json` 已提交；无 Python 也能 build
- Cloudflare Pages：Root=`web`，Build=`npm run build`，Out=`out`，Node=`20`

## 数据流
改 `data/games/*.yaml` → `npm run sync-data` → 提交 `web/src/data/games.json` → 部署

## itch
`python3 scripts/scrape-itch.py --tag furry --pages 1` → `data/candidates/` → 审核 → `data/games/`
