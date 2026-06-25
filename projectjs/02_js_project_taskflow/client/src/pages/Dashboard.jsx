import { useState } from 'react';
import Sidebar from '../components/Layout/Sidebar';
import TaskList from '../components/tasks/TaskList';
import TaskDrawer from '../components/tasks/TaskDrawer';
import CalendarView from '../components/tasks/CalendarView';
import StatsOverview from '../components/tasks/StatsOverview';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useTasks } from '../hooks/useTasks';
import { useRealtimeSync } from '../hooks/useRealtimeSync';
import { useLogout } from '../hooks/useAuthActions';
import { useAuthStore } from '../store/authStore';

export default function Dashboard() {
  useRealtimeSync();

  const [view, setView] = useState('today');
  const [category, setCategory] = useState(null);
  const [search, setSearch] = useState('');
  // undefined = drawer closed, null = creating a new task, object = editing
  const [drawerTask, setDrawerTask] = useState(undefined);

  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  const isCalendar = view === 'calendar';
  const isOverview = view === 'overview';
  const isListMode = !isCalendar && !isOverview;

  const filters = {
    view: category ? 'all' : view,
    ...(category ? { category } : {}),
    ...(search ? { search } : {}),
  };
  // Skip the list query entirely while on Calendar/Overview — they fetch
  // their own data (a date range, and aggregate stats, respectively).
  const { data, isLoading, isError, refetch } = useTasks(filters, { enabled: isListMode });

  return (
    <div className="flex h-screen bg-canvas">
      <Sidebar
        activeView={view}
        onSelectView={setView}
        activeCategory={category}
        onSelectCategory={setCategory}
        user={user}
        onLogout={() => logout.mutate()}
      />

      <main className="flex flex-1 flex-col overflow-hidden">
        {isCalendar && <CalendarView onOpenTask={setDrawerTask} />}
        {isOverview && <StatsOverview />}

        {isListMode && (
          <>
            <header className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h1 className="font-display text-lg font-semibold capitalize text-ink">{category || view}</h1>
                <p className="font-mono text-xs text-ink-muted">
                  {data?.pagination?.total ?? 0} task{data?.pagination?.total === 1 ? '' : 's'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  placeholder="Search tasks…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-56"
                />
                <Button onClick={() => setDrawerTask(null)}>+ New task</Button>
              </div>
            </header>

            <TaskList tasks={data?.tasks} isLoading={isLoading} isError={isError} onRetry={refetch} onOpenTask={setDrawerTask} />
          </>
        )}
      </main>

      {drawerTask !== undefined && <TaskDrawer task={drawerTask} onClose={() => setDrawerTask(undefined)} />}
    </div>
  );
}
