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
  p_iva: string; // New field for VAT number
  photo: File | null; // New field for store photo
}

const AddBusinessModal: React.FC<AddBusinessModalProps> = ({ open, onClose, onBusinessAdded }) => {
  const [formData, setFormData] = useState<BusinessFormData>({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    p_iva: '', // Initialize p_iva
    photo: null, // Initialize photo
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // For geocoding success
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [geocodingInProgress, setGeocodingInProgress] = useState<boolean>(false); // For geocoding loading state
  const fileInputRef = React.useRef<HTMLInputElement>(null); // Ref for file input
  const { token } = useAuth(); // For checking auth, though API call will fail if not authed

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
    // Clear messages when user types in relevant fields
    if (event.target.name === 'address' || event.target.name === 'latitude' || event.target.name === 'longitude') {
      setError(null);
      setSuccessMessage(null);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFormData({
        ...formData,
        photo: event.target.files[0],
      });
    } else {
      setFormData({
        ...formData,
        photo: null,
      });
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    // P.IVA can be optional, so no specific check unless it needs validation (e.g. format)
    if (!formData.name || !formData.address || !formData.latitude || !formData.longitude) {
      setError('Name, Address, Latitude, and Longitude are required.');
      return;
    }

    // Latitude and Longitude validation (still good to check if they are provided)
    // The backend will handle parseFloat for these string values.
    if (!formData.latitude || !formData.longitude) {
      setError('Latitude and Longitude are required.');
      return;
    }
    // Basic check if they look like numbers can still be useful, but not strictly required
    // if the backend does robust parsing. For now, we'll rely on backend validation for format.

    if (!token) {
      setError('You must be logged in to add a business.');
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('address', formData.address);
      data.append('latitude', formData.latitude); // Send as string
      data.append('longitude', formData.longitude); // Send as string

      if (formData.p_iva) {
        data.append('p_iva', formData.p_iva);
      }

      if (formData.photo) {
        data.append('shopPhoto', formData.photo);
        console.log('Appending photo to FormData:', formData.photo.name);
      }

      // console.log("Submitting FormData..."); // Optional: for debugging

      const newBusiness = await post<any>('/businesses', data); // Send FormData
      onBusinessAdded(newBusiness); // Pass the new business data to the parent
      // Reset form specific fields within handleSubmit before calling generic handleClose
      setFormData({ name: '', address: '', latitude: '', longitude: '', p_iva: '', photo: null });
      setError(null);
      onClose(); // Call original onClose from props
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
    // Reset form data to initial state
    setFormData({
      name: '',
      address: '',
      latitude: '',
      longitude: '',
      p_iva: '',
      photo: null,
    });
    setError(null);
    setSuccessMessage(null); // Also clear success message on close
    onClose(); // Call original onClose from props
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleGeocode = async () => {
    if (!formData.address.trim()) {
      setError("Per favore, inserisci un indirizzo.");
      setSuccessMessage(null);
      return;
    }
    setGeocodingInProgress(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.address)}`);
      if (!response.ok) {
        throw new Error('Errore nella risposta della rete Nominatim. Riprova più tardi.');
      }
      const data = await response.json();
      if (data && data.length > 0) {
        const firstResult = data[0];
        setFormData(prev => ({
          ...prev,
          latitude: firstResult.lat,
          longitude: firstResult.lon,
        }));
        setSuccessMessage("Coordinate trovate e compilate!");
      } else {
        setError("Indirizzo non trovato. Prova a essere più specifico.");
      }
    } catch (err: any) {
      setError(err.message || "Errore sconosciuto durante la geocodifica.");
    } finally {
      setGeocodingInProgress(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New Business</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{mb: 2}}>
          Please fill in the details for the new business. You can click on the map to pre-fill coordinates (Feature TBD).
        </DialogContentText>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
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
            disabled={submitting || geocodingInProgress}
            sx={{ flexGrow: 1, mr: geocodingInProgress ? 1 : 0 }}
          />
            <Button
              onClick={handleGeocode}
              variant="outlined"
              disabled={geocodingInProgress || !formData.address.trim()}
              sx={{ ml:1, mt:1, mb:0.5, height: '56px', whiteSpace: 'nowrap' }}
            >
              {geocodingInProgress ? <CircularProgress size={24} /> : "Trova Coordinate"}
            </Button>
          </Box>
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
            disabled={submitting || geocodingInProgress}
            disabled={submitting || geocodingInProgress}
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
          <TextField
            margin="dense"
            id="p_iva"
            name="p_iva"
            label="P.IVA (VAT Number)"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.p_iva}
            onChange={handleChange}
            disabled={submitting || geocodingInProgress}
          />
          <Box sx={{ mt: 2, mb: 1 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="photo-upload"
              name="photo"
              type="file"
              onChange={handleFileChange}
              ref={fileInputRef}
              disabled={submitting || geocodingInProgress}
            />
            <label htmlFor="photo-upload">
              <Button variant="outlined" component="span" onClick={handleUploadButtonClick} disabled={submitting || geocodingInProgress}>
                Carica Foto Negozio
              </Button>
            </label>
            {formData.photo && (
              <Typography variant="body2" sx={{ display: 'inline-block', ml: 2 }}>
                {formData.photo.name}
              </Typography>
            )}
          </Box>
      </DialogContent>
      <DialogActions sx={{p: '16px 24px', pt:0}}>
        <Button onClick={handleClose} color="secondary" disabled={submitting || geocodingInProgress}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary" disabled={submitting || geocodingInProgress}>
          {submitting ? <CircularProgress size={24} /> : 'Add Business'}
        </Button>
      </DialogActions>
    </Dialog >
  );
};

export default AddBusinessModal;
