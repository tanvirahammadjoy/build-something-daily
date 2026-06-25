export default function Checkbox({ checked, onChange, label, size = 'md' }) {
  const dims = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`flex ${dims} flex-shrink-0 items-center justify-center rounded border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
        checked ? 'border-sage bg-sage' : 'border-border bg-transparent hover:border-ink-muted'
      }`}
    >
      {checked && (
        <svg viewBox="0 0 16 16" className="h-3 w-3 text-canvas" fill="none">
          <path
            d="M3 8.5L6.2 11.7L13 4.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
