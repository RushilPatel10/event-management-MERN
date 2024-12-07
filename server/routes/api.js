const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const eventController = require('../controllers/eventController');

// Public routes
router.get('/events', eventController.getEvents);
router.get('/events/:id', eventController.getEventById);

// Protected routes
router.use(auth);
router.post('/events', eventController.createEvent);
router.put('/events/:id', eventController.updateEvent);
router.delete('/events/:id', eventController.deleteEvent);
router.post('/events/:id/rsvp', eventController.rsvpToEvent);
router.delete('/events/:id/rsvp', eventController.cancelRSVP);

module.exports = router; 