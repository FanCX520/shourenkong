"use client";

import { useEffect, useState, useCallback } from "react";
import { CloseIcon } from "@/components/ui/Icons";

export function GalleryLightbox({ images }: { images: string[] }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const close = useCallback(() => setOpen(false), []);
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + images.length) % images.length),
    [images.length]
  );
  const next = useCallback(
    () => setIndex((i) => (i + 1) % images.length),
    [images.length]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, prev, next]);

  if (!images.length) return null;

  return (
    <>
      {/* 缩略图网格 */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            className="card-lift group relative aspect-[16/10] overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--bg-muted)]"
            onClick={() => {
              setIndex(i);
              setOpen(true);
            }}
            aria-label={`查看第 ${i + 1} 张截图`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`截图 ${i + 1}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {/* 灯箱 */}
      {open && (
        <div
          className="anim-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="画廊查看器"
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            onClick={close}
            aria-label="关闭"
          >
            <CloseIcon size={20} />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-3 py-2 text-white transition-colors hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                aria-label="上一张"
              >
                ‹
              </button>
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-3 py-2 text-white transition-colors hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                aria-label="下一张"
              >
                ›
              </button>
            </>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[index]}
            alt={`截图 ${index + 1}`}
            className="max-h-full max-w-full rounded-[8px] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[13px] text-white/70">
            {index + 1} / {images.length}
          </p>
        </div>
      )}
    </>
  );
}
