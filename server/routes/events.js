const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
  getEvents, 
  createEvent, 
  getEventById, 
  updateEvent, 
  deleteEvent,
  rsvpToEvent 
} = require('../controllers/eventController');

// Public routes
router.get('/', getEvents);
router.get('/:id', getEventById);

// Protected routes
router.post('/', auth, createEvent);
router.put('/:id', auth, updateEvent);
router.delete('/:id', auth, deleteEvent);
router.post('/:id/rsvp', auth, rsvpToEvent);

module.exports = router; 