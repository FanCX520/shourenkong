# 仓库结构

```
shourenkong/
├── data/
│   ├── games/                  # 每个游戏一个 YAML 文件（主数据）
│   │   ├── black-chapter.yaml
│   │   ├── fuga-melodies-of-steel.yaml
│   │   └── ...
│   └── candidates/             # itch 抓取的待审核草稿（可选）
├── docs/
│   ├── 01-tags.md              # 标签体系
│   ├── 02-management.md        # 管理方案（含 Decap CMS）
│   ├── 03-repo-structure.md
│   └── 04-next-actions.md
├── schemas/
│   └── game.schema.yaml        # 校验用
├── scripts/
│   └── validate-games.py       # 本地/CI 校验
├── public/
│   └── admin/                  # Decap CMS
│       ├── index.html
│       └── config.yml
├── src/                        # 后续前端代码（Next.js / Astro）
├── .github/
│   └── workflows/
│       ├── validate.yml        # PR 时校验 YAML
│       └── deploy.yml          # 合并后部署
└── README.md
```

## 命名约定
- 游戏文件名 = `id` 字段（小写英文 + 连字符）
- 所有标签必须来自 `docs/01-tags.md`，新增标签先改文档
