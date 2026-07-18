import express from 'express';
import {
  getDashboardStats,
  approveProperty,
  getUsers,
  updateUserRole,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, authorize('admin'), getDashboardStats);
router.put('/properties/:id/approve', protect, authorize('admin'), approveProperty);
router.get('/users', protect, authorize('admin'), getUsers);
router.put('/users/:id', protect, authorize('admin'), updateUserRole);

export default router;
