import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
  Store, 
  Calendar, 
  DollarSign, 
  Star, 
  Users, 
  Clock, 
  ShieldCheck, 
  Plus, 
  ArrowRight,
  Key,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

const OwnerDashboard = () => {
  const [business, setBusiness] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkinOtpInput, setCheckinOtpInput] = useState({});

  const fetchData = async () => {
    try {
      const bizRes = await api.get('/businesses/owner/me');
      setBusiness(bizRes.data.data);

      if (bizRes.data.data?._id) {
        const bookRes = await api.get(`/bookings/business/${bizRes.data.data._id}`);
        setBookings(bookRes.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load owner dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVerifyCheckin = async (bookingId) => {
    const otp = checkinOtpInput[bookingId];
    if (!otp || String(otp).trim().length !== 4) {
      toast.error('Please enter the customer 4-digit check-in code');
      return;
    }

    try {
      const res = await api.put(`/bookings/${bookingId}/verify-checkin`, { otp });
      toast.success(res.data.message || 'Check-in verified!');
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid check-in code';
      toast.error(msg);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading your business dashboard..." />;
  }

  if (!business) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto">
          <Store className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Create Your Business Profile</h2>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          You haven't registered a business profile yet. Complete your profile to start receiving customer appointments.
        </p>
        <Link
          to="/owner/business"
          className="inline-flex items-center px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow-xs hover:bg-indigo-700"
        >
          <span>Set Up Business Profile</span>
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Link>
      </div>
    );
  }

  // Calculate metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter((b) => b.date === todayStr);
  const revenue = bookings
    .filter((b) => ['confirmed', 'checked-in', 'completed'].includes(b.status))
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-gray-900">{business.name}</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
              business.verificationStatus === 'verified'
                ? 'bg-emerald-100 text-emerald-800'
                : business.verificationStatus === 'pending_review'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {business.verificationStatus === 'verified' ? '✓ Verified Store' : business.verificationStatus === 'pending_review' ? '⏳ Under Review' : '⚠️ Unverified'}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700">
              {business.status}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Category: <span className="font-semibold uppercase">{business.category}</span> · {business.address?.city}
            {business.pinpointLocation?.landmark ? ` · Near ${business.pinpointLocation.landmark}` : ''}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Direct Store Maps Link */}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([business.name, business.address?.street, business.address?.city].filter(Boolean).join(' '))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-emerald-200"
            title="Open pinned store address in Google Maps"
          >
            <span>🗺️ Store Maps Link</span>
            <ArrowRight className="w-3 h-3" />
          </a>

          <Link
            to="/owner/business#coupons-section"
            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-amber-200"
            title="List store promotional coupons and active time frames"
          >
            <span>🏷️ Store Coupons</span>
          </Link>

          <Link
            to="/owner/services"
            className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Services</span>
          </Link>
          <Link
            to="/owner/business"
            className="px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-semibold transition-colors"
          >
            Manage Photos & Verification
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs space-y-1">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Bookings</span>
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-extrabold text-gray-900">{bookings.length}</p>
          <span className="text-[10px] text-gray-400">All-time reservations</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs space-y-1">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Today's Visits</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-gray-900">{todayBookings.length}</p>
          <span className="text-[10px] text-blue-600 font-medium">Scheduled for today</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs space-y-1">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-700">₹{revenue}</p>
          <span className="text-[10px] text-emerald-600 font-medium">From active/done slots</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs space-y-1">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Rating & Reviews</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-gray-900">
            {business.rating ? business.rating.toFixed(1) : '4.5'}
          </p>
          <span className="text-[10px] text-gray-400">{business.reviewCount || 0} customer reviews</span>
        </div>
      </div>

      {/* TODAY'S APPOINTMENTS & FAST CHECK-IN VERIFICATION */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900">Today's Schedule & OTP Arrival Desk</h3>
            <p className="text-xs text-gray-400">Verify customer 4-digit arrival codes to confirm check-ins</p>
          </div>
          <Link to="/owner/bookings" className="text-xs font-semibold text-indigo-600 hover:underline">
            View All ({bookings.length}) →
          </Link>
        </div>

        {todayBookings.length === 0 ? (
          <p className="text-xs text-gray-400 py-6 text-center">No bookings scheduled for today yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {todayBookings.map((b) => (
              <div key={b._id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-gray-900">{b.customer?.name}</span>
                    <span className="text-xs text-gray-400">({b.customer?.phone || b.customer?.email})</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      b.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-700'
                        : b.status === 'checked-in'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-indigo-50 text-indigo-700'
                    }`}>
                      {b.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    <span className="font-semibold">{b.service?.name}</span> · ₹{b.totalPrice} · {b.startTime} - {b.endTime}
                  </p>
                </div>

                {/* OTP Check-in Verification input for Owner */}
                {b.status === 'confirmed' && (
                  <div className="flex items-center space-x-2 bg-indigo-50/60 p-2 rounded-2xl border border-indigo-100">
                    <Key className="w-4 h-4 text-indigo-600 ml-1" />
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="Customer OTP"
                      value={checkinOtpInput[b._id] || ''}
                      onChange={(e) =>
                        setCheckinOtpInput({ ...checkinOtpInput, [b._id]: e.target.value })
                      }
                      className="w-28 px-2 py-1 text-xs font-mono font-bold text-center border border-indigo-200 rounded-xl bg-white focus:outline-none"
                    />
                    <button
                      onClick={() => handleVerifyCheckin(b._id)}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs"
                    >
                      Verify Check-in
                    </button>
                  </div>
                )}

                {b.status === 'checked-in' && (
                  <div className="text-xs text-blue-700 font-semibold bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 flex items-center space-x-1">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Checked in! Completion Code to tell customer: <strong className="font-mono text-sm">{b.completionOTP}</strong></span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;
