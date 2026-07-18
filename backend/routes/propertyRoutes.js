import express from 'express';
import {
  getProperties,
  getHostProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
} from '../controllers/propertyController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', getProperties);
router.get('/host', protect, authorize('host', 'admin'), getHostProperties);
router.get('/:id', getPropertyById);

router.post('/', protect, authorize('host', 'admin'), upload.array('images', 10), createProperty);
router.put('/:id', protect, authorize('host', 'admin'), upload.array('images', 10), updateProperty);
router.delete('/:id', protect, authorize('host', 'admin'), deleteProperty);

export default router;
