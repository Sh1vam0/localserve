import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  Sparkles, 
  ShieldCheck, 
  CalendarCheck, 
  Heart, 
  ArrowRight,
  MapPin,
  Clock3,
  LocateFixed,
  Car,
  Navigation,
  Crosshair,
  Compass,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import api from '../api/axios';
import BusinessCard from '../components/BusinessCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLocationContext, CITY_COORDINATES } from '../context/LocationContext';
import toast from 'react-hot-toast';

const categories = [
  { name: 'All services', id: 'all', emoji: '✳' },
  { name: 'Salon', id: 'salon', emoji: '✂' },
  { name: 'Beauty', id: 'parlour', emoji: '✦' },
  { name: 'Gym', id: 'gym', emoji: '↗' },
  { name: 'Spa', id: 'spa', emoji: '≈' },
  { name: 'Wellness', id: 'wellness', emoji: '♡' },
];

const Home = () => {
  const navigate = useNavigate();
  const { location: userGeoLocation, detecting: isDetectingGeo, detectLiveLocation, setManualCity } = useLocationContext();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All services');
  const [maxPrice, setMaxPrice] = useState('Any price');
  const [minRating, setMinRating] = useState('Any rating');
  const [sort, setSort] = useState('Recommended');
  const [distanceRadius, setDistanceRadius] = useState('all'); // '3', '5', '10', 'all'
  const [businesses, setBusinesses] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch businesses & hybrid recommendations based on current location
  const fetchLocationData = async (lat = null, lng = null) => {
    setLoading(true);
    try {
      let bizUrl = '/businesses';
      let recUrl = '/recommendations';

      const currentLat = lat ?? userGeoLocation?.lat;
      const currentLng = lng ?? userGeoLocation?.lng;

      if (currentLat && currentLng) {
        bizUrl += `?lat=${currentLat}&lng=${currentLng}&sort=nearest`;
        recUrl += `?lat=${currentLat}&lng=${currentLng}&limit=6`;
      }

      const [bizRes, recRes] = await Promise.all([
        api.get(bizUrl),
        api.get(recUrl).catch(() => ({ data: { data: null } })),
      ]);

      setBusinesses(bizRes.data.data || []);
      setRecommendations(recRes.data.data || null);
    } catch (err) {
      console.error('Failed to load businesses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userGeoLocation) {
      fetchLocationData(userGeoLocation.lat, userGeoLocation.lng);
      setSort('Nearest to me');
    } else {
      fetchLocationData();
    }
  }, [userGeoLocation]);

  const handleTriggerGPS = async (quickCategory = null) => {
    try {
      const loc = await detectLiveLocation();
      if (quickCategory) {
        setCategory(quickCategory);
      }
      setSort('Nearest to me');
      fetchLocationData(loc.lat, loc.lng);
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.warn('GPS trigger error:', err);
    }
  };

  const handleQuickChip = (chipType) => {
    if (chipType === 'spa_near_me') {
      setCategory('Spa');
      setSearch('');
      handleTriggerGPS('Spa');
    } else if (chipType === 'salon_near_me') {
      setCategory('Salon');
      setSearch('');
      handleTriggerGPS('Salon');
    } else if (chipType === 'gym_near_me') {
      setCategory('Gym');
      setSearch('');
      handleTriggerGPS('Gym');
    } else if (chipType === 'parlour_near_me') {
      setCategory('Beauty');
      setSearch('');
      handleTriggerGPS('Beauty');
    } else if (chipType === 'noida') {
      setSearch('');
      setCategory('All services');
      setManualCity('noida');
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
    } else if (chipType === 'greater_noida') {
      setSearch('');
      setCategory('All services');
      setManualCity('greater_noida');
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
    } else if (chipType === 'mumbai') {
      setSearch('');
      setCategory('All services');
      setManualCity('mumbai');
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const filtered = useMemo(() => {
    let list = businesses.filter((b) => {
      let rawQ = search.toLowerCase().trim();
      const q = rawQ.replace(/\bnear\s+me\b/gi, '').trim();

      const matchesSearch =
        !q ||
        [b.name, b.category, b.address?.city, b.address?.street, b.description].some((x) =>
          String(x || '').toLowerCase().includes(q)
        );

      const catObj = categories.find((c) => c.name === category);
      const matchesCategory =
        category === 'All services' || (catObj && b.category === catObj.id);

      const price = Number(b.startingPrice ?? 0);
      const matchesPrice =
        maxPrice === 'Any price' ||
        (maxPrice === 'Under ₹500'
          ? price < 500
          : maxPrice === '₹500–₹1,000'
          ? price >= 500 && price <= 1000
          : price > 1000);

      const matchesRating =
        minRating === 'Any rating' || Number(b.rating || 0) >= Number(minRating);

      const matchesRadius =
        distanceRadius === 'all' ||
        (b.distanceKm !== undefined && b.distanceKm <= parseFloat(distanceRadius));

      return matchesSearch && matchesCategory && matchesPrice && matchesRating && matchesRadius;
    });

    if (sort === 'Nearest to me') {
      list.sort((a, b) => Number(a.distanceKm ?? 999) - Number(b.distanceKm ?? 999));
    } else if (sort === 'Top rated') {
      list.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    } else if (sort === 'Price: low to high') {
      list.sort((a, b) => Number(a.startingPrice || 0) - Number(b.startingPrice || 0));
    } else if (sort === 'Price: high to low') {
      list.sort((a, b) => Number(b.startingPrice || 0) - Number(a.startingPrice || 0));
    }

    return list;
  }, [businesses, search, category, maxPrice, minRating, sort, distanceRadius]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-8 sm:space-y-10 pb-16">
      {/* NearNest Signature Hero Section */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-[2rem] bg-[#0F221A] px-4 py-8 sm:px-10 sm:py-14 lg:px-14 lg:py-16 text-white shadow-xl">
        {/* Architectural Radar Rings (Subtle Nod to GPS) */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full border border-white/[0.06]" />
        <div className="pointer-events-none absolute -top-10 -right-10 w-52 h-52 rounded-full border border-white/[0.05]" />
        <div className="pointer-events-none absolute top-10 right-10 w-28 h-28 rounded-full border border-white/[0.04]" />
        <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#DDF279]/5 blur-2xl" />

        <div className="relative max-w-2xl">
          <div className="mb-4 sm:mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 sm:px-3.5 sm:py-1.5 text-[11px] sm:text-xs font-bold text-[#d9f36a] tracking-wide">
            <Sparkles size={13} className="shrink-0" />
            <span className="truncate">LIVE GPS RECOMMENDATION ENGINE</span>
          </div>

          <h1 className="max-w-xl text-3xl font-extrabold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl text-white">
            Find your next{' '}
            <span className="font-serif italic font-normal text-[#d9f36a]">
              favourite
            </span>{' '}
            local spot.
          </h1>

          <p className="mt-3 sm:mt-5 max-w-lg text-xs sm:text-base leading-relaxed text-white/80 font-medium">
            Lock your live coordinates to see exact distances, verified partner stores, and instant slot availability.
          </p>

          {/* SINGLE INTEGRATED SEARCH BAR */}
          <div className="mt-6 sm:mt-8 relative flex items-center bg-white rounded-2xl p-1.5 shadow-md max-w-2xl">
            <Search className="w-4 h-4 text-[#0F221A]/40 ml-3 mr-2 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              placeholder="Search studio, massage, haircut..."
              className="w-full text-xs sm:text-sm text-[#0F221A] placeholder-[#0F221A]/40 focus:outline-none bg-transparent py-2"
            />
            {/* Integrated GPS Trigger Icon */}
            <button
              type="button"
              onClick={() => handleTriggerGPS()}
              disabled={isDetectingGeo}
              title="Use my current GPS location"
              className="p-2 text-[#0F221A]/50 hover:text-[#0F221A] transition shrink-0"
            >
              <LocateFixed size={16} className={isDetectingGeo ? 'animate-spin text-emerald-600' : ''} />
            </button>
            <button
              type="button"
              onClick={() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-[#DDF279] text-[#0F221A] text-xs font-bold px-4 py-2.5 rounded-xl hover:brightness-95 transition shrink-0"
            >
              Search
            </button>
          </div>

          {/* 3. UNIFIED 1.5PX CATEGORY ICONS (No Emojis, No repeated "Near Me") */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3 mt-6 max-w-2xl">
            {/* Spas (Lotus Icon) */}
            <button
              type="button"
              onClick={() => {
                setCategory(category === 'Spa' ? 'All services' : 'Spa');
                document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`group flex flex-col items-center justify-center py-3.5 px-2 rounded-2xl border transition active:scale-95 ${
                category === 'Spa'
                  ? 'bg-white/20 border-[#DDF279] ring-2 ring-[#DDF279]/30'
                  : 'bg-white/[0.07] hover:bg-white/[0.14] border-white/[0.08]'
              }`}
            >
              <svg className="w-5 h-5 text-[#DDF279] mb-1.5 group-hover:scale-110 transition" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4C10 7.5 9 11 12 16c3-5 2-8.5 0-12z"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16c-3.5-1-6.5-3.5-7.5-7.5 3.5.5 6 2.5 7.5 7.5z"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16c3.5-1 6.5-3.5 7.5-7.5-3.5.5-6 2.5-7.5 7.5z"/>
                <path strokeLinecap="round" d="M7 19h10"/>
              </svg>
              <span className="text-xs font-medium text-white/95">Spas</span>
            </button>

            {/* Salons (Minimalist Shears) */}
            <button
              type="button"
              onClick={() => {
                setCategory(category === 'Salon' ? 'All services' : 'Salon');
                document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`group flex flex-col items-center justify-center py-3.5 px-2 rounded-2xl border transition active:scale-95 ${
                category === 'Salon'
                  ? 'bg-white/20 border-[#DDF279] ring-2 ring-[#DDF279]/30'
                  : 'bg-white/[0.07] hover:bg-white/[0.14] border-white/[0.08]'
              }`}
            >
              <svg className="w-5 h-5 text-[#DDF279] mb-1.5 group-hover:scale-110 transition" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24">
                <circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/>
                <path strokeLinecap="round" d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12"/>
              </svg>
              <span className="text-xs font-medium text-white/95">Salons</span>
            </button>

            {/* Gyms (Minimalist Dumbbell) */}
            <button
              type="button"
              onClick={() => {
                setCategory(category === 'Gym' ? 'All services' : 'Gym');
                document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`group flex flex-col items-center justify-center py-3.5 px-2 rounded-2xl border transition active:scale-95 ${
                category === 'Gym'
                  ? 'bg-white/20 border-[#DDF279] ring-2 ring-[#DDF279]/30'
                  : 'bg-white/[0.07] hover:bg-white/[0.14] border-white/[0.08]'
              }`}
            >
              <svg className="w-5 h-5 text-[#DDF279] mb-1.5 group-hover:scale-110 transition" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>
              </svg>
              <span className="text-xs font-medium text-white/95">Gyms</span>
            </button>

            {/* Parlours (Refined Sparkle) */}
            <button
              type="button"
              onClick={() => {
                setCategory(category === 'Beauty' ? 'All services' : 'Beauty');
                document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`group flex flex-col items-center justify-center py-3.5 px-2 rounded-2xl border transition active:scale-95 ${
                category === 'Beauty'
                  ? 'bg-white/20 border-[#DDF279] ring-2 ring-[#DDF279]/30'
                  : 'bg-white/[0.07] hover:bg-white/[0.14] border-white/[0.08]'
              }`}
            >
              <svg className="w-5 h-5 text-[#DDF279] mb-1.5 group-hover:scale-110 transition" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l1.8 5.4a2 2 0 001.3 1.3L20.5 11.5l-5.4 1.8a2 2 0 00-1.3 1.3L12 20l-1.8-5.4a2 2 0 00-1.3-1.3L3.5 11.5l5.4-1.8a2 2 0 001.3-1.3L12 3z"/>
              </svg>
              <span className="text-xs font-medium text-white/95">Parlours</span>
            </button>
          </div>

          {/* Live Location Radar Telemetry Banner */}
          {userGeoLocation && (
            <div className="mt-4 p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d9f36a] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#d9f36a]"></span>
                </span>
                <span className="font-bold text-[#d9f36a]">Active Location:</span>
                <span className="text-white font-medium">{userGeoLocation.city}</span>
                <span className="text-white/60 font-mono text-[11px]">
                  ({userGeoLocation.lat.toFixed(3)}°N, {userGeoLocation.lng.toFixed(3)}°E)
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-white/70 text-[11px]">Filter Radius:</span>
                <div className="flex gap-1">
                  {[
                    { id: '3', label: '< 3 km' },
                    { id: '5', label: '< 5 km' },
                    { id: '10', label: '< 10 km' },
                    { id: 'all', label: 'All' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setDistanceRadius(r.id)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                        distanceRadius === r.id
                          ? 'bg-[#d9f36a] text-[#17231d]'
                          : 'bg-white/15 text-white hover:bg-white/25'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. MINIMALIST ARCHITECTURAL TRUST CARD */}
          <div className="mt-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-3.5 shadow-sm max-w-2xl">
            <div className="grid grid-cols-3 divide-x divide-white/15 text-center">
              <div className="px-2 flex flex-col items-center">
                <ShieldCheck size={16} className="text-[#DDF279] mb-1" />
                <p className="text-[11px] font-bold text-white leading-tight">Two-Way OTP</p>
                <p className="text-[10px] text-white/60 mt-0.5">Verified Entry</p>
              </div>

              <div className="px-2 flex flex-col items-center">
                <CalendarCheck size={16} className="text-[#DDF279] mb-1" />
                <p className="text-[11px] font-bold text-white leading-tight">Zero Double-Book</p>
                <p className="text-[10px] text-white/60 mt-0.5">Live Slot Lock</p>
              </div>

              <div className="px-2 flex flex-col items-center">
                <Heart size={16} className="text-[#DDF279] mb-1" />
                <p className="text-[11px] font-bold text-white leading-tight">Multi-Photo</p>
                <p className="text-[10px] text-white/60 mt-0.5">Inspected Stores</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DYNAMIC LIVE RECOMMENDATIONS (When GPS Active) */}
      {recommendations && recommendations.nearYou && recommendations.nearYou.length > 0 && (
        <section className="bg-white p-6 sm:p-8 rounded-[2rem] border border-[#e4e8e1] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <span className="p-1.5 bg-[#2f6b4f] text-[#d9f36a] rounded-lg">
                  <LocateFixed size={16} />
                </span>
                <p className="eyebrow">HYBRID DISTANCE & TRUST ENGINE</p>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#17231d] mt-1">
                Top recommendations closest to your coordinates
              </h2>
            </div>

            <span className="text-xs font-bold text-[#2f6b4f] bg-[#e7eee6] px-3 py-1.5 rounded-full">
              📍 Real-Time Haversine Radius Active
            </span>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.nearYou.slice(0, 3).map((b, i) => (
              <div key={b._id} className="relative">
                <div className="absolute top-2 right-2 z-10 bg-[#2f6b4f] text-[#d9f36a] text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                  {b.travelEstimate || `${b.distanceKm} km away`}
                </div>
                <BusinessCard business={b} index={i} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Category Pills Bar */}
      <section className="pt-1 sm:pt-2">
        <div className="mb-3 sm:mb-4 flex items-end justify-between">
          <div>
            <p className="eyebrow">A LITTLE OF EVERYTHING</p>
            <h2 className="section-title mt-1 text-[#17231d]">What are you in the mood for?</h2>
          </div>
          <span className="hidden text-xs font-bold text-[#6b756e] sm:block">
            Swipe to explore all categories
          </span>
        </div>

        {/* Scrollable category container with touch momentum & scroll snap */}
        <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-2.5 overflow-x-auto pb-3 pt-1 no-scrollbar scroll-smooth snap-x snap-mandatory">
            {categories.map((c) => (
              <button
                key={c.name}
                onClick={() => setCategory(c.name)}
                className={`category-pill shrink-0 snap-start ${category === c.name ? 'category-selected' : ''}`}
              >
                <span className="text-base">{c.emoji}</span>
                <span className="whitespace-nowrap">{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section id="results" className="scroll-mt-24 pb-4">
        <div className="mb-6 flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">GOOD PLACES, CLOSE BY</p>
            <h2 className="section-title mt-1 text-[#17231d]">
              Local favourites <span className="text-[#6b756e] font-normal">({filtered.length})</span>
            </h2>
          </div>

          {/* Filter Selects: Clean 3-column equal grid on mobile, flex row on tablet/desktop */}
          <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2 w-full lg:w-auto">
            <select
              className="filter-select w-full sm:w-auto text-[11px] sm:text-xs px-2 sm:px-3 py-2 text-center sm:text-left"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              aria-label="Filter by price"
            >
              <option>Any price</option>
              <option>Under ₹500</option>
              <option>₹500–₹1,000</option>
              <option>Over ₹1,000</option>
            </select>

            <select
              className="filter-select w-full sm:w-auto text-[11px] sm:text-xs px-2 sm:px-3 py-2 text-center sm:text-left"
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              aria-label="Filter by rating"
            >
              <option>Any rating</option>
              <option value="4.5">4.5+ rating</option>
              <option value="4.8">4.8+ rating</option>
            </select>

            <select
              className="filter-select w-full sm:w-auto text-[11px] sm:text-xs px-2 sm:px-3 py-2 text-center sm:text-left"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort results"
            >
              <option>Nearest to me</option>
              <option>Recommended</option>
              <option>Top rated</option>
              <option>Price: low to high</option>
              <option>Price: high to low</option>
            </select>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner text="Discovering neighbourhood businesses..." />
        ) : filtered.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((b, i) => (
              <BusinessCard key={b._id} business={b} index={i} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-[#e4e8e1] bg-white p-12 text-center space-y-3">
            <Search className="mx-auto text-[#6b756e]" size={32} />
            <h3 className="text-base font-extrabold text-[#17231d]">No places found within this distance</h3>
            <p className="text-xs text-[#6b756e] max-w-sm mx-auto">
              Try adjusting your distance radius filter or selecting "All" to expand your search.
            </p>
            <button
              className="btn-quiet mt-2"
              onClick={() => {
                setSearch('');
                setCategory('All services');
                setMaxPrice('Any price');
                setMinRating('Any rating');
                setDistanceRadius('all');
              }}
            >
              Reset filters
            </button>
          </div>
        )}
      </section>

      {/* Business Owner Onboarding Callout Banner */}
      <section className="grid gap-4 rounded-[1.75rem] bg-[#e9eee6] p-7 sm:grid-cols-[1fr_auto] sm:items-center sm:p-9">
        <div>
          <p className="eyebrow">OWN A LOCAL BUSINESS?</p>
          <h3 className="mt-1 text-2xl font-extrabold tracking-tight text-[#17231d]">
            Your next regular is just around the corner.
          </h3>
          <p className="mt-2 max-w-xl text-xs sm:text-sm leading-6 text-[#6b756e]">
            Put your services in front of nearby customers, eliminate double-booking, and verify visits with arrival codes.
          </p>
        </div>
        <Link to="/register" className="btn-dark w-fit text-xs">
          <span>List your business</span>
          <ArrowRight size={15} />
        </Link>
      </section>
    </div>
  );
};

export default Home;
