const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email address is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  phone: {
    type: String,
    required: [true, 'Mobile number is required'],
    trim: true
  },
  village: {
    type: String,
    required: [true, 'Village name is required'],
    trim: true
  },
  district: {
    type: String,
    required: [true, 'District is required'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    default: 'Maharashtra',
    trim: true
  },
  landholdingSize: {
    type: String,
    default: '1-3 Acres',
    trim: true
  },
  farmingType: {
    type: String,
    default: 'Mixed Farming',
    trim: true
  },
  role: {
    type: String,
    enum: ['farmer', 'admin'],
    default: 'farmer'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Password hash middleware before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to verify password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
