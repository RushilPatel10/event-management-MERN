const Event = require('../models/Event');

exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('creator', 'name')
      .sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const newEvent = new Event({
      ...req.body,
      creator: req.userId,
      attendees: [req.userId] // Creator automatically attends
    });

    await newEvent.save();
    
    const populatedEvent = await Event.findById(newEvent._id)
      .populate('creator', 'name')
      .populate('attendees', 'name');

    res.status(201).json(populatedEvent);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Failed to create event' });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('creator', 'name')
      .populate('attendees', 'name');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the creator
    if (event.creator.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to edit this event' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    ).populate('creator', 'name')
      .populate('attendees', 'name');

    res.json(updatedEvent);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Failed to update event' });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (event.creator.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await event.remove();
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.rsvpToEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event is full
    if (event.attendees.length >= event.maxAttendees) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // Check if user is already registered
    if (event.attendees.includes(req.userId)) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    event.attendees.push(req.userId);
    await event.save();

    const updatedEvent = await Event.findById(req.params.id)
      .populate('creator', 'name')
      .populate('attendees', 'name');

    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.cancelRSVP = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.attendees = event.attendees.filter(
      attendee => attendee.toString() !== req.userId
    );
    await event.save();

    const updatedEvent = await Event.findById(req.params.id)
      .populate('creator', 'name')
      .populate('attendees', 'name');

    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}; 