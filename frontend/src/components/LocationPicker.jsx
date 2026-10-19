import React, { useState, useRef, useEffect } from 'react';
import { LocateFixed, MapPin, ChevronDown, Check, Sparkles, Navigation } from 'lucide-react';
import { useLocationContext, CITY_COORDINATES } from '../context/LocationContext';

const LocationPicker = ({ className = '' }) => {
  const { location, detecting, detectLiveLocation, setManualCity, clearLocation } = useLocationContext();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const handleFetchLive = async () => {
    try {
      await detectLiveLocation();
      setIsOpen(false);
    } catch {
      // Handled by toast in context
    }
  };

  const handleSelectCity = (cityKey) => {
    setManualCity(cityKey);
    setIsOpen(false);
  };

  const handleReset = () => {
    clearLocation();
    setIsOpen(false);
  };

  // Primary label display: "Near me" or "Near me (City)"
  const pillLabel = location
    ? `Near me (${location.city ? location.city.split('(')[0].trim() : 'Live'})`
    : 'Near me';

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* 1-Tap Location Pill Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-white border border-[#17231d]/15 hover:border-[#17231d]/30 shadow-xs text-xs font-semibold text-[#17231d] transition-all hover:bg-[#fafbfa] active:scale-95"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="relative flex h-2 w-2">
          {location?.isLive && <span className="gps-pulse absolute inset-0"></span>}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              location?.isLive ? 'bg-emerald-500' : location ? 'bg-emerald-600' : 'bg-gray-400'
            }`}
          />
        </span>
        <span className="max-w-[130px] sm:max-w-[160px] truncate">{pillLabel}</span>
        <ChevronDown
          size={13}
          className={`text-[#17231d]/50 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white border border-[#e4e8e1] shadow-2xl z-50 p-2 text-[#17231d] animate-in fade-in duration-150">
          
          {/* Section 1: Fetch Live Location CTA */}
          <div className="p-1">
            <button
              type="button"
              onClick={handleFetchLive}
              disabled={detecting}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#0F221A] text-white hover:bg-[#163024] active:scale-[0.98] transition group text-left"
            >
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-[#DDF279] text-[#0F221A]">
                  <LocateFixed size={16} className={detecting ? 'animate-spin' : 'group-hover:scale-110 transition'} />
                </span>
                <div>
                  <p className="text-xs font-bold leading-tight flex items-center gap-1">
                    {detecting ? 'Acquiring GPS...' : 'Fetch Live Location'}
                  </p>
                  <p className="text-[10px] text-white/70">Calculates exact walking & driving distance</p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-md text-[#DDF279]">
                GPS
              </span>
            </button>
          </div>

          <div className="my-2 border-t border-gray-100" />

          {/* Section 2: Quick Neighbourhood Selection */}
          <div className="px-2 py-1">
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1.5">
              Or pick a neighbourhood:
            </p>

            <div className="space-y-1">
              {Object.entries(CITY_COORDINATES).map(([key, data]) => {
                const isSelected =
                  location &&
                  !location.isLive &&
                  (location.city === data.name || location.city?.includes(key.replace('_', ' ')));

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectCity(key)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin size={13} className={isSelected ? 'text-emerald-700' : 'text-gray-400'} />
                      <span>{data.name}</span>
                    </div>
                    {isSelected && <Check size={14} className="text-emerald-700" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="my-1.5 border-t border-gray-100" />

          {/* Section 3: Reset / All Locations */}
          <div className="p-1">
            <button
              type="button"
              onClick={handleReset}
              className="w-full text-center py-1.5 text-[11px] font-semibold text-gray-500 hover:text-emerald-800 hover:bg-gray-50 rounded-lg transition"
            >
              Clear filter · Show all cities
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;

