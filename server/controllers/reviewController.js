const Review = require('../models/Review');
const Request = require('../models/Request');
const Resource = require('../models/Resource');

// @desc    Add review for a resource
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  try {
    const { resourceId, rating, comment } = req.body;

    if (!resourceId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Resource ID, rating (1-5), and feedback comment are required'
      });
    }

    const numRating = Number(rating);
    if (numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5 stars'
      });
    }

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    // Owner cannot review their own resource
    if (resource.ownerId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Owners cannot review their own resource listings'
      });
    }

    // Check if farmer has already reviewed this resource
    const existingReview = await Review.findOne({
      resourceId,
      reviewerId: req.user._id
    });

    if (existingReview) {
      existingReview.rating = numRating;
      existingReview.comment = comment;
      await existingReview.save();
      return res.status(200).json({
        success: true,
        message: 'Review updated successfully',
        review: existingReview
      });
    }

    const review = await Review.create({
      resourceId,
      reviewerId: req.user._id,
      rating: numRating,
      comment
    });

    const populatedReview = await Review.findById(review._id).populate('reviewerId', 'name village district');

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully! Thank you for supporting the farming community.',
      review: populatedReview
    });
  } catch (error) {
    console.error('[Create Review Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error submitting review'
    });
  }
};

// @desc    Get reviews for a resource
// @route   GET /api/reviews/:resourceId
// @access  Public
const getResourceReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ resourceId: req.params.resourceId })
      .populate('reviewerId', 'name village district')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching reviews'
    });
  }
};

module.exports = {
  createReview,
  getResourceReviews
};
