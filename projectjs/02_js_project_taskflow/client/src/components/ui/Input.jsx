export default function Input({ label, error, className = '', ...props }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-muted">
          {label}
        </span>
      )}
      <input
        className={`w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-muted/60 focus:outline-none focus:ring-2 focus:ring-accent ${className}`}
        {...props}
      />
      {error && <span className="mt-1 block text-xs text-brick">{error}</span>}
    </label>
  );
}
