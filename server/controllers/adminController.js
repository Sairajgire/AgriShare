const User = require('../models/User');
const Resource = require('../models/Resource');
const Request = require('../models/Request');
const Review = require('../models/Review');

// @desc    Get Admin summary stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
const getAdminDashboardStats = async (req, res) => {
  try {
    const totalFarmers = await User.countDocuments({ role: 'farmer' });
    const totalResources = await Resource.countDocuments();
    const activeListings = await Resource.countDocuments({ status: 'Available', approvalStatus: 'Approved' });
    const pendingListings = await Resource.countDocuments({ approvalStatus: 'Pending' });
    const totalRequests = await Request.countDocuments();
    const completedRequests = await Request.countDocuments({ status: 'Completed' });
    const approvedRequests = await Request.countDocuments({ status: 'Approved' });

    // Distinct villages connected
    const villages = await User.distinct('village');

    return res.status(200).json({
      success: true,
      stats: {
        totalFarmers,
        totalResources,
        activeListings,
        pendingListings,
        totalRequests,
        completedRequests,
        approvedRequests,
        villagesConnected: villages.length
      }
    });
  } catch (error) {
    console.error('[Admin Dashboard Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching admin dashboard statistics'
    });
  }
};

// @desc    Get all registered users for management
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching users'
    });
  }
};

// @desc    Get all resources for moderation
// @route   GET /api/admin/resources
// @access  Private (Admin only)
const getAllResources = async (req, res) => {
  try {
    const resources = await Resource.find()
      .populate('ownerId', 'name email phone village district')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: resources.length,
      resources
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching resources'
    });
  }
};

// @desc    Approve or Reject resource listing
// @route   PUT /api/admin/resources/:id/approval
// @access  Private (Admin only)
const updateResourceApproval = async (req, res) => {
  try {
    const { approvalStatus } = req.body;
    if (!['Approved', 'Pending', 'Rejected'].includes(approvalStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid approval status'
      });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    resource.approvalStatus = approvalStatus;
    await resource.save();

    return res.status(200).json({
      success: true,
      message: `Resource listing status updated to ${approvalStatus}`,
      resource
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating resource approval'
    });
  }
};

// @desc    Delete user account (Admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin' && user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own admin account' });
    }

    // Cascade delete resources and requests
    await Resource.deleteMany({ ownerId: user._id });
    await Request.deleteMany({ $or: [{ borrowerId: user._id }, { ownerId: user._id }] });
    await user.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Farmer account and associated listings removed successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error deleting user'
    });
  }
};

module.exports = {
  getAdminDashboardStats,
  getAllUsers,
  getAllResources,
  updateResourceApproval,
  deleteUser
};
