const express = require('express');
const router = express.Router();
const {
  getAdminDashboardStats,
  getAllUsers,
  getAllResources,
  updateResourceApproval,
  deleteUser
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

// All routes require authentication AND admin role
router.use(protect, adminOnly);

router.get('/dashboard', getAdminDashboardStats);
router.get('/users', getAllUsers);
router.get('/resources', getAllResources);
router.put('/resources/:id/approval', updateResourceApproval);
router.delete('/users/:id', deleteUser);

module.exports = router;
