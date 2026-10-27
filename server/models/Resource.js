const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  resourceName: {
    type: String,
    required: [true, 'Resource name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Agricultural Machinery',
      'Tractors',
      'Harvesters',
      'Seed Drills',
      'Cultivators',
      'Irrigation Equipment',
      'Sprayers',
      'Farming Tools',
      'Seeds',
      'Fertilizers',
      'Storage Facilities',
      'Transport',
      'Other'
    ]
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  imageUrl: {
    type: String,
    default: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80'
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  village: {
    type: String,
    required: [true, 'Village is required'],
    trim: true
  },
  district: {
    type: String,
    required: [true, 'District is required'],
    trim: true
  },
  sharingType: {
    type: String,
    required: [true, 'Sharing type is required'],
    enum: ['Free Sharing', 'Barter Exchange', 'Nominal Rental']
  },
  price: {
    type: Number,
    default: 0
  },
  barterRequirements: {
    type: String,
    default: '',
    trim: true
  },
  availableFrom: {
    type: Date,
    required: [true, 'Availability start date is required']
  },
  availableTo: {
    type: Date,
    required: [true, 'Availability end date is required']
  },
  status: {
    type: String,
    enum: ['Available', 'Booked', 'Under Maintenance', 'Inactive'],
    default: 'Available'
  },
  approvalStatus: {
    type: String,
    enum: ['Approved', 'Pending', 'Rejected'],
    default: 'Approved'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for search optimization
resourceSchema.index({ resourceName: 'text', description: 'text', village: 'text', district: 'text' });

module.exports = mongoose.model('Resource', resourceSchema);
