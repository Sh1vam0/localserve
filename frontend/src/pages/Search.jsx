import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import BusinessCard from '../components/BusinessCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Search as SearchIcon, Filter, SlidersHorizontal, MapPin, Star, LocateFixed, Compass, Crosshair } from 'lucide-react';
import { useLocationContext } from '../context/LocationContext';
import toast from 'react-hot-toast';

const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { location: userGeoLocation, detecting: isDetectingGeo, detectLiveLocation } = useLocationContext();

  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [distanceRadius, setDistanceRadius] = useState('all');

  // Search parameters from URL
  const queryParams = new URLSearchParams(location.search);
  const searchParam = queryParams.get('search') || '';
  const categoryParam = queryParams.get('category') || 'all';
  const cityParam = queryParams.get('city') || '';
  const sortParam = queryParams.get('sort') || 'recommended';
  const ratingParam = queryParams.get('rating') || '';
  const latParam = queryParams.get('lat') || '';
  const lngParam = queryParams.get('lng') || '';

  const [searchTerm, setSearchTerm] = useState(searchParam);
  const [category, setCategory] = useState(categoryParam);
  const [city, setCity] = useState(cityParam);
  const [sort, setSort] = useState(sortParam);
  const [rating, setRating] = useState(ratingParam);

  useEffect(() => {
    const fetchFilteredBusinesses = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchParam) params.append('search', searchParam);
        if (categoryParam && categoryParam !== 'all') params.append('category', categoryParam);
        if (cityParam) params.append('city', cityParam);
        if (ratingParam) params.append('rating', ratingParam);
        if (sortParam) params.append('sort', sortParam);

        const activeLat = latParam || userGeoLocation?.lat;
        const activeLng = lngParam || userGeoLocation?.lng;

        if (activeLat) params.append('lat', activeLat);
        if (activeLng) params.append('lng', activeLng);

        const res = await api.get(`/businesses?${params.toString()}`);
        setBusinesses(res.data.data || []);
      } catch (err) {
        console.error('Failed to load businesses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredBusinesses();
  }, [location.search, userGeoLocation]);

  const applyFilters = (newParams = {}) => {
    const updated = {
      search: searchTerm,
      category,
      city,
      sort,
      rating,
      ...newParams,
    };

    const nextParams = new URLSearchParams();
    if (updated.search) nextParams.set('search', updated.search);
    if (updated.category && updated.category !== 'all') nextParams.set('category', updated.category);
    if (updated.city) nextParams.set('city', updated.city);
    if (updated.sort) nextParams.set('sort', updated.sort);
    if (updated.rating) nextParams.set('rating', updated.rating);

    const activeLat = updated.lat || latParam || userGeoLocation?.lat;
    const activeLng = updated.lng || lngParam || userGeoLocation?.lng;
    if (activeLat) nextParams.set('lat', activeLat);
    if (activeLng) nextParams.set('lng', activeLng);

    navigate(`/search?${nextParams.toString()}`);
  };

  const handleDetectGPS = async (quickCategory = null) => {
    try {
      const pos = await detectLiveLocation();
      applyFilters({
        lat: pos.lat,
        lng: pos.lng,
        sort: 'nearest',
        category: quickCategory || category,
      });
    } catch (err) {
      console.warn('GPS error in search:', err);
    }
  };

  const displayedBusinesses = useMemo(() => {
    if (distanceRadius === 'all') return businesses;
    const maxDist = parseFloat(distanceRadius);
    return businesses.filter((b) => b.distanceKm !== undefined && b.distanceKm <= maxDist);
  }, [businesses, distanceRadius]);

  const activeLat = latParam || userGeoLocation?.lat;
  const activeLng = lngParam || userGeoLocation?.lng;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Search Bar on Top */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <div className="flex-1 flex items-center px-4 py-2 bg-gray-50 rounded-2xl w-full">
            <SearchIcon className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search e.g. “spa near me”, “massage”, “salon”, or salon name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters({ search: searchTerm })}
              className="w-full bg-transparent text-xs text-gray-900 focus:outline-none placeholder-gray-400"
            />
          </div>

          <div className="flex items-center px-3 py-2 bg-gray-50 rounded-2xl w-full md:w-56">
            <MapPin className="w-4 h-4 text-[#2f6b4f] mr-2 shrink-0" />
            <select
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                applyFilters({ city: e.target.value });
              }}
              className="w-full bg-transparent text-xs text-gray-800 font-medium focus:outline-none cursor-pointer"
            >
              <option value="">All Locations</option>
              <option value="Noida">Noida (Sector 18 / 62)</option>
              <option value="Greater Noida">Greater Noida (Pari Chowk)</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Andheri">Andheri, Mumbai</option>
              <option value="Bandra">Bandra, Mumbai</option>
              <option value="Juhu">Juhu, Mumbai</option>
              <option value="Powai">Powai, Mumbai</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Live GPS Lock Button */}
            <button
              type="button"
              onClick={() => handleDetectGPS()}
              disabled={isDetectingGeo}
              className="flex-1 md:flex-none px-4 py-2.5 bg-[#e7eee6] hover:bg-[#d5e0d4] text-[#2f6b4f] rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-xs"
              title="Acquire live GPS coordinates"
            >
              <LocateFixed size={14} className={isDetectingGeo ? 'animate-spin' : ''} />
              <span>{isDetectingGeo ? 'Locating...' : 'Use Live Location'}</span>
            </button>

            <button
              onClick={() => applyFilters()}
              className="flex-1 md:flex-none px-6 py-2.5 bg-[#2f6b4f] text-white rounded-2xl text-xs font-semibold hover:bg-[#25553e] shadow-xs transition-colors shrink-0"
            >
              Search
            </button>
          </div>
        </div>

        {/* Quick Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-100">
          <span className="text-[11px] font-bold text-gray-500">Quick Filters:</span>
          <button
            onClick={() => handleDetectGPS('spa')}
            className="inline-flex items-center gap-1 rounded-full bg-emerald-50 hover:bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 transition-colors"
          >
            <span>💆</span> Spas Near Me
          </button>
          <button
            onClick={() => handleDetectGPS('salon')}
            className="inline-flex items-center gap-1 rounded-full bg-emerald-50 hover:bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 transition-colors"
          >
            <span>✂</span> Salons Near Me
          </button>
          <button
            onClick={() => handleDetectGPS('gym')}
            className="inline-flex items-center gap-1 rounded-full bg-emerald-50 hover:bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 transition-colors"
          >
            <span>💪</span> Gyms Near Me
          </button>
          <button
            onClick={() => {
              setCity('Noida');
              applyFilters({ city: 'Noida' });
            }}
            className="inline-flex items-center gap-1 rounded-full bg-gray-100 hover:bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700 transition-colors"
          >
            <span>📍</span> Noida
          </button>
          <button
            onClick={() => {
              setCity('Greater Noida');
              applyFilters({ city: 'Greater Noida' });
            }}
            className="inline-flex items-center gap-1 rounded-full bg-gray-100 hover:bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700 transition-colors"
          >
            <span>📍</span> Greater Noida
          </button>
          <button
            onClick={() => {
              setCity('Mumbai');
              applyFilters({ city: 'Mumbai' });
            }}
            className="inline-flex items-center gap-1 rounded-full bg-gray-100 hover:bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700 transition-colors"
          >
            <span>📍</span> Mumbai
          </button>
        </div>
      </div>

      {/* Live GPS Telemetry Status Banner */}
      {activeLat && activeLng && (
        <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-emerald-950 font-bold">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
            </span>
            <span>Live GPS Active:</span>
            <span className="text-emerald-800 font-medium">
              {userGeoLocation?.city || 'Detected Location'} ({parseFloat(activeLat).toFixed(3)}°N, {parseFloat(activeLng).toFixed(3)}°E)
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-emerald-900 font-semibold text-[11px]">Radius:</span>
            <div className="flex gap-1">
              {[
                { id: '3', label: '< 3 km' },
                { id: '5', label: '< 5 km' },
                { id: '10', label: '< 10 km' },
                { id: '25', label: '< 25 km' },
                { id: 'all', label: 'All' },
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => setDistanceRadius(r.id)}
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                    distanceRadius === r.id
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-white text-emerald-900 hover:bg-emerald-100'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Layout: Filters Sidebar + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filter Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="w-4 h-4 text-gray-700" />
                <h3 className="text-sm font-bold text-gray-900">Filters</h3>
              </div>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCategory('all');
                  setCity('');
                  setSort('recommended');
                  setRating('');
                  setDistanceRadius('all');
                  navigate('/search');
                }}
                className="text-[11px] text-emerald-800 font-bold hover:underline"
              >
                Reset
              </button>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-2">Category</label>
              <div className="space-y-1">
                {[
                  { id: 'all', label: 'All Categories' },
                  { id: 'salon', label: '💇 Hair & Salons' },
                  { id: 'gym', label: '💪 Fitness & Gyms' },
                  { id: 'spa', label: '💆 Ayurvedic Spas' },
                  { id: 'parlour', label: '💅 Beauty Parlours' },
                  { id: 'wellness', label: '🧘 Yoga & Wellness' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setCategory(cat.id);
                      applyFilters({ category: cat.id });
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                      category === cat.id
                        ? 'bg-emerald-50 text-emerald-800 font-bold'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating Filter */}
            <div className="pt-3 border-t border-gray-100">
              <label className="text-xs font-bold text-gray-700 block mb-2">Minimum Rating</label>
              <div className="flex flex-wrap gap-1.5">
                {['', '4.0', '4.5', '4.8'].map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setRating(r);
                      applyFilters({ rating: r });
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-medium flex items-center space-x-1 ${
                      rating === r
                        ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span>{r ? `${r}+` : 'All'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Filter */}
            <div className="pt-3 border-t border-gray-100">
              <label className="text-xs font-bold text-gray-700 block mb-2">Sort Results By</label>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  applyFilters({ sort: e.target.value });
                }}
                className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:outline-none text-gray-700 bg-white"
              >
                <option value="nearest">📍 Nearest Distance</option>
                <option value="recommended">✨ Smart Recommended</option>
                <option value="rating">⭐ Highest Rated</option>
                <option value="price_asc">💰 Price: Low to High</option>
                <option value="price_desc">💎 Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Search Results */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs text-gray-500">
              Showing <span className="font-bold text-gray-800">{displayedBusinesses.length}</span> verified places
              {distanceRadius !== 'all' && <span className="text-emerald-700 font-bold ml-1">within {distanceRadius} km</span>}
            </span>
          </div>

          {loading ? (
            <LoadingSpinner text="Searching available local services with live distance..." />
          ) : displayedBusinesses.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 space-y-3">
              <SearchIcon className="w-10 h-10 text-gray-300 mx-auto" />
              <h4 className="text-base font-bold text-gray-800">No matching services found in this radius</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Try widening your distance radius filter or clearing your search term.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCategory('all');
                  setCity('');
                  setDistanceRadius('all');
                  navigate('/search');
                }}
                className="px-4 py-2 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold hover:bg-emerald-100"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {displayedBusinesses.map((biz, idx) => (
                <BusinessCard key={biz._id} business={biz} index={idx} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
