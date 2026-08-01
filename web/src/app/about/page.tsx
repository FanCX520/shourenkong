import Link from "next/link";

export const metadata = {
  title: "关于",
  description: "关于兽人控.com 与如何贡献游戏条目",
};

export default function AboutPage() {
  return (
    <div className="anim-fade-up mx-auto max-w-[720px] px-4 py-8">
      <h1 className="text-[22px] font-semibold tracking-tight">关于兽人控.com</h1>
      <div className="mt-4 space-y-4 text-[14px] leading-relaxed text-[var(--text-secondary)]">
        <p>
          本站是中文圈兽人 / furry / kemono 游戏资源索引，目标是让大家更快发现合适的作品。
          内容以 GitHub 仓库中的 YAML 为唯一数据源，支持网页后台（Decap CMS）与 PR 贡献。
        </p>
        <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">如何贡献</h2>
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            最快的方式：{" "}
            <a className="text-[var(--primary-strong)]" href="https://github.com/FanCX520/shourenkong/issues/new/choose" target="_blank" rel="noreferrer">
              投稿表单
            </a>
            ，填个名字和链接就行，编辑会处理入库
          </li>
          <li>
            也可以直接改仓库{" "}
            <a className="text-[var(--primary-strong)]" href="https://github.com/FanCX520/shourenkong" target="_blank" rel="noreferrer">
              FanCX520/shourenkong
            </a>
          </li>
          <li>在 <code className="rounded bg-[var(--bg-muted)] px-1">data/games/</code> 新增 YAML（参考已有文件）</li>
          <li>标签请遵循 <code className="rounded bg-[var(--bg-muted)] px-1">docs/01-tags.md</code></li>
          <li>提交 Pull Request，CI 会自动校验格式</li>
        </ol>
        <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">声明</h2>
        <p>
          本站仅作索引与导航，不托管游戏文件。成人内容请遵守当地法律，并注意分级标识。
        </p>
        <p>
          <Link href="/explore/" className="text-[var(--primary)]">返回探索</Link>
        </p>
      </div>
    </div>
  );
}
