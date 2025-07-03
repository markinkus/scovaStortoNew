// src/components/AnomalyFormModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  extractTextWithGemini,
  generateAnomalyDescription
} from '../services/geminiService';
import { ParsedReceiptInfo, Business } from '../../../types';
import { get, post } from '../services/api';
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
  Box,
  Typography,
} from '@mui/material';

interface AnomalyFormModalProps {
  open: boolean;
  onClose: () => void;
  businessId: number | null;
  onAnomalyReported: (newAnomaly: any) => void;
}

interface BusinessDetails extends Omit<Business, 'id' | 'piva'> {
  id: number;
  p_iva?: string;
}

const AnomalyFormModal: React.FC<AnomalyFormModalProps> = ({
  open, onClose, businessId, onAnomalyReported,
}) => {
  // — Form state
  const [description, setDescription] = useState<string>(''); // ← filled by AI
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [anomalyPhotos, setAnomalyPhotos] = useState<File[]>([]);
  const [userNote, setUserNote] = useState<string>('');
  // — OCR state
  const [ocrData, setOcrData] = useState<ParsedReceiptInfo | null>(null);
  const [ocrInProgress, setOcrInProgress] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);

  // — Read-only OCR fields
  const [formOcrNome, setFormOcrNome] = useState('');
  const [formOcrPiva, setFormOcrPiva] = useState('');
  const [formOcrIndirizzo, setFormOcrIndirizzo] = useState('');
  const [formOcrData, setFormOcrData] = useState('');
  const [formOcrImporto, setFormOcrImporto] = useState('');

  // — Business details
  const [selectedBusinessDetails, setSelectedBusinessDetails] = useState<BusinessDetails | null>(null);
  const [businessFetchError, setBusinessFetchError] = useState<string | null>(null);

  // — Validation OCR vs business
  const [validationStatus, setValidationStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // — AI-description state
  const [aiDescInProgress, setAiDescInProgress] = useState(false);
  const [aiDescError, setAiDescError] = useState<string | null>(null);

  // — Submission & errors
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { token } = useAuth();
  const receiptRef = useRef<HTMLInputElement>(null);
  const photosRef = useRef<HTMLInputElement>(null);

  // — Helpers
  const convertFileToBase64 = (file: File): Promise<string> =>
    new Promise((res, rej) => {
      const r = new FileReader();
      r.readAsDataURL(file);
      r.onload = () => res(r.result as string);
      r.onerror = e => rej(e);
    });

  const normalize = (s?: string) =>
    s ? s.toLowerCase().trim().replace(/[\W_]+/g, ' ') : '';

  // — Fetch business details on open
  useEffect(() => {
    if (!open) {
      setSelectedBusinessDetails(null);
      return;
    }
    if (!businessId) return;
    (async () => {
      setBusinessFetchError(null);
      try {
        const data = await get<BusinessDetails>(`/businesses/${businessId}`);
        setSelectedBusinessDetails(data);
      } catch (e: any) {
        setBusinessFetchError(e.message || "Impossibile caricare dettagli attività.");
      }
    })();
  }, [open, businessId]);

  // — OCR when receipt changes
  useEffect(() => {
    if (!receiptFile || !open) return;
    (async () => {
      setOcrInProgress(true);
      setOcrError(null);
      setOcrData(null);
      // reset read-only
      setFormOcrNome(''); setFormOcrPiva(''); setFormOcrIndirizzo('');
      setFormOcrData(''); setFormOcrImporto('');
      setValidationStatus('idle');
      setValidationMessage(null);

      try {
        const b64 = await convertFileToBase64(receiptFile);
        const hint = selectedBusinessDetails?.name;
        const res = await extractTextWithGemini(b64, hint);
        if (typeof res === 'string') {
          setOcrError(res);
        } else {
          setOcrData(res);
          // populate read-only fields
          setFormOcrNome(res!.nome_esercizio || '');
          setFormOcrPiva(res!.p_iva || '');
          setFormOcrIndirizzo(res!.indirizzo_esercizio || '');
          setFormOcrData(res!.data || '');
          setFormOcrImporto(res!.importo_totale || '');
        }
      } catch (e: any) {
        setOcrError(e.message || 'Errore OCR.');
      } finally {
        setOcrInProgress(false);
      }
    })();
  }, [receiptFile, open, selectedBusinessDetails?.name]);

  // — Validate OCR vs business
  const handleValidate = () => {
    if (!selectedBusinessDetails) {
      setValidationStatus('error');
      return setValidationMessage("Dettagli attività mancanti.");
    }

    setValidationStatus('pending');

    const nOcr = normalize(formOcrNome);
    const nBuz = normalize(selectedBusinessDetails.name);

    const mName = Boolean(nOcr && nBuz && (
      nOcr.includes(nBuz) ||
      nBuz.includes(nOcr)
    ));
    const mPiva = normalize(formOcrPiva) === normalize(selectedBusinessDetails.p_iva || '');
    const mAddr = Boolean(
      normalize(formOcrIndirizzo)
        .includes(normalize(selectedBusinessDetails.address))
    );

    let ok = false;
    let msg = '';

    if (mPiva) {
      ok = true;
      msg = `OK P.IVA; nome:${mName ? 'OK' : 'NO'} indirizzo:${mAddr ? 'OK' : 'NO'}`;
    } else if (!selectedBusinessDetails.p_iva) {
      ok = mName && mAddr;
      msg = ok
        ? 'P.IVA mancante ma nome e indirizzo OK'
        : 'Dati Scontrino non validi';
    } else {
      msg = `P.IVA NO; nome:${mName ? 'OK' : 'NO'} indirizzo:${mAddr ? 'OK' : 'NO'}`;
    }

    setValidationStatus(ok ? 'success' : 'error');
    setValidationMessage(msg);
  };

  // — Auto-trigger validation once
  useEffect(() => {
    if (
      validationStatus === 'idle' &&
      !ocrInProgress &&
      selectedBusinessDetails &&
      (formOcrNome || formOcrPiva || formOcrIndirizzo)
    ) {
      handleValidate();
    }
  }, [ocrInProgress, selectedBusinessDetails, formOcrNome, formOcrPiva, formOcrIndirizzo]);
  const [aiDescValid, setAiDescValid] = useState<boolean | null>(null)
  // — Manual AI description generator
  const handleGenerateDescription = async () => {
    if (!ocrData || !selectedBusinessDetails) return;
    setAiDescError(null);
    setAiDescInProgress(true);

    try {
      const photoB64s = await Promise.all(
        anomalyPhotos.map(f => convertFileToBase64(f))
      );
      const aiRes = await generateAnomalyDescription(
        selectedBusinessDetails.name,
        ocrData,
        photoB64s
      ) as { valid: boolean; description: string | null; error: string | null } | null;
      if (!aiRes || typeof aiRes.valid !== 'boolean') {
        setAiDescError('Risposta AI non valida');
        setAiDescValid(false);
        setDescription('');
        return;
      }
      if (!aiRes.valid) {
        setAiDescValid(false);
        setAiDescError(aiRes.error || 'Prodotti non corrispondono.');
        setDescription('');
      } else {
        setAiDescValid(true);
        setDescription(aiRes.description || '');
      }
    } catch (e: any) {
      setAiDescError(e.message || 'Errore AI');
    } finally {
      setAiDescInProgress(false);
    }
  };

  // — Final submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !businessId ||
      !description.trim() ||
      !receiptFile ||
      validationStatus !== 'success'
    ) {
      setError('Compila tutti i campi e aspetta la validazione prima di inviare.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        businessId,
        description,
        note_utente: userNote || null,
        receiptPhotoBase64: await convertFileToBase64(receiptFile),
        anomalyPhotoBase64s: await Promise.all(anomalyPhotos.map(f => convertFileToBase64(f))),
        ocr_business_name: formOcrNome,
        ocr_p_iva: formOcrPiva,
        ocr_address: formOcrIndirizzo,
        ocr_date: formOcrData,
        ocr_total_amount: formOcrImporto,
      };
      const newAnomaly = await post<any>('/anomalies', payload);
      onAnomalyReported(newAnomaly);
      handleClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Errore invio.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting || ocrInProgress || aiDescInProgress) return;
    // reset everything
    setDescription('');
    setReceiptFile(null);
    setAnomalyPhotos([]);
    setOcrData(null);
    setFormOcrNome(''); setFormOcrPiva(''); setFormOcrIndirizzo('');
    setFormOcrData(''); setFormOcrImporto('');
    setValidationStatus('idle');
    setValidationMessage(null);
    setError(null);
    setAiDescError(null);
    onClose();
  };

  // — Render
  if (!businessId && open) {
    return (
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <Alert severity="error">Nessun business selezionato.</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Chiudi</Button>
        </DialogActions>
      </Dialog>
    );
  }
  // mostrare un alert se invalid
  {
    aiDescValid === false && (
      <Alert severity="error" sx={{ mt: 2 }}>
        I prodotti fotografati non corrispondono a quelli dello scontrino.
      </Alert>
    )
  }
  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Segnala Anomalia</DialogTitle>
      <DialogContent>
        <DialogContentText>Descrivi l’anomalia osservata</DialogContentText>

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {businessFetchError && <Alert severity="error" sx={{ mt: 2 }}>{businessFetchError}</Alert>}
        {ocrError && <Alert severity="warning" sx={{ mt: 2 }}>OCR: {ocrError}</Alert>}
        {validationMessage && (
          <Alert severity={validationStatus === 'success' ? 'success' : 'error'} sx={{ mt: 2 }}>
            {validationMessage}
          </Alert>
        )}
        {aiDescError && <Alert severity="error" sx={{ mt: 2 }}>AI: {aiDescError}</Alert>}

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
          {/* — Receipt upload & OCR — */}
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="receipt-upload"
            type="file"
            onChange={e => setReceiptFile(e.target.files?.[0] || null)}
            ref={receiptRef}
            disabled={submitting || ocrInProgress || aiDescInProgress}
          />
          <label htmlFor="receipt-upload">
            <Button
              variant="outlined"
              component="span"
              fullWidth
              disabled={submitting || ocrInProgress || aiDescInProgress}
            >
              Carica Scontrino
            </Button>
          </label>
          {receiptFile && <Typography variant="body2" sx={{ mt: 1 }}>{receiptFile.name}</Typography>}
          {ocrInProgress && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              <Typography>OCR in corso…</Typography>
            </Box>
          )}

          {/* — read-only OCR fields — */}
          <TextField label="Nome (OCR)" fullWidth margin="dense" variant="outlined" value={formOcrNome} InputProps={{ readOnly: true }} />
          <TextField label="P.IVA (OCR)" fullWidth margin="dense" variant="outlined" value={formOcrPiva} InputProps={{ readOnly: true }} />
          <TextField label="Indirizzo (OCR)" fullWidth margin="dense" variant="outlined" value={formOcrIndirizzo} InputProps={{ readOnly: true }} />
          <TextField label="Data (OCR)" fullWidth margin="dense" variant="outlined" value={formOcrData} InputProps={{ readOnly: true }} />
          <TextField label="Importo (OCR)" fullWidth margin="dense" variant="outlined" value={formOcrImporto} InputProps={{ readOnly: true }} />

          {/* — AI description generator button — */}
          <Box sx={{ mt: 2, position: 'relative' }}>
            <Button
              variant="contained"
              color="info"
              fullWidth
              onClick={handleGenerateDescription}
              disabled={
                !receiptFile               // serve lo scontrino
                || anomalyPhotos.length === 0   // serve almeno 1 foto
                || validationStatus !== 'success'  // deve aver passato la validazione OCR
              }
            >
              {aiDescInProgress
                ? <CircularProgress size={24} color="inherit" />
                : 'Genera descrizione AI'
              }
            </Button>
          </Box>

          {/* — read-only AI description — */}
          <TextField
            label="Descrizione Anomalia"
            fullWidth multiline rows={4} variant="outlined"
            value={description}
            InputProps={{ readOnly: true }}
            disabled={aiDescInProgress}
            sx={{ mt: 2 }}
          />

          <TextField
            margin="dense"
            label="Note Utente (opzionale)"
            type="text"
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            value={userNote}
            onChange={e => setUserNote(e.target.value)}
            disabled={submitting || ocrInProgress || aiDescInProgress}
            sx={{ mt: 2 }}
          />

          {/* — Additional photos — */}
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="photos-upload"
            type="file"
            multiple
            onChange={e => setAnomalyPhotos(Array.from(e.target.files || []))}
            ref={photosRef}
            disabled={submitting || ocrInProgress || aiDescInProgress}
          />
          <label htmlFor="photos-upload">
            <Button variant="outlined" component="span" fullWidth disabled={submitting || ocrInProgress || aiDescInProgress} sx={{ mt: 2 }}>
              Carica Altre Foto (opzionale)
            </Button>
          </label>
          {anomalyPhotos.length > 0 && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              {anomalyPhotos.map(f => f.name).join(', ')}
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={submitting || ocrInProgress || aiDescInProgress}>
          Annulla
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={
            submitting ||
            ocrInProgress ||
            aiDescInProgress ||
            aiDescValid !== true ||
            !businessId ||
            !description.trim() ||
            validationStatus !== 'success'
          }
        >
          {submitting
            ? <CircularProgress size={24} color="inherit" />
            : 'Invia'
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AnomalyFormModal;
