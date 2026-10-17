import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Heart, ArrowRight } from 'lucide-react';

const categoryImages = {
  salon: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=85',
  gym: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1000&q=85',
  spa: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=85',
  parlour: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=1000&q=85',
  wellness: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1000&q=85',
  other: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=1000&q=85',
};

const BusinessCard = ({ business, index = 0 }) => {
  const [saved, setSaved] = useState(false);
  const imageUrl = business.images?.[0] || categoryImages[business.category] || categoryImages.salon;

  return (
    <article className="group overflow-hidden rounded-[1.5rem] border border-[#e4e8e1] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-soft flex flex-col justify-between">
      <Link to={`/business/${business._id}`} className="relative block h-52 w-full overflow-hidden text-left">
        <img
          src={imageUrl}
          alt={business.name}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          loading={index > 2 ? 'lazy' : 'eager'}
        />

        {/* Floating Category Pill & Uber Ride Badge */}
        <div className="absolute left-4 top-4 flex items-center gap-1.5">
          <div className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-[#17231d] shadow-xs uppercase tracking-wide">
            {business.category}
          </div>
          {business.offersRideAssistance !== false && (
            <div className="rounded-full bg-black/80 text-white backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold shadow-xs flex items-center gap-1">
              <span>🚗</span> Uber
            </div>
          )}
        </div>

        {/* Floating Rating Pill */}
        <div className="absolute right-4 top-4 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-[#17231d] shadow-xs flex items-center">
          <Star size={12} className="mr-1 inline fill-amber-400 text-amber-400" />
          {business.rating ? business.rating.toFixed(1) : '4.8'}
        </div>

        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Location & Distance */}
        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-xs font-semibold text-white drop-shadow-xs">
          <MapPin size={13} />
          <span>{business.address?.city || 'Mumbai'}</span>
          {business.distanceKm !== undefined && (
            <span className="text-white/80 font-normal">· {business.distanceKm} km away</span>
          )}
        </div>

        {/* Heart Save Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setSaved(!saved);
          }}
          className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-white text-[#17231d] shadow-sm hover:scale-105 transition-transform"
          aria-label={saved ? 'Unsave business' : 'Save business'}
        >
          <Heart size={16} className={saved ? 'fill-rose-500 text-rose-500' : 'text-[#6b756e]'} />
        </button>
      </Link>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-extrabold tracking-tight text-[#17231d] group-hover:text-[#2f6b4f] transition-colors">
            {business.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#6b756e]">
            {business.description || 'Verified local service provider offering trusted treatments and care.'}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-[#e4e8e1] pt-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6b756e] block">
              Services from
            </span>
            <p className="mt-0.5 text-lg font-extrabold text-[#17231d]">
              ₹{business.startingPrice || 299}
            </p>
          </div>

          <Link to={`/business/${business._id}`} className="btn-outline text-xs py-2 px-3.5">
            View place <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default BusinessCard;
