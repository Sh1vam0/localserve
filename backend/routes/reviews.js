import express from 'express';
import {
  getBusinessReviews,
  createReview,
  addOwnerReply,
  deleteReview,
} from '../controllers/reviewController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/business/:businessId', getBusinessReviews);
router.post('/', protect, createReview);
router.put('/:id/reply', protect, authorize('owner', 'admin'), addOwnerReply);
router.delete('/:id', protect, deleteReview);

export default router;
