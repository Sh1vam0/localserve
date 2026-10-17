import express from 'express';
import {
  createBooking,
  getMyBookings,
  getBusinessBookings,
  verifyCheckin,
  verifyCompletion,
  cancelBooking,
  rescheduleBooking,
  updateBookingStatus,
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/business/:businessId', protect, authorize('owner', 'admin'), getBusinessBookings);

router.put('/:id/verify-checkin', protect, authorize('owner', 'admin'), verifyCheckin);
router.put('/:id/verify-completion', protect, verifyCompletion);
router.put('/:id/cancel', protect, cancelBooking);
router.put('/:id/reschedule', protect, rescheduleBooking);
router.put('/:id/status', protect, authorize('owner', 'admin'), updateBookingStatus);

export default router;
