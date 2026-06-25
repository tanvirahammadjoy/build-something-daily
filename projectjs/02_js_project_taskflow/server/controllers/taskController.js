const Task = require('../models/Task');
const { maybeCreateNextRecurringInstance } = require('../services/recurrenceService');
const { uploadBufferToCloudinary } = require('../utils/uploadToCloudinary');
const cloudinary = require('../config/cloudinary');
const { emitToUser } = require('../realtime/socket');

const ALLOWED_UPDATE_FIELDS = ['title', 'description', 'priority', 'category', 'tags', 'dueDate', 'order'];
const ALLOWED_SORT_FIELDS = ['createdAt', 'dueDate', 'priority', 'title', 'order'];
const VALID_RECURRENCE_TYPES = ['none', 'daily', 'weekly', 'monthly', 'custom'];

// @route POST /api/tasks
const createTask = async (req, res, next) => {
  try {
    const { title, description, priority, category, tags, dueDate, subtasks } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Task title is required' });
    }

    const task = await Task.create({
      user: req.user._id,
      title: title.trim(),
      description: description ? String(description).trim() : '',
      priority: priority || 'medium',
      category: category ? String(category).trim() : 'General',
      tags: Array.isArray(tags) ? tags.map((t) => String(t).trim()).filter(Boolean) : [],
      dueDate: dueDate || null,
      subtasks: Array.isArray(subtasks)
        ? subtasks
            .map((s) => ({ title: String(s.title ?? s).trim(), completed: false }))
            .filter((s) => s.title)
        : [],
    });

    emitToUser(req.user._id, 'task:created', task);
    res.status(201).json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/tasks
// Supports: ?view=today|upcoming|overdue|completed|all
//           &category=&priority=&tag=&search=
//           &startDate=&endDate= (explicit dueDate range — used by the calendar view)
//           &sortBy=&sortOrder=asc|desc&page=&limit=
const getTasks = async (req, res, next) => {
  try {
    const {
      view,
      category,
      priority,
      tag,
      search,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 50,
    } = req.query;

    const query = { user: req.user._id };

    if (startDate || endDate) {
      // An explicit range (e.g. "give me this whole month") takes priority
      // over view's relative date logic. `view` can still narrow by
      // completion status within that range (e.g. view=completed), but
      // unlike the branches below, a plain/missing view here does NOT
      // default to "incomplete only" — the calendar wants both.
      query.dueDate = {};
      if (startDate) query.dueDate.$gte = new Date(startDate);
      if (endDate) query.dueDate.$lte = new Date(endDate);
      if (view === 'completed') query.completed = true;
      else if (view && view !== 'all') query.completed = false;
    } else if (view === 'completed') {
      query.completed = true;
    } else if (view === 'today') {
      query.completed = false;
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      query.dueDate = { $gte: startOfDay, $lte: endOfDay };
    } else if (view === 'upcoming') {
      query.completed = false;
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);
      query.dueDate = { $gt: endOfToday };
    } else if (view === 'overdue') {
      query.completed = false;
      query.dueDate = { $lt: new Date() };
    }
    // view === 'all' or unspecified -> no completed/dueDate filter

    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (tag) query.tags = tag;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const sortField = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);

    const [tasks, total] = await Promise.all([
      Task.find(query)
        .sort({ [sortField]: sortDirection })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Task.countDocuments(query),
    ]);

    res.json({
      success: true,
      tasks,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) || 1 },
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/tasks/categories
const getCategories = async (req, res, next) => {
  try {
    const categories = await Task.distinct('category', { user: req.user._id });
    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

const PRIORITY_KEYS = ['low', 'medium', 'high', 'urgent'];

// @route GET /api/tasks/stats
const getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // Pulled once and reduced in JS rather than a DB-side aggregation
    // pipeline — a single user's task list is small, and it's far easier
    // to test this logic deterministically than a Mongo aggregate().
    const [activeTasks, completedTasks] = await Promise.all([
      Task.find({ user: userId, completed: false }),
      Task.find({ user: userId, completed: true }),
    ]);

    const overdueCount = activeTasks.filter((t) => t.dueDate && t.dueDate < startOfToday).length;
    const dueTodayCount = activeTasks.filter(
      (t) => t.dueDate && t.dueDate >= startOfToday && t.dueDate <= endOfToday
    ).length;
    const completedTodayCount = completedTasks.filter(
      (t) => t.completedAt && t.completedAt >= startOfToday && t.completedAt <= endOfToday
    ).length;

    const byPriority = { low: 0, medium: 0, high: 0, urgent: 0 };
    activeTasks.forEach((t) => {
      if (PRIORITY_KEYS.includes(t.priority)) byPriority[t.priority] += 1;
    });

    const byCategoryMap = {};
    activeTasks.forEach((t) => {
      byCategoryMap[t.category] = (byCategoryMap[t.category] || 0) + 1;
    });
    const byCategory = Object.entries(byCategoryMap)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    // Completions per day for the last 7 days (including today)
    const completedPerDay = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(startOfToday);
      dayStart.setDate(dayStart.getDate() - i);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);
      const count = completedTasks.filter(
        (t) => t.completedAt && t.completedAt >= dayStart && t.completedAt <= dayEnd
      ).length;
      completedPerDay.push({ date: dayStart.toISOString().slice(0, 10), count });
    }

    res.json({
      success: true,
      stats: {
        totalActive: activeTasks.length,
        totalCompleted: completedTasks.length,
        overdueCount,
        dueTodayCount,
        completedTodayCount,
        byPriority,
        byCategory,
        completedPerDay,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/tasks/:id
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

// @route PATCH /api/tasks/:id
// Whitelisted fields only — completion has its own endpoint below so
// completedAt stays consistent, and `user`/`_id` can never be reassigned.
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    for (const field of ALLOWED_UPDATE_FIELDS) {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    }

    if (typeof task.title === 'string') task.title = task.title.trim();
    if (!task.title) {
      return res.status(400).json({ success: false, message: 'Task title cannot be empty' });
    }

    await task.save();
    emitToUser(req.user._id, 'task:updated', task);
    res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    emitToUser(req.user._id, 'task:deleted', { _id: task._id });
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};

// @route PATCH /api/tasks/:id/complete
const toggleComplete = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const wasIncomplete = !task.completed;
    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date() : null;
    await task.save();
    emitToUser(req.user._id, 'task:updated', task);

    // Only generate the next occurrence going incomplete -> complete, never
    // on the reverse toggle (un-completing shouldn't delete or duplicate
    // whatever instance already got created the first time around).
    let nextInstance = null;
    if (wasIncomplete && task.completed) {
      nextInstance = await maybeCreateNextRecurringInstance(Task, task);
      if (nextInstance) {
        emitToUser(req.user._id, 'task:created', nextInstance);
      }
    }

    res.json({ success: true, task, nextInstance });
  } catch (error) {
    next(error);
  }
};

// @route PATCH /api/tasks/:id/recurrence
// Recurrence has its own endpoint (rather than going through the generic
// updateTask whitelist) because it's a nested shape that needs real
// validation, not just a pass-through field assignment.
const updateRecurrence = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const { type = 'none', interval = 1, daysOfWeek = [], endDate = null } = req.body;

    if (!VALID_RECURRENCE_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Recurrence type must be one of: ${VALID_RECURRENCE_TYPES.join(', ')}`,
      });
    }
    if (!Number.isInteger(interval) || interval < 1) {
      return res.status(400).json({ success: false, message: 'Interval must be a positive integer' });
    }
    if (daysOfWeek !== undefined) {
      if (
        !Array.isArray(daysOfWeek) ||
        !daysOfWeek.every((d) => Number.isInteger(d) && d >= 0 && d <= 6)
      ) {
        return res.status(400).json({ success: false, message: 'daysOfWeek must be integers between 0 and 6' });
      }
    }
    if (type === 'custom' && (!daysOfWeek || daysOfWeek.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Custom recurrence requires at least one day of the week',
      });
    }
    if (endDate && Number.isNaN(new Date(endDate).getTime())) {
      return res.status(400).json({ success: false, message: 'endDate is not a valid date' });
    }

    task.recurrence = { type, interval, daysOfWeek, endDate: endDate || null };
    await task.save();
    emitToUser(req.user._id, 'task:updated', task);
    res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/tasks/:id/subtasks
const addSubtask = async (req, res, next) => {
  try {
    const { title } = req.body;
    if (!title || !String(title).trim()) {
      return res.status(400).json({ success: false, message: 'Subtask title is required' });
    }

    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task.subtasks.push({ title: String(title).trim(), completed: false });
    await task.save();
    emitToUser(req.user._id, 'task:updated', task);
    res.status(201).json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

// @route PATCH /api/tasks/:id/subtasks/:subtaskId
const updateSubtask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const subtask = task.subtasks.id(req.params.subtaskId);
    if (!subtask) {
      return res.status(404).json({ success: false, message: 'Subtask not found' });
    }

    if (req.body.title !== undefined) {
      const trimmed = String(req.body.title).trim();
      if (!trimmed) {
        return res.status(400).json({ success: false, message: 'Subtask title cannot be empty' });
      }
      subtask.title = trimmed;
    }
    if (req.body.completed !== undefined) {
      subtask.completed = !!req.body.completed;
    }

    await task.save();
    emitToUser(req.user._id, 'task:updated', task);
    res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/tasks/:id/subtasks/:subtaskId
const deleteSubtask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const subtask = task.subtasks.id(req.params.subtaskId);
    if (!subtask) {
      return res.status(404).json({ success: false, message: 'Subtask not found' });
    }

    // Mongoose 7+ removed subdocument.remove() — deleteOne() is the current API
    subtask.deleteOne();
    await task.save();
    emitToUser(req.user._id, 'task:updated', task);
    res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/tasks/:id/attachments  (multipart/form-data, field name "file")
const uploadAttachment = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder: `taskflow/${req.user._id}/${task._id}`,
      resource_type: 'auto', // let Cloudinary decide image/video/raw
    });

    task.attachments.push({
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type, // must match this exactly to delete later
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
    });
    await task.save();
    emitToUser(req.user._id, 'task:updated', task);
    res.status(201).json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/tasks/:id/attachments/:attachmentId
const deleteAttachment = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const attachment = task.attachments.id(req.params.attachmentId);
    if (!attachment) {
      return res.status(404).json({ success: false, message: 'Attachment not found' });
    }

    // Best-effort remote cleanup. If Cloudinary's delete fails (e.g. the
    // file was already removed there), we still drop our own reference
    // rather than leaving the user stuck with an attachment they can't remove.
    try {
      await cloudinary.uploader.destroy(attachment.publicId, {
        resource_type: attachment.resourceType || 'image',
      });
    } catch (cloudErr) {
      console.error('Cloudinary destroy failed:', cloudErr.message);
    }

    attachment.deleteOne();
    await task.save();
    emitToUser(req.user._id, 'task:updated', task);

    res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  getCategories,
  getStats,
  getTaskById,
  updateTask,
  deleteTask,
  toggleComplete,
  updateRecurrence,
  addSubtask,
  updateSubtask,
  deleteSubtask,
  uploadAttachment,
  deleteAttachment,
};
