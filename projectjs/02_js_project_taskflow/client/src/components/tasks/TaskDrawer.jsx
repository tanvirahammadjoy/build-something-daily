import { useEffect, useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Checkbox from '../ui/Checkbox';
import RecurrencePicker from './RecurrencePicker';
import AttachmentList from './AttachmentList';
import {
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useAddSubtask,
  useUpdateSubtask,
  useDeleteSubtask,
  useUpdateRecurrence,
} from '../../hooks/useTasks';

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const DEFAULT_RECURRENCE = { type: 'none', interval: 1, daysOfWeek: [], endDate: null };

export default function TaskDrawer({ task, onClose }) {
  const isEditing = !!task;

  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState(task?.priority || 'medium');
  const [category, setCategory] = useState(task?.category || 'General');
  const [dueDate, setDueDate] = useState(task?.dueDate ? task.dueDate.slice(0, 10) : '');
  const [recurrence, setRecurrence] = useState(
    task?.recurrence ? { ...DEFAULT_RECURRENCE, ...task.recurrence, endDate: task.recurrence.endDate?.slice(0, 10) || null } : DEFAULT_RECURRENCE
  );
  const [newSubtask, setNewSubtask] = useState('');
  const [titleError, setTitleError] = useState('');

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const addSubtask = useAddSubtask();
  const updateSubtask = useUpdateSubtask();
  const deleteSubtask = useDeleteSubtask();
  const updateRecurrence = useUpdateRecurrence();

  useEffect(() => {
    setTitle(task?.title || '');
    setDescription(task?.description || '');
    setPriority(task?.priority || 'medium');
    setCategory(task?.category || 'General');
    setDueDate(task?.dueDate ? task.dueDate.slice(0, 10) : '');
    setRecurrence(
      task?.recurrence
        ? { ...DEFAULT_RECURRENCE, ...task.recurrence, endDate: task.recurrence.endDate?.slice(0, 10) || null }
        : DEFAULT_RECURRENCE
    );
    setTitleError('');
  }, [task]);

  const handleSave = () => {
    if (!title.trim()) {
      setTitleError('Title is required');
      return;
    }
    const payload = { title, description, priority, category, dueDate: dueDate || null };

    if (isEditing) {
      updateTask.mutate({ id: task._id, ...payload });
      // Only push a recurrence update if it actually differs from what's
      // already saved, so editing unrelated fields doesn't spam the endpoint.
      const current = task.recurrence || DEFAULT_RECURRENCE;
      const changed =
        recurrence.type !== current.type ||
        recurrence.interval !== current.interval ||
        recurrence.endDate !== (current.endDate?.slice(0, 10) || null) ||
        JSON.stringify([...recurrence.daysOfWeek].sort()) !== JSON.stringify([...(current.daysOfWeek || [])].sort());
      if (changed) {
        updateRecurrence.mutate({ taskId: task._id, ...recurrence });
      }
    } else {
      createTask.mutate(payload, { onSuccess: onClose });
    }
  };

  const handleDelete = () => {
    if (!task) return;
    deleteTask.mutate(task._id, { onSuccess: onClose });
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim() || !task) return;
    addSubtask.mutate({ taskId: task._id, title: newSubtask.trim() });
    setNewSubtask('');
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-border bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-base font-semibold text-ink">
            {isEditing ? 'Edit task' : 'New task'}
          </h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink" aria-label="Close">
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <Input
            label="Title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setTitleError('');
            }}
            error={titleError}
            placeholder="What needs doing?"
            autoFocus
          />

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-muted">
              Notes
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Add detail (optional)"
              className="w-full rounded-md border border-border bg-canvas px-3 py-2 text-sm text-ink placeholder:text-ink-muted/60 focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-muted">
                Priority
              </span>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-md border border-border bg-canvas px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p[0].toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
            </label>

            <Input label="Due date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>

          <Input label="Category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="General" />

          {isEditing && (
            <div>
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-muted">
                Subtasks
              </span>
              <div className="space-y-1.5">
                {task.subtasks?.map((s) => (
                  <div key={s._id} className="flex items-center gap-2">
                    <Checkbox
                      size="sm"
                      checked={s.completed}
                      onChange={(checked) =>
                        updateSubtask.mutate({ taskId: task._id, subtaskId: s._id, completed: checked })
                      }
                    />
                    <span className={`flex-1 text-sm text-ink ${s.completed ? 'text-ink-muted line-through' : ''}`}>
                      {s.title}
                    </span>
                    <button
                      onClick={() => deleteSubtask.mutate({ taskId: task._id, subtaskId: s._id })}
                      className="text-xs text-ink-muted hover:text-brick"
                      aria-label="Remove subtask"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                  placeholder="Add a subtask"
                  className="flex-1 rounded-md border border-border bg-canvas px-3 py-1.5 text-sm text-ink placeholder:text-ink-muted/60 focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <Button variant="ghost" onClick={handleAddSubtask}>
                  Add
                </Button>
              </div>
            </div>
          )}

          {isEditing && <RecurrencePicker value={recurrence} onChange={setRecurrence} />}

          {isEditing && <AttachmentList task={task} />}
        </div>

        <div className="flex items-center justify-between border-t border-border px-5 py-4">
          {isEditing ? <Button variant="danger" onClick={handleDelete}>Delete</Button> : <span />}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>{isEditing ? 'Save changes' : 'Create task'}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
