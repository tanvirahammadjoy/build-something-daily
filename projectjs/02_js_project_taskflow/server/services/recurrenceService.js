const { getNextOccurrence } = require('../utils/recurrence');
const Notification = require('../models/Notification');
const { emitToUser } = require('../realtime/socket');

// Called right after a task transitions from incomplete -> complete.
// Creates the next instance in the series if the task recurs and the
// computed next date doesn't run past recurrence.endDate.
//
// `Task` is passed in (rather than required at the top of this file) so it
// can be swapped out for a fake model in tests without touching real Mongo.
async function maybeCreateNextRecurringInstance(Task, completedTask) {
  const { recurrence } = completedTask;
  if (!recurrence || recurrence.type === 'none') return null;

  const baseDate = completedTask.dueDate || completedTask.completedAt || new Date();
  const nextDue = getNextOccurrence(baseDate, recurrence);
  if (!nextDue) return null; // invalid/incomplete recurrence rule

  if (recurrence.endDate && nextDue > new Date(recurrence.endDate)) {
    return null; // series has ended
  }

  // Keep a flat reference to the series' original task, not a deep chain —
  // if this completed task is itself an instance, point the new one at the
  // SAME root rather than at this instance.
  const rootId = completedTask.isRecurringInstance ? completedTask.parentTask : completedTask._id;

  const nextTask = await Task.create({
    user: completedTask.user,
    title: completedTask.title,
    description: completedTask.description,
    priority: completedTask.priority,
    category: completedTask.category,
    tags: completedTask.tags,
    dueDate: nextDue,
    // Fresh, uncompleted copies — a recurring task's checklist resets each cycle.
    subtasks: (completedTask.subtasks || []).map((s) => ({ title: s.title, completed: false })),
    recurrence: completedTask.recurrence,
    isRecurringInstance: true,
    parentTask: rootId,
  });

  // Best-effort: a failure here shouldn't undo the task that was already
  // created above, so it's isolated in its own try/catch.
  try {
    const notification = await Notification.create({
      user: completedTask.user,
      task: nextTask._id,
      type: 'recurring_created',
      message: `"${nextTask.title}" was created for ${nextDue.toLocaleDateString()}`,
      channel: 'in_app',
      sentAt: new Date(),
    });
    emitToUser(completedTask.user, 'notification:new', notification);
  } catch (err) {
    console.error('Failed to create recurring-instance notification:', err.message);
  }

  return nextTask;
}

module.exports = { maybeCreateNextRecurringInstance };
