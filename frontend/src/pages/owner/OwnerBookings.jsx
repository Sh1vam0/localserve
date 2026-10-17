import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Calendar, Clock, User, Phone, CheckCircle, Key, ShieldCheck, Filter } from 'lucide-react';

const OwnerBookings = () => {
  const [business, setBusiness] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [otpInputs, setOtpInputs] = useState({});

  const fetchData = async () => {
    try {
      const bizRes = await api.get('/businesses/owner/me');
      setBusiness(bizRes.data.data);
      if (bizRes.data.data?._id) {
        const bRes = await api.get(`/bookings/business/${bizRes.data.data._id}`);
        setBookings(bRes.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVerifyCheckin = async (bookingId) => {
    const otp = otpInputs[bookingId];
    if (!otp || String(otp).trim().length !== 4) {
      toast.error('Please enter the 4-digit code shown on the customer phone');
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

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await api.put(`/bookings/${bookingId}/status`, { status: newStatus });
      toast.success(`Booking status changed to ${newStatus}`);
      fetchData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading appointment records..." />;
  }

  const filteredBookings = statusFilter === 'all'
    ? bookings
    : bookings.filter((b) => b.status === statusFilter);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Customer Appointments</h1>
          <p className="text-xs text-gray-500 mt-1">
            Monitor incoming appointments, perform arrival check-ins, and issue completion codes
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-white border border-gray-100 rounded-2xl shadow-xs text-xs">
          {['all', 'confirmed', 'checked-in', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl font-semibold capitalize transition-all ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 text-xs text-gray-400">
          No appointments found for status filter "{statusFilter}".
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs">
          <div className="divide-y divide-gray-100">
            {filteredBookings.map((b) => (
              <div key={b._id} className="p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-gray-900">{b.customer?.name}</span>
                    <span className="text-xs text-gray-400">· {b.customer?.phone || b.customer?.email}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        b.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : b.status === 'checked-in'
                          ? 'bg-blue-50 text-blue-700'
                          : b.status === 'confirmed'
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>

                  <p className="text-xs text-gray-700">
                    <span className="font-semibold text-gray-900">{b.service?.name}</span> · ₹{b.totalPrice} ({b.service?.duration || 30} mins)
                  </p>

                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    <span className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1" />
                      {b.date}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      {b.startTime} - {b.endTime}
                    </span>
                    {b.notes && (
                      <span className="italic text-gray-500 max-w-xs truncate">Note: "{b.notes}"</span>
                    )}
                  </div>
                </div>

                {/* Status-specific actions & verification codes */}
                <div className="flex items-center space-x-3 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-gray-100">
                  {b.status === 'confirmed' && (
                    <div className="flex items-center space-x-2 bg-indigo-50 p-2 rounded-2xl border border-indigo-100">
                      <Key className="w-4 h-4 text-indigo-600 ml-1" />
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="Customer OTP"
                        value={otpInputs[b._id] || ''}
                        onChange={(e) =>
                          setOtpInputs({ ...otpInputs, [b._id]: e.target.value })
                        }
                        className="w-24 px-2 py-1 text-xs font-mono font-bold text-center border border-indigo-200 rounded-xl bg-white focus:outline-none"
                      />
                      <button
                        onClick={() => handleVerifyCheckin(b._id)}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl"
                      >
                        Check In
                      </button>
                    </div>
                  )}

                  {b.status === 'checked-in' && (
                    <div className="flex items-center space-x-2">
                      <div className="text-xs bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-100">
                        Give Customer Code: <strong className="font-mono text-sm tracking-widest">{b.completionOTP}</strong>
                      </div>
                      <button
                        onClick={() => handleStatusChange(b._id, 'completed')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold"
                      >
                        Mark Done
                      </button>
                    </div>
                  )}

                  {b.status === 'completed' && (
                    <span className="text-xs font-semibold text-emerald-600 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Completed {b.isVerified ? '✓ Verified' : ''}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerBookings;
