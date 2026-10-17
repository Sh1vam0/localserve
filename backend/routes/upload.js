import express from 'express';
import { uploadPhotos } from '../middleware/upload.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Upload multiple photos from device
// @route   POST /api/upload/photos
// @access  Public / Authenticated
router.post('/photos', (req, res) => {
  uploadPhotos.array('photos', 10)(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload error',
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided in upload payload.',
      });
    }

    // Generate accessible URLs (both relative and absolute path references)
    const host = req.get('host');
    const protocol = req.protocol;
    const urls = req.files.map((file) => `/uploads/${file.filename}`);
    const fullUrls = req.files.map((file) => `${protocol}://${host}/uploads/${file.filename}`);

    return res.status(200).json({
      success: true,
      message: `${req.files.length} photo(s) uploaded successfully from device!`,
      urls,
      fullUrls,
      files: req.files.map((f) => ({
        originalName: f.originalname,
        filename: f.filename,
        size: f.size,
        mimetype: f.mimetype,
        url: `/uploads/${f.filename}`,
      })),
    });
  });
});

// @desc    Upload a single photo from device
// @route   POST /api/upload/photo
// @access  Public / Authenticated
router.post('/photo', (req, res) => {
  uploadPhotos.single('photo')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload error',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided in upload payload.',
      });
    }

    const host = req.get('host');
    const protocol = req.protocol;
    const url = `/uploads/${req.file.filename}`;
    const fullUrl = `${protocol}://${host}${url}`;

    return res.status(200).json({
      success: true,
      message: 'Photo uploaded successfully from device!',
      url,
      fullUrl,
      file: {
        originalName: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size,
        url,
      },
    });
  });
});

export default router;
