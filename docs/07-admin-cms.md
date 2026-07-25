# 后台 Decap CMS 配置

入口：`https://你的域名/admin/`

## 1. 创建 GitHub OAuth App

1. 打开 https://github.com/settings/developers → **OAuth Apps** → **New OAuth App**
2. Application name：`兽人控 CMS`（随意）
3. Homepage URL：`https://hf.tn`（或你的 pages.dev）
4. Authorization callback URL：`https://hf.tn`（与站点根域名一致，不要加 /admin）
5. 注册后 **Generate a new client secret**，记下 Client ID 和 Client Secret

## 2. Cloudflare 环境变量

Pages 项目 → Settings → Environment variables（Production + Preview）：

| 变量名 | 值 |
|--------|-----|
| `GITHUB_CLIENT_ID` | OAuth App 的 Client ID |
| `GITHUB_CLIENT_SECRET` | OAuth App 的 Client Secret |

保存后重新部署一次。

## 3. 仓库已具备

- `functions/api/auth.js` + `callback.js`：OAuth 代理
- `web/public/admin/`：CMS 前端与 `config.yml`
- `config.yml` 中 `base_url` 需与你的域名一致（当前 `https://hf.tn`）

## 4. 使用

1. 打开 `https://hf.tn/admin/`
2. 点 Login with GitHub
3. 授权后即可增删改 `data/games/*.yaml`
4. 保存会 commit 到 GitHub main，触发 Pages 重建

## 注意

- 你的 GitHub 账号需对 `FanCX520/shourenkong` 有写权限
- 换域名时同步改：OAuth App 的 URL、`config.yml` 的 `base_url`、重新部署
