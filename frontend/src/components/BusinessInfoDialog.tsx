import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, CircularProgress } from '@mui/material';
import { get } from '../services/api';
import AnomalyCard from './AnomalyCard';

interface BusinessInfoDialogProps {
  businessId: number | null;
  open: boolean;
  onClose: () => void;
}

interface Anomaly {
  id: number;
  description: string;
  receipt_photo_base64?: string | null;
  anomaly_photo_base64s?: string[] | null;
  ocr_business_name?: string | null;
  ocr_p_iva?: string | null;
  ocr_address?: string | null;
  ocr_date?: string | null;
  ocr_total_amount?: string | null;
  reportedByUser?: { id: number; username: string } | null;
  createdAt: string;
}

interface BusinessDetails {
  id: number;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  p_iva?: string | null;
  photo_base64?: string | null;
  anomalies: Anomaly[];
}

const PLACEHOLDER =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGR5PSIuM2VtIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2IiBmb250LXNpemU9IjIwIj5ObyBQaG90bzwvdGV4dD48L3N2Zz4=';

const BusinessInfoDialog: React.FC<BusinessInfoDialogProps> = ({ businessId, open, onClose }) => {
  const [details, setDetails] = useState<BusinessDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAnomalies, setShowAnomalies] = useState(false);

  useEffect(() => {
    if (!open || !businessId) return;
    setLoading(true);
    setError(null);
    get<BusinessDetails>(`/businesses/${businessId}`)
      .then(setDetails)
      .catch((e: any) => {
        console.error(e);
        setError('Errore nel caricamento dettagli.');
      })
      .finally(() => setLoading(false));
  }, [businessId, open]);

  const handleClose = () => {
    setShowAnomalies(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Dettagli Attività</DialogTitle>
      <DialogContent dividers>
        {loading && <CircularProgress />}
        {error && <Typography color="error">{error}</Typography>}
        {details && (
          <Box>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <img
                src={details.photo_base64 || PLACEHOLDER}
                alt={details.name}
                style={{ maxHeight: 200, objectFit: 'contain' }}
              />
            </Box>
            <Typography variant="h6">{details.name}</Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {details.address}
            </Typography>
            {details.p_iva && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                P.IVA: {details.p_iva}
              </Typography>
            )}
            {typeof details.latitude === 'number' && typeof details.longitude === 'number' && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                Coord: {details.latitude}, {details.longitude}
              </Typography>
            )}
            {details.anomalies.length > 0 && !showAnomalies && (
              <Box textAlign="center" sx={{ mt: 2 }}>
                <Button variant="outlined" onClick={() => setShowAnomalies(true)}>
                  Vedi Anomalie ({details.anomalies.length})
                </Button>
              </Box>
            )}
            {showAnomalies && (
              <Box sx={{ mt: 2 }}>
                {details.anomalies.map(a => (
                  <AnomalyCard key={a.id} anomaly={a} />
                ))}
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Chiudi</Button>
      </DialogActions>
    </Dialog>
  );
};

export default BusinessInfoDialog;