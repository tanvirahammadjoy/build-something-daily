import Checkbox from '../ui/Checkbox';
import PriorityBadge, { priorityConfig } from './PriorityBadge';
import { useToggleComplete } from '../../hooks/useTasks';

function formatDueDate(dueDate) {
  if (!dueDate) return null;
  const date = new Date(dueDate);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return 'Today';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function TaskRow({ task, onOpen }) {
  const toggleComplete = useToggleComplete();
  const cfg = priorityConfig(task.priority);
  const dueLabel = formatDueDate(task.dueDate);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < startOfToday;
  const subtaskTotal = task.subtasks?.length || 0;
  const subtaskDone = task.subtasks?.filter((s) => s.completed).length || 0;
  const isRecurring = task.recurrence && task.recurrence.type !== 'none';
  const attachmentCount = task.attachments?.length || 0;

  return (
    <div
      className={`group flex items-center gap-3 border-b border-border py-3 pr-4 transition-colors hover:bg-surface-hover ${
        task.completed ? 'opacity-50' : ''
      }`}
    >
      <span className={`h-8 w-[3px] flex-shrink-0 rounded-full ${cfg.bar}`} />

      <div className="flex flex-1 items-center gap-3 cursor-pointer" onClick={() => onOpen(task)}>
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox checked={task.completed} onChange={() => toggleComplete.mutate(task._id)} />
        </div>

        <div className="min-w-0 flex-1">
          <p className={`truncate text-sm text-ink ${task.completed ? 'line-through' : ''}`}>{task.title}</p>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-ink-muted">
            <PriorityBadge priority={task.priority} />
            <span className="text-border">·</span>
            <span className="truncate">{task.category}</span>
            {subtaskTotal > 0 && (
              <>
                <span className="text-border">·</span>
                <span className="font-mono">
                  {subtaskDone}/{subtaskTotal}
                </span>
              </>
            )}
            {isRecurring && (
              <>
                <span className="text-border">·</span>
                <span title={`Repeats ${task.recurrence.type}`}>↻</span>
              </>
            )}
            {attachmentCount > 0 && (
              <>
                <span className="text-border">·</span>
                <span className="font-mono">📎{attachmentCount}</span>
              </>
            )}
          </div>
        </div>

        {dueLabel && (
          <span className={`flex-shrink-0 font-mono text-xs ${isOverdue ? 'text-brick' : 'text-ink-muted'}`}>
            {dueLabel}
          </span>
        )}
      </div>
    </div>
  );
}
