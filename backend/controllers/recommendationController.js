import { getHybridRecommendations } from '../services/recommendationEngine.js';
import jwt from 'jsonwebtoken';

// @desc    Get smart hybrid recommendations for user based on live location
// @route   GET /api/recommendations
// @access  Public (Optional auth for personalization)
export const getRecommendations = async (req, res, next) => {
  try {
    const { lat, lng, category, maxDistance, limit } = req.query;
    let userId = null;

    // Optional user authentication from Bearer token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      const token = req.headers.authorization.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'localserv_hackathon_secret_key_2026');
        userId = decoded.id;
      } catch (e) {
        // Token invalid or expired, proceed anonymously
      }
    }

    const recommendations = await getHybridRecommendations({
      userId,
      lat,
      lng,
      category,
      maxDistance,
      limit: limit ? parseInt(limit) : 8,
    });

    res.status(200).json({
      success: true,
      data: recommendations,
    });
  } catch (err) {
    next(err);
  }
};
