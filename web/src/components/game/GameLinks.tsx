import type { GameLink, LinkType } from "@/lib/types";
import { ExternalIcon, GamepadIcon } from "@/components/ui/Icons";

const TYPE_ORDER: LinkType[] = [
  "itch",
  "steam",
  "official",
  "patreon",
  "discord",
  "qq",
  "kofi",
  "fanbox",
  "telegram",
  "other",
];

const TYPE_LABEL: Record<LinkType, string> = {
  itch: "itch.io",
  steam: "Steam",
  official: "官网",
  patreon: "Patreon",
  discord: "Discord",
  qq: "QQ 群",
  kofi: "Ko-fi",
  fanbox: "Fanbox",
  telegram: "Telegram",
  other: "链接",
};

/** 主要下载/购买渠道（大按钮），其余为社交/支持链接（小徽章） */
const PRIMARY: LinkType[] = ["itch", "steam", "official"];

function linkType(link: GameLink): LinkType {
  return link.type || (link.url.includes("itch.io") ? "itch" : "other");
}

export function GameLinks({ links }: { links: GameLink[] }) {
  if (!links.length) return null;

  const sorted = [...links].sort(
    (a, b) => TYPE_ORDER.indexOf(linkType(a)) - TYPE_ORDER.indexOf(linkType(b))
  );
  const primary = sorted.filter((l) => PRIMARY.includes(linkType(l)));
  const social = sorted.filter((l) => !PRIMARY.includes(linkType(l)));

  return (
    <div className="flex flex-col gap-2.5">
      {primary.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {primary.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
            >
              {linkType(link) === "itch" && <GamepadIcon size={14} />}
              {link.name}
              <ExternalIcon size={13} />
            </a>
          ))}
        </div>
      )}
      {social.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[12px] text-[var(--text-tertiary)]">更多：</span>
          {social.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="badge border border-[var(--border)] bg-[var(--bg-muted)] text-[var(--text-secondary)] transition-colors hover:border-[color-mix(in_srgb,var(--primary)_45%,var(--border))] hover:text-[var(--primary-strong)]"
              title={link.url}
            >
              {TYPE_LABEL[linkType(link)]}
              <ExternalIcon size={11} />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
