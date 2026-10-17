/**
 * Ride & Transit Universal Deep Link Utilities
 * Generates direct booking deep links for Uber, Ola, and Google Maps Navigation
 */

export const getUberDeepLink = ({ name = '', lat, lng, street = '', city = '' }) => {
  const latitude = lat || 19.076;
  const longitude = lng || 72.8777;
  const addressParts = [street, city].filter(Boolean).join(', ');
  const nickname = name ? encodeURIComponent(name) : 'Destination';
  const address = encodeURIComponent(addressParts || name || 'Destination');

  // Uber Universal Web/App Deep Link
  // Works on mobile (opens Uber app directly if installed) and desktop (opens m.uber.com ride launcher)
  return `https://m.uber.com/ul/?action=setPickup&client_id=localserv&pickup=my_location&dropoff[latitude]=${latitude}&dropoff[longitude]=${longitude}&dropoff[nickname]=${nickname}&dropoff[formatted_address]=${address}`;
};

export const getOlaDeepLink = ({ name = '', lat, lng }) => {
  const latitude = lat || 19.076;
  const longitude = lng || 72.8777;
  const dropName = encodeURIComponent(name || 'Destination');

  // Ola Universal Web/App Deep Link
  return `https://book.olacabs.com/?lat=${latitude}&lng=${longitude}&drop_name=${dropName}`;
};

export const getGoogleMapsDirectionsUrl = ({ lat, lng, name = '', street = '', city = '' }) => {
  const latitude = lat || 19.076;
  const longitude = lng || 72.8777;
  const destinationQuery = encodeURIComponent(`${name} ${street} ${city}`.trim());
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&query=${destinationQuery}`;
};

/**
 * Calculates estimated travel duration in minutes based on distance
 */
export const getEstimatedTravelTime = (distanceKm) => {
  if (!distanceKm || distanceKm <= 0) return '5-10 mins';
  // Average urban city transit speed: ~20-25 km/h
  const minutes = Math.round((distanceKm / 22) * 60) + 3; // +3 min buffer for traffic & lights
  if (minutes <= 10) return '5–10 mins';
  if (minutes <= 20) return `${minutes - 3}–${minutes + 4} mins`;
  return `${minutes - 5}–${minutes + 8} mins`;
};
