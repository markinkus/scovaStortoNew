// src/components/BusinessMap.tsx
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Typography, CircularProgress, Alert, Box, Button, Stack } from '@mui/material';
import { get } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import AddBusinessModal from './AddBusinessModal';
import AnomalyFormModal from './AnomalyFormModal';
import { InfoCircleIcon } from '../../../components/icons/InfoCircleIcon';
import { Business } from '../App';  // l'interfaccia Business condivisa

// Generatore di icona (usa sempre il divIcon predefinito + la custom-div-icon)
const getIconByType = (type?: string) => {
  const base = new L.Icon.Default();
  return L.divIcon({
    html: `<img src="${base.options.iconUrl}" />`,
    iconSize:   base.options.iconSize,
    iconAnchor: base.options.iconAnchor,
    popupAnchor: base.options.popupAnchor,
    className:  'leaflet-div-icon custom-div-icon'
  });
};

// Effetto per flyTo e apertura popup sul marker selezionato
const FlyToSelected: React.FC<{selected: Business | null; markerRefs: React.MutableRefObject<Record<number, L.Marker | null>>}> = ({ selected, markerRefs }) => {
  const map = useMap();
  useEffect(() => {
    if (!selected) return;
    const { latitude, longitude, id } = selected;
    map.flyTo([latitude!, longitude!], 17, { duration: 1.2 });
    const m = markerRefs.current[id];
    if (m) setTimeout(() => m.openPopup(), 300);
  }, [selected, map]);
  return null;
};

interface BusinessMapProps {
  onBusinessesLoaded: (businesses: Business[]) => void;
  selectedBusiness:   Business | null;
  onSelectBusiness:   (business: Business) => void;
  onOpenDetails:      (business: Business) => void;
}

const BusinessMap: React.FC<BusinessMapProps> = ({
  onBusinessesLoaded,
  selectedBusiness,
  onSelectBusiness,
  onOpenDetails
}) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAnomOpen, setIsAnomOpen] = useState(false);
  const [anomBiz, setAnomBiz] = useState<Business | null>(null);

  const markerRefs = useRef<Record<number, L.Marker | null>>({});
  const { token } = useAuth();

  const fetchBusinesses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await get<Business[]>('/businesses');
      setBusinesses(data);
      onBusinessesLoaded(data);
    } catch (e: any) {
      console.error(e);
      setError('Recupero attività fallito.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBusinesses(); }, []);

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: '100%' }}><CircularProgress/></Box>;
  }
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
      {token && (
        <>
          <Button
            variant="contained"
            onClick={() => setIsAddOpen(true)}
            sx={{ position: 'absolute', top: '80%', right: 16, zIndex: theme => theme.zIndex.modal - 1 }}
          >
            Aggiungi Attività
          </Button>
          <AddBusinessModal
            open={isAddOpen}
            onClose={() => setIsAddOpen(false)}
            onBusinessAdded={() => { fetchBusinesses(); setIsAddOpen(false); }}
          />
        </>
      )}

      <MapContainer center={[51.505, -0.09]} zoom={businesses.length ? 6 : 2} style={{ height: '100%', width: '100%' }}>
        <FlyToSelected selected={selectedBusiness} markerRefs={markerRefs} />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />

        {businesses.map(b => (
          <Marker
            key={b.id}
            position={[b.latitude!, b.longitude!]}
            icon={getIconByType(b.type)}
            ref={ref => { markerRefs.current[b.id] = ref; }}
            eventHandlers={{ click: () => onSelectBusiness(b) }}
          >
            <Popup>
              <Stack spacing={1}>
                <Typography variant="h6">{b.name}</Typography>
                <Typography variant="body2">{b.address}</Typography>
                {b.addedByUser && <Typography variant="caption">Added by: {b.addedByUser.username}</Typography>}
                <Typography variant="caption">Anomalies: {b.anomalyCount || 0}</Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  {token && (
                    <Button size="small" variant="outlined" onClick={e => { e.stopPropagation(); setAnomBiz(b); setIsAnomOpen(true); }}>
                      Nuova Anomalia
                    </Button>
                  )}
                  <Button size="small" variant="outlined" onClick={e => { e.stopPropagation(); onOpenDetails(b); }}>
                    <InfoCircleIcon /> Dettagli
                  </Button>
                </Box>
              </Stack>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {anomBiz && (
        <AnomalyFormModal
          open={isAnomOpen}
          onClose={() => setIsAnomOpen(false)}
          businessId={anomBiz.id}
          onAnomalyReported={() => { fetchBusinesses(); setIsAnomOpen(false); }}
        />
      )}
    </Box>
  );
};

export default BusinessMap;
