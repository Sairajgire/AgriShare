const Resource = require('../models/Resource');
const Review = require('../models/Review');

// @desc    Get all resources with search, filtering and sorting
// @route   GET /api/resources
// @access  Public
const getResources = async (req, res) => {
  try {
    const { search, category, village, district, sharingType, status, ownerId } = req.query;
    let query = {};

    // Filter by approval status - only show approved resources to public
    if (!ownerId) {
      query.approvalStatus = 'Approved';
    }

    if (ownerId) {
      query.ownerId = ownerId;
    }

    if (status) {
      query.status = status;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (sharingType && sharingType !== 'All') {
      query.sharingType = sharingType;
    }

    if (village) {
      query.village = { $regex: village, $options: 'i' };
    }

    if (district && district !== 'All') {
      query.district = { $regex: district, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { resourceName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { village: { $regex: search, $options: 'i' } },
        { district: { $regex: search, $options: 'i' } }
      ];
    }

    const resources = await Resource.find(query)
      .populate('ownerId', 'name phone village district farmingType')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: resources.length,
      resources
    });
  } catch (error) {
    console.error('[Get Resources Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching resources'
    });
  }
};

// @desc    Get single resource by ID with owner and reviews
// @route   GET /api/resources/:id
// @access  Public
const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('ownerId', 'name email phone village district state farmingType');

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Fetch reviews for this resource
    const reviews = await Review.find({ resourceId: req.params.id })
      .populate('reviewerId', 'name village district')
      .sort({ createdAt: -1 });

    // Calculate average rating
    const avgRating = reviews.length > 0 
      ? (reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length).toFixed(1)
      : null;

    return res.status(200).json({
      success: true,
      resource,
      reviews,
      avgRating
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching resource details'
    });
  }
};

// @desc    Create a new agricultural resource
// @route   POST /api/resources
// @access  Private (Farmer)
const createResource = async (req, res) => {
  try {
    const {
      resourceName,
      category,
      description,
      imageUrl,
      village,
      district,
      sharingType,
      price,
      barterRequirements,
      availableFrom,
      availableTo
    } = req.body;

    if (!resourceName || !category || !description || !village || !district || !sharingType || !availableFrom || !availableTo) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields including availability dates'
      });
    }

    const resource = await Resource.create({
      resourceName,
      category,
      description,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
      ownerId: req.user._id,
      village,
      district,
      sharingType,
      price: sharingType === 'Nominal Rental' ? Number(price) || 0 : 0,
      barterRequirements: sharingType === 'Barter Exchange' ? barterRequirements : '',
      availableFrom: new Date(availableFrom),
      availableTo: new Date(availableTo),
      status: 'Available',
      approvalStatus: 'Approved' // auto-approve default for friendly college demo
    });

    return res.status(201).json({
      success: true,
      message: 'Resource listed successfully!',
      resource
    });
  } catch (error) {
    console.error('[Create Resource Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error creating resource'
    });
  }
};

// @desc    Update an existing resource
// @route   PUT /api/resources/:id
// @access  Private (Owner or Admin)
const updateResource = async (req, res) => {
  try {
    let resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    // Verify ownership or admin role
    if (resource.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this resource. Only the owner or an admin can modify it.'
      });
    }

    const fieldsToUpdate = [
      'resourceName', 'category', 'description', 'imageUrl',
      'village', 'district', 'sharingType', 'price',
      'barterRequirements', 'availableFrom', 'availableTo', 'status'
    ];

    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        resource[field] = req.body[field];
      }
    });

    const updated = await resource.save();

    return res.status(200).json({
      success: true,
      message: 'Resource updated successfully',
      resource: updated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating resource'
    });
  }
};

// @desc    Delete a resource
// @route   DELETE /api/resources/:id
// @access  Private (Owner or Admin)
const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    // Verify ownership or admin
    if (resource.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this resource'
      });
    }

    await resource.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error deleting resource'
    });
  }
};

// @desc    Get resources listed by current authenticated farmer
// @route   GET /api/resources/my/all
// @access  Private
const getMyResources = async (req, res) => {
  try {
    const resources = await Resource.find({ ownerId: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: resources.length,
      resources
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching your resources'
    });
  }
};

module.exports = {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  getMyResources
};
