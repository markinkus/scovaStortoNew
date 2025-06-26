import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Business } from '../types';

// Fix Leaflet's default icon path issue with bundlers like Webpack/Parcel or ES modules
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface BusinessMapProps {
  businesses: Business[];
  selectedBusiness: Business | null;
  onSelectBusiness: (businessId: string) => void;
  onOpenDetails: (businessId: string) => void;
}

// Component to handle map effects like panning to selected business
const MapEffect: React.FC<{ selectedBusiness: Business | null }> = ({ selectedBusiness }) => {
  const map = useMap();

  useEffect(() => {
    if (
      selectedBusiness &&
      typeof selectedBusiness.latitude === 'number' &&
      typeof selectedBusiness.longitude === 'number'
    ) {
      map.flyTo([selectedBusiness.latitude, selectedBusiness.longitude], 14, {
        animate: true,
        duration: 0.8,
      });
    }
  }, [selectedBusiness, map]);

  return null;
};

export const BusinessMap: React.FC<BusinessMapProps> = ({
  businesses,
  selectedBusiness,
  onSelectBusiness,
  onOpenDetails,
}) => {
  const initialCenter: L.LatLngTuple = [41.8719, 12.5674]; // Center of Italy
  const initialZoom = 5.5;

  return (
    <MapContainer
      center={initialCenter}
      zoom={initialZoom}
      style={{ height: '100%', width: '100%' }}
      className="rounded-lg shadow-lg border border-slate-700 bg-slate-800"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {businesses.map((business) =>
        typeof business.latitude === 'number' &&
        typeof business.longitude === 'number' ? (
          <Marker
            key={business.id}
            position={[business.latitude, business.longitude]}
            eventHandlers={{
              click: () => {
                // Solo seleziona, non apre dettagli
                onSelectBusiness(business.id);
              },
            }}
            opacity={
              !selectedBusiness || selectedBusiness.id === business.id ? 1 : 0.6
            }
          >
            <Popup autoPan={false}>
              <div className="text-sm">
                <strong className="text-cyan-400 block mb-0.5">{business.name}</strong>
                <span className="block text-xs text-slate-400">{business.type}</span>
                <button
                  className="text-cyan-500 hover:text-cyan-300 transition-colors text-xs mt-1.5 focus:outline-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Solo apre dettagli
                    onOpenDetails(business.id);
                  }}
                >
                  Visualizza Dettagli
                </button>
              </div>
            </Popup>
          </Marker>
        ) : null
      )}

      <MapEffect selectedBusiness={selectedBusiness} />
    </MapContainer>
  );
};
