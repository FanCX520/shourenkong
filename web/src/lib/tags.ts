export const TAG_GROUPS = {
  species: [
    "狼", "狐", "狗", "猫", "虎", "狮", "豹", "熊", "龙", "鸟", "兔", "鹿",
    "马", "牛", "羊", "鼠", "蝙蝠", "蛇", "鲨鱼", "恐龙", "兽人（广义）",
    "人类（含兽人角色）", "混合", "其他",
  ],
  rating: ["全年龄", "软色情", "R18", "R18G"],
  genres: [
    "视觉小说", "RPG", "模拟经营", "养成", "动作", "平台", "射击", "解谜",
    "约会模拟", "沙盒", "开放世界", "其他",
  ],
  platforms: [
    "Windows", "macOS", "Linux", "Android", "iOS", "Switch", "Web",
    "itch.io", "Steam", "其他",
  ],
  engines: ["Ren'Py", "Unity", "Godot", "RPG Maker", "HTML5", "原生", "其他"],
  features: [
    "bara", "yiff", "肌肉", "多结局", "免费", "付费", "WIP（进行中）", "完结",
    "中文支持", "官方中文", "民间汉化", "单人", "多人",
  ],
} as const;

export const TAG_GROUP_LABELS: Record<keyof typeof TAG_GROUPS, string> = {
  species: "物种",
  rating: "分级",
  genres: "类型",
  platforms: "平台",
  engines: "引擎",
  features: "特征",
};

export const RATING_COLORS: Record<string, string> = {
  全年龄: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  软色情: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  R18: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
  R18G: "bg-red-600/20 text-red-800 dark:text-red-300 border-red-600/40",
};
