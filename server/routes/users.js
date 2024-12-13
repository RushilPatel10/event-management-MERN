const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Event = require('../models/Event');
const auth = require('../middleware/auth');

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { username, email, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If changing password, verify current password
    if (newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      user.password = await bcrypt.hash(newPassword, 12);
    }

    // Update other fields
    user.username = username || user.username;
    user.email = email || user.email;

    await user.save();
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email or username already exists' });
    }
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Delete user account
router.delete('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user's events
    await Event.deleteMany({ creator: req.userId });
    
    // Remove user's RSVPs from events
    await Event.updateMany(
      { 'attendees.user': req.userId },
      { $pull: { attendees: { user: req.userId } } }
    );

    // Delete user
    await user.remove();
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting account' });
  }
});

// Get user's created events
router.get('/events/created', auth, async (req, res) => {
  try {
    const events = await Event.find({ creator: req.userId })
      .sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events' });
  }
});

// Get user's attending events
router.get('/events/attending', auth, async (req, res) => {
  try {
    const events = await Event.find({
      'attendees.user': req.userId,
      'attendees.status': 'going'
    }).sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events' });
  }
});

module.exports = router; 