const PRIORITY_CONFIG = {
  urgent: { code: 'P1', bar: 'bg-brick', text: 'text-brick' },
  high: { code: 'P2', bar: 'bg-accent', text: 'text-accent' },
  medium: { code: 'P3', bar: 'bg-teal', text: 'text-teal' },
  low: { code: 'P4', bar: 'bg-ink-muted', text: 'text-ink-muted' },
};

export function priorityConfig(priority) {
  return PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;
}

export default function PriorityBadge({ priority }) {
  const cfg = priorityConfig(priority);
  return <span className={`font-mono text-[10px] font-medium tracking-wider ${cfg.text}`}>{cfg.code}</span>;
}
