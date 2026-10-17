import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const LocationContext = createContext(null);

// Popular regional city centroids for instant selection / fallback
export const CITY_COORDINATES = {
  noida: { name: 'Noida (Sector 18 / 62)', lat: 28.5708, lng: 77.3260 },
  greater_noida: { name: 'Greater Noida (Pari Chowk)', lat: 28.4682, lng: 77.5074 },
  mumbai: { name: 'Mumbai (Bandra / Juhu)', lat: 19.0760, lng: 72.8777 },
  delhi: { name: 'Delhi-NCR (Connaught Place)', lat: 28.6139, lng: 77.2090 },
};

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(() => {
    try {
      const saved = localStorage.getItem('localserv_location');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [detecting, setDetecting] = useState(false);

  // Approximate nearest known city name from coordinates
  const getCityNameFromCoords = (lat, lng) => {
    // Distance to Noida
    const dNoida = Math.hypot(lat - 28.57, lng - 77.32);
    const dGNoida = Math.hypot(lat - 28.46, lng - 77.50);
    const dMumbai = Math.hypot(lat - 19.07, lng - 72.87);

    if (dNoida < 0.2) return 'Noida';
    if (dGNoida < 0.2) return 'Greater Noida';
    if (dMumbai < 0.3) return 'Mumbai';
    if (lat > 28 && lat < 29 && lng > 76.8 && lng < 77.6) return 'Delhi-NCR';
    return `${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E`;
  };

  const detectLiveLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return Promise.reject(new Error('Geolocation not supported'));
    }

    setDetecting(true);
    toast('📡 Acquiring real-time GPS coordinates...', { icon: '📍' });

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          const detectedCity = getCityNameFromCoords(latitude, longitude);

          const newLoc = {
            lat: latitude,
            lng: longitude,
            accuracy: Math.round(accuracy || 0),
            isLive: true,
            city: detectedCity,
            timestamp: Date.now(),
          };

          setLocation(newLoc);
          setDetecting(false);
          localStorage.setItem('localserv_location', JSON.stringify(newLoc));

          toast.success(`📍 Live GPS Locked! (${detectedCity})`);
          resolve(newLoc);
        },
        (error) => {
          setDetecting(false);
          console.warn('Geolocation acquisition error:', error.message);

          let errorMsg = 'Could not access GPS.';
          if (error.code === error.PERMISSION_DENIED) {
            errorMsg = 'Location permission was denied. Click the lock icon in your browser to enable it.';
          } else if (error.code === error.TIMEOUT) {
            errorMsg = 'GPS acquisition timed out.';
          }

          toast.error(errorMsg);

          // Graceful fallback to Noida Sector 18 so recommendations still work smoothly
          const fallback = {
            lat: 28.5708,
            lng: 77.3260,
            isLive: false,
            city: 'Noida (Sector 18)',
            isFallback: true,
          };
          setLocation(fallback);
          localStorage.setItem('localserv_location', JSON.stringify(fallback));
          toast('Using Noida Sector 18 as current reference point', { icon: '📍' });
          resolve(fallback);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000,
        }
      );
    });
  };

  const setManualCity = (cityKey) => {
    const cityData = CITY_COORDINATES[cityKey] || CITY_COORDINATES.noida;
    const manualLoc = {
      lat: cityData.lat,
      lng: cityData.lng,
      isLive: false,
      city: cityData.name,
      timestamp: Date.now(),
    };
    setLocation(manualLoc);
    localStorage.setItem('localserv_location', JSON.stringify(manualLoc));
    toast.success(`📍 Switched location to ${cityData.name}`);
    return manualLoc;
  };

  const clearLocation = () => {
    setLocation(null);
    localStorage.removeItem('localserv_location');
    toast('Location reset to national discovery', { icon: '🌐' });
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        detecting,
        detectLiveLocation,
        setManualCity,
        clearLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocationContext must be used within LocationProvider');
  }
  return context;
};

export default LocationContext;
