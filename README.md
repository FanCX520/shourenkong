# 兽人控.com

中文圈兽人 / furry / kemono 游戏资源索引站。

域名：兽人控.com

## 当前状态

- [x] 标签体系定稿
- [x] 数据 Schema 定义
- [x] 示例游戏条目
- [x] 内容管理方案（Git + **Decap CMS 可视化后台**）
- [x] GitHub Actions 自动校验
- [ ] 前端骨架
- [ ] 真实数据规模化
- [ ] 域名上线

## 快速开始（内容贡献）

### 方式一：网页后台（推荐）
部署后访问 `/admin`，用 GitHub 登录即可可视化新增/编辑游戏。

### 方式二：直接改文件
1. Fork 本仓库
2. 在 `data/games/` 下新建 `你的游戏-id.yaml`（参考现有文件）
3. 按 `schemas/game.schema.yaml` 和 `docs/01-tags.md` 填写
4. 本地运行校验：
   ```bash
   pip install pyyaml
   python scripts/validate-games.py
   ```
5. 提交 Pull Request（Actions 会自动再校验一次）

## 管理后台

已配置 **Decap CMS**。

- 配置文件：`public/admin/config.yml`
- 入口页面：`public/admin/index.html`
- 部署后访问：`https://你的域名/admin`

详细说明见 [docs/02-management.md](docs/02-management.md)。

## 文档

- [标签体系](docs/01-tags.md)
- [统一管理方案](docs/02-management.md)
- [仓库结构](docs/03-repo-structure.md)
- [下一步行动](docs/04-next-actions.md)

## 目录结构（简化）

```
data/games/          # 每个游戏一个 YAML（主数据）
public/admin/        # Decap CMS 后台
schemas/             # 校验规则
scripts/             # 校验与后续抓取脚本
.github/workflows/   # 自动校验 & 部署
docs/                # 规划与规范文档
```

## License

内容与代码许可后续确定（建议 Apache-2.0 或类似）。
