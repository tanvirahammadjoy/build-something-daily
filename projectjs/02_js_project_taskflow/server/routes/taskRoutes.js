const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
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
} = require('../controllers/taskController');

router.use(protect); // every task route requires a logged-in user

router.get('/', getTasks);
router.post('/', createTask);
router.get('/categories', getCategories); // must come before '/:id'
router.get('/stats', getStats); // must come before '/:id'
router.get('/:id', getTaskById);
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/complete', toggleComplete);
router.patch('/:id/recurrence', updateRecurrence);
router.post('/:id/subtasks', addSubtask);
router.patch('/:id/subtasks/:subtaskId', updateSubtask);
router.delete('/:id/subtasks/:subtaskId', deleteSubtask);
router.post('/:id/attachments', upload.single('file'), uploadAttachment);
router.delete('/:id/attachments/:attachmentId', deleteAttachment);

module.exports = router;
