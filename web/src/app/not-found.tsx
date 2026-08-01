import Link from "next/link";
import { GamepadIcon } from "@/components/ui/Icons";

export default function NotFound() {
  return (
    <div className="anim-fade-up mx-auto flex max-w-[520px] flex-col items-center px-4 py-20 text-center">
      <span className="text-[var(--text-tertiary)]">
        <GamepadIcon size={36} />
      </span>
      <p className="mt-3 text-[13px] font-medium text-[var(--primary)]">404</p>
      <h1 className="mt-2 text-[22px] font-semibold tracking-tight">没有这页</h1>
      <p className="mt-2 text-[14px] text-[var(--text-secondary)]">
        链接可能写错了，或者条目还没入库。去探索页挑一部，或随机撞见惊喜。
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link href="/explore/" className="btn btn-primary">
          去探索
        </Link>
        <Link href="/" className="btn btn-secondary">
          回首页
        </Link>
      </div>
    </div>
  );
}
