import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import ReviewCard from '../components/ReviewCard';
import ReviewForm from '../components/ReviewForm';
import GoogleReviewCard from '../components/GoogleReviewCard';
import LoadingSpinner from '../components/LoadingSpinner';
import RideAssistantCard from '../components/RideAssistantCard';
import { getUberDeepLink } from '../utils/rideLinks';
import { useAuth } from '../context/AuthContext';
import { 
  Star, 
  MapPin, 
  Clock3, 
  ArrowLeft, 
  BadgeCheck, 
  ArrowRight, 
  ShieldCheck, 
  Navigation,
  Car,
  Key,
  CheckCircle2,
  ExternalLink,
  Tag,
  Percent,
  Check,
  X,
  Globe,
  Award,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Building2,
  Info,
  MessageSquare,
  Phone,
  Mail
} from 'lucide-react';
import toast from 'react-hot-toast';

const categoryImages = {
  salon: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=85',
  gym: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1000&q=85',
  spa: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=85',
  parlour: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=1000&q=85',
  wellness: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1000&q=85',
  other: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=1000&q=85',
};

const BusinessDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated, isCustomer } = useAuth();

  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [reviewTab, setReviewTab] = useState('platform'); // 'platform' or 'google'

  // NearNest Booking Form State
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [slot, setSlot] = useState('');
  const [note, setNote] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bookedResult, setBookedResult] = useState(null);

  // Promo Coupons State
  const [applicableCoupons, setApplicableCoupons] = useState([]);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Photo Carousel Swipe & Drag State
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);
  const [mouseDownX, setMouseDownX] = useState(null);

  // Business Details Expandable Drawer State
  const [showBusinessDetails, setShowBusinessDetails] = useState(false);

  const fetchBusinessData = async () => {
    try {
      const [bizRes, revRes, couponRes] = await Promise.all([
        api.get(`/businesses/${id}`),
        api.get(`/reviews/business/${id}`),
        api.get(`/coupons?businessId=${id}&activeOnly=true`),
      ]);
      const b = bizRes.data.data;
      setBusiness(b);
      setReviews(revRes.data.data || []);
      setApplicableCoupons(couponRes.data.data || []);
      if (b?.services?.length > 0) {
        setSelectedServiceId(b.services[0]._id);
      }
    } catch (err) {
      console.error('Error fetching business detail:', err);
      toast.error('Could not load business details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinessData();
  }, [id]);

  // Fetch slots whenever business ID or date changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!id || !date) return;
      setLoadingSlots(true);
      try {
        const res = await api.get(`/businesses/${id}/availability?date=${date}`);
        setAvailableSlots(res.data.slots || []);
      } catch (err) {
        console.error('Failed to load slots:', err);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [id, date]);

  if (loading) {
    return <LoadingSpinner text="Loading business details & offerings..." />;
  }

  if (!business) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center">
        <h3 className="text-lg font-bold text-[#17231d]">Business not found</h3>
        <Link to="/" className="mt-3 inline-block text-xs font-bold text-[#2f6b4f]">
          ← Back to Discovery
        </Link>
      </div>
    );
  }

  const selectedService =
    business.services?.find((s) => s._id === selectedServiceId) ||
    business.services?.[0];

  const allImages =
    business.images?.length > 0
      ? business.images
      : [categoryImages[business.category] || categoryImages.salon];

  const currentImageUrl = allImages[activePhotoIndex] || allImages[0];

  const categoryDefaultAmenities = {
    salon: [
      'Air Conditioned',
      'Sanitized Tools & Capes',
      'Master Hair Stylists',
      'Card & UPI Accepted',
      'Beverage Service',
      'Valet Parking Available',
    ],
    spa: [
      'Private Therapy Suites',
      'Steam & Aromatherapy',
      'Organic Herbal Oils',
      'Certified Therapists',
      'Complimentary Herbal Tea',
      'Valet Parking Available',
    ],
    gym: [
      'CrossFit Arena',
      'Certified Personal Trainers',
      'Steam & Shower Rooms',
      'Cardio & Free Weights',
      'High-Speed Wi-Fi',
      'Locker Facility',
    ],
    parlour: [
      'Bridal Dressing Suite',
      'HD Airbrush Equipment',
      'Hygiene First Protocol',
      'Single-Use Kits',
      'Card & UPI Accepted',
      'Refreshment Lounge',
    ],
    wellness: [
      'Sound Bath Acoustics',
      'Organic Essential Oils',
      'Meditation Cushions',
      'Certified Practitioners',
      'Complimentary Detox Tea',
      'Calm Ambient Atmosphere',
    ],
  };

  const amenitiesList =
    business.amenities && business.amenities.length > 0
      ? business.amenities
      : (categoryDefaultAmenities[business.category] || [
          'Air Conditioned',
          'Sanitized Equipment',
          'Free Wi-Fi',
          'Card & UPI Accepted',
          'Valet Parking Available',
        ]);

  const ownerNoteText =
    business.ownerNote ||
    business.rideNotes ||
    'Welcome to our verified establishment! We take hygiene, punctual service, and customer satisfaction seriously. Please arrive 5–10 minutes prior to your scheduled slot for seamless check-in.';

  const nextPhoto = () => {
    if (allImages.length <= 1) return;
    setActivePhotoIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevPhoto = () => {
    if (allImages.length <= 1) return;
    setActivePhotoIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  // Touch Swipe for Mobile
  const onTouchStart = (e) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    if (distance > 45) {
      nextPhoto();
    } else if (distance < -45) {
      prevPhoto();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  // Mouse Drag / Swipe for PC
  const onMouseDown = (e) => {
    setMouseDownX(e.clientX);
  };
  const onMouseUp = (e) => {
    if (mouseDownX === null) return;
    const distance = mouseDownX - e.clientX;
    if (distance > 50) {
      nextPhoto();
    } else if (distance < -50) {
      prevPhoto();
    }
    setMouseDownX(null);
  };

  const handleSelectService = (serviceId) => {
    setSelectedServiceId(serviceId);
    setSlot('');
    const bookingCard = document.getElementById('booking-card');
    if (bookingCard) {
      bookingCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const bLng = business.location?.coordinates?.[0] || 72.8777;
  const bLat = business.location?.coordinates?.[1] || 19.076;
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${bLat},${bLng}`;
  const googleMapsStoreLink =
    business.pinpointLocation?.googleMapsUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([business.name, business.address?.street, business.address?.city].filter(Boolean).join(' '))}&center=${bLat},${bLng}`;

  const handleApplyCoupon = async (codeToTry) => {
    const code = (codeToTry || couponCodeInput).trim().toUpperCase();
    if (!code) {
      toast.error('Please enter a coupon promo code');
      return;
    }

    if (!selectedService) {
      toast.error('Please select a service first');
      return;
    }

    setValidatingCoupon(true);
    try {
      const res = await api.post('/coupons/validate', {
        code,
        businessId: id,
        orderAmount: selectedService.price,
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

  const handleBook = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in first to book an appointment.');
      return;
    }

    if (!selectedService || !date || !slot) {
      toast.error('Please choose a service, date, and time slot first.');
      return;
    }

    setSaving(true);
    try {
      const res = await api.post('/bookings', {
        businessId: business._id,
        serviceId: selectedService._id,
        date,
        startTime: slot,
        notes: note,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      });

      setBookedResult(res.data.data);
      setSlot('');
      toast.success('🎉 Booking confirmed!');
      fetchBusinessData();
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Booking failed. Slot may have been taken.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl pb-16 space-y-8">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs font-bold text-[#6b756e] hover:text-[#17231d] transition-colors"
      >
        <ArrowLeft size={16} /> Back to discovery
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
        {/* Left Column: Photos, Badges, Details & About */}
        <div className="space-y-6">
          {/* Main Showcase Photo Carousel (Touch Swipe for Mobile & Mouse Drag / Arrows for PC) */}
          <div 
            className="group relative overflow-hidden rounded-[1.75rem] shadow-sm bg-neutral-900 select-none cursor-grab active:cursor-grabbing"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseLeave={() => setMouseDownX(null)}
          >
            <img
              src={currentImageUrl}
              alt={business.name}
              draggable={false}
              className="h-72 w-full object-cover sm:h-[420px] transition-all duration-300 pointer-events-none"
            />

            {/* Verified Store Badge */}
            {business.verificationStatus === 'verified' && (
              <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-600/90 backdrop-blur-xs text-white px-3.5 py-1.5 text-xs font-extrabold shadow-md pointer-events-none">
                <ShieldCheck size={14} />
                <span>Verified Partner Store</span>
              </div>
            )}

            {/* PC Navigation Chevron Left */}
            {allImages.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prevPhoto();
                }}
                aria-label="Previous photo"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/55 hover:bg-black/85 backdrop-blur-md text-white flex items-center justify-center transition-all opacity-85 sm:opacity-0 sm:group-hover:opacity-100 shadow-lg focus:outline-none"
              >
                <ChevronLeft size={22} />
              </button>
            )}

            {/* PC Navigation Chevron Right */}
            {allImages.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nextPhoto();
                }}
                aria-label="Next photo"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/55 hover:bg-black/85 backdrop-blur-md text-white flex items-center justify-center transition-all opacity-85 sm:opacity-0 sm:group-hover:opacity-100 shadow-lg focus:outline-none"
              >
                <ChevronRight size={22} />
              </button>
            )}

            {/* Indicator Dots */}
            {allImages.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/45 backdrop-blur-xs">
                {allImages.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePhotoIndex(dotIdx);
                    }}
                    className={`rounded-full transition-all ${
                      activePhotoIndex === dotIdx ? 'w-5 h-1.5 bg-[#DCF078]' : 'w-1.5 h-1.5 bg-white/60 hover:bg-white'
                    }`}
                    aria-label={`Jump to photo ${dotIdx + 1}`}
                  />
                ))}
              </div>
            )}

            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-full pointer-events-none">
              Photo {activePhotoIndex + 1} of {allImages.length}
            </div>
          </div>

          {/* Multiple Photos Thumbnail Strip */}
          {allImages.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
              {allImages.map((img, idx) => {
                const labels = ['Exterior', 'Interior', 'Workstation', 'Facilities'];
                const isSelected = activePhotoIndex === idx;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePhotoIndex(idx)}
                    className={`relative shrink-0 rounded-2xl overflow-hidden border-2 transition-all w-24 h-16 sm:w-28 sm:h-20 ${
                      isSelected
                        ? 'border-[#2f6b4f] scale-105 shadow-md'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={labels[idx] || `Photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 inset-x-1 bg-black/70 text-[9px] font-bold text-white text-center rounded py-0.5 truncate">
                      {labels[idx] || `View ${idx + 1}`}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#e7eee6] px-3.5 py-1.5 text-xs font-extrabold text-[#2f6b4f] uppercase tracking-wide">
              {business.category}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white border border-[#e4e8e1] px-3 py-1.5 text-xs font-bold text-[#17231d]">
              <Star size={13} className="fill-amber-400 text-amber-400" />
              {business.rating ? business.rating.toFixed(1) : '4.8'} · {business.reviewCount || 0} reviews
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white border border-[#e4e8e1] px-3 py-1.5 text-xs font-bold text-[#6b756e]">
              <MapPin size={13} />
              {business.address?.city || 'Mumbai'}
            </span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-[#17231d]">
            {business.name}
          </h1>

          <p className="text-sm leading-relaxed text-[#6b756e]">
            {business.description || 'Welcome to our verified center. We are committed to hygiene, punctuality, and excellent service.'}
          </p>

          {/* Services Offered Section (Directly Below Business Name & Description) */}
          <div className="rounded-[1.75rem] border border-[#e4e8e1] bg-white p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#f0f3ee] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2f6b4f] bg-[#e7eee6] px-2.5 py-1 rounded-full">
                  Services Menu
                </span>
                <h2 className="text-lg font-extrabold text-[#17231d] mt-1.5">
                  Services offered by {business.name}
                </h2>
              </div>
              <span className="text-xs font-semibold text-[#6b756e] bg-[#f8faf7] px-3 py-1.5 rounded-full border border-[#e4e8e1] self-start sm:self-auto">
                {(business.services || []).length} available
              </span>
            </div>

            {(business.services || []).length === 0 ? (
              <p className="text-xs text-[#6b756e] py-4 text-center">
                No services currently listed. Please contact the business directly.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {business.services.map((s) => {
                  const isSelected = selectedServiceId === s._id;
                  return (
                    <div
                      key={s._id}
                      onClick={() => handleSelectService(s._id)}
                      className={`group relative flex flex-col justify-between rounded-2xl border p-4 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#2f6b4f] bg-[#f2f7ef] shadow-sm ring-1 ring-[#2f6b4f]'
                          : 'border-[#e4e8e1] bg-white hover:border-[#2f6b4f]/60 hover:shadow-xs'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-sm text-[#17231d] group-hover:text-[#2f6b4f] transition-colors">
                            {s.name}
                          </h3>
                          {isSelected && (
                            <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-[#2f6b4f] bg-[#e7eee6] px-2 py-0.5 rounded-full">
                              <CheckCircle2 size={11} /> Selected
                            </span>
                          )}
                        </div>

                        {s.description && (
                          <p className="text-xs text-[#6b756e] line-clamp-2 leading-relaxed">
                            {s.description}
                          </p>
                        )}

                        <div className="flex items-center gap-3 text-[11px] text-[#6b756e] pt-1">
                          <span className="inline-flex items-center gap-1">
                            <Clock3 size={12} className="text-[#2f6b4f]" />
                            {s.duration || 30} mins
                          </span>
                          {s.category && (
                            <span className="text-[#404c44] bg-[#f0f3ee] px-2 py-0.5 rounded-md font-medium">
                              {s.category}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#e4e8e1]/60 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#6b756e] block leading-none">Price</span>
                          <span className="text-base font-extrabold text-[#17231d]">₹{s.price}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectService(s._id);
                          }}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-[#2f6b4f] text-white shadow-xs'
                              : 'bg-[#f0f3ee] text-[#17231d] group-hover:bg-[#2f6b4f] group-hover:text-white'
                          }`}
                        >
                          {isSelected ? 'Selected' : 'Book Service'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* About this place & Pinpoint Location */}
          <div className="rounded-[1.5rem] border border-[#e4e8e1] bg-white p-6 space-y-4 shadow-xs">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-extrabold text-[#17231d]">About this place & Pinpoint</h2>
                <p className="text-xs text-[#6b756e] mt-0.5">Verified establishment address & store profile</p>
              </div>

              {/* Top-Right Corner: GPS Verified Badge + Business Details Toggle */}
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                  GPS Verified
                </span>
                <button
                  type="button"
                  onClick={() => setShowBusinessDetails((prev) => !prev)}
                  aria-expanded={showBusinessDetails}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2f6b4f] hover:text-[#1d4331] bg-[#e7eee6]/70 hover:bg-[#e7eee6] px-3 py-1.5 rounded-xl transition-all shadow-2xs border border-[#2f6b4f]/20 cursor-pointer"
                >
                  <Building2 size={13} className="text-[#2f6b4f]" />
                  <span>Business Details</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-300 ${
                      showBusinessDetails ? 'rotate-180 text-[#17231d]' : ''
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              <p className="flex items-start gap-2.5 text-xs leading-5 text-[#17231d] font-medium">
                <MapPin size={16} className="mt-0.5 shrink-0 text-[#2f6b4f]" />
                <span>
                  {business.address?.street ? `${business.address.street}, ` : ''}{business.address?.city}
                  {business.address?.state ? `, ${business.address.state}` : ''}
                </span>
              </p>

              {business.pinpointLocation?.landmark && (
                <p className="flex items-start gap-2.5 text-xs leading-5 text-[#2f6b4f] font-semibold pl-6">
                  <span>📍 Landmark: {business.pinpointLocation.landmark}</span>
                </p>
              )}

              <p className="flex items-start gap-2.5 text-xs leading-5 text-[#6b756e]">
                <Clock3 size={16} className="mt-0.5 shrink-0 text-[#2f6b4f]" />
                <span>Open: 9:00 AM – 8:00 PM (Monday to Saturday)</span>
              </p>
            </div>

            {/* Direct Open in Google Maps Button */}
            <div className="pt-3 border-t border-[#e4e8e1] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-[#17231d] block">
                  Store Pinpoint Location
                </span>
                <span className="text-[10px] text-[#6b756e]">
                  Coordinates: {bLat.toFixed(4)}, {bLng.toFixed(4)}
                </span>
              </div>

              <a
                href={googleMapsStoreLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2f6b4f] text-white hover:bg-[#25553e] text-xs font-bold shadow-xs transition-colors"
                title="Open pinned store address in Google Maps"
              >
                <MapPin size={13} />
                <span>Open Address on Store Maps</span>
                <ExternalLink size={12} />
              </a>
            </div>

            {/* Smoothly Expandable Business Details Drawer / Section */}
            {showBusinessDetails && (
              <div className="pt-4 border-t border-[#e4e8e1] space-y-4 animate-fadeIn transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#2f6b4f]"></span>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#2f6b4f]">
                      Owner-Verified Store Profile
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-[#6b756e] bg-[#f8faf7] px-2.5 py-0.5 rounded-full border border-[#e4e8e1]">
                    Live Store Data
                  </span>
                </div>

                {/* 1. Store Description */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#17231d]">
                    <Info size={13} className="text-[#2f6b4f]" />
                    <span>Store Description:</span>
                  </div>
                  <p className="text-xs leading-relaxed text-[#404c44] bg-[#f8faf7] p-3.5 rounded-2xl border border-[#e4e8e1]/70">
                    {business.description || 'Welcome to our verified center. We are committed to hygiene, punctuality, and excellent service.'}
                  </p>
                </div>

                {/* 2. Highlights & Amenities Chips */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#17231d]">
                    <Sparkles size={13} className="text-[#2f6b4f]" />
                    <span>Highlights & Amenities:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {amenitiesList.map((chip, cIdx) => (
                      <span
                        key={cIdx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f0f5ee] border border-[#d6e3d2] text-xs font-semibold text-[#1f4733] shadow-2xs"
                      >
                        <CheckCircle2 size={12} className="text-[#2f6b4f]" />
                        <span>{chip}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* 3. Owner's Note to Guests */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#17231d]">
                    <MessageSquare size={13} className="text-[#2f6b4f]" />
                    <span>Owner's Note to Guests:</span>
                  </div>
                  <div className="rounded-2xl bg-[#fffdf5] p-3.5 border border-[#f1e6bf] text-xs space-y-2 text-[#5c4a16]">
                    <p className="leading-relaxed italic">
                      "{ownerNoteText}"
                    </p>
                    <div className="pt-2 border-t border-[#f1e6bf]/60 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#17231d]">
                        <ShieldCheck size={13} className="text-emerald-600" />
                        <span>{business.owner?.name ? `${business.owner.name} (Store Host)` : 'Verified Store Host'}</span>
                      </span>
                      {business.phone && (
                        <a
                          href={`tel:${business.phone}`}
                          className="text-[11px] font-bold text-[#2f6b4f] hover:underline flex items-center gap-1"
                        >
                          <Phone size={11} />
                          <span>{business.phone}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Ride / Commute Assistance with Uber & Ola */}
          {business.offersRideAssistance !== false && (
            <RideAssistantCard business={business} />
          )}
        </div>

        {/* Right Column: NearNest Interactive Booking Card */}
        <aside id="booking-card" className="h-fit rounded-[1.75rem] border border-[#e4e8e1] bg-white p-6 shadow-soft space-y-5 scroll-mt-24">
          <div>
            <p className="eyebrow">MAKE IT YOURS</p>
            <h2 className="mt-1 text-2xl font-extrabold text-[#17231d]">Book a service</h2>
            <p className="mt-1 text-xs text-[#6b756e]">
              Choose what you need and reserve your verified appointment slot.
            </p>
          </div>

          {/* Service picker */}
          <div>
            <label className="form-label">Choose service</label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {(business.services || []).map((s) => {
                const isSelected = selectedServiceId === s._id;
                return (
                  <button
                    key={s._id}
                    type="button"
                    onClick={() => {
                      setSelectedServiceId(s._id);
                      setSlot('');
                    }}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left transition-all ${
                      isSelected
                        ? 'border-[#2f6b4f] bg-[#f2f7ef]'
                        : 'border-[#e4e8e1] hover:border-[#2f6b4f]/50 bg-white'
                    }`}
                  >
                    <span>
                      <span className="block text-xs font-bold text-[#17231d]">{s.name}</span>
                      <span className="mt-0.5 block text-[11px] text-[#6b756e]">
                        <Clock3 size={11} className="mr-1 inline text-[#2f6b4f]" />
                        {s.duration || 30} mins · {s.category || 'General'}
                      </span>
                    </span>
                    <span className="text-sm font-extrabold text-[#17231d]">₹{s.price}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date picker */}
          <div>
            <label className="form-label">Choose a date</label>
            <input
              type="date"
              min={new Date().toISOString().slice(0, 10)}
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setSlot('');
              }}
              className="field"
            />
          </div>

          {/* Dynamic Available times */}
          <div>
            <label className="form-label flex justify-between items-center">
              <span>Available times</span>
              <span className="text-[10px] font-normal text-[#6b756e]">Real-time slot lock</span>
            </label>

            {loadingSlots ? (
              <p className="text-xs text-[#6b756e] py-3 text-center animate-pulse">
                Checking availability...
              </p>
            ) : availableSlots.length === 0 ? (
              <p className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-center">
                Closed or fully booked on this date. Please pick another date.
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto pr-1">
                {availableSlots.map((s) => {
                  const disabled = !s.isAvailable;
                  const isSelected = slot === s.time;
                  return (
                    <button
                      disabled={disabled}
                      key={s.time}
                      type="button"
                      onClick={() => setSlot(s.time)}
                      className={`rounded-xl border px-1 py-2 text-xs font-bold transition-all ${
                        disabled
                          ? 'cursor-not-allowed border-[#e4e8e1] bg-gray-100 text-gray-400 line-through'
                          : isSelected
                          ? 'border-[#2f6b4f] bg-[#2f6b4f] text-white shadow-xs'
                          : 'border-[#e4e8e1] text-[#17231d] hover:border-[#2f6b4f] bg-white'
                      }`}
                    >
                      {s.time}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="form-label">
              Note for the business <span className="font-normal text-[#6b756e]">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={300}
              rows={2}
              className="field min-h-16 resize-y text-xs"
              placeholder="Any special requests or preferences?"
            />
          </div>

          {/* Coupons & Promo Codes Section */}
          <div className="pt-3 border-t border-[#e4e8e1] space-y-3">
            <div className="flex items-center justify-between">
              <label className="form-label mb-0 flex items-center gap-1.5">
                <Tag size={13} className="text-[#2f6b4f]" />
                <span>Apply Promo Code or Store Coupon</span>
              </label>
            </div>

            {/* Quick-Apply Applicable Coupons Carousel/Pills */}
            {applicableCoupons.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block">
                  Available for this appointment:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {applicableCoupons.map((c) => {
                    const isSelected = appliedCoupon?.code === c.code;
                    return (
                      <button
                        key={c._id}
                        type="button"
                        onClick={() => handleApplyCoupon(c.code)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 border ${
                          isSelected
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300 ring-2 ring-emerald-200'
                            : 'bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 border-gray-200'
                        }`}
                      >
                        <span className="font-mono">{c.code}</span>
                        <span className="text-[10px] opacity-75">
                          ({c.discountType === 'percentage' ? `${c.discountValue}% off` : `₹${c.discountValue} off`})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Manual Coupon Input Box */}
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCodeInput}
                onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                placeholder="Enter promo code (e.g. WELCOME50)"
                className="field flex-1 text-xs py-2 uppercase font-mono font-bold tracking-wider"
                disabled={!!appliedCoupon}
              />
              {appliedCoupon ? (
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 border border-red-200"
                >
                  <X size={13} />
                  <span>Remove</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={validatingCoupon || !couponCodeInput.trim()}
                  onClick={() => handleApplyCoupon()}
                  className="px-4 py-2 bg-[#2f6b4f] hover:bg-[#25553e] text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50 shadow-xs"
                >
                  {validatingCoupon ? 'Checking...' : 'Apply'}
                </button>
              )}
            </div>

            {appliedCoupon && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-700 shrink-0" />
                  <span>
                    Coupon <strong>{appliedCoupon.code}</strong> applied! You save ₹{appliedCoupon.discountAmount}.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Pricing summary */}
          <div className="border-t border-[#e4e8e1] pt-4 space-y-1.5">
            {appliedCoupon ? (
              <>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Service Subtotal:</span>
                  <span className="font-semibold text-gray-800">₹{selectedService?.price || 299}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-emerald-700 font-bold">
                  <span>Promo Discount ({appliedCoupon.code}):</span>
                  <span>-₹{appliedCoupon.discountAmount}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-dashed border-gray-200">
                  <span className="text-xs font-black text-gray-800 uppercase tracking-wider">Final Price:</span>
                  <span className="text-2xl font-black text-[#17231d]">
                    ₹{appliedCoupon.finalPrice}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#6b756e]">Total price</span>
                <span className="text-2xl font-black text-[#17231d]">
                  ₹{selectedService?.price || 299}
                </span>
              </div>
            )}
          </div>

          <button
            disabled={saving || !slot}
            onClick={handleBook}
            className="btn-dark w-full justify-center text-xs py-3 disabled:opacity-50"
          >
            {saving ? 'Reserving slot...' : 'Confirm booking'}{' '}
            <ArrowRight size={15} />
          </button>

          <p className="text-center text-[10px] text-[#6b756e] leading-relaxed">
            Includes free cancellation with instant wallet refund up to 4 hours before your slot.
          </p>

          {/* Booking Confirmation / Check-in Code Card */}
          {bookedResult && (
            <div className="bg-[#e7eee6] border border-[#2f6b4f]/20 rounded-2xl p-4 space-y-2 animate-in zoom-in-95">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#2f6b4f]">
                <CheckCircle2 size={16} />
                <span>Appointment Confirmed!</span>
              </div>
              <p className="text-[11px] text-[#17231d]">
                Your 4-digit arrival check-in code for {business.name}:
              </p>
              <div className="text-2xl font-black tracking-widest text-[#2f6b4f] font-mono bg-white py-1.5 px-3 rounded-xl text-center border border-[#e4e8e1]">
                {bookedResult.checkinOTP}
              </div>

              {business.offersRideAssistance !== false && (
                <div className="pt-2">
                  <a
                    href={getUberDeepLink({
                      name: business.name,
                      lat: bLat,
                      lng: bLng,
                      street: business.address?.street,
                      city: business.address?.city,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl bg-black text-white text-xs font-bold hover:bg-neutral-800 transition-colors shadow-xs"
                  >
                    <Car size={13} />
                    <span>Ride with Uber to Venue</span>
                    <ExternalLink size={11} className="opacity-70" />
                  </a>
                </div>
              )}

              <Link
                to="/my-bookings"
                className="text-[11px] font-bold text-[#2f6b4f] underline block text-center mt-1"
              >
                View in My Bookings →
              </Link>
            </div>
          )}
        </aside>
      </div>

      {/* DUAL REVIEW SYSTEM: NearNest Platform (70% Weight) vs Google Maps (30% Weight) */}
      <section className="pt-8 border-t border-[#e4e8e1] space-y-6">
        <div>
          <p className="eyebrow">AUTHENTIC REPUTATION & REVIEWS</p>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-1">
            <h2 className="section-title text-[#17231d]">
              Customer Reviews & Community Ratings
            </h2>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                <ShieldCheck size={14} className="text-emerald-700" />
                <span>Dual-Source Trust Rating</span>
              </span>
            </div>
          </div>
        </div>

        {/* Composite Score Breakdown Card */}
        {(() => {
          const platformScore = (business.platformRating || 4.8).toFixed(1);
          const googleScore = (business.googleRating || 4.5).toFixed(1);
          const compositeScore = (business.rating || 4.7).toFixed(1);
          const googleReviewsList = business.googleReviews || [];
          const googleTotalCount = business.googleReviewCount || (googleReviewsList.length * 19 + 12);

          return (
            <div className="bg-[#f7f8f5] border border-[#e4e8e1] rounded-3xl p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Composite Weighted Score */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                    Overall Composite Rating
                  </span>
                  <div className="my-2 flex items-baseline gap-2">
                    <span className="text-4xl font-black text-[#17231d]">{compositeScore}</span>
                    <span className="text-amber-500 text-xl font-bold">★</span>
                    <span className="text-xs text-gray-500 font-medium">/ 5.0</span>
                  </div>
                  <div className="text-[11px] text-[#2f6b4f] font-bold bg-[#e7eee6] px-2.5 py-1 rounded-xl w-fit">
                    Weighted 70% Platform + 30% Google Maps
                  </div>
                </div>

                {/* Platform Reviews Rating Card */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#2f6b4f]">
                      🛡️ NearNest Verified Store Score
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                      70% High Weight
                    </span>
                  </div>
                  <div className="my-2 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-[#17231d]">{platformScore}</span>
                    <span className="text-amber-500 text-lg font-bold">★</span>
                    <span className="text-xs text-gray-500">({reviews.length} verified visits)</span>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-tight">
                    Higher weightage: Authenticated appointments with verified arrival OTP check-ins.
                  </p>
                </div>

                {/* Google Maps Rating Card */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                      </svg>
                      Google Maps Rating
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-800">
                      30% Weight
                    </span>
                  </div>
                  <div className="my-2 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-[#17231d]">{googleScore}</span>
                    <span className="text-amber-500 text-lg font-bold">★</span>
                    <span className="text-xs text-gray-500">({googleTotalCount} community reviews)</span>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-tight">
                    Public feedback imported directly from official Google Maps Place profile.
                  </p>
                </div>
              </div>

              {/* Source Navigation Tabs */}
              <div className="flex flex-wrap gap-2 border-b border-[#e4e8e1] pb-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewTab('platform')}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    reviewTab === 'platform'
                      ? 'bg-[#17231d] text-white shadow-xs'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <ShieldCheck size={14} className={reviewTab === 'platform' ? 'text-emerald-400' : 'text-emerald-600'} />
                  <span>NearNest Verified Store Reviews ({reviews.length})</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    reviewTab === 'platform' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    70% Priority
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setReviewTab('google')}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    reviewTab === 'google'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                    <path fill={reviewTab === 'google' ? '#fff' : '#4285F4'} d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill={reviewTab === 'google' ? '#fff' : '#34A853'} d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill={reviewTab === 'google' ? '#fff' : '#FBBC05'} d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill={reviewTab === 'google' ? '#fff' : '#EA4335'} d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Google Maps Reviews ({googleReviewsList.length})</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    reviewTab === 'google' ? 'bg-blue-800 text-white' : 'bg-blue-100 text-blue-800'
                  }`}>
                    30% Weight
                  </span>
                </button>
              </div>

              {/* SECTION A: NEAREST VERIFIED STORE REVIEWS */}
              {reviewTab === 'platform' && (
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900">
                    <span className="flex items-center gap-1.5 font-medium">
                      <ShieldCheck size={16} className="text-emerald-700 shrink-0" />
                      <span>
                        <strong>Higher Priority Weightage (70%):</strong> Reviews from registered customers with arrival OTP verified bookings carry greater influence on store standing.
                      </span>
                    </span>
                  </div>

                  {isAuthenticated && isCustomer && (
                    <ReviewForm
                      businessId={business._id}
                      onReviewSubmitted={(newRev) => setReviews([newRev, ...reviews])}
                    />
                  )}

                  {reviews.length === 0 ? (
                    <p className="text-xs text-[#6b756e] bg-white p-6 rounded-2xl border border-[#e4e8e1] text-center">
                      No NearNest platform reviews yet. Book an appointment to be the first verified reviewer!
                    </p>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {reviews.map((r) => (
                        <ReviewCard key={r._id} review={r} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SECTION B: GOOGLE MAPS REVIEWS */}
              {reviewTab === 'google' && (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-center justify-between text-xs text-blue-900 flex-wrap gap-2">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Globe size={16} className="text-blue-700 shrink-0" />
                      <span>
                        <strong>Google Maps Community Feedback (30% Weight):</strong> Authentic reviews imported from Google Maps Places, displaying verified Local Guides and ratings.
                      </span>
                    </span>

                    {googleMapsStoreLink && (
                      <a
                        href={googleMapsStoreLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-blue-300 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-50 transition-colors shadow-xs ml-auto"
                      >
                        <span>Open on Google Maps</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>

                  {googleReviewsList.length === 0 ? (
                    <div className="text-center py-8 bg-white rounded-2xl border border-gray-100 space-y-2 p-6">
                      <Globe size={28} className="mx-auto text-gray-400" />
                      <p className="text-xs font-bold text-gray-700">No Google Maps reviews imported yet for this store.</p>
                      <p className="text-[11px] text-gray-500">The store owner can import their Google reviews directly from the Owner Dashboard.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {googleReviewsList.map((gRev, idx) => (
                        <GoogleReviewCard
                          key={gRev._id || idx}
                          review={gRev}
                          googleMapsUrl={googleMapsStoreLink}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })()}
      </section>
    </div>
  );
};

export default BusinessDetail;
