import express from 'express';
import {
  generateDescription,
  processSmartSearch,
  generateTravelPlan,
  summarizePropertyReviews,
  getRecommendations,
  chatWithProperty,
} from '../controllers/aiController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Optional protect middleware for logging search queries if logged in
const optionalProtect = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  next();
};

router.post('/generate-description', protect, authorize('host', 'admin'), generateDescription);
router.post('/smart-search', optionalProtect, processSmartSearch);
router.post('/travel-plan', generateTravelPlan);
router.post('/summarize-reviews', summarizePropertyReviews);
router.post('/recommendations', protect, getRecommendations);
router.post('/chatbot', chatWithProperty);

export default router;
