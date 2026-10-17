import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { 
  Store, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle2, 
  Car, 
  LocateFixed, 
  ShieldCheck, 
  Image, 
  Plus, 
  Trash2, 
  ExternalLink, 
  AlertTriangle,
  FileText,
  Building,
  Sparkles,
  Tag,
  Percent,
  Copy,
  Upload,
  Globe,
  Search,
  RefreshCw,
  Star,
  Compass,
  Camera
} from 'lucide-react';

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const samplePhotoPacks = {
  salon: [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=85', // Exterior & Entry
    'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1000&q=85', // Styling Stations
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1000&q=85', // Hair Wash & Lounge
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1000&q=85', // Grooming Suite
  ],
  spa: [
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=85', // Reception & Ambience
    'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=1000&q=85', // Massage Suite
    'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1000&q=85', // Herbal Bath & Steam
    'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1000&q=85', // Aromatherapy Room
  ],
  gym: [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1000&q=85', // Front Cardio Floor
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1000&q=85', // Free Weights & Power Racks
    'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1000&q=85', // CrossFit Arena
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1000&q=85', // Locker & Stretch Bay
  ],
  parlour: [
    'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=1000&q=85', // Entrance & Reception
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=85', // Bridal Makeup Studio
    'https://images.unsplash.com/photo-1512290900672-1f417439589d?auto=format&fit=crop&w=1000&q=85', // Facial & Skincare Room
    'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=1000&q=85', // Nail Art Bar
  ],
  wellness: [
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1000&q=85', // Studio Entrance
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1000&q=85', // Meditation Hall
    'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1000&q=85', // Yoga Deck
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=85', // Sound Therapy Suite
  ],
};

