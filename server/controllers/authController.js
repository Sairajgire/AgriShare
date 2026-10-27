const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT token helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecret_agrishare_jwt_token_key_2026', {
    expiresIn: '30d'
  });
};

// @desc    Register a new farmer
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, village, district, state, landholdingSize, farmingType } = req.body;

    if (!name || !email || !password || !phone || !village || !district) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password, phone, village, and district'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists'
      });
    }

    // Strict security rule: Force role to 'farmer', prevent self-registration as admin
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      village,
      district,
      state: state || 'Maharashtra',
      landholdingSize: landholdingSize || '1-3 Acres',
      farmingType: farmingType || 'Mixed Farming',
      role: 'farmer'
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to AgriShare.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        village: user.village,
        district: user.district,
        state: user.state,
        landholdingSize: user.landholdingSize,
        farmingType: user.farmingType,
        role: user.role
      }
    });
  } catch (error) {
    console.error('[Register Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration'
    });
  }
};

// @desc    Authenticate farmer or admin & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        village: user.village,
        district: user.district,
        state: user.state,
        landholdingSize: user.landholdingSize,
        farmingType: user.farmingType,
        role: user.role
      }
    });
  } catch (error) {
    console.error('[Login Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during login'
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching user profile'
    });
  }
};

// @desc    Update farmer profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, phone, village, district, state, landholdingSize, farmingType } = req.body;
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (village) user.village = village;
    if (district) user.district = district;
    if (state) user.state = state;
    if (landholdingSize) user.landholdingSize = landholdingSize;
    if (farmingType) user.farmingType = farmingType;

    const updatedUser = await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        village: updatedUser.village,
        district: updatedUser.district,
        state: updatedUser.state,
        landholdingSize: updatedUser.landholdingSize,
        farmingType: updatedUser.farmingType,
        role: updatedUser.role
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating profile'
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile
};
