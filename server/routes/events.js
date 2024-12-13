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

    // Search by title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by location
    if (location) {
      query.location = location;
    }

    // Filter by date
    if (date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      switch (date) {
        case 'today':
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          query.date = { $gte: today, $lt: tomorrow };
          break;
        case 'tomorrow':
          const tomorrowStart = new Date(today);
          tomorrowStart.setDate(tomorrowStart.getDate() + 1);
          const dayAfterTomorrow = new Date(today);
          dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
          query.date = { $gte: tomorrowStart, $lt: dayAfterTomorrow };
          break;
        case 'this-week':
          const weekEnd = new Date(today);
          weekEnd.setDate(weekEnd.getDate() + 7);
          query.date = { $gte: today, $lt: weekEnd };
          break;
        case 'this-month':
          const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          query.date = { $gte: today, $lt: monthEnd };
          break;
      }
    }

    // Filter by price
    if (price === 'free') {
      query.price = 0;
    } else if (price === 'paid') {
      query.price = { $gt: 0 };
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

module.exports = router; 