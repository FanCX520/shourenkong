# 上线清单（Cloudflare Pages + 兽人控.com）

按顺序执行，每步完成后打勾。

## 1. 推送代码到 GitHub

远端已配置（`git remote -v` 可见），本地已有 3 个提交。推送**需要本机 GitHub 凭据**：

```bash
git push -u origin main
```

若提示认证失败，二选一：

- **A（推荐）**：在本机装 GitHub CLI 后 `gh auth login` 一次，之后 git push 直接复用；
- **B**：在 IDE 里点「Push」按钮，按提示弹出登录窗口完成授权。

> 仓库地址以 `web/public/admin/config.yml` 里的 `repo:` 为准，不一致时两边一起改。
> 推送前确认工作区干净：`git status --short`（当前应无输出）。

## 2. 创建 Cloudflare Pages 项目

Dashboard → Workers & Pages → Create → Pages → **Connect to Git**：

| 字段 | 值 |
|------|-----|
| Repository | `FanCX520/shourenkong` |
| Production branch | `main` |
| Root directory | `web` |
| Framework preset | `Next.js (Static HTML Export)`（或 None） |
| Build command | `npm run build` |
| Build output directory | `out` |
| Environment variable `NODE_VERSION` | `22` |

> **注意**：仓库里的 `wrangler.toml` 写了 `pages_build_output_dir = "web/out"`，Cloudflare 会锁定 Dashboard 的「构建输出目录」输入框（提示"在 wrangler.toml 中修改版本输出目录"）——**这是正常的**，输出目录本来就该是 `web/out`。
>
> **不要在 wrangler.toml 里写 `[build]` 段**（command/cwd）——那是 Workers 配置，Pages 会直接报 `Configuration file for Pages projects does not support "build"`。
> 根目录和构建命令改在 **Dashboard → 构建配置 → 编辑** 里填：
> - Root directory：`web`
> - Build command：`npm run build`
>
> `NODE_VERSION=22` 环境变量也必须在 Dashboard「变量和密钥」里加（wrangler.toml 不支持）。

保存并部署。首次构建成功后得到 `https://<项目名>.pages.dev`。

> 构建时会先跑 `npm run sync-data`（Node 版，无需 Python），把 `data/games/*.yaml` 转成 JSON，再 `next build` 输出纯静态文件。

## 3. 绑定域名 兽人控.com

1. 域名需已托管在 Cloudflare DNS（punycode：`xn--gmq10evxz.com`）
2. Pages 项目 → Custom domains → Set up a custom domain → 输入 `兽人控.com`
3. 等待证书签发，访问 `https://xn--gmq10evxz.com` 验证

## 4. 配置 Decap CMS 登录（GitHub OAuth）

详见 [07-admin-cms.md](07-admin-cms.md)，要点：

1. GitHub → Settings → Developer settings → OAuth Apps → New：
   - Homepage URL：`https://xn--gmq10evxz.com`
   - Callback URL：`https://xn--gmq10evxz.com`（与根域名一致）
2. Pages 项目 → Settings → Environment variables（Production）：
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
3. 重新部署一次（Pages 的 Functions 需要环境变量生效）
4. 打开 `https://xn--gmq10evxz.com/admin/` → Login with GitHub

> 未绑定正式域名前，可先把 `config.yml` 的 `base_url` 临时改为 `https://<项目名>.pages.dev` 调通后台。

## 5. 验证清单

- [ ] 首页 /explore/ /tags/ /game/<id>/ /random/ 均可访问
- [ ] `/admin/` 能登录并保存条目（保存后 GitHub 出现新 commit）
- [ ] push 后 Actions「Validate Games」「Build & Validate」全绿
- [ ] Pages 自动重新部署，新条目出现在前台

## 6. 首次构建失败排查

| 现象 | 原因与处理 |
|------|-----------|
| `sync-data` 找不到 js-yaml | 根目录 `npm install`（已把 js-yaml 加入根 `package.json`） |
| 本地构建报 `NODE_OPTIONS=--use-system-ca` | 本地沙箱注入，构建前 `export NODE_OPTIONS=`；**Cloudflare Pages 无此问题** |
| Windows EPERM 写 games.json | 本地 IDE 监视器锁文件，脚本已改为先 unlink 再写；**Cloudflare 无此问题** |
| Next 编译报 Node 版本低 | Next 16 要求 Node ≥ 20.9，Pages 环境变量 `NODE_VERSION=22` |

## 7. 日常运营

- 抓候选：`python scripts/scrape-itch.py --tag furry --pages 2`
- 审核：后台「候选游戏（待审核）」集合
- 转正：`data/candidates/x.yaml` → `data/games/x.yaml`，push 即上线
