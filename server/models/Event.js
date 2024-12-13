const mongoose = require('mongoose');
require('./User');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters']
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['conference', 'workshop', 'seminar', 'concert', 'sports', 'other'],
      message: '{VALUE} is not a valid category'
    }
  },
  imageUrl: {
    type: String,
    default: ''
  },
  maxAttendees: {
    type: Number,
    required: [true, 'Maximum attendees is required'],
    min: [1, 'Maximum attendees must be at least 1'],
    default: 100
  },
  currentAttendees: {
    type: Number,
    default: 0
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  attendees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['going', 'maybe', 'not_going'],
      default: 'going'
    },
    rsvpDate: {
      type: Date,
      default: Date.now
    }
  }],
  price: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled'],
    default: 'published'
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Virtual for checking if event is full
eventSchema.virtual('isFull').get(function() {
  return this.currentAttendees >= this.maxAttendees;
});

// Virtual for checking if event has passed
eventSchema.virtual('hasPassed').get(function() {
  return new Date() > this.date;
});

// Method to check if user can RSVP
eventSchema.methods.canRSVP = function(userId) {
  if (this.isFull) return false;
  if (this.hasPassed) return false;
  const existingRSVP = this.attendees.find(a => a.user.toString() === userId.toString());
  return !existingRSVP;
};

// Pre-save middleware to update currentAttendees
eventSchema.pre('save', function(next) {
  if (this.isModified('attendees')) {
    this.currentAttendees = this.attendees.filter(a => a.status === 'going').length;
  }
  next();
});

// Index for better query performance
eventSchema.index({ date: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ location: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ 'attendees.user': 1 });

module.exports = mongoose.model('Event', eventSchema); 