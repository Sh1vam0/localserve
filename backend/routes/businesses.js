import express from 'express';
import {
  getBusinesses,
  getBusiness,
  createBusiness,
  updateBusiness,
  getMyBusiness,
  getAvailability,
  submitVerification,
} from '../controllers/businessController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getBusinesses);
router.get('/owner/me', protect, authorize('owner', 'admin'), getMyBusiness);
router.get('/:id', getBusiness);
router.get('/:id/availability', getAvailability);

router.post('/', protect, authorize('owner', 'admin'), createBusiness);
router.put('/:id', protect, authorize('owner', 'admin'), updateBusiness);
router.put('/:id/verification', protect, authorize('owner', 'admin'), submitVerification);

export default router;
