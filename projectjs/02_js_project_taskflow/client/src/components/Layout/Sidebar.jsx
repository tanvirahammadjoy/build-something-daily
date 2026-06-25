import { useCategories } from '../../hooks/useTasks';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';

const VIEWS = [
  { key: 'today', label: 'Today' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'all', label: 'All tasks' },
  { key: 'completed', label: 'Completed' },
];

const TOOLS = [
  { key: 'calendar', label: 'Calendar' },
  { key: 'overview', label: 'Overview' },
];

export default function Sidebar({ activeView, onSelectView, activeCategory, onSelectCategory, user, onLogout }) {
  const { data: categories } = useCategories();

  return (
    <aside className="flex h-full w-56 flex-shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-4">
        <span className="font-display text-base font-semibold text-ink">TaskFlow</span>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <NotificationBell />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="space-y-0.5">
          {VIEWS.map((view) => (
            <li key={view.key}>
              <button
                onClick={() => {
                  onSelectView(view.key);
                  onSelectCategory(null);
                }}
                className={`w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors ${
                  activeView === view.key && !activeCategory
                    ? 'bg-surface-hover text-ink'
                    : 'text-ink-muted hover:bg-surface-hover hover:text-ink'
                }`}
              >
                {view.label}
              </button>
            </li>
          ))}
        </ul>

        <ul className="mt-4 space-y-0.5 border-t border-border pt-3">
          {TOOLS.map((tool) => (
            <li key={tool.key}>
              <button
                onClick={() => {
                  onSelectView(tool.key);
                  onSelectCategory(null);
                }}
                className={`w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors ${
                  activeView === tool.key && !activeCategory
                    ? 'bg-surface-hover text-ink'
                    : 'text-ink-muted hover:bg-surface-hover hover:text-ink'
                }`}
              >
                {tool.label}
              </button>
            </li>
          ))}
        </ul>

        {categories && categories.length > 0 && (
          <div className="mt-6">
            <p className="px-3 text-[10px] font-medium uppercase tracking-wider text-ink-muted/70">Categories</p>
            <ul className="mt-1 space-y-0.5">
              {categories.map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => {
                      onSelectCategory(cat);
                      onSelectView('all');
                    }}
                    className={`w-full truncate rounded-md px-3 py-1.5 text-left text-sm transition-colors ${
                      activeCategory === cat
                        ? 'bg-surface-hover text-ink'
                        : 'text-ink-muted hover:bg-surface-hover hover:text-ink'
                    }`}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>

      <div className="border-t border-border px-4 py-3">
        <p className="truncate text-sm text-ink">{user?.name}</p>
        <button onClick={onLogout} className="mt-1 text-xs text-ink-muted hover:text-brick">
          Sign out
        </button>
      </div>
    </aside>
  );
}
