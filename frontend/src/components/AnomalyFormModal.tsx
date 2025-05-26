import React, { useState } from 'react';
import { post } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  CircularProgress,
  Box
} from '@mui/material';

interface AnomalyFormModalProps {
  open: boolean;
  onClose: () => void;
  businessId: number | null; // The ID of the business this anomaly is for
  onAnomalyReported: (newAnomaly: any) => void;
}

interface AnomalyFormData {
  description: string;
  photo_url: string; // Optional
}

const AnomalyFormModal: React.FC<AnomalyFormModalProps> = ({ open, onClose, businessId, onAnomalyReported }) => {
  const [formData, setFormData] = useState<AnomalyFormData>({
    description: '',
    photo_url: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const { token } = useAuth();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!businessId) {
      setError('No business selected to report an anomaly for.');
      return;
    }
    if (!formData.description) {
      setError('Description is required.');
      return;
    }
    if (!token) {
        setError('You must be logged in to report an anomaly.');
        return;
    }

    setSubmitting(true);
    try {
      const newAnomaly = await post<any>('/anomalies', {
        description: formData.description,
        photo_url: formData.photo_url || null, // Send null if empty
        businessId: businessId,
      });
      onAnomalyReported(newAnomaly);
      handleClose(); // Close modal on success
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to report anomaly. Please try again.');
      }
      console.error('Report anomaly error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    setFormData({ description: '', photo_url: '' });
    setError(null);
    onClose();
  };

  if (!businessId && open) {
    // This case should ideally be prevented by not allowing the modal to open
    // without a businessId, but as a fallback:
    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Error</DialogTitle>
            <DialogContent>
                <Alert severity="error">No business ID provided. Cannot report anomaly.</Alert>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Report Anomaly</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{mb: 2}}>
          Describe the anomaly you observed for this business.
        </DialogContentText>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            autoFocus
            margin="dense"
            id="description"
            name="description"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={formData.description}
            onChange={handleChange}
            required
            disabled={submitting}
          />
          <TextField
            margin="dense"
            id="photo_url"
            name="photo_url"
            label="Photo URL (Optional)"
            type="url"
            fullWidth
            variant="outlined"
            value={formData.photo_url}
            onChange={handleChange}
            disabled={submitting}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{p: '16px 24px'}}>
        <Button onClick={handleClose} color="secondary" disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary" disabled={submitting}>
          {submitting ? <CircularProgress size={24} /> : 'Report Anomaly'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AnomalyFormModal;
