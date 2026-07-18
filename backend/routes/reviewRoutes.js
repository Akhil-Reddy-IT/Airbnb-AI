import express from 'express';
import {
  addReview,
  getPropertyReviews,
  respondToReview,
} from '../controllers/reviewController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, addReview);
router.get('/property/:propertyId', getPropertyReviews);
router.put('/:id/respond', protect, authorize('host', 'admin'), respondToReview);

export default router;
