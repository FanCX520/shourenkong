"use client";

import { useEffect, useRef, useState } from "react";

const PALETTES = [
  { id: "gold", label: "金琥珀", dot: "#e8a94d" },
  { id: "cyan", label: "青", dot: "#61d0f1" },
  { id: "pink", label: "粉", dot: "#f093b8" },
  { id: "green", label: "绿", dot: "#7dd3a0" },
  { id: "purple", label: "紫", dot: "#b89ef5" },
];

function applyPalette(id: string) {
  document.documentElement.setAttribute("data-palette", id);
  try {
    localStorage.setItem("shourenkong-palette", id);
  } catch {
    /* ignore */
  }
}

export function PalettePicker({ defaultPalette = "gold" }: { defaultPalette?: string }) {
  const [palette, setPalette] = useState(defaultPalette);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let initial = defaultPalette;
    try {
      const saved = localStorage.getItem("shourenkong-palette");
      if (saved && PALETTES.some((p) => p.id === saved)) initial = saved;
    } catch {
      /* ignore */
    }
    applyPalette(initial);
    setPalette(initial);
    setReady(true);
  }, [defaultPalette]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = PALETTES.find((p) => p.id === palette) || PALETTES[0];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="btn btn-ghost"
        onClick={() => setOpen((v) => !v)}
        aria-label="切换配色"
        aria-expanded={open}
        title="配色"
        suppressHydrationWarning
      >
        <span
          className="inline-block h-3.5 w-3.5 rounded-full border border-[var(--border-strong)]"
          style={{ background: ready ? current.dot : "transparent" }}
          aria-hidden
        />
      </button>

      {open && (
        <div className="anim-fade-up absolute right-0 top-full z-50 mt-2 w-40 rounded-[12px] border border-[var(--border)] bg-[var(--bg-surface)] p-2 shadow-[var(--shadow-pop)]">
          <p className="px-2 pb-1.5 text-[12px] text-[var(--text-tertiary)]">站点配色</p>
          {PALETTES.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`flex w-full items-center gap-2.5 rounded-[8px] px-2 py-2 text-[13px] transition-colors ${
                palette === p.id
                  ? "bg-[var(--bg-selected)] text-[var(--primary-strong)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
              }`}
              onClick={() => {
                setPalette(p.id);
                applyPalette(p.id);
                setOpen(false);
              }}
            >
              <span
                className="inline-block h-4 w-4 rounded-full border border-black/10"
                style={{ background: p.dot }}
                aria-hidden
              />
              {p.label}
              {palette === p.id && <span className="ml-auto text-[11px]">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
