# 统一内容管理方案

## 已落地架构

**主数据源 = GitHub 仓库里的 YAML 文件**（版本可控、可回滚、社区可贡献）

**可视化后台 = Decap CMS**（Git-backed）

访问路径：部署后打开 `https://你的域名/admin`

### 方案说明

| 层级 | 工具 | 作用 |
|------|------|------|
| 数据真相 | `data/games/*.yaml` | 唯一数据源，Git 管理 |
| 可视化后台 | Decap CMS (`/admin`) | 非技术用户可视化新增/编辑/上传 |
| 校验 | `scripts/validate-games.py` + GitHub Actions | PR 时自动检查格式与必填字段 |
| 部署 | GitHub Actions (`deploy.yml`) | 合并后自动构建与发布 |

### 日常使用流程

**方式一：网页后台（推荐给非技术用户）**
1. 打开 `/admin`
2. 用 GitHub 账号登录（需配置 OAuth）
3. 左侧选择「游戏」→ 新建或编辑
4. 保存后自动提交到仓库（或创建 PR，取决于 publish_mode）

**方式二：直接改 Git**
1. Fork / Clone 仓库
2. 在 `data/games/` 下新建或修改 `.yaml`
3. 本地运行 `python scripts/validate-games.py` 自检
4. 提交 Pull Request → Actions 自动校验

**方式三：从 itch 批量导入（后续）**
1. 运行抓取脚本生成 `data/candidates/`
2. 在后台或本地确认后转为正式条目

### 配置 Decap CMS 的必要步骤

1. 仓库已配置为 `FanCX520/shourenkong`
2. 在 GitHub 创建 OAuth App（或使用 Netlify Identity / Git Gateway）
3. 部署站点后访问 `/admin` 即可使用

当前 `publish_mode: simple` 会直接提交到 main。如果希望更安全，可改成 `editorial_workflow`（走 PR 审核）。

### 后续可扩展

- 增加「待审核队列」集合（candidates）
- 网页表单投稿 → 自动开 Issue
- 权限区分（编辑 vs 审核）
- 封面图本地上传到 `public/uploads`
