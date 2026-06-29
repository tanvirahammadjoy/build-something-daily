const User = require('../models/User');

// GET /api/users - all other users, used to populate the "start new chat" picker
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select(
      'username email avatar isOnline lastSeen'
    );
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching users', error: error.message });
  }
};

module.exports = { getAllUsers };
