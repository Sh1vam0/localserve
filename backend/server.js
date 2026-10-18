import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/auth.js';
import businessRoutes from './routes/businesses.js';
import serviceRoutes from './routes/services.js';
import bookingRoutes from './routes/bookings.js';
import reviewRoutes from './routes/reviews.js';
import recommendationRoutes from './routes/recommendations.js';
import adminRoutes from './routes/admin.js';
import couponRoutes from './routes/coupons.js';
import uploadRoutes from './routes/upload.js';
import googleMapsRoutes from './routes/googleMaps.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
connectDB();

const app = express();

// Security: Disable X-Powered-By header to prevent technology fingerprinting
app.disable('x-powered-by');

// Security Headers Middleware (Clickjacking, MIME Sniffing, HSTS, XSS)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Body parser with strict size limit to prevent memory exhaustion DoS
app.use(express.json({ limit: '2mb' }));

// NoSQL Injection Sanitizer: Recursively strip keys starting with '$' or containing '.'
const sanitizeInput = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
    } else if (typeof obj[key] === 'object') {
      sanitizeInput(obj[key]);
    }
  }
  return obj;
};

app.use((req, res, next) => {
  if (req.body) sanitizeInput(req.body);
  if (req.query) sanitizeInput(req.query);
  if (req.params) sanitizeInput(req.params);
  next();
});

// In-Memory Brute-Force Rate Limiter for Authentication Endpoints (15 attempts / 15 mins per IP)
const authAttemptMap = new Map();
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of authAttemptMap.entries()) {
    if (now > data.resetTime) {
      authAttemptMap.delete(ip);
    }
  }
}, 5 * 60 * 1000);

const authRateLimiter = (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes window
  const maxAttempts = 15; // Max 15 login/register attempts per 15 mins per IP

  const record = authAttemptMap.get(ip) || { count: 0, resetTime: now + windowMs };

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
  } else {
    record.count += 1;
  }

  authAttemptMap.set(ip, record);

  if (record.count > maxAttempts) {
    const minutesLeft = Math.ceil((record.resetTime - now) / (1000 * 60));
    return res.status(429).json({
      success: false,
      message: `Too many authentication attempts from this IP address. Please try again in ${minutesLeft} minute(s).`,
    });
  }

  next();
};

// Enable CORS with strict production domain filtering
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (
        !process.env.NODE_ENV ||
        process.env.NODE_ENV !== 'production' ||
        !process.env.CLIENT_URL ||
        process.env.CLIENT_URL === '*' ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.netlify.app') ||
        origin.endsWith('.onrender.com')
      ) {
        return callback(null, true);
      }
      return callback(new Error('Blocked by CORS security policy: Origin not allowed'), false);
    },
    credentials: true,
  })
);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Mount routers (Rate-limit applied to /api/auth)
app.use('/api/auth', authRateLimiter, authRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/location', googleMapsRoutes);
app.use('/api/google', googleMapsRoutes);

// Serve uploaded store photos statically
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// Serve Frontend Build when dist exists (enables Single-Service Monolithic deployment on Render / VPS)
const frontendDistPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  // Express 5 compatible SPA fallback
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(frontendDistPath, 'index.html'));
    }
    next();
  });
}

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 LocalServ Server running on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
});
