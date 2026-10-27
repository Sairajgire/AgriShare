const express = require('express');
const router = express.Router();
const {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  getMyResources
} = require('../controllers/resourceController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getResources);
router.get('/my/all', protect, getMyResources);
router.get('/:id', getResourceById);
router.post('/', protect, createResource);
router.put('/:id', protect, updateResource);
router.delete('/:id', protect, deleteResource);

module.exports = router;
