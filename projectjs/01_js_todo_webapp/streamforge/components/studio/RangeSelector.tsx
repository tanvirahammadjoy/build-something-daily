"use client";
import { useRouter, useSearchParams } from "next/navigation";
const ranges = [{ value: "7d", label: "7 days" }, { value: "30d", label: "30 days" }, { value: "90d", label: "90 days" }] as const;
export function RangeSelector({ active }: { active: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setRange = (range: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", range);
    router.push(`/studio?${params}`);
  };
  return (
    <div className="flex gap-2">
      {ranges.map((r) => (
        <button key={r.value} onClick={() => setRange(r.value)} className={`px-4 py-1.5 rounded-full text-sm transition ${active === r.value ? "bg-flare text-ink font-medium" : "bg-ink-surface text-paper-dim hover:bg-ink-raised ring-1 ring-ink-border"}`}>{r.label}</button>
      ))}
    </div>
  );
}
