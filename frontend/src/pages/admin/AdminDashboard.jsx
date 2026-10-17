import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  Users,
  Store,
  Calendar,
  DollarSign,
  ShieldCheck,
  ArrowRight,
  Shield,
  Crown,
  Key,
  ListFilter,
  Search,
  RefreshCw,
  Plus,
  UserCheck,
  UserX,
  Lock,
  Mail,
  User as UserIcon,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Activity,
  FileText,
  Check,
  X,
  Trophy,
  Tag,
  Percent,
  Award,
  TrendingUp,
  Copy,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'best-stores' | 'coupons' | 'logs' | 'admins'
  const [loading, setLoading] = useState(true);

  // Best Performing Stores state
  const [bestStores, setBestStores] = useState([]);
  const [bestStoresLoading, setBestStoresLoading] = useState(false);
  const [bestStoresSummary, setBestStoresSummary] = useState(null);
  const [storeCategory, setStoreCategory] = useState('all');
  const [storeSortBy, setStoreSortBy] = useState('score');
  const [storeTimeWindow, setStoreTimeWindow] = useState('all');
  const [storeSearch, setStoreSearch] = useState('');

  // Coupons state
  const [coupons, setCoupons] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [couponScopeFilter, setCouponScopeFilter] = useState('all');
  const [createCouponModal, setCreateCouponModal] = useState(false);
  const [submittingCoupon, setSubmittingCoupon] = useState(false);
  const [newCouponData, setNewCouponData] = useState({
    code: '',
    title: '',
    description: '',
    scope: 'platform',
    discountType: 'percentage',
    discountValue: 20,
    minBookingAmount: 0,
    maxDiscountAmount: '',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
    usageLimit: 100,
  });

  // Audit Logs state
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logCategory, setLogCategory] = useState('all');
  const [logSearch, setLogSearch] = useState('');

  // Admin Management state
  const [admins, setAdmins] = useState([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [createAdminModal, setCreateAdminModal] = useState(false);
  const [submittingAdmin, setSubmittingAdmin] = useState(false);
  const [newAdminData, setNewAdminData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    permissions: {
      canVerifyBusinesses: true,
      canManageUsers: true,
      canManageBookings: true,
    },
  });

  const fetchPlatformData = async () => {
    try {
      setLoading(true);
      const [statsRes, bookRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/bookings'),
      ]);
      setStats(statsRes.data.data);
      setRecentBookings(bookRes.data.data?.slice(0, 6) || []);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      setLogsLoading(true);
      const params = new URLSearchParams();
      if (logCategory !== 'all') params.append('category', logCategory);
      if (logSearch.trim()) params.append('search', logSearch.trim());
      params.append('limit', '50');

      const res = await api.get(`/admin/logs?${params.toString()}`);
      setLogs(res.data.data || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLogsLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      setAdminsLoading(true);
      const res = await api.get('/admin/admins');
      setAdmins(res.data.data || []);
    } catch (err) {
      console.error('Failed to load admins:', err);
    } finally {
      setAdminsLoading(false);
    }
  };

  const fetchBestStores = async () => {
    try {
      setBestStoresLoading(true);
      const params = new URLSearchParams();
      if (storeCategory !== 'all') params.append('category', storeCategory);
      if (storeSortBy) params.append('sortBy', storeSortBy);
      if (storeTimeWindow !== 'all') params.append('timeWindow', storeTimeWindow);
      const res = await api.get(`/admin/analytics/best-stores?${params.toString()}`);
      setBestStores(res.data.data || []);
      setBestStoresSummary(res.data.summary || null);
    } catch (err) {
      console.error('Failed to load best performing stores:', err);
    } finally {
      setBestStoresLoading(false);
    }
  };

  const fetchCoupons = async () => {
    try {
      setCouponsLoading(true);
      const params = new URLSearchParams();
      if (couponScopeFilter !== 'all') params.append('scope', couponScopeFilter);
      const res = await api.get(`/coupons?${params.toString()}`);
      setCoupons(res.data.data || []);
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setCouponsLoading(false);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!newCouponData.code || !newCouponData.discountValue || !newCouponData.validUntil) {
      toast.error('Please provide coupon code, discount value, and expiration date');
      return;
    }

    try {
      setSubmittingCoupon(true);
      await api.post('/coupons', {
        ...newCouponData,
        code: newCouponData.code.trim().toUpperCase(),
      });
      toast.success(`Coupon "${newCouponData.code.toUpperCase()}" created successfully!`);
      setCreateCouponModal(false);
      setNewCouponData({
        code: '',
        title: '',
        description: '',
        scope: 'platform',
        discountType: 'percentage',
        discountValue: 20,
        minBookingAmount: 0,
        maxDiscountAmount: '',
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: '',
        usageLimit: 100,
      });
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create coupon');
    } finally {
      setSubmittingCoupon(false);
    }
  };

  const handleToggleCouponStatus = async (couponId, currentStatus) => {
    try {
      await api.put(`/coupons/${couponId}`, { isActive: !currentStatus });
      toast.success(`Coupon marked ${!currentStatus ? 'Active' : 'Deactivated'}`);
      fetchCoupons();
    } catch (err) {
      toast.error('Failed to update coupon status');
    }
  };

  const handleDeleteCoupon = async (couponId, code) => {
    if (!window.confirm(`Are you sure you want to delete promo coupon "${code}"?`)) return;
    try {
      await api.delete(`/coupons/${couponId}`);
      toast.success(`Coupon "${code}" deleted`);
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete coupon');
    }
  };

  useEffect(() => {
    fetchPlatformData();
  }, []);

  useEffect(() => {
    if (activeTab === 'best-stores') fetchBestStores();
    if (activeTab === 'coupons') fetchCoupons();
    if (activeTab === 'logs') fetchAuditLogs();
    if (activeTab === 'admins') fetchAdmins();
  }, [activeTab, storeCategory, storeSortBy, storeTimeWindow, couponScopeFilter, logCategory]);

  const handleCreateSubAdmin = async (e) => {
    e.preventDefault();
    if (!newAdminData.name || !newAdminData.email || !newAdminData.password) {
      toast.error('Please fill in name, email, and password');
      return;
    }

    try {
      setSubmittingAdmin(true);
      await api.post('/admin/admins', newAdminData);
      toast.success(`Sub-admin "${newAdminData.name}" created successfully!`);
      setCreateAdminModal(false);
      setNewAdminData({
        name: '',
        username: '',
        email: '',
        password: '',
        permissions: { canVerifyBusinesses: true, canManageUsers: true, canManageBookings: true },
      });
      fetchAdmins();
      fetchPlatformData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create sub-admin');
    } finally {
      setSubmittingAdmin(false);
    }
  };

  const handleRevokeAdmin = async (adminId, adminName) => {
    if (!window.confirm(`Are you sure you want to revoke admin authority for "${adminName}"?`)) return;

    try {
      await api.delete(`/admin/admins/${adminId}`);
      toast.success(`Admin access revoked for ${adminName}`);
      fetchAdmins();
      fetchPlatformData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to revoke admin');
    }
  };

  if (loading && !stats) {
    return <LoadingSpinner text="Aggregating platform intelligence..." />;
  }

  const isSuperAdmin = user?.isSuperAdmin || user?.email === 'admin@localserve.com';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Executive Clean Header */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Executive Operations & Governance</h1>
            {isSuperAdmin ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 flex items-center space-x-1 shadow-xs ring-1 ring-amber-300">
                <Crown size={12} className="text-amber-700" />
                <span>Root Super Admin (Sh1vam)</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 flex items-center space-x-1">
                <Shield size={12} />
                <span>Administrator</span>
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Real-time audit telemetry, zero-loss transaction logging, and access control governance.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/admin/businesses"
            className="px-4 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-xs font-bold text-gray-700 transition-colors"
          >
            Moderate Listings
          </Link>
          <Link
            to="/admin/users"
            className="px-4 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-xs font-bold text-gray-700 transition-colors"
          >
            Manage Users
          </Link>
        </div>
      </div>

      {/* Top Level Uncluttered KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs space-y-1">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Registered Accounts</span>
            <Users className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-2xl font-black text-gray-900">{stats?.users?.total || 0}</p>
          <p className="text-[11px] text-gray-400">
            {stats?.users?.customers || 0} customers · {stats?.users?.owners || 0} owners · {stats?.users?.admins || 1} admins
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs space-y-1">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Store Listings</span>
            <Store className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-gray-900">{stats?.businesses?.total || 0}</p>
          <p className="text-[11px] text-gray-400">
            {stats?.businesses?.verified || 0} verified partners · {stats?.businesses?.pendingVerifications || 0} pending review
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs space-y-1">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Platform Bookings</span>
            <Calendar className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-gray-900">{stats?.bookings?.total || 0}</p>
          <p className="text-[11px] text-emerald-600 font-bold">
            {stats?.bookings?.verified || 0} OTP-verified deliveries
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs space-y-1">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Gross Platform GMV</span>
            <DollarSign className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-2xl font-black text-emerald-800">₹{stats?.revenue || 0}</p>
          <p className="text-[11px] text-gray-400">Completed & confirmed revenue</p>
        </div>
      </div>

      {/* Verification Queue Alert (When stores require audit) */}
      {(stats?.businesses?.pendingVerifications || 0) > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-600 text-white rounded-2xl shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-amber-950">
                {stats.businesses.pendingVerifications} Store Verification Request(s) Awaiting Audit
              </h2>
              <p className="text-xs text-amber-800">
                Owners have submitted municipal licenses, GSTIN credentials, and minimum 3 premise photos for review.
              </p>
            </div>
          </div>

          <Link
            to="/admin/businesses?status=pending_review"
            className="px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-colors shadow-xs flex items-center space-x-1 shrink-0"
          >
            <span>Review & Audit Queue</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      )}

      {/* Main Clean Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeTab === 'overview'
              ? 'bg-gray-900 text-white shadow-xs'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Activity size={14} />
          <span>Platform Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('best-stores')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeTab === 'best-stores'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Trophy size={14} />
          <span>Best Performing Stores</span>
        </button>

        <button
          onClick={() => setActiveTab('coupons')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeTab === 'coupons'
              ? 'bg-[#2f6b4f] text-white shadow-xs'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Tag size={14} />
          <span>Coupons & Promos</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeTab === 'logs'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <FileText size={14} />
          <span>Live Audit & Security Logs</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white">
            {stats?.logs?.total || 'All'}
          </span>
        </button>

        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab('admins')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'admins'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Crown size={14} />
            <span>Administrator Authority (RBAC)</span>
          </button>
        )}
      </div>

      {/* TAB 1: PLATFORM OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Recent Appointments Feed */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Recent Platform Appointments</h3>
                <p className="text-xs text-gray-400">Live booking activity with customer & store info</p>
              </div>
              <button
                onClick={fetchPlatformData}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                title="Refresh feed"
              >
                <RefreshCw size={14} />
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {recentBookings.length === 0 ? (
                <p className="py-6 text-center text-xs text-gray-400">No appointments recorded yet.</p>
              ) : (
                recentBookings.map((b) => (
                  <div key={b._id} className="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-gray-900">
                        {b.customer?.name} → <span className="text-emerald-800 font-bold">{b.business?.name}</span> ({b.service?.name})
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {b.date} at {b.startTime} · ₹{b.totalPrice} · Booking #{b._id.slice(-6)}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      {b.isVerified && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 flex items-center space-x-0.5">
                          <CheckCircle2 size={11} />
                          <span>OTP Verified</span>
                        </span>
                      )}
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        b.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.status === 'checked-in'
                          ? 'bg-blue-100 text-blue-800'
                          : b.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BEST PERFORMING STORES LEADERBOARD */}
      {activeTab === 'best-stores' && (
        <div className="space-y-6">
          {/* Executive Overview Header */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-extrabold text-gray-900">
                  Best Performing Stores & Partner Leaderboard
                </h3>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Data-driven evaluation of platform merchant performance scored across Gross GMV, OTP-verified service delivery, and verified customer ratings.
              </p>
            </div>

            <button
              onClick={fetchBestStores}
              className="px-3.5 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 border border-gray-200"
            >
              <RefreshCw size={13} className={bestStoresLoading ? 'animate-spin' : ''} />
              <span>Refresh Analytics</span>
            </button>
          </div>

          {/* Key Leaderboard Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 p-5 rounded-3xl shadow-xs space-y-1">
              <div className="flex justify-between items-center text-amber-800">
                <span className="text-[11px] font-bold uppercase tracking-wider">Platform Champion #1</span>
                <Crown className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-lg font-black text-gray-900 truncate">
                {bestStoresSummary?.topStore?.name || 'Top Store'}
              </p>
              <p className="text-xs font-bold text-amber-800">
                ₹{bestStoresSummary?.topStore?.revenue || 0} Gross GMV
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs space-y-1">
              <div className="flex justify-between items-center text-gray-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Ranked GMV Volume</span>
                <DollarSign className="w-4 h-4 text-emerald-700" />
              </div>
              <p className="text-2xl font-black text-emerald-800">
                ₹{bestStoresSummary?.totalGmv || 0}
              </p>
              <p className="text-[11px] text-gray-400">Completed & confirmed revenue</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs space-y-1">
              <div className="flex justify-between items-center text-gray-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Verified Deliveries</span>
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-black text-gray-900">
                {bestStoresSummary?.totalCompletedAppointments || 0}
              </p>
              <p className="text-[11px] text-blue-600 font-bold">100% OTP Verified</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs space-y-1">
              <div className="flex justify-between items-center text-gray-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Avg Customer Score</span>
                <Award className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-gray-900">
                {bestStoresSummary?.averageStoreRating || 4.8} <span className="text-sm font-normal text-amber-500">★</span>
              </p>
              <p className="text-[11px] text-gray-400">Across verified client reviews</p>
            </div>
          </div>

          {/* Controls & Filter Bar */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
                {[
                  { id: 'all', label: 'All Categories' },
                  { id: 'salon', label: '💇 Salons' },
                  { id: 'spa', label: '💆 Spas' },
                  { id: 'gym', label: '🏋️ Gyms' },
                  { id: 'parlour', label: '💄 Parlours' },
                  { id: 'wellness', label: '🧘 Wellness' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setStoreCategory(c.id)}
                    className={`px-3 py-1.5 rounded-xl transition-all ${
                      storeCategory === c.id
                        ? 'bg-amber-600 text-white shadow-xs font-bold'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Search & Sort Controls */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                {/* Search input */}
                <div className="relative flex-1 sm:w-48">
                  <Search size={13} className="text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={storeSearch}
                    onChange={(e) => setStoreSearch(e.target.value)}
                    placeholder="Search by store or city..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Sort By Dropdown */}
                <select
                  value={storeSortBy}
                  onChange={(e) => setStoreSortBy(e.target.value)}
                  className="px-3 py-1.5 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl text-gray-700 outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="score">Sort: Performance Score</option>
                  <option value="revenue">Sort: Highest GMV Revenue</option>
                  <option value="rating">Sort: Customer Rating</option>
                  <option value="bookings">Sort: Completed Bookings</option>
                </select>

                {/* Time Window */}
                <select
                  value={storeTimeWindow}
                  onChange={(e) => setStoreTimeWindow(e.target.value)}
                  className="px-3 py-1.5 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl text-gray-700 outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="all">Time: All-Time</option>
                  <option value="month">Time: This Month</option>
                  <option value="week">Time: Past 7 Days</option>
                </select>
              </div>
            </div>

            {/* Leaderboard Table */}
            {bestStoresLoading ? (
              <div className="py-16 text-center text-xs text-gray-400">
                Calculating multi-dimensional performance scores...
              </div>
            ) : bestStores.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400">
                No stores found matching current filter criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                      <th className="pb-3 text-center w-12">Rank</th>
                      <th className="pb-3">Store & Location</th>
                      <th className="pb-3">Performance Score</th>
                      <th className="pb-3">Gross GMV</th>
                      <th className="pb-3">Deliveries & Completion</th>
                      <th className="pb-3">Rating & Reviews</th>
                      <th className="pb-3">Verification</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {bestStores
                      .filter((s) => {
                        if (!storeSearch.trim()) return true;
                        const q = storeSearch.toLowerCase();
                        return (
                          s.name.toLowerCase().includes(q) ||
                          (s.address?.city && s.address.city.toLowerCase().includes(q)) ||
                          (s.category && s.category.toLowerCase().includes(q))
                        );
                      })
                      .map((store) => {
                        const isTop1 = store.rank === 1;
                        const isTop2 = store.rank === 2;
                        const isTop3 = store.rank === 3;

                        return (
                          <tr
                            key={store._id}
                            className={`hover:bg-gray-50/60 transition-colors ${
                              isTop1 ? 'bg-amber-50/20' : ''
                            }`}
                          >
                            {/* Rank Column */}
                            <td className="py-4 text-center">
                              {isTop1 ? (
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-900 font-black text-xs ring-2 ring-amber-300 shadow-xs" title="Rank #1 Gold Medal">
                                  🥇 1
                                </span>
                              ) : isTop2 ? (
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-800 font-black text-xs ring-2 ring-slate-300 shadow-xs" title="Rank #2 Silver Medal">
                                  🥈 2
                                </span>
                              ) : isTop3 ? (
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-900 font-black text-xs ring-2 ring-orange-300 shadow-xs" title="Rank #3 Bronze Medal">
                                  🥉 3
                                </span>
                              ) : (
                                <span className="font-bold text-gray-500 font-mono">
                                  #{store.rank}
                                </span>
                              )}
                            </td>

                            {/* Store Name & Category */}
                            <td className="py-4 pr-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-2xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                                  <img
                                    src={store.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=150&q=80'}
                                    alt={store.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=150&q=80';
                                    }}
                                  />
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900 text-xs hover:text-amber-700">
                                    {store.name}
                                  </p>
                                  <p className="text-[11px] text-gray-400">
                                    <span className="uppercase font-semibold text-gray-600">{store.category}</span> · {store.address?.city || 'Mumbai'}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Score & Badge */}
                            <td className="py-4 pr-3 whitespace-nowrap">
                              <div className="flex items-center space-x-1.5">
                                <span className="font-mono font-bold text-xs text-gray-900">
                                  {store.performanceScore} pts
                                </span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  isTop1
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : isTop2
                                    ? 'bg-slate-100 text-slate-800'
                                    : isTop3
                                    ? 'bg-orange-100 text-orange-900'
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {store.badge}
                                </span>
                              </div>
                            </td>

                            {/* Gross GMV Revenue */}
                            <td className="py-4 pr-3 whitespace-nowrap">
                              <span className="font-extrabold text-xs text-emerald-800">
                                ₹{store.revenue}
                              </span>
                              {store.discountGiven > 0 && (
                                <p className="text-[10px] text-gray-400">
                                  -₹{store.discountGiven} in promos
                                </p>
                              )}
                            </td>

                            {/* Bookings & Completion Rate */}
                            <td className="py-4 pr-3 whitespace-nowrap min-w-[140px]">
                              <div className="space-y-1">
                                <div className="flex justify-between text-[11px]">
                                  <span className="font-bold text-gray-800">
                                    {store.completedBookings} done
                                  </span>
                                  <span className="text-gray-400 font-mono">
                                    {store.completionRate}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className="bg-emerald-600 h-1.5 rounded-full"
                                    style={{ width: `${Math.min(store.completionRate, 100)}%` }}
                                  />
                                </div>
                                <p className="text-[10px] text-gray-400">
                                  {store.totalBookings} total booked · {store.verifiedBookings} OTP verified
                                </p>
                              </div>
                            </td>

                            {/* Customer Rating */}
                            <td className="py-4 pr-3 whitespace-nowrap">
                              <div className="flex items-center space-x-1">
                                <span className="font-extrabold text-xs text-gray-900">
                                  {store.rating ? store.rating.toFixed(1) : '4.5'}
                                </span>
                                <span className="text-amber-500 text-xs">★</span>
                                <span className="text-[10px] text-gray-400">
                                  ({store.reviewCount || 0})
                                </span>
                              </div>
                            </td>

                            {/* Verification */}
                            <td className="py-4 pr-3 whitespace-nowrap">
                              {store.verificationStatus === 'verified' ? (
                                <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  <CheckCircle2 size={11} />
                                  <span>Verified Partner</span>
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold text-gray-400">
                                  {store.verificationStatus}
                                </span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="py-4 text-right whitespace-nowrap">
                              <a
                                href={`/business/${store._id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold transition-colors border border-gray-200"
                                title="Open Live Store Profile"
                              >
                                <span>Inspect</span>
                                <ExternalLink size={11} />
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PROMOTIONAL & COUPONS ENGINE */}
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <Tag className="w-5 h-5 text-[#2f6b4f]" />
                <h3 className="text-base font-extrabold text-gray-900">
                  Coupons & Promotional Discount Engine
                </h3>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Centrally create and manage platform-wide vouchers for all stores, or audit store-specific promotional discount campaigns and their active time frames.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCreateCouponModal(true)}
                className="px-4 py-2 bg-[#2f6b4f] hover:bg-[#25553e] text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors"
              >
                <Plus size={14} />
                <span>Create Platform Coupon</span>
              </button>
              <button
                onClick={fetchCoupons}
                className="p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-700"
                title="Refresh Coupons"
              >
                <RefreshCw size={14} className={couponsLoading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Scope Filters */}
          <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
            {[
              { id: 'all', label: 'All Promotions' },
              { id: 'platform', label: '🌐 Platform-Wide Vouchers' },
              { id: 'store', label: '🏪 Store-Specific Offers' },
            ].map((scp) => (
              <button
                key={scp.id}
                onClick={() => setCouponScopeFilter(scp.id)}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  couponScopeFilter === scp.id
                    ? 'bg-[#2f6b4f] text-white shadow-xs font-bold'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {scp.label}
              </button>
            ))}
          </div>

          {/* Coupons Table */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
            {couponsLoading ? (
              <div className="py-12 text-center text-xs text-gray-400">Loading coupon engine data...</div>
            ) : coupons.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400">
                No coupons found for filter "{couponScopeFilter}". Click "Create Platform Coupon" to launch a campaign.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                      <th className="pb-3">Coupon Code & Title</th>
                      <th className="pb-3">Target Scope</th>
                      <th className="pb-3">Discount Value</th>
                      <th className="pb-3">Min Order</th>
                      <th className="pb-3">Active Time Frame</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Usage / Limit</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {coupons.map((coupon) => {
                      const isPlatform = coupon.scope === 'platform';
                      const status = coupon.status || 'active';

                      return (
                        <tr key={coupon._id} className="hover:bg-gray-50/50">
                          {/* Code */}
                          <td className="py-3.5 pr-3">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono font-black text-xs px-2.5 py-1 rounded-xl bg-gray-100 border border-gray-200 text-gray-900 tracking-wider">
                                {coupon.code}
                              </span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(coupon.code);
                                  toast.success(`Copied "${coupon.code}"`);
                                }}
                                className="text-gray-400 hover:text-gray-700"
                                title="Copy code"
                              >
                                <Copy size={12} />
                              </button>
                            </div>
                            <p className="text-[11px] font-medium text-gray-700 mt-1">
                              {coupon.title || coupon.code}
                            </p>
                          </td>

                          {/* Scope */}
                          <td className="py-3.5 pr-3 whitespace-nowrap">
                            {isPlatform ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                                🌐 Platform-Wide
                              </span>
                            ) : (
                              <div>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700">
                                  🏪 Store-Specific
                                </span>
                                <p className="text-[11px] text-gray-600 font-semibold mt-0.5 truncate max-w-[130px]">
                                  {coupon.business?.name || 'Exclusive Store'}
                                </p>
                              </div>
                            )}
                          </td>

                          {/* Discount Value */}
                          <td className="py-3.5 pr-3 whitespace-nowrap font-bold text-gray-900">
                            {coupon.discountType === 'percentage' ? (
                              <span>
                                {coupon.discountValue}% OFF
                                {coupon.maxDiscountAmount && (
                                  <span className="block text-[10px] font-normal text-gray-400">
                                    (up to ₹{coupon.maxDiscountAmount})
                                  </span>
                                )}
                              </span>
                            ) : (
                              <span>Flat ₹{coupon.discountValue} OFF</span>
                            )}
                          </td>

                          {/* Min Order */}
                          <td className="py-3.5 pr-3 whitespace-nowrap text-gray-600">
                            {coupon.minBookingAmount ? `₹${coupon.minBookingAmount}` : 'No minimum'}
                          </td>

                          {/* Active Time Frame */}
                          <td className="py-3.5 pr-3 whitespace-nowrap text-gray-600">
                            <div className="text-[11px]">
                              <span>{new Date(coupon.validFrom).toLocaleDateString()}</span>
                              <span className="text-gray-400 mx-1">→</span>
                              <span className="font-semibold text-gray-900">
                                {new Date(coupon.validUntil).toLocaleDateString()}
                              </span>
                            </div>
                          </td>

                          {/* Live Dynamic Status */}
                          <td className="py-3.5 pr-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              status === 'active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : status === 'scheduled'
                                ? 'bg-blue-100 text-blue-800'
                                : status === 'expired'
                                ? 'bg-red-100 text-red-800'
                                : status === 'exhausted'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {status}
                            </span>
                          </td>

                          {/* Usage / Limit */}
                          <td className="py-3.5 pr-3 whitespace-nowrap min-w-[110px]">
                            <div className="space-y-0.5">
                              <div className="flex justify-between text-[11px]">
                                <span className="font-semibold text-gray-800">{coupon.usedCount} used</span>
                                <span className="text-gray-400">/ {coupon.usageLimit}</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden">
                                <div
                                  className="bg-[#2f6b4f] h-1 rounded-full"
                                  style={{
                                    width: `${Math.min(
                                      coupon.usageLimit ? (coupon.usedCount / coupon.usageLimit) * 100 : 0,
                                      100
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={() => handleToggleCouponStatus(coupon._id, coupon.isActive)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                                  coupon.isActive
                                    ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                }`}
                              >
                                {coupon.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                onClick={() => handleDeleteCoupon(coupon._id, coupon.code)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete coupon"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-5">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-emerald-800" />
                <span>Immutable Security & Transaction Logs</span>
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Every login, booking, arrival check-in, and administrative action is preserved in the database.
              </p>
            </div>

            {/* Search and Refresh */}
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search size={14} className="text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchAuditLogs()}
                  placeholder="Filter logs by keyword..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>
              <button
                onClick={fetchAuditLogs}
                className="p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-700"
                title="Refresh Logs"
              >
                <RefreshCw size={14} className={logsLoading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
            {[
              { id: 'all', label: 'All Events' },
              { id: 'auth', label: '🔑 Logins & Auth' },
              { id: 'booking', label: '📅 Bookings & OTP' },
              { id: 'verification', label: '🛡️ Store Verifications' },
              { id: 'governance', label: '👑 Admin Actions' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setLogCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  logCategory === cat.id
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Logs Table */}
          {logsLoading ? (
            <div className="py-12 text-center text-xs text-gray-400">Loading audit records...</div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400">
              No audit logs recorded for filter "{logCategory}".
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                    <th className="pb-3">Timestamp</th>
                    <th className="pb-3">Event Type</th>
                    <th className="pb-3">Actor / User</th>
                    <th className="pb-3">Description</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {logs.map((log) => {
                    const isSuccess = log.status === 'success';
                    const isFailed = log.status === 'failed';

                    return (
                      <tr key={log._id} className="hover:bg-gray-50/50">
                        <td className="py-3 pr-3 text-gray-400 whitespace-nowrap font-mono text-[11px]">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          <span className="block text-[10px] text-gray-300">
                            {new Date(log.timestamp).toLocaleDateString()}
                          </span>
                        </td>

                        <td className="py-3 pr-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            log.category === 'auth'
                              ? 'bg-purple-50 text-purple-700'
                              : log.category === 'booking'
                              ? 'bg-blue-50 text-blue-700'
                              : log.category === 'verification'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}>
                            {log.action.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="py-3 pr-3 whitespace-nowrap">
                          <p className="font-semibold text-gray-900">{log.actor?.name || 'Anonymous'}</p>
                          <p className="text-[10px] text-gray-400">{log.actor?.email || log.actor?.role}</p>
                        </td>

                        <td className="py-3 pr-3 text-gray-600 max-w-md">
                          {log.description}
                        </td>

                        <td className="py-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isSuccess
                              ? 'bg-emerald-100 text-emerald-800'
                              : isFailed
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ADMINISTRATOR AUTHORITY & RBAC (Super Admin Only) */}
      {activeTab === 'admins' && isSuperAdmin && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5">
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
                <Crown className="w-4 h-4 text-amber-600" />
                <span>Administrator Directory & Role-Based Access Control</span>
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                As the Root Super Admin (Sh1vam), you hold the exclusive authority to create new sub-admins and delegate platform permissions.
              </p>
            </div>

            <button
              onClick={() => setCreateAdminModal(true)}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors"
            >
              <Plus size={14} />
              <span>Create New Sub-Admin</span>
            </button>
          </div>

          {/* Admins Table */}
          {adminsLoading ? (
            <div className="py-12 text-center text-xs text-gray-400">Loading administrators...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                    <th className="pb-3">Admin Name & Username</th>
                    <th className="pb-3">Email Address</th>
                    <th className="pb-3">Authority Level</th>
                    <th className="pb-3">Assigned Permissions</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {admins.map((adm) => {
                    const isRoot = adm.isSuperAdmin || adm.email === 'admin@localserve.com';

                    return (
                      <tr key={adm._id} className="hover:bg-gray-50/50">
                        <td className="py-4 pr-3">
                          <div className="flex items-center space-x-2">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                              isRoot ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {isRoot ? <Crown size={14} /> : <UserIcon size={14} />}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{adm.name}</p>
                              <p className="text-[10px] font-mono text-gray-400">@{adm.username || 'admin'}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 pr-3 font-medium text-gray-700">
                          {adm.email}
                        </td>

                        <td className="py-4 pr-3">
                          {isRoot ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                              Root Super Admin
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700">
                              Delegated Sub-Admin
                            </span>
                          )}
                        </td>

                        <td className="py-4 pr-3">
                          <div className="flex flex-wrap gap-1">
                            {isRoot ? (
                              <span className="text-[11px] text-amber-800 font-bold">★ Full Root Authority</span>
                            ) : (
                              <>
                                {adm.adminPermissions?.canVerifyBusinesses && (
                                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-semibold">
                                    ✓ Store Auditor
                                  </span>
                                )}
                                {adm.adminPermissions?.canManageUsers && (
                                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 text-[10px] font-semibold">
                                    ✓ User Moderator
                                  </span>
                                )}
                                {adm.adminPermissions?.canManageBookings && (
                                  <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 text-[10px] font-semibold">
                                    ✓ Booking Oversight
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </td>

                        <td className="py-4 text-right">
                          {isRoot ? (
                            <span className="text-[11px] text-gray-400 italic">Protected</span>
                          ) : (
                            <button
                              onClick={() => handleRevokeAdmin(adm._id, adm.name)}
                              className="px-3 py-1.5 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs font-bold transition-colors"
                            >
                              Revoke Access
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CREATE SUB-ADMIN MODAL */}
      {createAdminModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-gray-100 animate-in fade-in">
            <div className="flex justify-between items-start border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-gray-900 flex items-center space-x-2">
                  <Crown className="w-5 h-5 text-amber-600" />
                  <span>Grant New Administrator Access</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Create a delegated sub-admin and assign specific platform privileges.
                </p>
              </div>
              <button
                onClick={() => setCreateAdminModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rohit Kumar"
                  value={newAdminData.name}
                  onChange={(e) => setNewAdminData({ ...newAdminData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    placeholder="e.g. rohit.audit"
                    value={newAdminData.username}
                    onChange={(e) => setNewAdminData({ ...newAdminData, username: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="rohit@localserve.com"
                    value={newAdminData.email}
                    onChange={(e) => setNewAdminData({ ...newAdminData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Initial Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={newAdminData.password}
                  onChange={(e) => setNewAdminData({ ...newAdminData, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 outline-none"
                />
              </div>

              {/* Granular Permission Toggles */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2.5">
                <p className="text-xs font-bold text-gray-800">Assign Platform Access Rights:</p>
                <div className="space-y-2 text-xs text-gray-700">
                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAdminData.permissions.canVerifyBusinesses}
                      onChange={(e) =>
                        setNewAdminData({
                          ...newAdminData,
                          permissions: { ...newAdminData.permissions, canVerifyBusinesses: e.target.checked },
                        })
                      }
                      className="rounded text-emerald-700 focus:ring-emerald-700"
                    />
                    <span>🛡️ <strong>Store Auditor</strong>: Audit trade licenses, photos, and grant verified badges</span>
                  </label>

                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAdminData.permissions.canManageUsers}
                      onChange={(e) =>
                        setNewAdminData({
                          ...newAdminData,
                          permissions: { ...newAdminData.permissions, canManageUsers: e.target.checked },
                        })
                      }
                      className="rounded text-emerald-700 focus:ring-emerald-700"
                    />
                    <span>👥 <strong>User Moderator</strong>: Suspend or activate customer and owner accounts</span>
                  </label>

                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAdminData.permissions.canManageBookings}
                      onChange={(e) =>
                        setNewAdminData({
                          ...newAdminData,
                          permissions: { ...newAdminData.permissions, canManageBookings: e.target.checked },
                        })
                      }
                      className="rounded text-emerald-700 focus:ring-emerald-700"
                    />
                    <span>💳 <strong>Financial Oversight</strong>: Monitor transactions, bookings, and platform GMV</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCreateAdminModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdmin}
                  className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50"
                >
                  {submittingAdmin ? 'Provisioning...' : 'Confirm & Create Sub-Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE PLATFORM COUPON MODAL */}
      {createCouponModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-gray-100 animate-in fade-in">
            <div className="flex justify-between items-start border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-gray-900 flex items-center space-x-2">
                  <Tag className="w-5 h-5 text-[#2f6b4f]" />
                  <span>Issue Platform Promotional Coupon</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Deploy a site-wide coupon code redeemable at all salons, spas, and gyms across NearNest.
                </p>
              </div>
              <button
                onClick={() => setCreateCouponModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Coupon Promo Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FESTIVE25 or WELCOME100"
                  value={newCouponData.code}
                  onChange={(e) =>
                    setNewCouponData({ ...newCouponData, code: e.target.value.toUpperCase() })
                  }
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold tracking-wider uppercase focus:ring-2 focus:ring-[#2f6b4f] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Coupon Title</label>
                <input
                  type="text"
                  placeholder="e.g. Platform Welcome Discount"
                  value={newCouponData.title}
                  onChange={(e) =>
                    setNewCouponData({ ...newCouponData, title: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#2f6b4f] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description / Terms</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Valid on all haircut and spa appointments on NearNest."
                  value={newCouponData.description}
                  onChange={(e) =>
                    setNewCouponData({ ...newCouponData, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#2f6b4f] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Discount Type</label>
                  <select
                    value={newCouponData.discountType}
                    onChange={(e) =>
                      setNewCouponData({ ...newCouponData, discountType: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#2f6b4f] outline-none font-semibold"
                  >
                    <option value="percentage">Percentage (% OFF)</option>
                    <option value="flat">Flat Amount (₹ OFF)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {newCouponData.discountType === 'percentage' ? 'Discount % *' : 'Discount Amount (₹) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={newCouponData.discountType === 'percentage' ? 90 : 5000}
                    value={newCouponData.discountValue}
                    onChange={(e) =>
                      setNewCouponData({ ...newCouponData, discountValue: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#2f6b4f] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Min Booking Amount (₹)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={newCouponData.minBookingAmount}
                    onChange={(e) =>
                      setNewCouponData({ ...newCouponData, minBookingAmount: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#2f6b4f] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Max Cap (₹, optional)</label>
                  <input
                    type="number"
                    placeholder="e.g. 250"
                    disabled={newCouponData.discountType === 'flat'}
                    value={newCouponData.maxDiscountAmount}
                    onChange={(e) =>
                      setNewCouponData({ ...newCouponData, maxDiscountAmount: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#2f6b4f] outline-none disabled:opacity-40"
                  />
                </div>
              </div>

              {/* Active Time Frame Section */}
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                <p className="text-xs font-bold text-gray-800 flex items-center space-x-1.5">
                  <Clock size={13} className="text-[#2f6b4f]" />
                  <span>Active Time Frame *</span>
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-0.5">Valid From (Start Date)</label>
                    <input
                      type="date"
                      required
                      value={newCouponData.validFrom}
                      onChange={(e) =>
                        setNewCouponData({ ...newCouponData, validFrom: e.target.value })
                      }
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#2f6b4f] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-500 mb-0.5">Valid Until (Expiration Date) *</label>
                    <input
                      type="date"
                      required
                      min={newCouponData.validFrom || new Date().toISOString().split('T')[0]}
                      value={newCouponData.validUntil}
                      onChange={(e) =>
                        setNewCouponData({ ...newCouponData, validUntil: e.target.value })
                      }
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:ring-2 focus:ring-[#2f6b4f] outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Total Usage Limit</label>
                <input
                  type="number"
                  min={1}
                  placeholder="100"
                  value={newCouponData.usageLimit}
                  onChange={(e) =>
                    setNewCouponData({ ...newCouponData, usageLimit: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#2f6b4f] outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCreateCouponModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCoupon}
                  className="px-5 py-2.5 bg-[#2f6b4f] hover:bg-[#25553e] text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50"
                >
                  {submittingCoupon ? 'Deploying...' : 'Deploy Promotional Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
