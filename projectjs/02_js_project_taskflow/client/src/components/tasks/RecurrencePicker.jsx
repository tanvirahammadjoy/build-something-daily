import Input from '../ui/Input';

const DAYS = [
  { value: 1, label: 'M' },
  { value: 2, label: 'T' },
  { value: 3, label: 'W' },
  { value: 4, label: 'T' },
  { value: 5, label: 'F' },
  { value: 6, label: 'S' },
  { value: 0, label: 'S' },
];

const TYPES = [
  { value: 'none', label: 'Never' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'custom', label: 'Custom days' },
];

export default function RecurrencePicker({ value, onChange }) {
  const { type, interval, daysOfWeek, endDate } = value;

  const toggleDay = (day) => {
    const next = daysOfWeek.includes(day) ? daysOfWeek.filter((d) => d !== day) : [...daysOfWeek, day];
    onChange({ ...value, daysOfWeek: next });
  };

  return (
    <div>
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-muted">Repeat</span>
      <select
        value={type}
        onChange={(e) => onChange({ ...value, type: e.target.value })}
        className="w-full rounded-md border border-border bg-canvas px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
      >
        {TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>

      {type !== 'none' && (
        <div className="mt-3 space-y-3">
          {(type === 'daily' || type === 'weekly' || type === 'monthly') && (
            <label className="flex items-center gap-2 text-sm text-ink-muted">
              Every
              <input
                type="number"
                min={1}
                value={interval}
                onChange={(e) => onChange({ ...value, interval: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                className="w-16 rounded-md border border-border bg-canvas px-2 py-1 text-center text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
              />
              {type === 'daily' && (interval === 1 ? 'day' : 'days')}
              {type === 'weekly' && (interval === 1 ? 'week' : 'weeks')}
              {type === 'monthly' && (interval === 1 ? 'month' : 'months')}
            </label>
          )}

          {(type === 'weekly' || type === 'custom') && (
            <div className="flex gap-1.5">
              {DAYS.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => toggleDay(d.value)}
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                    daysOfWeek.includes(d.value)
                      ? 'bg-accent text-canvas'
                      : 'border border-border bg-canvas text-ink-muted hover:text-ink'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          )}

          <Input
            label="Ends (optional)"
            type="date"
            value={endDate || ''}
            onChange={(e) => onChange({ ...value, endDate: e.target.value || null })}
          />
        </div>
      )}
    </div>
  );
}
