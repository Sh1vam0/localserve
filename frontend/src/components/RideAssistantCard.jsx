import React from 'react';
import { Car, Navigation, ExternalLink, ShieldCheck, MapPin, Compass } from 'lucide-react';
import { getUberDeepLink, getOlaDeepLink, getGoogleMapsDirectionsUrl, getEstimatedTravelTime } from '../utils/rideLinks';

const RideAssistantCard = ({ business, distanceKm = null }) => {
  if (!business) return null;

  const lat = business.location?.coordinates?.[1] || 19.076;
  const lng = business.location?.coordinates?.[0] || 72.8777;
  const street = business.address?.street || '';
  const city = business.address?.city || 'Mumbai';

  const uberUrl = getUberDeepLink({
    name: business.name,
    lat,
    lng,
    street,
    city,
  });

  const olaUrl = getOlaDeepLink({
    name: business.name,
    lat,
    lng,
  });

  const mapsUrl = getGoogleMapsDirectionsUrl({
    name: business.name,
    lat,
    lng,
    street,
    city,
  });

  const travelTime = distanceKm ? getEstimatedTravelTime(distanceKm) : '10-15 mins';

  return (
    <div className="rounded-[1.75rem] border border-[#e4e8e1] bg-white p-6 shadow-soft space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#17231d] text-white shadow-xs">
            <Car size={20} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-[#2f6b4f]">
                Ride Assistance
              </span>
              <span className="rounded-full bg-[#d9f36a]/40 px-2 py-0.5 text-[10px] font-extrabold text-[#17231d]">
                Instant Link
              </span>
            </div>
            <h3 className="text-base font-extrabold text-[#17231d]">
              Book a Ride to {business.name}
            </h3>
          </div>
        </div>

        {distanceKm && (
          <div className="text-right shrink-0">
            <span className="text-xs font-black text-[#17231d] block">
              {distanceKm} km
            </span>
            <span className="text-[10px] font-medium text-[#6b756e]">
              ~{travelTime}
            </span>
          </div>
        )}
      </div>

      {/* Dropoff Instructions / Valet Info from Owner */}
      <div className="rounded-2xl bg-[#f7f8f5] p-3.5 border border-[#e4e8e1]/60 text-xs text-[#6b756e] space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold text-[#17231d]">
          <MapPin size={13} className="text-[#2f6b4f]" />
          <span>Drop-off & Valet Note:</span>
        </div>
        <p className="text-[11px] leading-relaxed pl-5 text-[#404c44]">
          {business.rideNotes || 'Designated drop-off point and valet parking available at main entrance.'}
        </p>
      </div>

      {/* Ride Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
        {/* Uber */}
        <a
          href={uberUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-center gap-2 rounded-2xl bg-[#000000] px-4 py-3 text-xs font-extrabold text-white shadow-xs hover:bg-[#222222] transition-all hover:scale-[1.02]"
        >
          <span className="font-sans tracking-wide">UBER</span>
          <span className="text-[11px] font-normal text-white/80">Book Ride</span>
          <ExternalLink size={12} className="opacity-70 group-hover:opacity-100 transition-opacity" />
        </a>

        {/* Ola */}
        <a
          href={olaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-center gap-2 rounded-2xl bg-[#c5e840] px-4 py-3 text-xs font-extrabold text-[#17231d] shadow-xs hover:bg-[#b8dd30] transition-all hover:scale-[1.02]"
        >
          <span>OLA</span>
          <span className="text-[11px] font-semibold text-[#17231d]/80">Book Cab</span>
          <ExternalLink size={12} className="opacity-70 group-hover:opacity-100 transition-opacity" />
        </a>

        {/* Google Maps Directions */}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-center gap-2 rounded-2xl border border-[#e4e8e1] bg-white px-4 py-3 text-xs font-bold text-[#17231d] hover:bg-gray-50 hover:border-[#2f6b4f]/40 transition-all hover:scale-[1.02]"
        >
          <Navigation size={13} className="text-[#2f6b4f]" />
          <span>Directions</span>
          <ExternalLink size={12} className="opacity-60 group-hover:opacity-100 text-[#6b756e]" />
        </a>
      </div>

      <div className="flex items-center justify-between text-[10px] text-[#6b756e] pt-1">
        <span className="flex items-center gap-1">
          <ShieldCheck size={12} className="text-[#2f6b4f]" />
          Auto-fills pickup at your current GPS and sets drop-off destination
        </span>
      </div>
    </div>
  );
};

export default RideAssistantCard;
