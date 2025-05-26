import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { extractTextWithGemini } from '../../services/geminiService';
import { ParsedReceiptInfo, Business } from '../../../types'; // Adjusted path for Business
import { get, post } from '../../../services/api'; // Import get and post services
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
  businessId: number | null;
  onAnomalyReported: (newAnomaly: any) => void;
}

// Local interface for business details to align with expected backend response
interface BusinessDetails extends Omit<Business, 'id' | 'piva'> {
  id: number; // Assuming backend uses number for ID
  p_iva?: string; // Assuming backend sends p_iva
  // Other fields from types.ts Business if needed, like name, address
}


const AnomalyFormModal: React.FC<AnomalyFormModalProps> = ({ open, onClose, businessId, onAnomalyReported }) => {
  const [description, setDescription] = useState<string>('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [anomalyPhotos, setAnomalyPhotos] = useState<File[]>([]);

  // OCR related states
  const [ocrData, setOcrData] = useState<ParsedReceiptInfo | null>(null);
  const [ocrInProgress, setOcrInProgress] = useState<boolean>(false);
  const [ocrError, setOcrError] = useState<string | null>(null);

  // Form fields for OCR data (editable by user)
  const [formOcrNomeEsercizio, setFormOcrNomeEsercizio] = useState('');
  const [formOcrPiva, setFormOcrPiva] = useState('');
  const [formOcrIndirizzo, setFormOcrIndirizzo] = useState('');
  const [formOcrData, setFormOcrData] = useState('');
  const [formOcrImporto, setFormOcrImporto] = useState('');

  // Business details states
  const [selectedBusinessDetails, setSelectedBusinessDetails] = useState<BusinessDetails | null>(null);
  const [businessFetchError, setBusinessFetchError] = useState<string | null>(null);

  // Validation states
  const [validationStatus, setValidationStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null); // General form error for other issues
  const [submitting, setSubmitting] = useState<boolean>(false);
  const { token } = useAuth();

  const receiptFileInputRef = React.useRef<HTMLInputElement>(null);
  const anomalyPhotosInputRef = React.useRef<HTMLInputElement>(null);

  const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(event.target.value);
  };

  // Helper function to convert file to base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (errorView) => reject(errorView);
    });
  };

  const handleReceiptFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setReceiptFile(file);
    // Reset OCR fields when file changes or is removed
    setOcrData(null);
    setOcrError(null);
    setFormOcrNomeEsercizio('');
    setFormOcrPiva('');
    setFormOcrIndirizzo('');
    setFormOcrData('');
    setFormOcrImporto('');
    // Reset validation status on file change
    setValidationStatus('idle');
    setValidationMessage(null);
  };

  // Fetch business details when modal opens or businessId changes
  useEffect(() => {
    if (open && businessId) {
      const fetchBusinessDetails = async () => {
        setBusinessFetchError(null);
        setSelectedBusinessDetails(null); // Clear previous details
        setValidationStatus('idle'); // Reset validation
        setValidationMessage(null);
        try {
          // Assuming backend expects number for ID, as businessId is number.
          // If backend expects string, use businessId.toString()
          const data = await get<BusinessDetails>(`/businesses/${businessId}`);
          setSelectedBusinessDetails(data);
        } catch (err: any) {
          console.error("Error fetching business details:", err);
          setBusinessFetchError(err.message || "Impossibile caricare i dettagli dell'attività.");
        }
      };
      fetchBusinessDetails();
    } else if (!open) {
        // Clear details when modal is closed
        setSelectedBusinessDetails(null);
        setBusinessFetchError(null);
    }
  }, [open, businessId]);


  // useEffect to trigger OCR when receiptFile changes
  useEffect(() => {
    if (receiptFile && open) { // Only process if modal is open
      const processOcr = async () => {
        setOcrInProgress(true);
        setOcrError(null);
        setOcrData(null);
        setFormOcrNomeEsercizio('');
        setFormOcrPiva('');
        setFormOcrIndirizzo('');
        setFormOcrData('');
        setFormOcrImporto('');
        setValidationStatus('idle'); // Reset validation
        setValidationMessage(null);

        try {
          const base64String = await convertFileToBase64(receiptFile);
          const businessNameHint = selectedBusinessDetails?.name; // Use fetched name as hint
          const result = await extractTextWithGemini(base64String, businessNameHint);

          if (typeof result === 'string') {
            setOcrError(result);
          } else if (result) {
            setOcrData(result);
            setError(null); // Clear general form error on OCR success
          } else {
            setOcrError("Nessun dato estratto o formato non valido.");
          }
        } catch (err: any) {
          setOcrError(err.message || "Errore durante la conversione del file o chiamata OCR.");
        } finally {
          setOcrInProgress(false);
        }
      };
      processOcr();
    }
  }, [receiptFile, open, selectedBusinessDetails?.name]); // Added open and selectedBusinessDetails.name

  // useEffects to populate form fields when ocrData changes
  useEffect(() => { setFormOcrNomeEsercizio(ocrData?.nome_esercizio || ''); }, [ocrData?.nome_esercizio]);
  useEffect(() => { setFormOcrPiva(ocrData?.p_iva || ''); }, [ocrData?.p_iva]);
  useEffect(() => { setFormOcrIndirizzo(ocrData?.indirizzo_esercizio || ''); }, [ocrData?.indirizzo_esercizio]);
  useEffect(() => { setFormOcrData(ocrData?.data || ''); }, [ocrData?.data]);
  useEffect(() => { setFormOcrImporto(ocrData?.importo_totale || ''); }, [ocrData?.importo_totale]);

  // Normalization helper
  const normalizeString = (str: string | undefined | null): string => {
    if (!str) return '';
    return str.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s+/g, ' ');
  };

  const handleValidateOcrData = () => {
    if (!selectedBusinessDetails) {
      setValidationMessage("Dettagli attività non caricati. Impossibile validare.");
      setValidationStatus('error');
      return;
    }
    if (!formOcrNomeEsercizio && !formOcrPiva && !formOcrIndirizzo) {
        setValidationMessage("Nessun dato OCR rilevante per la validazione. Compila i campi OCR.");
        setValidationStatus('error');
        return;
    }

    setValidationStatus('pending');
    setValidationMessage("Verifica in corso...");

    const normOcrName = normalizeString(formOcrNomeEsercizio);
    const normOcrPiva = normalizeString(formOcrPiva);
    const normOcrAddress = normalizeString(formOcrIndirizzo);

    const normBusinessName = normalizeString(selectedBusinessDetails.name);
    const normBusinessPiva = normalizeString(selectedBusinessDetails.p_iva); // Using p_iva from BusinessDetails
    const normBusinessAddress = normalizeString(selectedBusinessDetails.address);

    let matches = 0;
    const nameMatch = normOcrName && normBusinessName && normOcrName.includes(normBusinessName) || normBusinessName.includes(normOcrName);
    const pivaMatch = normOcrPiva && normBusinessPiva && normOcrPiva === normBusinessPiva;
    const addressMatch = normOcrAddress && normBusinessAddress && normOcrAddress.includes(normBusinessAddress) || normBusinessAddress.includes(normOcrAddress);

    if (nameMatch) matches++;
    if (pivaMatch) matches++;
    if (addressMatch) matches++;

    let message = "";
    if (pivaMatch) {
      setValidationStatus('success');
      message = "OK: P.IVA corrisponde.";
      if (nameMatch) message += " Nome attività corrisponde."; else message += " Nome attività non corrisponde o non rilevato.";
      if (addressMatch) message += " Indirizzo corrisponde."; else message += " Indirizzo non corrisponde o non rilevato.";
    } else if (normBusinessPiva) { // P.IVA dell'attività è presente ma non corrisponde
        setValidationStatus('error');
        message = "ATTENZIONE: P.IVA non corrisponde. ";
        if (nameMatch) message += "Nome OK. "; else message += "Nome NON OK. ";
        if (addressMatch) message += "Indirizzo OK."; else message += "Indirizzo NON OK.";
        if (matches >=2) {
             message += " Tuttavia, Nome e Indirizzo sembrano corrispondere.";
             // Potrebbe essere un caso limite, per ora lo tengo come errore se PIVA è presente e non matcha
        }
    } else { // P.IVA dell'attività non è presente (selectedBusinessDetails.p_iva è nullo/vuoto)
      if (nameMatch && addressMatch) {
        setValidationStatus('success');
        message = "OK: P.IVA attività non disponibile, ma Nome e Indirizzo corrispondono.";
      } else {
        setValidationStatus('error');
        message = "ATTENZIONE: P.IVA attività non disponibile. ";
        if (nameMatch) message += "Nome OK. "; else message += "Nome NON OK. ";
        if (addressMatch) message += "Indirizzo OK."; else message += "Indirizzo NON OK.";
        message += " È richiesta la corrispondenza di Nome e Indirizzo.";
      }
    }
    setValidationMessage(message);
  };

  // Auto-trigger validation when OCR fields (from form) and business details are ready
   useEffect(() => {
    if (selectedBusinessDetails && (formOcrNomeEsercizio || formOcrPiva || formOcrIndirizzo) && validationStatus === 'idle' && !ocrInProgress ) {
        // Only auto-validate if some OCR data is present in the form fields
        // and validation hasn't been run yet for this set of data
        handleValidateOcrData();
    }
    // Do not run if ocr is in progress to avoid race conditions
    // validationStatus === 'idle' ensures it runs once automatically then waits for manual trigger or data change
  }, [selectedBusinessDetails, formOcrNomeEsercizio, formOcrPiva, formOcrIndirizzo, ocrInProgress, validationStatus]);

  const handleAnomalyPhotosChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setAnomalyPhotos(Array.from(event.target.files)); // Convert FileList to Array
    } else {
      setAnomalyPhotos([]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    // Basic validation for now (can be expanded later)
    if (!businessId) {
      setError('Business ID is missing. Cannot report anomaly.');
      return;
    }
    if (!description.trim()) {
      setError('La descrizione è obbligatoria.');
      return;
    }
    if (!receiptFile) {
      setError('Il file dello scontrino è obbligatorio.');
      return;
    }
    // Anomaly photos can be optional

    console.log('Submitting Anomaly Data (Logging only):');
    console.log('Business ID:', businessId);
    console.log('Description:', description);
    console.log('Receipt File Name:', receiptFile ? receiptFile.name : 'Nessuno');
    console.log('Anomaly Photos Names:', anomalyPhotos.length > 0 ? anomalyPhotos.map(f => f.name) : 'Nessuna');
    console.log('OCR Nome Esercizio (form):', formOcrNomeEsercizio);
    console.log('OCR P.IVA (form):', formOcrPiva);
    console.log('OCR Indirizzo (form):', formOcrIndirizzo);
    console.log('OCR Data (form):', formOcrData);
    console.log('OCR Importo Totale (form):', formOcrImporto);
    console.log('Raw OCR Data:', ocrData);
    console.log('Validation Status:', validationStatus);
    console.log('Validation Message:', validationMessage);

    // TODO: Actual submission logic will be implemented in a future subtask.
    // For now, we can simulate success and close or just log.
    // To simulate closing on "submit":
    // onAnomalyReported({ description, receiptFile, anomalyPhotos }); // Adjust payload as needed for parent
    // handleClose();

    // For now, just log and don't close, to allow multiple "submissions" for testing.
    // If you want it to close and reset:
    // For now, just log and don't close, to allow multiple "submissions" for testing.
    // If you want it to close and reset:
    // onAnomalyReported({ message: "Data logged to console."}); // Dummy data for now
    // handleClose();

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('businessId', String(businessId)); // Ensure businessId is string
      data.append('description', description);

      // Append OCR data
      data.append('ocr_business_name', formOcrNomeEsercizio);
      data.append('ocr_p_iva', formOcrPiva);
      data.append('ocr_address', formOcrIndirizzo);
      data.append('ocr_date', formOcrData);
      data.append('ocr_total_amount', formOcrImporto);

      // Append receipt photo
      if (receiptFile) {
        data.append('receiptPhoto', receiptFile);
      }

      // Append anomaly photos
      if (anomalyPhotos && anomalyPhotos.length > 0) {
        anomalyPhotos.forEach(photo => {
          data.append('anomalyPhotos', photo);
        });
      }
      
      const newAnomaly = await post<any>('/anomalies', data);
      onAnomalyReported(newAnomaly);
      handleClose(); // Close and reset form on success

    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Errore durante l\'invio della segnalazione. Riprova.');
      }
      console.error('Submit anomaly error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    // Now also disable closing if submitting is true
    if (submitting || ocrInProgress) return;
    setDescription('');
    setReceiptFile(null);
    setAnomalyPhotos([]);
    setError(null);
    // Reset OCR states
    setOcrData(null);
    setOcrError(null);
    setOcrInProgress(false); // Should be false anyway, but good to ensure
    setFormOcrNomeEsercizio('');
    setFormOcrPiva('');
    setFormOcrIndirizzo('');
    setFormOcrData('');
    setFormOcrImporto('');
    // Reset business details and validation
    setSelectedBusinessDetails(null);
    setBusinessFetchError(null);
    setValidationStatus('idle');
    setValidationMessage(null);
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
        {businessFetchError && <Alert severity="error" sx={{ mb: 2 }}>Errore Caricamento Attività: {businessFetchError}</Alert>}
        {ocrError && <Alert severity="warning" sx={{ mb: 2 }}>Errore OCR: {ocrError}</Alert>}
        {validationMessage && (
          <Alert 
            severity={validationStatus === 'success' ? 'success' : validationStatus === 'error' ? 'error' : 'info'} 
            sx={{ mb: 2 }}
          >
            {validationMessage}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          {/* Receipt File Input and OCR Progress */}
          <Box sx={{ mt: 2, mb: 1 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="receipt-file-upload"
              type="file"
              onChange={handleReceiptFileChange}
              ref={receiptFileInputRef}
              disabled={submitting || ocrInProgress}
            />
            <label htmlFor="receipt-file-upload">
              <Button 
                variant="outlined" 
                component="span" 
                onClick={() => receiptFileInputRef.current?.click()}
                disabled={submitting || ocrInProgress}
                fullWidth
              >
                Carica Scontrino (per OCR)
              </Button>
            </label>
            {receiptFile && (
              <Typography variant="body2" sx={{ display: 'block', mt: 1 }}>
                Scontrino: {receiptFile.name}
              </Typography>
            )}
            {ocrInProgress && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                <Typography variant="body2">Elaborazione OCR in corso...</Typography>
              </Box>
            )}
          </Box>

          {/* OCR Extracted Fields - Editable */}
          <TextField
            margin="dense"
            id="formOcrNomeEsercizio"
            label="Nome Esercizio (da OCR)"
            type="text"
            fullWidth
            variant="outlined"
            value={formOcrNomeEsercizio}
            onChange={(e) => { setFormOcrNomeEsercizio(e.target.value); setValidationStatus('idle'); }}
            disabled={submitting || ocrInProgress || !selectedBusinessDetails}
          />
          <TextField
            margin="dense"
            id="formOcrPiva"
            label="P.IVA (da OCR)"
            type="text"
            fullWidth
            variant="outlined"
            value={formOcrPiva}
            onChange={(e) => { setFormOcrPiva(e.target.value); setValidationStatus('idle'); }}
            disabled={submitting || ocrInProgress || !selectedBusinessDetails}
          />
          <TextField
            margin="dense"
            id="formOcrIndirizzo"
            label="Indirizzo Esercizio (da OCR)"
            type="text"
            fullWidth
            variant="outlined"
            value={formOcrIndirizzo}
            onChange={(e) => { setFormOcrIndirizzo(e.target.value); setValidationStatus('idle'); }}
            disabled={submitting || ocrInProgress || !selectedBusinessDetails}
          />
          <TextField
            margin="dense"
            id="formOcrData"
            label="Data Scontrino (da OCR)"
            type="text"
            fullWidth
            variant="outlined"
            value={formOcrData}
            onChange={(e) => setFormOcrData(e.target.value)}
            disabled={submitting || ocrInProgress || !selectedBusinessDetails}
          />
          <TextField
            margin="dense"
            id="formOcrImporto"
            label="Importo Totale (da OCR)"
            type="text"
            fullWidth
            variant="outlined"
            value={formOcrImporto}
            onChange={(e) => setFormOcrImporto(e.target.value)}
            disabled={submitting || ocrInProgress || !selectedBusinessDetails}
            sx={{mb:1}} // Reduced margin bottom
          />

          <Button
            onClick={handleValidateOcrData}
            variant="contained"
            color="info"
            fullWidth
            disabled={ocrInProgress || !selectedBusinessDetails || (!formOcrNomeEsercizio && !formOcrPiva && !formOcrIndirizzo)}
            sx={{ mt: 1, mb: 2 }}
          >
            {validationStatus === 'pending' ? <CircularProgress size={24} /> : "Verifica Dati Scontrino"}
          </Button>
          
          <TextField
            // autoFocus // Removed autoFocus
            margin="dense"
            id="description"
            name="description"
            label="Descrizione Anomalia (obbligatoria)"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={description}
            onChange={handleDescriptionChange}
            required
            disabled={submitting || ocrInProgress}
          />

          {/* Anomaly Photos Input */}
          <Box sx={{ mt: 2, mb: 1 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="anomaly-photos-upload"
              type="file"
              multiple // Allow multiple files
              onChange={handleAnomalyPhotosChange}
              ref={anomalyPhotosInputRef}
              disabled={submitting || ocrInProgress}
            />
            <label htmlFor="anomaly-photos-upload">
              <Button 
                variant="outlined" 
                component="span" 
                onClick={() => anomalyPhotosInputRef.current?.click()}
                disabled={submitting || ocrInProgress}
                fullWidth
              >
                Carica Altre Foto Anomalia (Opzionale)
              </Button>
            </label>
            {anomalyPhotos.length > 0 && (
              <Typography variant="body2" sx={{ display: 'block', mt: 1 }}>
                Foto Anomalia ({anomalyPhotos.length}): {anomalyPhotos.map(f => f.name).join(', ')}
              </Typography>
            )}
          </Box>

        </Box>
      </DialogContent>
      <DialogActions sx={{p: '16px 24px'}}>
        <Button onClick={handleClose} color="secondary" disabled={submitting || ocrInProgress}>
          Annulla
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary" 
          disabled={submitting || ocrInProgress || validationStatus !== 'success'}
        >
          {submitting ? <CircularProgress size={24} color="inherit" /> : 'Invia Segnalazione'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AnomalyFormModal;
