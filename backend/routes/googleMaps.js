import express from 'express';
import {
  reverseGeocode,
  searchLocation,
  importGoogleMapsData,
  previewGoogleImport,
} from '../controllers/googleController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public location helpers
router.get('/reverse-geocode', reverseGeocode);
router.get('/search', searchLocation);
router.post('/preview', previewGoogleImport);

// Authenticated business Google import
router.post('/business/:id/import', protect, importGoogleMapsData);

export default router;
