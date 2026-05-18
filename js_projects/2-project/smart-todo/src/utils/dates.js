export function getDueStatus(due) {
  if (!due) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(due + "T00:00:00");
  const diff = Math.round((d - today) / 86400000);

  if (diff < 0)
    return { label: `Overdue by ${Math.abs(diff)}d`, cls: "overdue" };
  if (diff === 0) return { label: "Due today", cls: "due-soon" };
  if (diff <= 3) return { label: `Due in ${diff}d`, cls: "due-soon" };
  return { label: d.toLocaleDateString(), cls: "" };
}
