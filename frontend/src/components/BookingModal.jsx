import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft,
  ShieldCheck,
  Key,
  Tag,
  Check
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const BookingModal = ({ service, business, isOpen, onClose, onSuccess }) => {
  const { isAuthenticated, user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notes, setNotes] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

  // Promo Coupons State
  const [applicableCoupons, setApplicableCoupons] = useState([]);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Initialize selected date to today or tomorrow
  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0];
      setSelectedDate(today);
      setStep(1);
      setSelectedSlot(null);
      setBookingResult(null);
      setNotes('');
      setAppliedCoupon(null);
      setCouponCodeInput('');

      if (business?._id) {
        api
          .get(`/coupons?businessId=${business._id}&activeOnly=true`)
          .then((res) => setApplicableCoupons(res.data.data || []))
          .catch((err) => console.error('Error fetching modal coupons:', err));
      }
    }
  }, [isOpen, service, business?._id]);

  const handleApplyCoupon = async (codeToTry) => {
    const code = (codeToTry || couponCodeInput).trim().toUpperCase();
    if (!code) {
      toast.error('Please enter a coupon promo code');
      return;
    }

    setValidatingCoupon(true);
    try {
      const res = await api.post('/coupons/validate', {
        code,
        businessId: business._id,
        orderAmount: service.price,
      });

      setAppliedCoupon(res.data.data);
      setCouponCodeInput(code);
      toast.success(res.data.message || `Coupon "${code}" applied!`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired coupon code';
      toast.error(msg);
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput('');
    toast('Coupon removed');
  };

  // Fetch slots whenever selectedDate or business changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!business?._id || !selectedDate) return;
      setLoadingSlots(true);
      try {
        const res = await api.get(`/businesses/${business._id}/availability?date=${selectedDate}`);
        setAvailableSlots(res.data.slots || []);
      } catch (err) {
        console.error('Error fetching slots:', err);
        toast.error('Could not load time slots');
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    if (isOpen && selectedDate) {
      fetchSlots();
    }
  }, [business?._id, selectedDate, isOpen]);

  if (!isOpen || !service || !business) return null;

  // Generate next 7 days for quick date picking
  const nextDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = d.getDate();
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    return { dateStr, dayName, dayNum, month, isToday: i === 0 };
  });

  const handleConfirmBooking = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to complete your booking');
      navigate('/login');
      return;
    }

    if (!selectedSlot) {
      toast.error('Please select an appointment time');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/bookings', {
        businessId: business._id,
        serviceId: service._id,
        date: selectedDate,
        startTime: selectedSlot.time,
        notes,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      });

      setBookingResult(res.data.data);
      setStep(4); // Success step
      if (refreshUser) refreshUser();
      if (onSuccess) onSuccess(res.data.data);
      toast.success('🎉 Booking confirmed!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Booking failed. Slot may have been taken.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <span className="text-xs uppercase tracking-wider font-semibold text-indigo-200">
            Book Appointment
          </span>
          <h3 className="text-xl font-bold text-white mt-1">{service.name}</h3>
          <p className="text-xs text-indigo-100 mt-0.5">
            at <span className="font-semibold">{business.name}</span> · ₹{service.price} ({service.duration || 30} mins)
          </p>

          {/* Stepper Progress */}
          {step <= 3 && (
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-indigo-500/40 text-xs">
              <div className={`flex items-center space-x-1.5 ${step >= 1 ? 'text-white font-bold' : 'text-indigo-300'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === 1 ? 'bg-white text-indigo-700' : 'bg-indigo-500 text-white'}`}>1</span>
                <span>Date</span>
              </div>
              <div className="h-0.5 w-8 bg-indigo-500/50" />
              <div className={`flex items-center space-x-1.5 ${step >= 2 ? 'text-white font-bold' : 'text-indigo-300'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === 2 ? 'bg-white text-indigo-700' : step > 2 ? 'bg-indigo-500 text-white' : 'bg-indigo-800 text-indigo-300'}`}>2</span>
                <span>Time</span>
              </div>
              <div className="h-0.5 w-8 bg-indigo-500/50" />
              <div className={`flex items-center space-x-1.5 ${step >= 3 ? 'text-white font-bold' : 'text-indigo-300'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === 3 ? 'bg-white text-indigo-700' : 'bg-indigo-800 text-indigo-300'}`}>3</span>
                <span>Confirm</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* STEP 1: Date Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
                Select Date
              </label>

              {/* Quick horizontal calendar pills */}
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {nextDays.map((d) => {
                  const isSelected = selectedDate === d.dateStr;
                  return (
                    <button
                      key={d.dateStr}
                      type="button"
                      onClick={() => setSelectedDate(d.dateStr)}
                      className={`p-2.5 rounded-2xl flex flex-col items-center justify-center border transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100 scale-105'
                          : 'border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50/50'
                      }`}
                    >
                      <span className="text-[10px] font-medium uppercase opacity-80">{d.dayName}</span>
                      <span className="text-base font-bold my-0.5">{d.dayNum}</span>
                      <span className="text-[10px] opacity-80">{d.month}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Date Input */}
              <div className="pt-2">
                <label className="text-xs text-gray-500 block mb-1">Or pick specific date:</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs flex items-center space-x-1.5 hover:bg-indigo-700 transition-colors shadow-xs"
                >
                  <span>Select Time Slot</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Time Slot Selection */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
                  Available Slots for {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}
                </label>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-indigo-600 hover:underline flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Change Date</span>
                </button>
              </div>

              {loadingSlots ? (
                <div className="py-12 text-center text-sm text-gray-500 animate-pulse">
                  Checking real-time slot availability...
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="py-8 text-center bg-gray-50 rounded-2xl border border-gray-100 p-4">
                  <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-800">No slots available on this date</p>
                  <p className="text-xs text-gray-500 mt-1">The business may be closed or fully booked. Please select another date.</p>
                  <button
                    onClick={() => setStep(1)}
                    className="mt-3 px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-600"
                  >
                    Go Back to Dates
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-60 overflow-y-auto pr-1">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedSlot?.time === slot.time;
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={!slot.isAvailable}
                        onClick={() => slot.isAvailable && setSelectedSlot(slot)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                          !slot.isAvailable
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'
                            : isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100'
                            : 'border-gray-200 text-gray-700 hover:border-indigo-400 hover:bg-indigo-50/50'
                        }`}
                      >
                        {slot.time}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100">
                <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-indigo-600 mr-1.5"></span> Available</span>
                <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-gray-300 mr-1.5"></span> Booked / Unavailable</span>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-600 font-semibold text-xs hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!selectedSlot}
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs flex items-center space-x-1.5 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                >
                  <span>Review & Confirm</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Summary and Confirmation */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2.5 text-xs text-gray-700">
                <div className="flex justify-between pb-2 border-b border-gray-200/60 font-semibold text-sm text-gray-900">
                  <span>Booking Summary</span>
                  {appliedCoupon ? (
                    <div className="text-right">
                      <span className="text-xs text-gray-400 line-through mr-1.5 font-normal">₹{service.price}</span>
                      <span className="text-emerald-700 font-extrabold text-base">₹{appliedCoupon.finalPrice}</span>
                    </div>
                  ) : (
                    <span className="text-indigo-600 font-bold">₹{service.price}</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Business:</span>
                  <span className="font-semibold text-gray-800">{business.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Service:</span>
                  <span className="font-semibold text-gray-800">{service.name} ({service.duration || 30} mins)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Date:</span>
                  <span className="font-semibold text-gray-800">{selectedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Slot Time:</span>
                  <span className="font-semibold text-indigo-700">{selectedSlot?.time} - {selectedSlot?.endTime}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between pt-1 border-t border-dashed border-gray-200 text-emerald-700 font-bold">
                    <span>Coupon Discount ({appliedCoupon.code}):</span>
                    <span>-₹{appliedCoupon.discountAmount}</span>
                  </div>
                )}
              </div>

              {/* Coupons & Promo Codes Section */}
              <div className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-2.5">
                <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <Tag size={13} className="text-indigo-600" />
                  <span>Have a Promo Code or Store Coupon?</span>
                </label>

                {applicableCoupons.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {applicableCoupons.map((c) => (
                      <button
                        key={c._id}
                        type="button"
                        onClick={() => handleApplyCoupon(c.code)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all ${
                          appliedCoupon?.code === c.code
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
                        }`}
                      >
                        {c.code} ({c.discountType === 'percentage' ? `${c.discountValue}% off` : `₹${c.discountValue} off`})
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                    placeholder="Enter promo code..."
                    disabled={!!appliedCoupon}
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl uppercase font-mono font-bold outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                  {appliedCoupon ? (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl border border-red-200"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={validatingCoupon || !couponCodeInput.trim()}
                      onClick={() => handleApplyCoupon()}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl disabled:opacity-50 shadow-xs"
                    >
                      {validatingCoupon ? '...' : 'Apply'}
                    </button>
                  )}
                </div>

                {appliedCoupon && (
                  <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                    <Check size={12} />
                    <span>Applied: You save ₹{appliedCoupon.discountAmount}!</span>
                  </p>
                )}
              </div>

              {/* Special notes */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Special Requests / Notes (optional):
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. skin sensitivity, preferred stylist, hair length..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Trust Badge */}
              <div className="flex items-center space-x-2 text-[11px] text-gray-500 bg-indigo-50/60 p-3 rounded-xl border border-indigo-100/60">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Includes 100% free cancellation up to 4 hours before your slot.</span>
              </div>

              <div className="pt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-600 font-semibold text-xs hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleConfirmBooking}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-100 active:scale-95 disabled:opacity-50"
                >
                  {submitting ? 'Confirming...' : '✅ Reserve Appointment'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Success & Check-in OTP Display */}
          {step === 4 && bookingResult && (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-gray-900">Appointment Confirmed!</h4>
                <p className="text-xs text-gray-500 mt-1">
                  Your appointment for <span className="font-semibold text-gray-700">{service.name}</span> at <span className="font-semibold text-gray-700">{business.name}</span> is set.
                </p>
              </div>

              {/* Two-Way OTP Check-in Card */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 text-center">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-700 block mb-1">
                  🔑 Your Arrival Check-In Code
                </span>
                <div className="text-3xl font-extrabold tracking-widest text-indigo-900 my-1 font-mono">
                  {bookingResult.checkinOTP}
                </div>
                <p className="text-[11px] text-indigo-600 mt-1 max-w-xs mx-auto">
                  Show this 4-digit code to the receptionist or business staff when you arrive to verify your presence.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  onClick={() => {
                    onClose();
                    navigate('/my-bookings');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs"
                >
                  View in My Bookings
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-xs hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
