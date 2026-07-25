# 兽人控.com

中文圈兽人 / furry / kemono 游戏资源索引站。

域名：兽人控.com

## 当前状态

- [x] 标签体系定稿
- [x] 数据 Schema + 示例游戏
- [x] Decap CMS + GitHub Actions 校验
- [x] 前端 Next.js 静态站（`web/`）
- [ ] 真实数据规模化（itch 候选 → 审核）
- [ ] 域名上线

## 部署（Cloudflare Pages）

| 字段 | 值 |
|------|-----|
| Root directory | `web` |
| Build command | `npm run build` |
| Build output directory | `out` |
| Node version | `20` |

`web/src/data/games.json` 已提交，无 Python 也能构建。有 Python 时 `npm run sync-data` 会从 `data/games/*.yaml` 刷新 JSON。

## 本地开发

```bash
cd web
npm install
npm run dev
```

## 内容贡献

### 网页后台
部署后访问 `/admin`（需配置 GitHub OAuth）。

### 改 YAML
1. 在 `data/games/` 新增文件（参考已有）
2. `python3 scripts/validate-games.py`
3. `cd web && npm run sync-data` 更新 JSON
4. 提交 PR

## itch 抓取（本机有网）

```bash
pip install pyyaml
python3 scripts/scrape-itch.py --tag furry --pages 1
# 结果 → data/candidates/，审核后移入 data/games/
```

## 文档

- [标签体系](docs/01-tags.md)
- [管理方案](docs/02-management.md)
- [前端与爬虫计划](docs/05-frontend-and-scraper-plan.md)
- [构建计划](docs/06-build-plan.md)
