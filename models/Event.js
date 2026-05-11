const mongoose = require('mongoose');

const PLACEHOLDER_IMAGE =
  'https://placehold.co/600x400/4F46E5/ffffff?text=EventFlow';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: [10, 'Description must be at least 10 characters']
    },
    category: {
      type: String,
      enum: ['Conference', 'Workshop', 'Festival', 'Private', 'Other'],
      required: [true, 'Category is required']
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      validate: {
        // Future-date check is only enforced on creation, not on edits of past events.
        validator: function (value) {
          if (!this.isNew) return true;
          return value && value.getTime() > Date.now();
        },
        message: 'Event date must be in the future'
      }
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1']
    },
    ticketsBooked: {
      type: Number,
      default: 0,
      min: 0
    },
    price: {
      type: Number,
      default: 0,
      min: [0, 'Price cannot be negative']
    },
    imageUrl: {
      type: String,
      default: PLACEHOLDER_IMAGE,
      trim: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

eventSchema.virtual('ticketsAvailable').get(function () {
  return Math.max(0, this.capacity - this.ticketsBooked);
});

eventSchema.virtual('isSoldOut').get(function () {
  return this.ticketsBooked >= this.capacity;
});

eventSchema.virtual('isPast').get(function () {
  return this.date && this.date.getTime() < Date.now();
});

module.exports = mongoose.model('Event', eventSchema);
