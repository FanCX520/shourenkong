# 兽人控.com

中文圈兽人 / furry / kemono 游戏资源索引站。

域名：兽人控.com（punycode：`xn--gmq10evxz.com`）

## 架构一览

| 层 | 实现 |
|----|------|
| 数据源 | `data/games/*.yaml`（Git 管理，唯一真相） |
| 校验 | `scripts/validate-games.py` + GitHub Actions |
| 同步 | `scripts/build-games-json.mjs`（Node，构建时自动跑）→ `web/src/data/games.json` |
| 前端 | Next.js 静态导出（`web/`），标签筛选 / 搜索 / 随机 / 双主题 |
| 后台 | Decap CMS（`/admin`，GitHub OAuth 由 `functions/api/*` 代理） |
| 采集 | `scripts/scrape-itch.py` 按 itch.io 标签抓取 → `data/candidates/` 待审核 |
| 部署 | Cloudflare Pages（Git 集成，push 即发布） |

## 当前状态

- [x] 标签体系定稿
- [x] 数据 Schema + 示例游戏
- [x] Decap CMS（含候选游戏审核集合）+ GitHub Actions 校验/构建
- [x] 前端 Next.js 静态站（`web/`）
- [x] itch.io 候选抓取脚本
- [ ] 真实数据规模化（itch 候选 → 审核）
- [ ] 域名上线（见 [上线清单](docs/08-go-live.md)）

## 部署（Cloudflare Pages）

| 字段 | 值 |
|------|-----|
| Root directory | `web` |
| Build command | `npm run build` |
| Build output directory | `out` |
| Node version | `20` |

`web/src/data/games.json` 已提交，无 Python 也能构建。构建时 `npm run sync-data` 会从 `data/games/*.yaml` 自动刷新 JSON。

## 本地开发

```bash
cd web
npm install
npm run dev
```

## 内容贡献

### 网页后台
部署后访问 `/admin`（需配置 GitHub OAuth，见 [07-admin-cms.md](docs/07-admin-cms.md)）。
保存即提交 commit 到 main，触发 Pages 重建。

### 改 YAML
1. 在 `data/games/` 新增文件（参考已有）
2. `python3 scripts/validate-games.py`
3. `cd web && npm run sync-data` 更新 JSON
4. 提交 PR

### itch 抓取 → 审核 → 转正
```bash
pip install pyyaml
python3 scripts/scrape-itch.py --tag furry --pages 1
# 结果 → data/candidates/，后台「候选游戏」集合审核后移入 data/games/
```

## 文档

- [标签体系](docs/01-tags.md)
- [管理方案](docs/02-management.md)
- [仓库结构](docs/03-repo-structure.md)
- [前端与爬虫计划](docs/05-frontend-and-scraper-plan.md)
- [构建计划](docs/06-build-plan.md)
- [后台 CMS 配置](docs/07-admin-cms.md)
- [上线清单](docs/08-go-live.md)
