const cron = require('node-cron');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const { emitToUser } = require('../realtime/socket');
const sendEmail = require('../utils/sendEmail');

const DUE_SOON_WINDOW_MS = 60 * 60 * 1000; // tasks due within the next hour

// Creates a notification only if one of this exact type doesn't already
// exist for this task — without this, a still-overdue task would get a
// fresh "overdue" notification every single time the job runs.
async function createNotificationIfNew({ userId, taskId, type, message }) {
  const existing = await Notification.findOne({ user: userId, task: taskId, type });
  if (existing) return null;

  const notification = await Notification.create({
    user: userId,
    task: taskId,
    type,
    message,
    channel: 'in_app',
    sentAt: new Date(),
  });

  emitToUser(userId, 'notification:new', notification);
  return notification;
}

async function notifyForTask(task, type, message) {
  const notification = await createNotificationIfNew({
    userId: task.user._id,
    taskId: task._id,
    type,
    message,
  });

  if (notification && task.user.preferences?.emailRemindersEnabled) {
    await sendEmail({
      to: task.user.email,
      subject: message,
      text: `Hi ${task.user.name}, ${message.toLowerCase()}. Due: ${
        task.dueDate ? task.dueDate.toLocaleString() : 'no due date'
      }.`,
    });
  }

  return notification;
}

async function checkDueSoonAndOverdue() {
  const now = new Date();
  const soonThreshold = new Date(now.getTime() + DUE_SOON_WINDOW_MS);

  const dueSoonTasks = await Task.find({
    completed: false,
    dueDate: { $ne: null, $gte: now, $lte: soonThreshold },
  }).populate('user', 'email name preferences');

  const overdueTasks = await Task.find({
    completed: false,
    // $ne: null matters here: in MongoDB's BSON ordering, null sorts BEFORE
    // any real Date, so a bare { $lt: now } would also match every task
    // that has no due date at all — silently flagging them all as overdue.
    dueDate: { $ne: null, $lt: now },
  }).populate('user', 'email name preferences');

  const created = [];

  for (const task of dueSoonTasks) {
    if (!task.user) continue; // user account was deleted; nothing to notify
    const n = await notifyForTask(task, 'due_soon', `"${task.title}" is due soon`);
    if (n) created.push(n);
  }

  for (const task of overdueTasks) {
    if (!task.user) continue;
    const n = await notifyForTask(task, 'overdue', `"${task.title}" is overdue`);
    if (n) created.push(n);
  }

  return created;
}

function startNotificationScheduler() {
  cron.schedule('*/15 * * * *', () => {
    checkDueSoonAndOverdue().catch((err) => {
      console.error('Notification scheduler error:', err.message);
    });
  });
}

module.exports = { startNotificationScheduler, checkDueSoonAndOverdue, createNotificationIfNew };