const ManageBusiness = () => {
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submittingDocs, setSubmittingDocs] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('salon');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [landmark, setLandmark] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  // Device Photo Upload State
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  // Exact Pinpoint GPS & Area Search State
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [searchingLocation, setSearchingLocation] = useState(false);

  // Google Maps Import & Dual Reviews State
  const [googleImportUrl, setGoogleImportUrl] = useState('');
  const [importingGoogle, setImportingGoogle] = useState(false);
  const [googleReviews, setGoogleReviews] = useState([]);
  const [googleRating, setGoogleRating] = useState(4.6);
  const [googleReviewCount, setGoogleReviewCount] = useState(0);

  // Multiple Photos State
  const [images, setImages] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Verification Documents State
  const [verificationStatus, setVerificationStatus] = useState('pending_review');
  const [gstin, setGstin] = useState('');
  const [tradeLicense, setTradeLicense] = useState('');
  const [ownerIdType, setOwnerIdType] = useState('Aadhaar Card');
  const [ownerIdNumber, setOwnerIdNumber] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Commute & Ride Settings
  const [offersRideAssistance, setOffersRideAssistance] = useState(true);
  const [rideNotes, setRideNotes] = useState('Designated drop-off point and valet parking available at main entrance.');

  // Operating Hours State
  const [workingHours, setWorkingHours] = useState([
    { day: 0, open: '10:00', close: '18:00', isClosed: true },
    { day: 1, open: '09:00', close: '20:00', isClosed: false },
    { day: 2, open: '09:00', close: '20:00', isClosed: false },
    { day: 3, open: '09:00', close: '20:00', isClosed: false },
    { day: 4, open: '09:00', close: '20:00', isClosed: false },
    { day: 5, open: '09:00', close: '20:00', isClosed: false },
    { day: 6, open: '09:00', close: '21:00', isClosed: false },
  ]);

  // Store Promotional Coupons State
  const [storeCoupons, setStoreCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [submittingCoupon, setSubmittingCoupon] = useState(false);
  const [newStoreCoupon, setNewStoreCoupon] = useState({
    code: '',
    title: '',
    description: '',
    discountType: 'percentage',
    discountValue: 20,
    minBookingAmount: 0,
    maxDiscountAmount: '',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
    usageLimit: 50,
  });

  const fetchStoreCoupons = async (bizId) => {
    if (!bizId) return;
    try {
      setLoadingCoupons(true);
      const res = await api.get(`/coupons?businessId=${bizId}`);
      // Filter to only this store's coupons
      setStoreCoupons(res.data.data?.filter((c) => c.scope === 'store') || []);
    } catch (err) {
      console.error('Failed to load store coupons:', err);
    } finally {
      setLoadingCoupons(false);
    }
  };

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const res = await api.get('/businesses/owner/me');
        if (res.data.data) {
          const b = res.data.data;
          setBusiness(b);
          setName(b.name || '');
          setCategory(b.category || 'salon');
          setDescription(b.description || '');
          setPhone(b.phone || '');
          setEmail(b.email || '');
          setStreet(b.address?.street || '');
          setCity(b.address?.city || '');
          setLandmark(b.pinpointLocation?.landmark || '');
          if (b.offersRideAssistance !== undefined) setOffersRideAssistance(b.offersRideAssistance);
          if (b.rideNotes) setRideNotes(b.rideNotes);
          if (b.location?.coordinates?.length >= 2) {
            setLongitude(b.location.coordinates[0]);
            setLatitude(b.location.coordinates[1]);
          }
          if (b.images?.length) {
            setImages(b.images);
          } else {
            // Provide category default pack if no images yet
            setImages(samplePhotoPacks[b.category] || samplePhotoPacks.salon);
          }
          if (b.workingHours?.length) {
            setWorkingHours(b.workingHours);
          }

          // Google reviews & rating
          if (b.googleReviews?.length) {
            setGoogleReviews(b.googleReviews);
          }
          if (b.googleRating) setGoogleRating(b.googleRating);
          if (b.googleReviewCount) setGoogleReviewCount(b.googleReviewCount);
          if (b.pinpointLocation?.googleMapsUrl) {
            setGoogleImportUrl(b.pinpointLocation.googleMapsUrl);
          }

          // Verification Details
          setVerificationStatus(b.verificationStatus || 'unverified');
          if (b.verificationDocuments) {
            setGstin(b.verificationDocuments.gstin || '');
            setTradeLicense(b.verificationDocuments.tradeLicense || '');
            setOwnerIdType(b.verificationDocuments.ownerIdType || 'Aadhaar Card');
            setOwnerIdNumber(b.verificationDocuments.ownerIdNumber || '');
            setDocumentUrl(b.verificationDocuments.documentUrl || '');
            setRejectionReason(b.verificationDocuments.rejectionReason || '');
          }

          // Fetch coupons for this store
          if (b._id) {
            fetchStoreCoupons(b._id);
          }
        } else {
          // New business setup default photos
          setImages(samplePhotoPacks.salon);
          // Check if user already detected their live location in browser
          try {
            const savedLoc = localStorage.getItem('localserv_location');
            if (savedLoc) {
              const parsed = JSON.parse(savedLoc);
              if (parsed.lat && parsed.lng) {
                setLatitude(parsed.lat);
                setLongitude(parsed.lng);
                if (parsed.city && !parsed.city.includes('°')) {
                  setCity(parsed.city);
                }
              }
            }
          } catch {}
        }
      } catch (err) {
        console.error('Failed to load business:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, []);

  const handleCreateStoreCoupon = async (e) => {
    e.preventDefault();
    if (!business?._id) {
      toast.error('Please save your store general profile first before issuing coupons.');
      return;
    }
    if (!newStoreCoupon.code || !newStoreCoupon.discountValue || !newStoreCoupon.validUntil) {
      toast.error('Please provide promo code, discount amount, and active expiration date (validUntil).');
      return;
    }

    try {
      setSubmittingCoupon(true);
      await api.post('/coupons', {
        ...newStoreCoupon,
        code: newStoreCoupon.code.trim().toUpperCase(),
        businessId: business._id,
        scope: 'store',
      });
      toast.success(`Coupon "${newStoreCoupon.code.toUpperCase()}" listed for your store!`);
      setShowCouponForm(false);
      setNewStoreCoupon({
        code: '',
        title: '',
        description: '',
        discountType: 'percentage',
        discountValue: 20,
        minBookingAmount: 0,
        maxDiscountAmount: '',
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: '',
        usageLimit: 50,
      });
      fetchStoreCoupons(business._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to list coupon');
    } finally {
      setSubmittingCoupon(false);
    }
  };

  const handleToggleStoreCoupon = async (couponId, currentStatus) => {
    try {
      await api.put(`/coupons/${couponId}`, { isActive: !currentStatus });
      toast.success(`Coupon marked ${!currentStatus ? 'Active' : 'Inactive'}!`);
      fetchStoreCoupons(business._id);
    } catch (err) {
      toast.error('Failed to update coupon status');
    }
  };

  const handleDeleteStoreCoupon = async (couponId, code) => {
    if (!window.confirm(`Are you sure you want to remove promotional coupon "${code}"?`)) return;
    try {
      await api.delete(`/coupons/${couponId}`);
      toast.success(`Coupon "${code}" deleted`);
      fetchStoreCoupons(business._id);
    } catch (err) {
      toast.error('Failed to delete coupon');
    }
  };

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setDetectingLocation(true);
    toast('📍 Detecting exact store coordinates from device...', { icon: '🔍' });

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        setLatitude(lat);
        setLongitude(lng);

        try {
          const revRes = await api.get(`/location/reverse-geocode?lat=${lat}&lng=${lng}`);
          if (revRes.data.success && revRes.data.data) {
            const d = revRes.data.data;
            if (d.city) setCity(d.city);
            if (d.street && !street) setStreet(d.street);
            if (d.formattedAddress && !landmark) setLandmark(d.formattedAddress.slice(0, 80));
            toast.success(`📍 Real-time GPS Locked: ${d.city} [${lat}, ${lng}]`);
          } else {
            toast.success(`📍 Store coordinates captured: [${lat}, ${lng}]`);
          }
        } catch {
          toast.success(`📍 Store coordinates captured: [${lat}, ${lng}]`);
        } finally {
          setDetectingLocation(false);
        }
      },
      async (err) => {
        console.warn('Browser GPS acquisition failed or timed out:', err.message);
        toast('Device GPS access unavailable. Resolving approximate network location...', { icon: '🌐' });
        try {
          const ipRes = await fetch('https://ipapi.co/json/');
          const ipData = await ipRes.json();
          if (ipData && ipData.latitude && ipData.longitude) {
            const lat = parseFloat(ipData.latitude.toFixed(6));
            const lng = parseFloat(ipData.longitude.toFixed(6));
            setLatitude(lat);
            setLongitude(lng);
            if (ipData.city) setCity(ipData.city);
            toast.success(`📍 Network Location acquired: ${ipData.city} [${lat}, ${lng}]`);
          } else {
            toast.error('GPS unavailable. You can search your city/neighborhood below.');
          }
        } catch {
          toast.error('Could not detect location. Please use "Search Area" below.');
        } finally {
          setDetectingLocation(false);
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const handleSearchLocation = async (e) => {
    if (e) e.preventDefault();
    if (!locationSearchQuery.trim()) {
      toast.error('Please enter a city, area, or landmark to search');
      return;
    }
    setSearchingLocation(true);
    try {
      const res = await api.get(`/location/search?query=${encodeURIComponent(locationSearchQuery.trim())}`);
      if (res.data.success && res.data.data) {
        const d = res.data.data;
        setLatitude(d.lat);
        setLongitude(d.lng);
        if (d.city) setCity(d.city);
        if (d.street && !street) setStreet(d.street);
        if (d.displayName && !landmark) setLandmark(d.displayName.slice(0, 80));
        toast.success(`📍 Located & Pinned: ${d.city} (${d.displayName.slice(0, 45)}...)`);
      } else {
        toast.error('Location not found. Try searching with city name.');
      }
    } catch (err) {
      toast.error('Failed to locate area: ' + (err.response?.data?.message || err.message));
    } finally {
      setSearchingLocation(false);
    }
  };

  const handleDevicePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const invalidFile = files.find((f) => f.size > 10 * 1024 * 1024);
    if (invalidFile) {
      toast.error(`"${invalidFile.name}" exceeds 10MB limit. Please choose smaller photos.`);
      return;
    }

    setUploadingPhotos(true);
    const toastId = toast.loading(`Uploading ${files.length} photo(s) from device...`);

    const formData = new FormData();
    files.forEach((file) => formData.append('photos', file));

    try {
      const res = await api.post('/upload/photos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success && res.data.urls) {
        setImages((prev) => [...prev, ...res.data.urls]);
        toast.success(`🎉 ${res.data.urls.length} photo(s) uploaded successfully from device!`, { id: toastId });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Device photo upload failed.', { id: toastId });
    } finally {
      setUploadingPhotos(false);
      e.target.value = '';
    }
  };

  const handleImportGoogleData = async () => {
    if (!googleImportUrl.trim()) {
      toast.error('Please enter a Google Maps link or store place name.');
      return;
    }

    setImportingGoogle(true);
    const toastId = toast.loading('Connecting to Google Maps & importing location and reviews...');

    try {
      if (business?._id) {
        const res = await api.post(`/google/business/${business._id}/import`, {
          googleMapsUrl: googleImportUrl.trim(),
          storeName: name,
          category,
        });

        if (res.data.success) {
          const d = res.data.data;
          if (d.importedLocation) {
            setLatitude(d.importedLocation.lat);
            setLongitude(d.importedLocation.lng);
          }
          if (d.googleReviews) {
            setGoogleReviews(d.googleReviews);
          }
          if (d.googleRating) setGoogleRating(d.googleRating);
          if (d.googleReviewCount) setGoogleReviewCount(d.googleReviewCount);
          toast.success(`✓ Successfully imported ${d.googleReviews?.length || 4} Google reviews and exact map coordinates!`, { id: toastId });
        }
      } else {
        const res = await api.post('/google/preview', {
          googleMapsUrl: googleImportUrl.trim(),
          storeName: name,
          category,
        });

        if (res.data.success) {
          const d = res.data.data;
          setLatitude(d.lat);
          setLongitude(d.lng);
          setGoogleReviews(d.reviews || []);
          setGoogleRating(d.googleRating || 4.6);
          setGoogleReviewCount(d.googleReviewCount || 54);
          toast.success(`✓ Captured Google coordinates [${d.lat}, ${d.lng}] & ${d.reviews?.length} Google reviews!`, { id: toastId });
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to import Google data.', { id: toastId });
    } finally {
      setImportingGoogle(false);
    }
  };

  const handleAddPhoto = () => {
    if (!newImageUrl.trim()) {
      toast.error('Please enter a valid image URL');
      return;
    }
    if (!newImageUrl.startsWith('http')) {
      toast.error('Image URL must start with http:// or https://');
      return;
    }
    setImages([...images, newImageUrl.trim()]);
    setNewImageUrl('');
    toast.success('Photo added to store gallery');
  };

  const handleRemovePhoto = (indexToRemove) => {
    if (images.length <= 3) {
      toast.error('A minimum of 3 photos is required for store verification policy.');
      return;
    }
    setImages(images.filter((_, idx) => idx !== indexToRemove));
  };

  const handleLoadSamplePack = () => {
    const pack = samplePhotoPacks[category] || samplePhotoPacks.salon;
    setImages(pack);
    toast.success(`Loaded verified ${category} photo pack (4 photos)`);
  };

  const handleAutoFillCredentials = () => {
    setGstin(city.toLowerCase().includes('noida') ? '09AABC9821F1Z5' : '27AABC9821F1Z2');
    setTradeLicense(`TL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setOwnerIdType('Aadhaar Card');
    setOwnerIdNumber('XXXX-XXXX-8921');
    setDocumentUrl('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80');
    toast.success('Sample business registration credentials filled');
  };

  const handleSubmitVerificationDocs = async () => {
    if (!business?._id) {
      toast.error('Please save your general business profile first.');
      return;
    }
    if (!gstin && !tradeLicense) {
      toast.error('Please provide at least a GSTIN or Trade License registration number.');
      return;
    }

    setSubmittingDocs(true);
    try {
      const res = await api.put(`/businesses/${business._id}/verification`, {
        gstin,
        tradeLicense,
        ownerIdType,
        ownerIdNumber,
        documentUrl,
      });
      setVerificationStatus(res.data.data.verificationStatus);
      toast.success('Verification documents submitted to platform admin!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit documents');
    } finally {
      setSubmittingDocs(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (images.length < 3) {
      toast.error('Verification requires at least 3 photos (Storefront Exterior, Interior Ambience, and Workstation/Treatment Area).');
      return;
    }

    if (!latitude || !longitude) {
      toast.error('Please detect GPS or search your store area coordinates before saving.');
      return;
    }

    setSaving(true);

    const payload = {
      name,
      category,
      description,
      phone,
      email,
      address: {
        street,
        city: city || 'Noida',
        state: city.toLowerCase().includes('noida') ? 'Uttar Pradesh' : (city.toLowerCase().includes('mumbai') ? 'Maharashtra' : 'Uttar Pradesh'),
        pincode: '201301',
      },
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
      pinpointLocation: {
        landmark,
        googleMapsUrl: googleImportUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([name, street, city].filter(Boolean).join(' '))}`,
        isPinpointConfirmed: true,
      },
      images,
      offersRideAssistance,
      rideNotes,
      workingHours,
      googleReviews,
      googleRating,
      googleReviewCount,
    };

    try {
      if (business?._id) {
        const res = await api.put(`/businesses/${business._id}`, payload);
        setBusiness(res.data.data);
        toast.success('Business profile & pinpoint coordinates updated!');
      } else {
        const res = await api.post('/businesses', payload);
        setBusiness(res.data.data);
        toast.success('Business profile created successfully!');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save business profile';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const googleMapsStoreLink = latitude && longitude
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([name || 'Store', street, city].filter(Boolean).join(' '))}&center=${latitude},${longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([name || 'Store', street, city].filter(Boolean).join(' '))}`;

  if (loading) {
    return <LoadingSpinner text="Loading business settings..." />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#17231d] tracking-tight">
            {business ? 'Manage Store & Verification' : 'Set Up New Business'}
          </h1>
          <p className="text-xs text-[#6b756e] mt-1">
            Maintain your verified store profile, pinpoint coordinates, multiple photos, and municipal licenses
          </p>
        </div>

        {/* Live Store View Button */}
        {business?._id && (
          <a
            href={`/business/${business._id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#2f6b4f] text-white text-xs font-bold shadow-xs hover:bg-[#25553e] transition-colors"
          >
            <span>View Live Store Page</span>
            <ExternalLink size={13} />
          </a>
        )}
      </div>

      {/* VERIFICATION PROCESS BANNER */}
      <div className={`rounded-3xl p-6 border shadow-xs transition-all ${
        verificationStatus === 'verified'
          ? 'bg-emerald-50/80 border-emerald-200'
          : verificationStatus === 'pending_review'
          ? 'bg-amber-50/80 border-amber-200'
          : verificationStatus === 'rejected'
          ? 'bg-red-50/80 border-red-200'
          : 'bg-blue-50/80 border-blue-200'
      }`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-start space-x-3.5">
            <div className={`p-2.5 rounded-2xl ${
              verificationStatus === 'verified'
                ? 'bg-emerald-600 text-white'
                : verificationStatus === 'pending_review'
                ? 'bg-amber-600 text-white'
                : verificationStatus === 'rejected'
                ? 'bg-red-600 text-white'
                : 'bg-blue-600 text-white'
            }`}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Business Verification Process
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  verificationStatus === 'verified'
                    ? 'bg-emerald-100 text-emerald-800'
                    : verificationStatus === 'pending_review'
                    ? 'bg-amber-100 text-amber-800'
                    : verificationStatus === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {verificationStatus.replace('_', ' ')}
                </span>
              </div>

              <h2 className="text-base font-extrabold text-[#17231d] mt-1">
                {verificationStatus === 'verified'
                  ? '✓ NearNest Verified Partner Store'
                  : verificationStatus === 'pending_review'
                  ? 'Verification Documents Under Review'
                  : verificationStatus === 'rejected'
                  ? 'Verification Action Required'
                  : 'Get Your Store Verified'}
              </h2>

              <p className="text-xs text-[#6b756e] mt-0.5 leading-relaxed max-w-2xl">
                {verificationStatus === 'verified'
                  ? 'Your store has passed government trade license verification and premise inspection. Verified badge is prominently displayed to all customers.'
                  : verificationStatus === 'pending_review'
                  ? 'Your GSTIN and business credentials are under administrative review. Once approved, your store will be featured with the verified badge.'
                  : verificationStatus === 'rejected'
                  ? `Your previous submission was declined (${rejectionReason || 'document mismatch'}). Please update your license documents below.`
                  : 'Submit your GSTIN or Trade License to earn the NearNest Verified badge and gain top priority in customer recommendations.'}
              </p>
            </div>
          </div>

          <a
            href="#verification-section"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 transition-colors shadow-xs shrink-0"
          >
            Review Documents ↓
          </a>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Core General Details */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-gray-900 pb-2 border-b border-gray-100 flex items-center">
            <Store className="w-4 h-4 mr-2 text-[#2f6b4f]" />
            General Store Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Business Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aura Luxury Day Spa & Wellness"
                className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2f6b4f] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2f6b4f] focus:outline-none bg-white"
              >
                <option value="salon">Salon (Hair, Beard & Grooming)</option>
                <option value="spa">Spa (Ayurveda, Massage & Wellness)</option>
                <option value="gym">Gym (Fitness, CrossFit & Strength)</option>
                <option value="parlour">Beauty Parlour (Bridal & Skin Care)</option>
                <option value="wellness">Wellness & Yoga Studio</option>
                <option value="other">Other Service</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-gray-700 block mb-1">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your treatments, master stylists, cleanliness protocols, and amenities..."
                className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2f6b4f] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Contact Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98110 00000"
                className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2f6b4f] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Official Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@business.com"
                className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2f6b4f] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* MULTIPLE PHOTOS REQUIREMENT (At least 3 photos mandatory) */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center">
                <Image className="w-4 h-4 mr-2 text-[#2f6b4f]" />
                Store Photo Gallery (Multiple Photos Required)
              </h3>
              <p className="text-xs text-[#6b756e] mt-0.5">
                Verification standard: You must upload at least <span className="font-bold text-[#17231d]">3 high-resolution photos</span> (Storefront Exterior, Interior Ambience, Workstations/Equipment).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                images.length >= 3 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {images.length} / 3 Required Photos {images.length >= 3 ? '✓' : ''}
              </span>

              <button
                type="button"
                onClick={handleLoadSamplePack}
                className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-[#17231d] rounded-xl text-xs font-semibold transition-colors"
                title="Load curated 4-photo pack for this category"
              >
                <Sparkles size={13} className="text-[#2f6b4f]" />
                <span>Load Sample Pack</span>
              </button>
            </div>
          </div>

          {/* Photo Gallery Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {images.map((imgUrl, idx) => {
              const labels = ['Storefront Exterior', 'Interior Ambience', 'Workstation / Setup', 'Facility Amenities'];
              const label = labels[idx] || `Photo ${idx + 1}`;

              return (
                <div key={idx} className="relative group rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 aspect-video sm:aspect-square flex flex-col justify-between shadow-xs">
                  <img
                    src={imgUrl}
                    alt={label}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80';
                    }}
                  />

                  {/* Label badge */}
                  <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {label}
                  </div>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-90 hover:opacity-100 hover:scale-110 transition-all shadow-xs"
                    title="Remove this photo"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Device Photo Upload & URL Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            {/* 1. Upload from Device */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <Upload size={14} className="text-[#2f6b4f]" />
                <span>Upload Photos from Device (Camera / Gallery)</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="devicePhotoInput"
                  multiple
                  accept="image/*"
                  onChange={handleDevicePhotoUpload}
                  disabled={uploadingPhotos}
                  className="hidden"
                />
                <label
                  htmlFor="devicePhotoInput"
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                    uploadingPhotos
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-[#2f6b4f] hover:bg-[#25553e] text-white active:scale-98'
                  }`}
                >
                  <Camera size={15} />
                  <span>{uploadingPhotos ? 'Uploading Photos...' : 'Choose Photos from Device'}</span>
                </label>
              </div>
              <p className="text-[10px] text-gray-500">
                Direct file upload from phone or PC. Minimum 3 high-resolution photos required.
              </p>
            </div>

            {/* 2. Add by URL */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <Globe size={14} className="text-[#2f6b4f]" />
                <span>Or Add Photo by URL</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or image link"
                  className="flex-1 text-xs p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2f6b4f] focus:outline-none bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddPhoto}
                  className="px-4 py-2.5 bg-[#17231d] text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors flex items-center gap-1 shrink-0"
                >
                  <Plus size={14} />
                  <span>Add URL</span>
                </button>
              </div>
              <p className="text-[10px] text-gray-500">
                You can also paste external image URLs or click "Load Sample Pack" above.
              </p>
            </div>
          </div>
        </div>

        {/* GOOGLE MAPS STORE LOCATION & REVIEWS IMPORTER */}
        <div className="bg-white rounded-3xl p-6 border border-blue-100 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-gray-100">
            <div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <h3 className="text-sm font-bold text-gray-900">
                  Import Store Location & Reviews from Google Maps
                </h3>
              </div>
              <p className="text-xs text-[#6b756e] mt-1">
                Sync with your Google Maps listing to import your verified Google star ratings, community reviews, and exact pinpoint coordinates.
              </p>
            </div>

            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
              {googleReviews.length > 0 ? `${googleReviews.length} Google Reviews Active` : 'Google Sync Ready'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={googleImportUrl}
                onChange={(e) => setGoogleImportUrl(e.target.value)}
                placeholder="Paste Google Maps URL or enter place name (e.g. Aura Luxury Spa Sector 18 Noida)"
                className="w-full text-xs p-2.5 pl-8 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              />
              <Globe size={14} className="absolute left-2.5 top-3 text-gray-400" />
            </div>

            <button
              type="button"
              disabled={importingGoogle}
              onClick={handleImportGoogleData}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs shrink-0 disabled:opacity-50"
            >
              <RefreshCw size={13} className={importingGoogle ? 'animate-spin' : ''} />
              <span>{importingGoogle ? 'Importing from Google...' : 'Import Google Data'}</span>
            </button>
          </div>

          {/* Imported Google Reviews preview strip */}
          {googleReviews.length > 0 && (
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-800">
                    Imported Google Reputation:
                  </span>
                  <span className="text-xs font-black text-blue-700 bg-white px-2 py-0.5 rounded-lg border border-blue-200">
                    ★ {googleRating} ({googleReviewCount || 54} Google Reviews)
                  </span>
                </div>
                <span className="text-[11px] text-gray-500">
                  Weightage: 30% in composite store score
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {googleReviews.slice(0, 2).map((rev, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-xl border border-gray-100 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">{rev.authorName}</span>
                      <span className="text-amber-500 font-bold text-[11px]">★ {rev.rating}</span>
                    </div>
                    <p className="text-[11px] text-gray-600 line-clamp-2 italic">"{rev.text}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* EXACT PINPOINT LOCATION OF STORE */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-[#2f6b4f]" />
                Exact Store Pinpoint Location (No Mumbai Lock)
              </h3>
              <p className="text-xs text-[#6b756e] mt-0.5">
                Capture high-accuracy GPS coordinates from your device or search your neighborhood.
              </p>
            </div>

            <button
              type="button"
              disabled={detectingLocation}
              onClick={handleDetectGPS}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 text-[#2f6b4f] hover:bg-emerald-100 text-xs font-bold transition-colors border border-emerald-200 disabled:opacity-50"
            >
              <LocateFixed size={14} className={detectingLocation ? 'animate-spin' : ''} />
              <span>{detectingLocation ? 'Detecting Real Coordinates...' : 'Capture Current Device GPS'}</span>
            </button>
          </div>

          {/* Quick Area / Landmark Search Bar */}
          <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
            <label className="text-xs font-semibold text-gray-700 block">
              Search City, Sector, or Landmark (Instant Coordinate Pin)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={locationSearchQuery}
                  onChange={(e) => setLocationSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchLocation(e)}
                  placeholder="e.g. Sector 18 Noida, Indirapuram Ghaziabad, Koramangala, Connaught Place..."
                  className="w-full text-xs p-2.5 pl-8 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2f6b4f] focus:outline-none bg-white"
                />
                <Search size={14} className="absolute left-2.5 top-3 text-gray-400" />
              </div>
              <button
                type="button"
                disabled={searchingLocation}
                onClick={handleSearchLocation}
                className="px-4 py-2.5 bg-[#17231d] text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors flex items-center gap-1.5 shrink-0 disabled:opacity-50"
              >
                <Compass size={13} className={searchingLocation ? 'animate-spin' : ''} />
                <span>{searchingLocation ? 'Locating...' : 'Search & Set Pin'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Street Address / Building
              </label>
              <input
                type="text"
                required
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="e.g. Sector 18, Opp Wave Silver Tower"
                className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2f6b4f] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                City / Region
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Noida / Greater Noida / Delhi / Mumbai"
                className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2f6b4f] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Pinpoint Landmark / Floor / Entrance Details
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Wave Silver Tower 2nd Floor, next to Starbucks, Sector 18 Metro Gate 2"
                className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2f6b4f] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1 flex items-center justify-between">
                <span>Exact Latitude (GPS)</span>
                {latitude && (
                  <span className="text-[10px] text-emerald-700 font-bold">✓ Pinned</span>
                )}
              </label>
              <input
                type="number"
                step="any"
                required
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="e.g. 28.5708"
                className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2f6b4f] focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1 flex items-center justify-between">
                <span>Exact Longitude (GPS)</span>
                {longitude && (
                  <span className="text-[10px] text-emerald-700 font-bold">✓ Pinned</span>
                )}
              </label>
              <input
                type="number"
                step="any"
                required
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="e.g. 77.3260"
                className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2f6b4f] focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Clickable Live Store Pinpoint Link Card */}
          <div className="rounded-2xl bg-[#f7f8f5] border border-[#e4e8e1] p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#17231d]">
                <MapPin size={15} className="text-[#2f6b4f]" />
                <span>Live Address Pinpoint Preview:</span>
              </div>
              <p className="text-[11px] text-[#6b756e] mt-0.5">
                {street ? `${street}, ` : ''}{city} {landmark ? `(${landmark})` : ''} · [{latitude}, {longitude}]
              </p>
            </div>

            {/* Direct Open in Maps Button */}
            <a
              href={googleMapsStoreLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#2f6b4f]/30 text-[#2f6b4f] hover:bg-[#e7eee6] text-xs font-extrabold shadow-xs transition-colors shrink-0"
              title="Test Google Maps search link with exact store address"
            >
              <span>Open Address on Store Maps</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>

        {/* COMMUTE & UBER RIDE ASSISTANCE */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-gray-900 pb-2 border-b border-gray-100 flex items-center">
            <Car className="w-4 h-4 mr-2 text-[#2f6b4f]" />
            Uber Ride & Commute Assistance
          </h3>

          <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-2xl">
            <input
              type="checkbox"
              id="rideToggle"
              checked={offersRideAssistance}
              onChange={(e) => setOffersRideAssistance(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded text-[#2f6b4f] focus:ring-[#2f6b4f]"
            />
            <label htmlFor="rideToggle" className="text-xs text-gray-700 cursor-pointer">
              <span className="font-bold text-gray-900 block">
                Enable 1-Click Uber & Ola Booking for Customers
              </span>
              <span>
                Displays a "Ride to Venue" card on your store profile with pre-filled drop-off coordinates.
              </span>
            </label>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Drop-off & Valet Notes for Passengers & Drivers
            </label>
            <textarea
              rows={2}
              value={rideNotes}
              onChange={(e) => setRideNotes(e.target.value)}
              placeholder="e.g. Dedicated Uber drop-off zone at Gate 2. Valet parking available."
              className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2f6b4f] focus:outline-none"
            />
          </div>
        </div>

        {/* BUSINESS VERIFICATION DOCUMENTS SECTION */}
        <div id="verification-section" className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-[#2f6b4f]" />
                Municipal & Government Verification Documents
              </h3>
              <p className="text-xs text-[#6b756e] mt-0.5">
                Submit GSTIN, Trade License, or Establishment Registration to secure verified business status.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAutoFillCredentials}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline"
            >
              Fill Sample Credentials
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                GSTIN / Tax Identification
              </label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                placeholder="e.g. 09AABC9821F1Z5"
                className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2f6b4f] focus:outline-none font-mono uppercase"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Trade License / Establishment Registration #
              </label>
              <input
                type="text"
                value={tradeLicense}
                onChange={(e) => setTradeLicense(e.target.value)}
                placeholder="e.g. NOIDA-SPA-2024-88 or BMC-TL-4819"
                className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2f6b4f] focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Owner Government ID Type
              </label>
              <select
                value={ownerIdType}
                onChange={(e) => setOwnerIdType(e.target.value)}
                className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2f6b4f] focus:outline-none bg-white"
              >
                <option value="Aadhaar Card">Aadhaar Card</option>
                <option value="PAN Card">PAN Card</option>
                <option value="Passport">Passport</option>
                <option value="Voter ID">Voter ID</option>
                <option value="Trade License">Municipal Trade License</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Owner ID Number (Masked)
              </label>
              <input
                type="text"
                value={ownerIdNumber}
                onChange={(e) => setOwnerIdNumber(e.target.value)}
                placeholder="e.g. XXXX-XXXX-9912"
                className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2f6b4f] focus:outline-none font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Certificate Document URL / Image Proof
              </label>
              <input
                type="url"
                value={documentUrl}
                onChange={(e) => setDocumentUrl(e.target.value)}
                placeholder="https://... URL of scanned trade certificate or business registration"
                className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2f6b4f] focus:outline-none bg-white font-mono"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              disabled={submittingDocs}
              onClick={handleSubmitVerificationDocs}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <ShieldCheck size={15} />
              <span>{submittingDocs ? 'Submitting...' : 'Submit Documents for Verification'}</span>
            </button>
          </div>
        </div>

        {/* Operating Hours Table */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-gray-900 pb-2 border-b border-gray-100 flex items-center">
            <Clock className="w-4 h-4 mr-2 text-[#2f6b4f]" />
            Operating Schedule (Slot Generation)
          </h3>
          <p className="text-xs text-gray-400">
            Customer appointment booking slots are generated in 30-minute intervals based on these hours.
          </p>

          <div className="divide-y divide-gray-100 space-y-2">
            {dayNames.map((dName, dayIdx) => {
              const wh = workingHours.find((w) => w.day === dayIdx) || {
                day: dayIdx,
                open: '09:00',
                close: '20:00',
                isClosed: false,
              };

              return (
                <div key={dayIdx} className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <span className="w-28 font-semibold text-gray-700">{dName}</span>

                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={wh.isClosed}
                        onChange={(e) => {
                          const updated = workingHours.map((w) =>
                            w.day === dayIdx ? { ...w, isClosed: e.target.checked } : w
                          );
                          setWorkingHours(updated);
                        }}
                        className="rounded text-[#2f6b4f] focus:ring-[#2f6b4f]"
                      />
                      <span className="text-gray-500">Closed</span>
                    </label>

                    {!wh.isClosed && (
                      <div className="flex items-center space-x-2">
                        <input
                          type="time"
                          value={wh.open}
                          onChange={(e) => {
                            const updated = workingHours.map((w) =>
                              w.day === dayIdx ? { ...w, open: e.target.value } : w
                            );
                            setWorkingHours(updated);
                          }}
                          className="p-1 border border-gray-200 rounded-lg text-xs"
                        />
                        <span className="text-gray-400">to</span>
                        <input
                          type="time"
                          value={wh.close}
                          onChange={(e) => {
                            const updated = workingHours.map((w) =>
                              w.day === dayIdx ? { ...w, close: e.target.value } : w
                            );
                            setWorkingHours(updated);
                          }}
                          className="p-1 border border-gray-200 rounded-lg text-xs"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* STORE EXCLUSIVE COUPONS & ACTIVE TIME FRAMES */}
        <div id="coupons-section" className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center">
                <Tag className="w-4 h-4 mr-2 text-[#2f6b4f]" />
                Store Exclusive Coupons & Active Time Frames
              </h3>
              <p className="text-xs text-[#6b756e] mt-0.5">
                List promotional discount codes for your customers and set the exact active start and expiration dates.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowCouponForm(!showCouponForm)}
              className="px-4 py-2 bg-[#2f6b4f] hover:bg-[#25553e] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Plus size={14} />
              <span>{showCouponForm ? 'Close Form' : 'List New Store Coupon'}</span>
            </button>
          </div>

          {/* New Store Coupon Form (Collapsible) */}
          {showCouponForm && (
            <div className="p-5 bg-gray-50/80 rounded-2xl border border-gray-200 space-y-4 animate-in fade-in">
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-800">
                Create & List Store Promotion
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Store Promo Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GLOW30 or RELAX100"
                    value={newStoreCoupon.code}
                    onChange={(e) =>
                      setNewStoreCoupon({ ...newStoreCoupon, code: e.target.value.toUpperCase() })
                    }
                    className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl font-mono font-bold uppercase focus:ring-2 focus:ring-[#2f6b4f] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Promotion Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Weekend Hair Spa Special"
                    value={newStoreCoupon.title}
                    onChange={(e) =>
                      setNewStoreCoupon({ ...newStoreCoupon, title: e.target.value })
                    }
                    className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2f6b4f] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Terms & Notes for Customers
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Valid on all premium spa and hair styling packages."
                    value={newStoreCoupon.description}
                    onChange={(e) =>
                      setNewStoreCoupon({ ...newStoreCoupon, description: e.target.value })
                    }
                    className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2f6b4f] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Discount Type
                  </label>
                  <select
                    value={newStoreCoupon.discountType}
                    onChange={(e) =>
                      setNewStoreCoupon({ ...newStoreCoupon, discountType: e.target.value })
                    }
                    className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2f6b4f] focus:outline-none font-semibold"
                  >
                    <option value="percentage">Percentage (% OFF)</option>
                    <option value="flat">Flat Amount (₹ OFF)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    {newStoreCoupon.discountType === 'percentage' ? 'Discount % *' : 'Discount Amount (₹) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={newStoreCoupon.discountType === 'percentage' ? 80 : 3000}
                    value={newStoreCoupon.discountValue}
                    onChange={(e) =>
                      setNewStoreCoupon({ ...newStoreCoupon, discountValue: Number(e.target.value) })
                    }
                    className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-[#2f6b4f] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Min Booking Spend (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={newStoreCoupon.minBookingAmount}
                    onChange={(e) =>
                      setNewStoreCoupon({ ...newStoreCoupon, minBookingAmount: Number(e.target.value) })
                    }
                    className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2f6b4f] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Max Discount Cap (₹, optional)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 150"
                    disabled={newStoreCoupon.discountType === 'flat'}
                    value={newStoreCoupon.maxDiscountAmount}
                    onChange={(e) =>
                      setNewStoreCoupon({ ...newStoreCoupon, maxDiscountAmount: e.target.value })
                    }
                    className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2f6b4f] focus:outline-none disabled:opacity-40"
                  />
                </div>

                {/* Active Time Frame Dates */}
                <div className="sm:col-span-2 p-3 bg-white rounded-xl border border-gray-200 space-y-2">
                  <p className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <Clock size={13} className="text-[#2f6b4f]" />
                    <span>Coupon Active Time Frame (Start & Expiration Dates) *</span>
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-gray-500 block mb-0.5">
                        Active From (Start Date)
                      </label>
                      <input
                        type="date"
                        required
                        value={newStoreCoupon.validFrom}
                        onChange={(e) =>
                          setNewStoreCoupon({ ...newStoreCoupon, validFrom: e.target.value })
                        }
                        className="w-full text-xs p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2f6b4f] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-gray-500 block mb-0.5">
                        Active Until (Expiration Date) *
                      </label>
                      <input
                        type="date"
                        required
                        min={newStoreCoupon.validFrom || new Date().toISOString().split('T')[0]}
                        value={newStoreCoupon.validUntil}
                        onChange={(e) =>
                          setNewStoreCoupon({ ...newStoreCoupon, validUntil: e.target.value })
                        }
                        className="w-full text-xs p-2 border border-gray-200 rounded-lg font-bold text-gray-800 focus:ring-2 focus:ring-[#2f6b4f] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Redemption Usage Limit
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newStoreCoupon.usageLimit}
                    onChange={(e) =>
                      setNewStoreCoupon({ ...newStoreCoupon, usageLimit: Number(e.target.value) })
                    }
                    className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2f6b4f] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCouponForm(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submittingCoupon}
                  onClick={handleCreateStoreCoupon}
                  className="px-5 py-2.5 bg-[#2f6b4f] hover:bg-[#25553e] text-white rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
                >
                  {submittingCoupon ? 'Listing...' : 'Confirm & List Store Coupon'}
                </button>
              </div>
            </div>
          )}

          {/* Existing Store Coupons Table */}
          {loadingCoupons ? (
            <div className="py-6 text-center text-xs text-gray-400">Loading store promotions...</div>
          ) : storeCoupons.length === 0 ? (
            <div className="py-6 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-4">
              <Tag className="w-6 h-6 text-gray-400 mx-auto mb-1.5" />
              <p className="text-xs font-bold text-gray-700">No store-exclusive coupons active yet</p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Boost your bookings by creating a limited-time 15% or 20% discount coupon for your clients.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                    <th className="pb-2.5">Code & Title</th>
                    <th className="pb-2.5">Discount</th>
                    <th className="pb-2.5">Active Time Frame</th>
                    <th className="pb-2.5">Status</th>
                    <th className="pb-2.5">Usage</th>
                    <th className="pb-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {storeCoupons.map((coupon) => {
                    const status = coupon.status || 'active';

                    return (
                      <tr key={coupon._id} className="hover:bg-gray-50/50">
                        <td className="py-3 pr-3">
                          <span className="font-mono font-black text-xs px-2 py-0.5 rounded-lg bg-gray-100 border border-gray-200 text-gray-900">
                            {coupon.code}
                          </span>
                          <p className="text-[11px] font-semibold text-gray-700 mt-0.5">
                            {coupon.title || coupon.code}
                          </p>
                        </td>

                        <td className="py-3 pr-3 font-bold text-gray-900 whitespace-nowrap">
                          {coupon.discountType === 'percentage'
                            ? `${coupon.discountValue}% OFF`
                            : `Flat ₹${coupon.discountValue} OFF`}
                          {coupon.minBookingAmount > 0 && (
                            <span className="block text-[10px] font-normal text-gray-400">
                              (Min ₹{coupon.minBookingAmount})
                            </span>
                          )}
                        </td>

                        <td className="py-3 pr-3 whitespace-nowrap text-gray-600 text-[11px]">
                          <span>{new Date(coupon.validFrom).toLocaleDateString()}</span>
                          <span className="text-gray-400 mx-1">→</span>
                          <span className="font-semibold text-gray-900">
                            {new Date(coupon.validUntil).toLocaleDateString()}
                          </span>
                        </td>

                        <td className="py-3 pr-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : status === 'scheduled'
                              ? 'bg-blue-100 text-blue-800'
                              : status === 'expired'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {status}
                          </span>
                        </td>

                        <td className="py-3 pr-3 whitespace-nowrap text-[11px] text-gray-700">
                          {coupon.usedCount} / {coupon.usageLimit || 100} used
                        </td>

                        <td className="py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              type="button"
                              onClick={() => handleToggleStoreCoupon(coupon._id, coupon.isActive)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                                coupon.isActive
                                  ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              }`}
                            >
                              {coupon.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteStoreCoupon(coupon._id, coupon.code)}
                              className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete store coupon"
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

        {/* Submit Main Changes */}
        <div className="flex items-center justify-between pt-4">
          <p className="text-xs text-gray-500">
            {images.length < 3 ? (
              <span className="text-amber-700 font-semibold">⚠️ Minimum 3 photos required to save store changes</span>
            ) : (
              <span className="text-emerald-700 font-semibold">✓ Ready to save store profile & pinpoint coordinates</span>
            )}
          </p>

          <button
            type="submit"
            disabled={saving || images.length < 3}
            className="px-8 py-3.5 bg-[#17231d] hover:bg-neutral-800 text-white rounded-2xl text-xs font-extrabold shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <CheckCircle2 size={16} />
            <span>{saving ? 'Saving changes...' : 'Save Store Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ManageBusiness;
