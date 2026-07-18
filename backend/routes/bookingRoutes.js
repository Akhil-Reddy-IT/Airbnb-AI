import express from 'express';
import {
  createBooking,
  getUserBookings,
  getHostBookings,
  cancelBooking,
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getUserBookings);
router.get('/host-requests', protect, authorize('host', 'admin'), getHostBookings);
router.put('/:id/cancel', protect, cancelBooking);

export default router;
