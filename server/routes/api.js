const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const eventController = require('../controllers/eventController');

// Public routes
router.get('/events', eventController.getEvents);

// Protected routes - require authentication
router.use(auth); // Apply auth middleware to all routes below this

router.get('/events/created', eventController.getCreatedEvents);
router.get('/events/attending', eventController.getAttendingEvents);
router.post('/events', eventController.createEvent);
router.put('/events/:id', eventController.updateEvent);
router.delete('/events/:id', eventController.deleteEvent);
router.post('/events/:id/rsvp', eventController.rsvpEvent);

module.exports = router; 