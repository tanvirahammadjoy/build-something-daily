import { useState } from 'react';
import Button from '../ui/Button';
import { priorityConfig } from './PriorityBadge';
import { useTasks } from '../../hooks/useTasks';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
function addMonths(date, n) {
  return new Date(date.getFullYear(), date.getMonth() + n, 1);
}
function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

// Builds the 42-cell (6 week) grid for a month, including the leading/
// trailing days from adjacent months needed to fill complete weeks.
function buildCalendarGrid(monthDate) {
  const first = startOfMonth(monthDate);
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - first.getDay());

  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    days.push(d);
  }
  return days;
}

export default function CalendarView({ onOpenTask }) {
  const [monthDate, setMonthDate] = useState(() => startOfMonth(new Date()));

  const days = buildCalendarGrid(monthDate);
  const rangeStart = days[0];
  const rangeEnd = days[days.length - 1];

  const { data, isLoading, isError, refetch } = useTasks({
    startDate: toDateKey(rangeStart),
    endDate: toDateKey(rangeEnd),
    limit: 200,
  });

  const tasksByDay = {};
  (data?.tasks || []).forEach((t) => {
    if (!t.dueDate) return;
    const key = toDateKey(new Date(t.dueDate));
    (tasksByDay[key] ||= []).push(t);
  });

  const today = new Date();

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-lg font-semibold text-ink">
            {monthDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </h1>
          {isLoading && <span className="font-mono text-xs text-ink-muted">loading…</span>}
          {isError && (
            <button onClick={() => refetch()} className="font-mono text-xs text-brick hover:underline">
              Couldn't load this month — try again
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => setMonthDate(startOfMonth(new Date()))}>
            Today
          </Button>
          <Button variant="ghost" onClick={() => setMonthDate((d) => addMonths(d, -1))} aria-label="Previous month">
            ←
          </Button>
          <Button variant="ghost" onClick={() => setMonthDate((d) => addMonths(d, 1))} aria-label="Next month">
            →
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-border text-center font-mono text-[10px] uppercase tracking-wider text-ink-muted">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-2">
            {d}
          </div>
        ))}
      </div>

      <div className="grid flex-1 grid-cols-7 grid-rows-6 overflow-y-auto">
        {days.map((day) => {
          const inMonth = day.getMonth() === monthDate.getMonth();
          const isToday = isSameDay(day, today);
          const dayTasks = tasksByDay[toDateKey(day)] || [];
          const visibleTasks = dayTasks.slice(0, 3);
          const extraCount = dayTasks.length - visibleTasks.length;

          return (
            <div
              key={day.toISOString()}
              className={`flex flex-col gap-1 border-b border-r border-border p-1.5 ${inMonth ? '' : 'opacity-40'}`}
            >
              <span
                className={`self-start rounded-full px-1.5 font-mono text-xs ${
                  isToday ? 'bg-accent text-canvas' : 'text-ink-muted'
                }`}
              >
                {day.getDate()}
              </span>

              <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                {visibleTasks.map((task) => {
                  const cfg = priorityConfig(task.priority);
                  return (
                    <button
                      key={task._id}
                      onClick={() => onOpenTask(task)}
                      className={`truncate rounded px-1 py-0.5 text-left text-[11px] hover:bg-surface-hover ${
                        task.completed ? 'text-ink-muted line-through' : 'text-ink'
                      }`}
                    >
                      <span className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${cfg.bar}`} />
                      {task.title}
                    </button>
                  );
                })}
                {extraCount > 0 && <span className="px-1 text-[10px] text-ink-muted">+{extraCount} more</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
