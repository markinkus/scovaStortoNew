
import React from 'react';
import { Business } from '../types';
import { MapPinIcon } from './icons/MapPinIcon';

interface BusinessCardProps {
  business: Business;
  onSelectBusiness: (businessId: string) => void;
  isSelected: boolean;
}

const typeColors: Record<Business['type'], string> = {
  Ristorante: 'bg-red-500/20 text-red-300 border-red-500',
  Albergo: 'bg-blue-500/20 text-blue-300 border-blue-500',
  Pizzeria: 'bg-orange-500/20 text-orange-300 border-orange-500',
  Bar: 'bg-purple-500/20 text-purple-300 border-purple-500',
  Negozio: 'bg-green-500/20 text-green-300 border-green-500',
};

export const BusinessCard: React.FC<BusinessCardProps> = ({ business, onSelectBusiness, isSelected }) => {
  const typeStyle = typeColors[business.type] || 'bg-slate-600/20 text-slate-300 border-slate-500';

  return (
    <div
      onClick={() => onSelectBusiness(business.id)}
      className={`p-3 rounded-lg shadow-md cursor-pointer transition-all duration-200 ease-in-out flex space-x-3 items-start
                  border ${isSelected ? 'border-cyan-500 bg-slate-700 scale-105 shadow-cyan-500/30' : 'border-slate-700 bg-slate-800 hover:bg-slate-700/70 hover:border-slate-600'}
                  transform hover:shadow-xl`}
    >
      {business.photoBase64 && (
        <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border border-slate-600">
          <img src={business.photoBase64} alt={`Foto di ${business.name}`} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="flex-grow">
        <div className="flex justify-between items-start mb-0.5">
          <h3 className="text-lg font-semibold text-cyan-400 leading-tight">{business.name}</h3>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${typeStyle} ml-2 flex-shrink-0`}>
            {business.type}
          </span>
        </div>
        <p className="text-sm text-slate-400 mb-1">{business.address}</p>
        <div className="flex items-center text-xs text-slate-500 mb-0.5">
          <MapPinIcon className="w-3 h-3 mr-1 text-cyan-600" />
          <span>{business.location}</span>
        </div>
        {business.piva && (
          <p className="text-xs text-slate-600">P.IVA: {business.piva}</p>
        )}
      </div>
    </div>
  );
};
