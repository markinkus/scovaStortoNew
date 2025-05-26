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

interface AddBusinessModalProps {
  open: boolean;
  onClose: () => void;
  onBusinessAdded: (newBusiness: any) => void; // Callback after successful addition
}

interface BusinessFormData {
  name: string;
  address: string;
  latitude: string; // Keep as string for input, convert on submit
  longitude: string; // Keep as string for input, convert on submit
}

const AddBusinessModal: React.FC<AddBusinessModalProps> = ({ open, onClose, onBusinessAdded }) => {
  const [formData, setFormData] = useState<BusinessFormData>({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const { token } = useAuth(); // For checking auth, though API call will fail if not authed

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!formData.name || !formData.address || !formData.latitude || !formData.longitude) {
      setError('All fields are required.');
      return;
    }

    const lat = parseFloat(formData.latitude);
    const lon = parseFloat(formData.longitude);

    if (isNaN(lat) || isNaN(lon)) {
      setError('Latitude and Longitude must be valid numbers.');
      return;
    }

    if (!token) {
        setError('You must be logged in to add a business.');
        return;
    }

    setSubmitting(true);
    try {
      const newBusiness = await post<any>('/businesses', {
        name: formData.name,
        address: formData.address,
        latitude: lat,
        longitude: lon,
      });
      onBusinessAdded(newBusiness); // Pass the new business data to the parent
      handleClose(); // Close modal on success
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to add business. Please try again.');
      }
      console.error('Add business error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return; // Prevent closing while submitting
    setFormData({ name: '', address: '', latitude: '', longitude: '' }); // Reset form
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New Business</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{mb: 2}}>
          Please fill in the details for the new business. You can click on the map to pre-fill coordinates (Feature TBD).
        </DialogContentText>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            name="name"
            label="Business Name"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={submitting}
          />
          <TextField
            margin="dense"
            id="address"
            name="address"
            label="Address"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.address}
            onChange={handleChange}
            required
            disabled={submitting}
          />
          <TextField
            margin="dense"
            id="latitude"
            name="latitude"
            label="Latitude"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.latitude}
            onChange={handleChange}
            required
            disabled={submitting}
          />
          <TextField
            margin="dense"
            id="longitude"
            name="longitude"
            label="Longitude"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.longitude}
            onChange={handleChange}
            required
            disabled={submitting}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{p: '16px 24px'}}>
        <Button onClick={handleClose} color="secondary" disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary" disabled={submitting}>
          {submitting ? <CircularProgress size={24} /> : 'Add Business'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddBusinessModal;
