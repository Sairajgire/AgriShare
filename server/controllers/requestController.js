const Request = require('../models/Request');
const Resource = require('../models/Resource');

// @desc    Submit a request to borrow or rent a resource
// @route   POST /api/requests
// @access  Private (Farmer)
const createRequest = async (req, res) => {
  try {
    const { resourceId, startDate, endDate, message } = req.body;

    if (!resourceId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Resource ID, start date, and end date are required'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be after end date'
      });
    }

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'The requested resource does not exist'
      });
    }

    // Prevent requesting own resource
    if (resource.ownerId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot request your own agricultural resource'
      });
    }

    // Check availability range
    if (start < new Date(resource.availableFrom) || end > new Date(resource.availableTo)) {
      return res.status(400).json({
        success: false,
        message: `Resource is only available from ${new Date(resource.availableFrom).toLocaleDateString()} to ${new Date(resource.availableTo).toLocaleDateString()}`
      });
    }

    // Check for existing overlapping APPROVED booking
    const overlappingBooking = await Request.findOne({
      resourceId,
      status: 'Approved',
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });

    if (overlappingBooking) {
      return res.status(400).json({
        success: false,
        message: 'This resource is already booked for the selected date range. Please choose different dates.'
      });
    }

    // Check if the user already has a pending request for the same resource
    const existingPending = await Request.findOne({
      resourceId,
      borrowerId: req.user._id,
      status: 'Pending'
    });

    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending request for this resource. Please wait for the owner to respond.'
      });
    }

    const newRequest = await Request.create({
      resourceId,
      ownerId: resource.ownerId,
      borrowerId: req.user._id,
      startDate: start,
      endDate: end,
      message: message || '',
      status: 'Pending'
    });

    return res.status(201).json({
      success: true,
      message: 'Request submitted successfully! The owner will review your booking.',
      request: newRequest
    });
  } catch (error) {
    console.error('[Create Request Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error creating resource request'
    });
  }
};

// @desc    Get requests made by the current user (Borrower view)
// @route   GET /api/requests/my
// @access  Private
const getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({ borrowerId: req.user._id })
      .populate('resourceId', 'resourceName category imageUrl price sharingType village district')
      .populate('ownerId', 'name phone email village district')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching your requests'
    });
  }
};

// @desc    Get incoming requests for resources owned by current user (Owner view)
// @route   GET /api/requests/incoming
// @access  Private
const getIncomingRequests = async (req, res) => {
  try {
    const requests = await Request.find({ ownerId: req.user._id })
      .populate('resourceId', 'resourceName category price sharingType imageUrl')
      .populate('borrowerId', 'name phone email village district landholdingSize farmingType')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching incoming requests'
    });
  }
};

// @desc    Update request status (Approve or Reject by Owner, or Mark Completed)
// @route   PUT /api/requests/:id/status
// @access  Private
const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['Approved', 'Rejected', 'Completed'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Can only be Approved, Rejected, or Completed'
      });
    }

    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Only resource owner or admin can approve/reject
    if (request.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      // Completed can also be marked if borrower has it approved
      if (status === 'Completed' && request.borrowerId.toString() === req.user._id.toString()) {
        // Allow borrower to complete
      } else {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to change this request status'
        });
      }
    }

    // If approving, double-check for date clashes with other approved requests
    if (status === 'Approved') {
      const clash = await Request.findOne({
        _id: { $ne: request._id },
        resourceId: request.resourceId,
        status: 'Approved',
        $or: [
          { startDate: { $lte: request.endDate }, endDate: { $gte: request.startDate } }
        ]
      });

      if (clash) {
        return res.status(400).json({
          success: false,
          message: 'Cannot approve: another booking already exists for overlapping dates.'
        });
      }
    }

    request.status = status;
    await request.save();

    return res.status(200).json({
      success: true,
      message: `Request marked as ${status} successfully`,
      request
    });
  } catch (error) {
    console.error('[Update Status Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating request status'
    });
  }
};

// @desc    Cancel a request (by Borrower)
// @route   PUT /api/requests/:id/cancel
// @access  Private
const cancelRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Borrower or Admin can cancel
    if (request.borrowerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own requests'
      });
    }

    if (request.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Completed requests cannot be cancelled'
      });
    }

    request.status = 'Cancelled';
    await request.save();

    return res.status(200).json({
      success: true,
      message: 'Request cancelled successfully',
      request
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error cancelling request'
    });
  }
};

module.exports = {
  createRequest,
  getMyRequests,
  getIncomingRequests,
  updateRequestStatus,
  cancelRequest
};
