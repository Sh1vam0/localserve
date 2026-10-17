import express from 'express';
import {
  getServicesByBusiness,
  createService,
  updateService,
  deleteService,
} from '../controllers/serviceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/business/:businessId', getServicesByBusiness);
router.post('/', protect, authorize('owner', 'admin'), createService);
router.put('/:id', protect, authorize('owner', 'admin'), updateService);
router.delete('/:id', protect, authorize('owner', 'admin'), deleteService);

export default router;
