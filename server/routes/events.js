const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');

// GET all events
router.get('/', async (req, res) => {
  try {
    const { search, category, location, date, price } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const events = await Event.find(query)
      .populate('creator', 'username email')
      .sort({ date: 1 });

    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Error fetching events' });
  }
});

// POST new event
router.post('/', auth, async (req, res) => {
  try {
    console.log('Creating event with data:', req.body);
    console.log('User ID from auth:', req.userId);

    const event = new Event({
      ...req.body,
      creator: req.userId // Use the authenticated user's ID
    });

    const savedEvent = await event.save();
    await savedEvent.populate('creator', 'username email');
    
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error('Event creation error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: Object.values(error.errors)
          .map(err => err.message)
          .join(', ')
      });
    }
    
    res.status(500).json({ message: 'Error creating event' });
  }
});

// Get event details
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('creator', 'username email')
      .populate('attendees.user', 'username email');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Error fetching event details' });
  }
});

// RSVP to event
router.post('/:id/rsvp', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Remove existing RSVP if any
    const existingRSVPIndex = event.attendees.findIndex(
      a => a.user.toString() === req.userId.toString()
    );

    if (existingRSVPIndex > -1) {
      event.attendees.splice(existingRSVPIndex, 1);
    }

    // Add new RSVP if not "not_going"
    if (status !== 'not_going') {
      // Check if event is full for "going" status
      if (status === 'going' && event.currentAttendees >= event.maxAttendees) {
        return res.status(400).json({ message: 'Event is full' });
      }

      event.attendees.push({
        user: req.userId,
        status,
        rsvpDate: new Date()
      });
    }

    // Update currentAttendees count
    event.currentAttendees = event.attendees.filter(a => a.status === 'going').length;

    await event.save();

    // Create notification for event creator
    if (status === 'going' && event.creator.toString() !== req.userId.toString()) {
      const notification = new Notification({
        user: event.creator,
        event: event._id,
        type: 'rsvp_confirmation',
        message: `A new user has RSVP'd to your event: ${event.title}`
      });
      await notification.save();
    }

    res.json(event);
  } catch (error) {
    console.error('RSVP error:', error);
    res.status(500).json({ message: 'Error updating RSVP status' });
  }
});

// Get events created by user
router.get('/users/:userId/events/created', auth, async (req, res) => {
  try {
    const events = await Event.find({ creator: req.params.userId })
      .sort({ date: 'asc' })
      .populate('creator', 'username email');

    res.json(events);
  } catch (error) {
    console.error('Error fetching created events:', error);
    res.status(500).json({ message: 'Error fetching created events' });
  }
});

// Get events user is attending
router.get('/users/:userId/events/attending', auth, async (req, res) => {
  try {
    const events = await Event.find({
      'attendees.user': req.params.userId,
      'attendees.status': 'going'
    })
      .sort({ date: 'asc' })
      .populate('creator', 'username email');

    res.json(events);
  } catch (error) {
    console.error('Error fetching attending events:', error);
    res.status(500).json({ message: 'Error fetching attending events' });
  }
});

module.exports = router; 