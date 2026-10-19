import User from '../models/User.js';
import Business from '../models/Business.js';
import Booking from '../models/Booking.js';
import AuditLog from '../models/AuditLog.js';
import { recordAuditLog } from '../utils/auditLogger.js';

// @desc    Get system statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
export const getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const customersCount = await User.countDocuments({ role: 'customer' });
    const ownersCount = await User.countDocuments({ role: 'owner' });
    const adminsCount = await User.countDocuments({ role: 'admin' });

    const totalBusinesses = await Business.countDocuments();
    const approvedBusinesses = await Business.countDocuments({ status: 'approved' });
    const pendingBusinesses = await Business.countDocuments({ status: 'pending' });
    const pendingVerifications = await Business.countDocuments({ verificationStatus: 'pending_review' });
    const verifiedStores = await Business.countDocuments({ verificationStatus: 'verified' });

    const totalBookings = await Booking.countDocuments();
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const verifiedBookings = await Booking.countDocuments({ isVerified: true });

    const totalAuditLogs = await AuditLog.countDocuments();

    const revenueResult = await Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'checked-in', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    res.status(200).json({
      success: true,
      data: {
        users: { total: totalUsers, customers: customersCount, owners: ownersCount, admins: adminsCount },
        businesses: { 
          total: totalBusinesses, 
          approved: approvedBusinesses, 
          pending: pendingBusinesses,
          pendingVerifications,
          verified: verifiedStores 
        },
        bookings: { total: totalBookings, completed: completedBookings, verified: verifiedBookings },
        logs: { total: totalAuditLogs },
        revenue: totalRevenue,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getUsers = async (req, res, next) => {
  try {
    const { search, role } = req.query;
    let query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user status (activate/deactivate)
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
export const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isSuperAdmin) {
      return res.status(403).json({ success: false, message: 'Cannot deactivate Root Super Admin' });
    }

    user.isActive = isActive;
    await user.save();

    await recordAuditLog({
      action: 'user_status_changed',
      category: 'governance',
      actor: { id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role },
      target: { id: user._id, name: user.name, type: 'User' },
      description: `User "${user.name}" status changed to ${isActive ? 'active' : 'suspended'} by ${req.user.name}.`,
      status: 'warning',
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all businesses for admin
// @route   GET /api/admin/businesses
// @access  Private (Admin)
export const getBusinessesAdmin = async (req, res, next) => {
  try {
    const { status, verificationStatus, search } = req.query;
    let query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (verificationStatus && verificationStatus !== 'all') {
      query.verificationStatus = verificationStatus;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const businesses = await Business.find(query).populate('owner', 'name email phone').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: businesses.length,
      data: businesses,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update business status (approve/suspend)
// @route   PUT /api/admin/businesses/:id/status
// @access  Private (Admin)
export const updateBusinessStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const business = await Business.findByIdAndUpdate(req.params.id, { status }, { new: true });

    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    await recordAuditLog({
      action: 'business_status_changed',
      category: 'governance',
      actor: { id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role },
      target: { id: business._id, name: business.name, type: 'Business' },
      description: `Business "${business.name}" status updated to "${status}" by ${req.user.name}.`,
      status: 'warning',
    });

    res.status(200).json({
      success: true,
      data: business,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/admin/bookings
// @access  Private (Admin)
export const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('customer', 'name email phone')
      .populate('business', 'name category')
      .populate('service', 'name price duration')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify or reject business documents
// @route   PUT /api/admin/businesses/:id/verify
// @access  Private (Admin)
export const verifyBusiness = async (req, res, next) => {
  try {
    const { verificationStatus, rejectionReason } = req.body;
    const update = {
      verificationStatus,
      'verificationDocuments.rejectionReason': rejectionReason || '',
    };

    if (verificationStatus === 'verified') {
      update.status = 'approved';
      update['verificationDocuments.verifiedAt'] = new Date();
    }

    const business = await Business.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    await recordAuditLog({
      action: verificationStatus === 'verified' ? 'business_verified' : 'business_rejected',
      category: 'verification',
      actor: { id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role },
      target: { id: business._id, name: business.name, type: 'Business' },
      description: verificationStatus === 'verified'
        ? `Store "${business.name}" verified and awarded green Verified Partner badge by ${req.user.name}.`
        : `Store "${business.name}" verification rejected by ${req.user.name}. Reason: ${rejectionReason || 'Correction required'}.`,
      details: { rejectionReason, verificationStatus },
      status: verificationStatus === 'verified' ? 'success' : 'warning',
    });

    res.status(200).json({
      success: true,
      message: `Business verification marked as ${verificationStatus}`,
      data: business,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get system audit logs (Logins, Bookings, Verifications, Admin actions)
// @route   GET /api/admin/logs
// @access  Private (Admin)
export const getAuditLogs = async (req, res, next) => {
  try {
    const { category, search, limit = 50, page = 1 } = req.query;
    let query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { 'actor.name': { $regex: search, $options: 'i' } },
        { 'actor.email': { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)) || 1,
      data: logs,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all admin users
// @route   GET /api/admin/admins
// @access  Private (Admin)
export const getAdmins = async (req, res, next) => {
  try {
    const admins = await User.find({ role: 'admin' })
      .select('-password')
      .sort({ isSuperAdmin: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: admins.length,
      data: admins,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new sub-admin (Root Super Admin Only)
// @route   POST /api/admin/admins
// @access  Private (Super Admin)
export const createAdmin = async (req, res, next) => {
  try {
    if (!req.user.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Authority Denied: Only the Root Super Admin (Sh1vam) can create new administrators.',
      });
    }

    const { name, username, email, password, phone, permissions } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide admin name, email, and password' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = (username || cleanEmail.split('@')[0]).trim().toLowerCase();

    const existing = await User.findOne({
      $or: [{ email: cleanEmail }, { username: cleanUsername }],
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email or username already exists' });
    }

    const newAdmin = await User.create({
      name,
      username: cleanUsername,
      email: cleanEmail,
      password,
      phone: phone || '',
      role: 'admin',
      isSuperAdmin: false,
      adminPermissions: {
        canVerifyBusinesses: permissions?.canVerifyBusinesses ?? true,
        canManageUsers: permissions?.canManageUsers ?? true,
        canManageBookings: permissions?.canManageBookings ?? true,
        canManageAdmins: false, // Protected: only Root Super Admin can manage admins
      },
    });

    await recordAuditLog({
      action: 'admin_created',
      category: 'governance',
      actor: { id: req.user.id, name: req.user.name, email: req.user.email, role: 'admin' },
      target: { id: newAdmin._id, name: newAdmin.name, type: 'Admin' },
      description: `Root Super Admin "${req.user.name}" created new Sub-Admin "${newAdmin.name}" (${newAdmin.email}).`,
      details: { permissions: newAdmin.adminPermissions },
      status: 'success',
    });

    res.status(201).json({
      success: true,
      message: `Sub-admin "${newAdmin.name}" created successfully!`,
      data: {
        id: newAdmin._id,
        name: newAdmin.name,
        username: newAdmin.username,
        email: newAdmin.email,
        phone: newAdmin.phone,
        role: newAdmin.role,
        isSuperAdmin: newAdmin.isSuperAdmin,
        adminPermissions: newAdmin.adminPermissions,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update admin permissions or status (Super Admin Only)
// @route   PUT /api/admin/admins/:id/permissions
// @access  Private (Super Admin)
export const updateAdminPermissions = async (req, res, next) => {
  try {
    if (!req.user.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Authority Denied: Only the Root Super Admin can modify administrator privileges.',
      });
    }

    const admin = await User.findById(req.params.id);
    if (!admin || admin.role !== 'admin') {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    if (admin.isSuperAdmin && admin._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Cannot modify another Super Admin account' });
    }

    const { permissions, isActive } = req.body;
    if (permissions) {
      admin.adminPermissions = {
        canVerifyBusinesses: permissions.canVerifyBusinesses ?? admin.adminPermissions?.canVerifyBusinesses,
        canManageUsers: permissions.canManageUsers ?? admin.adminPermissions?.canManageUsers,
        canManageBookings: permissions.canManageBookings ?? admin.adminPermissions?.canManageBookings,
        canManageAdmins: false,
      };
    }

    if (isActive !== undefined && !admin.isSuperAdmin) {
      admin.isActive = isActive;
    }

    await admin.save();

    await recordAuditLog({
      action: 'admin_permissions_updated',
      category: 'governance',
      actor: { id: req.user.id, name: req.user.name, email: req.user.email, role: 'admin' },
      target: { id: admin._id, name: admin.name, type: 'Admin' },
      description: `Permissions updated for Sub-Admin "${admin.name}".`,
      details: { permissions: admin.adminPermissions, isActive: admin.isActive },
      status: 'success',
    });

    res.status(200).json({
      success: true,
      message: 'Admin permissions updated successfully',
      data: admin,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Revoke admin access (Super Admin Only)
// @route   DELETE /api/admin/admins/:id
// @access  Private (Super Admin)
export const deleteAdmin = async (req, res, next) => {
  try {
    if (!req.user.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Authority Denied: Only the Root Super Admin can revoke administrator access.',
      });
    }

    const admin = await User.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin user not found' });
    }

    const rootEmails = ['admin@localserve.com', 'admin2@localserve.com'];
    const rootUsernames = ['sh1vam', 'sangamgautam'];
    if (admin.isSuperAdmin || rootEmails.includes(admin.email) || rootUsernames.includes(admin.username)) {
      return res.status(400).json({
        success: false,
        message: 'Protected Account: Root Super Admin accounts cannot be revoked or deleted!',
      });
    }

    // Demote to customer
    admin.role = 'customer';
    admin.isSuperAdmin = false;
    admin.adminPermissions = {
      canVerifyBusinesses: false,
      canManageUsers: false,
      canManageBookings: false,
      canManageAdmins: false,
    };
    await admin.save();

    await recordAuditLog({
      action: 'admin_revoked',
      category: 'governance',
      actor: { id: req.user.id, name: req.user.name, email: req.user.email, role: 'admin' },
      target: { id: admin._id, name: admin.name, type: 'Admin' },
      description: `Root Super Admin "${req.user.name}" revoked admin privileges for "${admin.name}". Demoted to Customer.`,
      status: 'warning',
    });

    res.status(200).json({
      success: true,
      message: `Admin privileges revoked for ${admin.name}. Account demoted to customer.`,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Best Performing Stores analytics leaderboard
// @route   GET /api/admin/analytics/best-stores
// @access  Private (Admin)
export const getBestPerformingStores = async (req, res, next) => {
  try {
    const { category, sortBy = 'score', timeWindow } = req.query;

    // 1. Fetch all approved/active businesses
    let bizQuery = { status: { $ne: 'suspended' } };
    if (category && category !== 'all') {
      bizQuery.category = category;
    }

    const businesses = await Business.find(bizQuery)
      .populate('owner', 'name email phone')
      .lean();

    // 2. Aggregate booking statistics per business
    let bookingMatch = {};
    if (timeWindow === 'month') {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      bookingMatch.createdAt = { $gte: startOfMonth };
    } else if (timeWindow === 'week') {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - 7);
      bookingMatch.createdAt = { $gte: startOfWeek };
    }

    const bookingStats = await Booking.aggregate([
      { $match: bookingMatch },
      {
        $group: {
          _id: '$business',
          totalBookings: { $sum: 1 },
          completedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          verifiedBookings: {
            $sum: { $cond: [{ $eq: ['$isVerified', true] }, 1, 0] },
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
          },
          revenue: {
            $sum: {
              $cond: [
                { $in: ['$status', ['confirmed', 'checked-in', 'completed']] },
                '$totalPrice',
                0,
              ],
            },
          },
          discountGiven: { $sum: '$discountAmount' },
        },
      },
    ]);

    // Create a map for fast lookup
    const statsMap = new Map();
    bookingStats.forEach((st) => {
      statsMap.set(st._id.toString(), st);
    });

    // 3. Merge stats with businesses and compute performance metrics
    const storesList = businesses.map((biz) => {
      const st = statsMap.get(biz._id.toString()) || {
        totalBookings: 0,
        completedBookings: 0,
        verifiedBookings: 0,
        cancelledBookings: 0,
        revenue: 0,
        discountGiven: 0,
      };

      const completionRate =
        st.totalBookings > 0
          ? Math.round((st.completedBookings / st.totalBookings) * 100)
          : 0;

      // Composite Performance Score
      // Revenue (40%), Completed volume (30%), Rating & reviews (30%)
      const ratingWeight = (biz.rating || 4.5) * 60;
      const reviewWeight = Math.min((biz.reviewCount || 0) * 4, 300);
      const revenueWeight = st.revenue * 0.4;
      const completionWeight = st.completedBookings * 120 + st.verifiedBookings * 50;
      const performanceScore = Math.round(
        revenueWeight + completionWeight + ratingWeight + reviewWeight
      );

      return {
        _id: biz._id,
        name: biz.name,
        category: biz.category,
        address: biz.address,
        rating: biz.rating || 4.5,
        reviewCount: biz.reviewCount || 0,
        platformRating: biz.platformRating || biz.rating || 4.8,
        googleRating: biz.googleRating || 4.5,
        googleReviewCount: biz.googleReviewCount || 0,
        verificationStatus: biz.verificationStatus,
        offersRideAssistance: biz.offersRideAssistance,
        image: biz.images?.[0] || '',
        owner: biz.owner,
        totalBookings: st.totalBookings,
        completedBookings: st.completedBookings,
        verifiedBookings: st.verifiedBookings,
        cancelledBookings: st.cancelledBookings,
        revenue: st.revenue,
        discountGiven: st.discountGiven || 0,
        completionRate,
        performanceScore,
      };
    });

    // 4. Sort based on query
    if (sortBy === 'revenue') {
      storesList.sort((a, b) => b.revenue - a.revenue || b.performanceScore - a.performanceScore);
    } else if (sortBy === 'rating') {
      storesList.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    } else if (sortBy === 'bookings') {
      storesList.sort((a, b) => b.completedBookings - a.completedBookings || b.revenue - a.revenue);
    } else {
      // Default: composite performanceScore
      storesList.sort((a, b) => b.performanceScore - a.performanceScore);
    }

    // 5. Assign leaderboard ranks and badges
    const rankedStores = storesList.map((store, index) => {
      let badge = 'Standard';
      let medal = null;

      if (index === 0) {
        badge = 'Platform Champion';
        medal = '🥇 Gold';
      } else if (index === 1) {
        badge = 'Top Performer';
        medal = '🥈 Silver';
      } else if (index === 2) {
        badge = 'Rising Star';
        medal = '🥉 Bronze';
      } else if (store.rating >= 4.8) {
        badge = 'Customer Favorite';
      } else if (store.revenue > 1000) {
        badge = 'High GMV';
      }

      return {
        rank: index + 1,
        medal,
        badge,
        ...store,
      };
    });

    // Platform aggregate metrics
    const totalGmv = rankedStores.reduce((acc, s) => acc + s.revenue, 0);
    const totalCompleted = rankedStores.reduce((acc, s) => acc + s.completedBookings, 0);
    const avgRating =
      rankedStores.length > 0
        ? (
            rankedStores.reduce((acc, s) => acc + s.rating, 0) / rankedStores.length
          ).toFixed(1)
        : '0.0';

    res.status(200).json({
      success: true,
      count: rankedStores.length,
      summary: {
        totalGmv,
        totalCompletedAppointments: totalCompleted,
        averageStoreRating: Number(avgRating),
        topStore: rankedStores[0] ? { name: rankedStores[0].name, revenue: rankedStores[0].revenue } : null,
      },
      data: rankedStores,
    });
  } catch (err) {
    next(err);
  }
};
