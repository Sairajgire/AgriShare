const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource',
    required: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  borrowerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: [true, 'Request start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'Request end date is required']
  },
  message: {
    type: String,
    default: '',
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to help query bookings quickly
requestSchema.index({ resourceId: 1, status: 1 });
requestSchema.index({ borrowerId: 1 });
requestSchema.index({ ownerId: 1 });

module.exports = mongoose.model('Request', requestSchema);
