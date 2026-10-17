import React from 'react';
import { Clock, Tag, Sparkles } from 'lucide-react';

const ServiceCard = ({ service, onBook }) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-1.5 flex-1">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700">
            <Tag className="w-3 h-3 mr-1 text-gray-400" />
            {service.category || 'General'}
          </span>
          <span className="inline-flex items-center text-xs text-gray-500 font-medium">
            <Clock className="w-3.5 h-3.5 mr-1 text-gray-400" />
            {service.duration || 30} mins
          </span>
        </div>

        <h4 className="text-base font-bold text-gray-900">{service.name}</h4>
        <p className="text-xs text-gray-500 leading-relaxed max-w-xl">
          {service.description || 'Full service including consultation and premium products.'}
        </p>
      </div>

      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
        <div className="text-left sm:text-right mb-0 sm:mb-2">
          <span className="text-[10px] uppercase font-semibold text-gray-400 block">Price</span>
          <span className="text-lg font-bold text-gray-900">₹{service.price}</span>
        </div>

        <button
          onClick={() => onBook(service)}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs hover:shadow-indigo-100 hover:shadow-md transition-all active:scale-95"
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

export default ServiceCard;
