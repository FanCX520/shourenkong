# 下一步可执行清单

## 已完成 ✅

- [x] 标签体系正式文档（docs/01-tags.md）
- [x] 游戏数据 Schema（schemas/game.schema.yaml）
- [x] 示例游戏条目（black-chapter + fuga-melodies-of-steel）
- [x] 校验脚本（scripts/validate-games.py）
- [x] **Decap CMS 后台配置**（public/admin/）
- [x] **GitHub Actions 自动校验**（.github/workflows/validate.yml）
- [x] 部署工作流骨架（deploy.yml）
- [x] 统一管理方案文档
- [x] **GitHub 仓库已创建并推送** → https://github.com/FanCX520/shourenkong

## 当前优先级

### 1. 前端骨架（下一阶段重点）
推荐技术栈：
- Next.js（App Router）+ Tailwind
- 样式方向：已安装的 **app-shell-ui**（干净双主题、工具感、侧栏筛选）
- 或结合 frontend-design 做更有辨识度的视觉

需要实现的页面：
- 首页（热门 + 最新 + 随机按钮 + 标签云）
- 探索页（筛选 + 卡片列表）
- 游戏详情页
- 标签页

### 2. 真实数据扩充
- 手动再录 20–50 部高质量游戏
- 或参考 FurryGamesIndex 公开数据做映射脚本

### 3. 域名与部署
- 把 兽人控.com 解析到 Vercel / Cloudflare Pages
- 完善 deploy.yml 真正的构建与发布步骤

### 4. Decap 登录配置
- 配置 GitHub OAuth 或使用简化登录，让 `/admin` 真正可用

## 可用 Skills

- `app-shell-ui`：桌面工具风外壳（推荐做筛选侧栏 + 卡片）
- `frontend-design`：避免模板化 AI 审美
- `frontend-ui-engineering`：生产级可访问性与组件规范
- `web-design-guidelines`：审查 UI 是否符合最佳实践

开始做前端时，直接说「用 app-shell-ui 做探索页」即可。
