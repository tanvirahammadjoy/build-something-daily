const VARIANTS = {
  primary: 'bg-accent text-canvas hover:bg-accent-soft',
  ghost: 'bg-transparent text-ink-muted hover:text-ink hover:bg-surface-hover',
  danger: 'bg-transparent text-brick hover:bg-brick/10',
};

export default function Button({ variant = 'primary', className = '', children, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
