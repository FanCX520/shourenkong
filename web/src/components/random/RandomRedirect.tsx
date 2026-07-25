"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function RandomRedirect({ ids }: { ids: string[] }) {
  const router = useRouter();
  const [empty, setEmpty] = useState(false);

  useEffect(() => {
    if (!ids.length) {
      setEmpty(true);
      return;
    }
    const id = ids[Math.floor(Math.random() * ids.length)];
    router.replace(`/game/${id}/`);
  }, [ids, router]);

  if (empty) {
    return (
      <div className="mx-auto max-w-[480px] px-4 py-16 text-center">
        <h1 className="text-[18px] font-semibold">还没有可随机的游戏</h1>
        <p className="mt-2 text-[13px] text-[var(--text-secondary)]">先往仓库加几条条目吧。</p>
        <Link href="/explore/" className="btn btn-primary mt-5 inline-flex">
          去探索
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[480px] px-4 py-16 text-center text-[13px] text-[var(--text-secondary)]">
      正在随机跳转…
    </div>
  );
}
