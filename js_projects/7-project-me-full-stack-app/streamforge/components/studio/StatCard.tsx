interface Props { label: string; value: string | number; subtext?: string; accent?: "blue" | "green" | "purple" | "amber"; }
const accents = { blue: "border-blue-500/30 bg-blue-500/5", green: "border-green-500/30 bg-green-500/5", purple: "border-purple-500/30 bg-purple-500/5", amber: "border-amber-500/30 bg-amber-500/5" };
export function StatCard({ label, value, subtext, accent = "blue" }: Props) {
  return (
    <div className={`rounded-xl border p-5 ${accents[accent]}`}>
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-white text-3xl font-bold mt-1 tabular-nums">{typeof value === "number" ? value.toLocaleString() : value}</p>
      {subtext && <p className="text-gray-500 text-xs mt-1">{subtext}</p>}
    </div>
  );
}
