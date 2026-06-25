import TaskRow from './TaskRow';
import EmptyState from './EmptyState';
import ErrorState from '../ui/ErrorState';

export default function TaskList({ tasks, isLoading, isError, onRetry, onOpenTask }) {
  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center font-mono text-sm text-ink-muted">
        Loading tasks…
      </div>
    );
  }

  if (isError) {
    return <ErrorState message="Couldn't load your tasks." onRetry={onRetry} />;
  }

  if (!tasks || tasks.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {tasks.map((task) => (
        <TaskRow key={task._id} task={task} onOpen={onOpenTask} />
      ))}
    </div>
  );
}
