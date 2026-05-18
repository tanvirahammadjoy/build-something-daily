const COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f97316",
  "#10b981",
  "#14b8a6",
  "#ef4444",
  "#f59e0b",
];

const cache = {};

export function getCategoryColor(cat) {
  if (!cat) return "#6b7280";
  if (!cache[cat]) {
    cache[cat] = COLORS[Object.keys(cache).length % COLORS.length];
  }
  return cache[cat];
}
