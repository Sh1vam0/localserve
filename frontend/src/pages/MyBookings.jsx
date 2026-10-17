import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Key, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Car
} from 'lucide-react';
import { getUberDeepLink, getOlaDeepLink, getGoogleMapsDirectionsUrl } from '../utils/rideLinks';
import toast from 'react-hot-toast';

const MyBookings = () => {
  const { user, refreshUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'completed' | 'cancelled'
  const [completionInput, setCompletionInput] = useState({});
  const [rescheduleData, setRescheduleData] = useState(null); // booking to reschedule

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/my');
      setBookings(res.data.data || []);
    } catch (err) {
      console.error('Failed to load bookings:', err);
      toast.error('Could not load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? Eligible refunds will be credited to your wallet.')) {
      return;
    }

    try {
      const res = await api.put(`/bookings/${bookingId}/cancel`);
      toast.success(res.data.message || 'Booking cancelled');
      fetchBookings();
      if (refreshUser) refreshUser();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cancel booking';
      toast.error(msg);
    }
  };

  const handleVerifyCompletion = async (bookingId) => {
    const otp = completionInput[bookingId];
    if (!otp || String(otp).trim().length !== 4) {
      toast.error('Please enter the 4-digit completion code provided by the business');
      return;
    }

    try {
      const res = await api.put(`/bookings/${bookingId}/verify-completion`, { otp });
      toast.success(res.data.message || 'Service verified and completed!');
      fetchBookings();
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid completion code';
      toast.error(msg);
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleData) return;

    try {
      const res = await api.put(`/bookings/${rescheduleData._id}/reschedule`, {
        date: rescheduleData.newDate,
        startTime: rescheduleData.newTime,
      });
      toast.success('Booking rescheduled successfully!');
      setRescheduleData(null);
      fetchBookings();
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not reschedule slot';
      toast.error(msg);
    }
  };

  const filterBookings = () => {
    if (activeTab === 'upcoming') {
      return bookings.filter((b) => ['confirmed', 'checked-in', 'pending'].includes(b.status));
    }
    if (activeTab === 'completed') {
      return bookings.filter((b) => b.status === 'completed');
    }
    if (activeTab === 'cancelled') {
      return bookings.filter((b) => ['cancelled', 'no-show'].includes(b.status));
    }
    return bookings;
  };

  const filtered = filterBookings();

  if (loading) {
    return <LoadingSpinner text="Loading your appointments..." />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Title & Wallet Summary */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            My Appointments
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Track arrival codes, service completions, and verified visits
          </p>
        </div>

        <div className="bg-emerald-50 border border-emerald-100 px-4 py-2.5 rounded-2xl flex items-center space-x-3">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 block">
              Wallet Balance
            </span>
            <span className="text-base font-extrabold text-emerald-800">
              ₹{user?.walletBalance || 0}
            </span>
          </div>
          <Link to="/profile" className="text-xs text-emerald-700 underline font-medium">
            History
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-gray-200 space-x-6 text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3 transition-colors ${
            activeTab === 'upcoming'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-400 hover:text-gray-700'
          }`}
        >
          Upcoming ({bookings.filter((b) => ['confirmed', 'checked-in', 'pending'].includes(b.status)).length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`pb-3 transition-colors ${
            activeTab === 'completed'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-400 hover:text-gray-700'
          }`}
        >
          Completed ({bookings.filter((b) => b.status === 'completed').length})
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`pb-3 transition-colors ${
            activeTab === 'cancelled'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-400 hover:text-gray-700'
          }`}
        >
          Cancelled ({bookings.filter((b) => ['cancelled', 'no-show'].includes(b.status)).length})
        </button>
      </div>

      {/* Bookings List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 space-y-3">
          <Calendar className="w-10 h-10 text-gray-300 mx-auto" />
          <h4 className="text-sm font-bold text-gray-800">No {activeTab} bookings</h4>
          <p className="text-xs text-gray-400">Discover top local salons and spas and book your next appointment!</p>
          <Link
            to="/search"
            className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 shadow-xs"
          >
            Explore Services
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((booking) => {
            const isConfirmed = booking.status === 'confirmed';
            const isCheckedIn = booking.status === 'checked-in';
            const isCompleted = booking.status === 'completed';
            const isCancelled = booking.status === 'cancelled';

            const bLat = booking.business?.location?.coordinates?.[1] || 19.076;
            const bLng = booking.business?.location?.coordinates?.[0] || 72.8777;
            const uberUrl = getUberDeepLink({
              name: booking.business?.name,
              lat: bLat,
              lng: bLng,
              street: booking.business?.address?.street,
              city: booking.business?.address?.city,
            });
            const olaUrl = getOlaDeepLink({
              name: booking.business?.name,
              lat: bLat,
              lng: bLng,
            });
            const mapsUrl = getGoogleMapsDirectionsUrl({
              name: booking.business?.name,
              lat: bLat,
              lng: bLng,
              street: booking.business?.address?.street,
              city: booking.business?.address?.city,
            });

            return (
              <div
                key={booking._id}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-gray-100">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-bold text-gray-900">
                        {booking.service?.name || 'Service'}
                      </h3>
                      {/* Status Badges */}
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-700'
                            : isCheckedIn
                            ? 'bg-blue-50 text-blue-700'
                            : isConfirmed
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mt-0.5">
                      at <span className="font-semibold text-gray-800">{booking.business?.name}</span> · {booking.business?.address?.city}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-extrabold text-gray-900">₹{booking.totalPrice}</span>
                    <span className="block text-[10px] text-gray-400">ID: #{booking._id.slice(-6)}</span>
                  </div>
                </div>

                {/* Appointment Schedule & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-600 bg-gray-50/70 p-3.5 rounded-2xl">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <span className="font-semibold">{booking.date}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <span>{booking.startTime} - {booking.endTime}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                    <span className="truncate">{booking.business?.address?.street || booking.business?.address?.city}</span>
                  </div>
                </div>

                {/* TWO-WAY OTP ARRIVAL VERIFICATION (The hackathon highlight!) */}
                {isConfirmed && (
                  <div className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1 text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start space-x-1.5 text-xs font-bold text-indigo-900">
                        <Key className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Step 1: Your Check-In Code</span>
                      </div>
                      <p className="text-[11px] text-indigo-700">
                        Show this 4-digit code to the salon staff upon arrival to check in.
                      </p>
                    </div>

                    <div className="px-5 py-2 bg-white rounded-xl border border-indigo-200 text-2xl font-black tracking-widest text-indigo-900 font-mono shadow-xs">
                      {booking.checkinOTP}
                    </div>
                  </div>
                )}

                {/* TWO-WAY OTP COMPLETION VERIFICATION */}
                {isCheckedIn && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center space-x-2 text-xs font-bold text-emerald-900">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Step 2: Service Done? Enter Business Completion Code</span>
                    </div>
                    <p className="text-[11px] text-emerald-700">
                      Ask your provider for the 4-digit completion code to verify your appointment and unlock verified review perks.
                    </p>

                    <div className="flex gap-2 max-w-xs">
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="4-digit code"
                        value={completionInput[booking._id] || ''}
                        onChange={(e) =>
                          setCompletionInput({ ...completionInput, [booking._id]: e.target.value })
                        }
                        className="w-32 px-3 py-1.5 text-sm font-mono font-bold tracking-widest text-center border border-emerald-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        onClick={() => handleVerifyCompletion(booking._id)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs"
                      >
                        Confirm Done
                      </button>
                    </div>
                  </div>
                )}

                {/* If Cancelled with Refund */}
                {isCancelled && booking.refundAmount > 0 && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center justify-between">
                    <span>Cancelled with refund: ₹{booking.refundAmount} ({booking.refundStatus} refund)</span>
                    <span className="font-semibold text-emerald-700">Credited to Wallet ✓</span>
                  </div>
                )}

                {/* Actions Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  {/* Commute / Ride Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={uberUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                      title="Open Uber with automatic dropoff"
                    >
                      <Car className="w-3.5 h-3.5 text-white" />
                      <span>Uber Ride</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                    </a>

                    <a
                      href={olaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#c5e840] hover:bg-[#b8dd30] text-[#17231d] rounded-xl text-xs font-bold transition-all shadow-xs"
                      title="Open Ola cab booking"
                    >
                      <span>Ola Cab</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                    </a>

                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-medium transition-all"
                    >
                      <MapPin className="w-3 h-3 text-[#2f6b4f]" />
                      <span>Maps</span>
                    </a>
                  </div>

                  <div className="flex items-center space-x-2">
                    {isConfirmed && (
                      <>
                        <button
                          onClick={() =>
                            setRescheduleData({
                              _id: booking._id,
                              newDate: booking.date,
                              newTime: booking.startTime,
                            })
                          }
                          className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-50 flex items-center space-x-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reschedule</span>
                        </button>
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          className="px-3 py-1.5 rounded-xl border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50"
                        >
                          Cancel Booking
                        </button>
                      </>
                    )}

                    {isCompleted && (
                      <Link
                        to={`/business/${booking.business?._id}`}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Leave Verified Review</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <h4 className="text-sm font-bold text-gray-900">Reschedule Appointment</h4>
            <form onSubmit={handleRescheduleSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">New Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  required
                  value={rescheduleData.newDate}
                  onChange={(e) =>
                    setRescheduleData({ ...rescheduleData, newDate: e.target.value })
                  }
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">New Time</label>
                <input
                  type="time"
                  required
                  value={rescheduleData.newTime}
                  onChange={(e) =>
                    setRescheduleData({ ...rescheduleData, newTime: e.target.value })
                  }
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRescheduleData(null)}
                  className="px-4 py-2 text-xs border rounded-xl text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs bg-indigo-600 text-white font-semibold rounded-xl"
                >
                  Confirm Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
