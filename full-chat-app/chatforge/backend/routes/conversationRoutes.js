const express = require('express');
const { createConversation, getMyConversations } = require('../controllers/conversationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // every conversation route requires a logged-in user

router.post('/', createConversation);
router.get('/', getMyConversations);

module.exports = router;
