# 构建与上线计划 · 2026-07-25

## 现状
- 前端源码已在 GitHub `web/`
- itch 爬虫以本地完整版为准
- Cloudflare Pages：Root=`web`，Build=`npm run build`，Out=`out`

## 构建策略
1. `games.json` 已提交，CF 无 Python 也能构建
2. 本地有 Python 时 `npm run sync-data` 从 YAML 刷新 JSON
3. 改 YAML → sync-data → commit JSON → 部署

## 下一步
1. CF 接仓库部署
2. 本机跑 scrape-itch 填充 candidates
3. 绑定 兽人控.com
