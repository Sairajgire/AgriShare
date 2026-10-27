const express = require('express');
const router = express.Router();
const { createReview, getResourceReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createReview);
router.get('/:resourceId', getResourceReviews);

module.exports = router;
