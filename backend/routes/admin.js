import express from 'express';
import {
  getStats,
  getUsers,
  updateUserStatus,
  getBusinessesAdmin,
  updateBusinessStatus,
  verifyBusiness,
  getAllBookings,
  getAuditLogs,
  getAdmins,
  createAdmin,
  updateAdminPermissions,
  deleteAdmin,
  getBestPerformingStores,
} from '../controllers/adminController.js';
import { protect, authorize, checkAdminPermission } from '../middleware/auth.js';

const router = express.Router();

// Base protection: All routes require authentication and at least admin role
router.use(protect);
router.use(authorize('admin'));

// General Platform Stats & User/Store Viewing (Accessible to all admins)
router.get('/stats', getStats);
router.get('/users', getUsers);
router.get('/businesses', getBusinessesAdmin);
router.get('/analytics/best-stores', getBestPerformingStores);

// Granular: User Moderation
router.put('/users/:id/status', checkAdminPermission('canManageUsers'), updateUserStatus);

// Granular: Store Verification & Governance
router.put('/businesses/:id/status', checkAdminPermission('canVerifyBusinesses'), updateBusinessStatus);
router.put('/businesses/:id/verify', checkAdminPermission('canVerifyBusinesses'), verifyBusiness);

// Granular: Bookings & Audit Logs Oversight
router.get('/bookings', checkAdminPermission('canManageBookings'), getAllBookings);
router.get('/logs', checkAdminPermission('canManageBookings'), getAuditLogs);

// Super Admin Authority Only: Administrator Management & RBAC
router.get('/admins', getAdmins);
router.post('/admins', checkAdminPermission('canManageAdmins'), createAdmin);
router.put('/admins/:id/permissions', checkAdminPermission('canManageAdmins'), updateAdminPermissions);
router.delete('/admins/:id', checkAdminPermission('canManageAdmins'), deleteAdmin);

export default router;
