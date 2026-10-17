import express from 'express';
import {
  createCoupon,
  getCoupons,
  validateCoupon,
  updateCoupon,
  deleteCoupon,
} from '../controllers/couponController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes for browsing active promos and applying coupon at checkout
router.get('/', getCoupons);
router.post('/validate', validateCoupon);

// Protected routes for Admin and Store Owners
router.post('/', protect, authorize('admin', 'owner'), createCoupon);
router.put('/:id', protect, authorize('admin', 'owner'), updateCoupon);
router.delete('/:id', protect, authorize('admin', 'owner'), deleteCoupon);

export default router;
