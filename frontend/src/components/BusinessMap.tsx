import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import { get } from '../services/api';
import { Typography, CircularProgress, Alert, Box, Button, Stack } from '@mui/material';
import AddBusinessModal from './AddBusinessModal';
import AnomalyFormModal from './AnomalyFormModal'; // Import AnomalyFormModal
import { useAuth } from '../contexts/AuthContext';

interface Business {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  addedByUser?: { id: number; username: string }; // Optional, from include
  anomalyCount?: number; // Optional, from include
}

const BusinessMap: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddBusinessModalOpen, setIsAddBusinessModalOpen] = useState(false);
  const [isAnomalyModalOpen, setIsAnomalyModalOpen] = useState(false);
  const [selectedBusinessIdForAnomaly, setSelectedBusinessIdForAnomaly] = useState<number | null>(null);
  const { token } = useAuth();

  const defaultPosition: LatLngExpression = [51.505, -0.09];

  const fetchBusinesses = async () => { // Make fetchBusinesses reusable
    try {
      setLoading(true);
      setError(null);
      const data = await get<Business[]>('/businesses'); // API endpoint
      setBusinesses(data);
    } catch (err: any) {
      setError('Failed to fetch businesses. Please try again later.');
      console.error('Fetch businesses error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const handleBusinessAdded = (newBusiness: Business) => {
    fetchBusinesses();
    setIsAddBusinessModalOpen(false);
  };

  const handleOpenAnomalyModal = (businessId: number) => {
    setSelectedBusinessIdForAnomaly(businessId);
    setIsAnomalyModalOpen(true);
  };

  const handleAnomalyReported = (newAnomaly: any) => {
    fetchBusinesses(); // Refetch businesses to update anomaly counts
    setIsAnomalyModalOpen(false);
    // Could also show a global success message/toast here
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ height: 'calc(100vh - 120px)', width: '100%', position: 'relative' }}> {/* Adjust height as needed */}
      {token && (
        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsAddBusinessModalOpen(true)}
          sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1000 }}
        >
          Add New Business
        </Button>
      )}
      <MapContainer center={defaultPosition} zoom={businesses.length > 0 ? 6 : 2} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {businesses.map((business) => (
          <Marker key={business.id} position={[business.latitude, business.longitude]}>
            <Popup>
              <Stack spacing={1}>
                <Typography variant="h6">{business.name}</Typography>
                <Typography variant="body2">{business.address}</Typography>
                {business.addedByUser && (
                  <Typography variant="caption">Added by: {business.addedByUser.username}</Typography>
                )}
                <Typography variant="caption">Anomalies: {business.anomalyCount || 0}</Typography>
                {token && (
                  <Button 
                    size="small" 
                    variant="outlined" 
                    onClick={() => handleOpenAnomalyModal(business.id)}
                    sx={{mt: 1}}
                  >
                    Report Anomaly
                  </Button>
                )}
                {/* TODO: Link to view business details / anomalies list */}
              </Stack>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <AddBusinessModal
        open={isAddBusinessModalOpen}
        onClose={() => setIsAddBusinessModalOpen(false)}
        onBusinessAdded={handleBusinessAdded}
      />
      <AnomalyFormModal
        open={isAnomalyModalOpen}
        onClose={() => setIsAnomalyModalOpen(false)}
        businessId={selectedBusinessIdForAnomaly}
        onAnomalyReported={handleAnomalyReported}
      />
    </Box>
  );
};

export default BusinessMap;
