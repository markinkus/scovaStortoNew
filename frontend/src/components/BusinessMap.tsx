import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Typography, CircularProgress, Alert, Box, Button, Stack } from '@mui/material';
import { get } from '../services/api';
import AddBusinessModal from './AddBusinessModal';
import AnomalyFormModal from './AnomalyFormModal';
import { useAuth } from '../contexts/AuthContext';
import { Business } from '../App';

interface BusinessMapProps {
  onBusinessesLoaded: (businesses: Business[]) => void;
  selectedBusiness: Business | null;
  onSelectBusiness: (business: Business) => void;
}

const getIconByType = (type?: string) => {
  const base = new L.Icon.Default();
  return L.divIcon({
    html: `<img src="${base.options.iconUrl}" />`,
    iconSize:   base.options.iconSize,
    iconAnchor: base.options.iconAnchor,
    popupAnchor: base.options.popupAnchor,
    className: 'leaflet-div-icon custom-div-icon'
  });
};

const BusinessMap: React.FC<BusinessMapProps> = ({
  onBusinessesLoaded,
  selectedBusiness,
  onSelectBusiness
}) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAnomOpen, setIsAnomOpen] = useState(false);
  const [anomBizId, setAnomBizId] = useState<number | null>(null);

  const mapRef = useRef<L.Map | null>(null);
  const markerRefs = useRef<{ [key: number]: L.Marker | null }>({});
  const { token } = useAuth();

  const defaultPosition: [number, number] = [51.505, -0.09];

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await get<Business[]>('/businesses');
      setBusinesses(data);
      onBusinessesLoaded(data);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch businesses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBusinesses(); }, []);

  // Zoom + popup on selection change
  useEffect(() => {
    if (!selectedBusiness || !mapRef.current) return;
    const { latitude, longitude, id } = selectedBusiness;
    mapRef.current.flyTo([latitude, longitude], 17, { duration: 1.2 });
    const m = markerRefs.current[id];
    if (m) setTimeout(() => m.openPopup(), 300);
  }, [selectedBusiness]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
      {/* Bottone + Modal */}
      {token && (
        <>
          <Button
            variant="contained"
            onClick={() => setIsAddOpen(true)}
            sx={{ position: 'absolute', top: 16, right: 16, zIndex: theme => theme.zIndex.modal + 1 }}
          >
            Add New Business
          </Button>
          <AddBusinessModal
            open={isAddOpen}
            onClose={() => setIsAddOpen(false)}
            onBusinessAdded={() => { fetchBusinesses(); setIsAddOpen(false); }}
          />
        </>
      )}

      <MapContainer
        center={defaultPosition}
        zoom={businesses.length ? 6 : 2}
        style={{ height: '100%', width: '100%' }}
        whenCreated={map => (mapRef.current = map)}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {businesses.map(b => (
          <Marker
            key={b.id}
            position={[b.latitude, b.longitude]}
            icon={getIconByType(b.type)}
            ref={el => (markerRefs.current[b.id] = el)}
            eventHandlers={{ click: () => onSelectBusiness(b) }}
          >
            <Popup>
              <Stack spacing={1}>
                <Typography variant="h6">{b.name}</Typography>
                <Typography variant="body2">{b.address}</Typography>
                {b.addedByUser && (
                  <Typography variant="caption">Added by: {b.addedByUser.username}</Typography>
                )}
                <Typography variant="caption">Anomalies: {b.anomalyCount || 0}</Typography>
                {token && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => { setAnomBizId(b.id); setIsAnomOpen(true); }}
                    sx={{ mt: 1 }}
                  >
                    Report Anomaly
                  </Button>
                )}
              </Stack>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <AnomalyFormModal
        open={isAnomOpen}
        onClose={() => setIsAnomOpen(false)}
        businessId={anomBizId}
        onAnomalyReported={() => { fetchBusinesses(); setIsAnomOpen(false); }}
      />
    </Box>
  );
};

export default BusinessMap;
