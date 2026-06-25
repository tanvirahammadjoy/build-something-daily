import { useStats } from '../../hooks/useTasks';
import { priorityConfig } from './PriorityBadge';
import ErrorState from '../ui/ErrorState';

const PRIORITY_ORDER = ['urgent', 'high', 'medium', 'low'];

function StatCard({ label, value, accent }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="text-xs uppercase tracking-wide text-ink-muted">{label}</p>
      <p className={`mt-1 font-display text-2xl font-semibold ${accent || 'text-ink'}`}>{value}</p>
    </div>
  );
}

export default function StatsOverview() {
  const { data: stats, isLoading, isError, refetch } = useStats();

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center font-mono text-sm text-ink-muted">
        Loading overview…
      </div>
    );
  }

  if (isError || !stats) {
    return <ErrorState message="Couldn't load your overview." onRetry={refetch} />;
  }

  const maxCompletedPerDay = Math.max(1, ...stats.completedPerDay.map((d) => d.count));
  const maxPriorityCount = Math.max(1, ...PRIORITY_ORDER.map((p) => stats.byPriority[p] || 0));

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6">
      <h1 className="mb-6 font-display text-lg font-semibold text-ink">Overview</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Active" value={stats.totalActive} />
        <StatCard label="Completed" value={stats.totalCompleted} accent="text-sage" />
        <StatCard label="Due today" value={stats.dueTodayCount} accent="text-accent" />
        <StatCard
          label="Overdue"
          value={stats.overdueCount}
          accent={stats.overdueCount > 0 ? 'text-brick' : 'text-ink'}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-muted">
            Completed, last 7 days
          </h2>
          <div className="flex items-end gap-2 rounded-lg border border-border bg-surface p-4" style={{ height: 120 }}>
            {stats.completedPerDay.map((d) => (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-sm bg-sage"
                  style={{ height: `${Math.max(4, (d.count / maxCompletedPerDay) * 80)}px` }}
                  title={`${d.count} completed`}
                />
                <span className="font-mono text-[10px] text-ink-muted">
                  {new Date(`${d.date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short' })[0]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-muted">
            Active tasks by priority
          </h2>
          <div className="space-y-2 rounded-lg border border-border bg-surface p-4">
            {PRIORITY_ORDER.map((p) => {
              const cfg = priorityConfig(p);
              const count = stats.byPriority[p] || 0;
              return (
                <div key={p} className="flex items-center gap-2">
                  <span className={`w-8 font-mono text-xs ${cfg.text}`}>{cfg.code}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-canvas">
                    <div className={`h-full ${cfg.bar}`} style={{ width: `${(count / maxPriorityCount) * 100}%` }} />
                  </div>
                  <span className="w-6 text-right font-mono text-xs text-ink-muted">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {stats.byCategory.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-muted">By category</h2>
          <div className="flex flex-wrap gap-2">
            {stats.byCategory.map((c) => (
              <span
                key={c.category}
                className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-ink-muted"
              >
                {c.category} <span className="font-mono text-ink">{c.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
