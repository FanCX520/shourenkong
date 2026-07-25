# 前端 + itch 抓取 · 执行计划

更新：2026-07-25

## 总览状态

| 模块 | 本地 | GitHub | 说明 |
|------|------|--------|------|
| 标签 / Schema / 示例数据 | ✅ | ✅ | 稳定 |
| Decap CMS | ✅ | ✅ | 需 OAuth 才可登录 |
| 前端 Next.js（`web/`） | ✅ 完整 | ⚠️ 部分 | 补推页面与组件中 |
| itch 自动爬取 | ✅ 脚本已写 | 推送中 | 写入 `data/candidates/` |
| Cloudflare 部署 | — | — | Root=`web`，build=`npm run build`，out=`out` |

---

## A. 前端剩余

把本地 `web/` 页面与组件推全，使 Cloudflare Pages 能 `npm run build`。

### Cloudflare Pages
| 字段 | 值 |
|------|-----|
| Root directory | `web` |
| Build command | `npm run build` |
| Output directory | `out` |
| Node | `20` |

---

## B. itch 自动爬取

### 原则
1. **不直接写入 `data/games/`** — 进 `data/candidates/`，审核后再转正。
2. **礼貌爬取**：延迟、User-Agent、限页数。
3. **映射 Schema**：title / description / cover / links；物种与分级需人工补。
4. **可重复跑**：已有 id 跳过。

### 用法
```bash
pip install pyyaml
python3 scripts/scrape-itch.py --tag furry --pages 1
python3 scripts/scrape-itch.py --tag kemono --pages 2 --delay 1.5
python3 scripts/scrape-itch.py --url https://someone.itch.io/game-slug
```

### 数据流
itch 标签页 → scrape-itch.py → data/candidates/ → 人工审核 → data/games/ → 前端
