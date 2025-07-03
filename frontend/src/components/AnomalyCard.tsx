import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  CardMedia,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface Anomaly {
  id: number;
  description: string;
  note_utente?: string | null;
  receipt_photo_base64?: string | null;
  anomaly_photo_base64s?: string[] | null;
  ocr_business_name?: string | null;
  ocr_p_iva?: string | null;
  ocr_address?: string | null;
  ocr_date?: string | null;
  ocr_total_amount?: string | null;
  reportedByUser?: { id: number; username: string } | null;
  business?: { id: number; name: string; address: string } | null;
  createdAt: string;
}

interface AnomalyCardProps {
  anomaly: Anomaly;
}

const AnomalyCard: React.FC<AnomalyCardProps> = ({ anomaly }) => {
  // Stato per il dialog di preview
  const [open, setOpen] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);

  const photos = anomaly.anomaly_photo_base64s || [];
  const hasReceipt = Boolean(anomaly.receipt_photo_base64);
  const hasPhotos  = photos.length > 0;

  const handleOpen = (idx: number) => {
    setCurrentIdx(idx);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  return (
    <>
      <Card sx={{ mb: 2 }}>
        {/* Scontrino se presente */}
        {hasReceipt && (
          <CardMedia
            component="img"
            height="140"
            image={anomaly.receipt_photo_base64!}
            alt={`Scontrino ${anomaly.business?.name || ''}`}
            sx={{ objectFit: 'cover' }}
          />
        )}

        <CardContent>
          <Typography gutterBottom variant="h6">
            Segnalazione
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {anomaly.description}
          </Typography>
          {anomaly.note_utente && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <strong>Nota utente:</strong> {anomaly.note_utente}
            </Typography>
          )}

          {/* Dati OCR */}

          {/* Dati business / utente */}
          {anomaly.business && (
            <Typography variant="caption" display="block">
              Business: {anomaly.business.name}
            </Typography>
          )}
          {anomaly.reportedByUser && (
            <Typography variant="caption" display="block">
              Segnalato da: {anomaly.reportedByUser.username}
            </Typography>
          )}
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            {new Date(anomaly.createdAt).toLocaleDateString('it-IT')}
          </Typography>

          {/* Mini-galleria inline */}
          {hasPhotos && (
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {photos.map((src, idx) => (
                <Box
                  key={idx}
                  component="img"
                  src={src}
                  alt={`Prodotto ${idx + 1}`}
                  sx={{
                    width: 80,
                    height: 80,
                    objectFit: 'cover',
                    borderRadius: 1,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                  onClick={() => handleOpen(idx)}
                />
              ))}
            </Box>
          )}

          {/* Dati OCR */}
          {anomaly.ocr_business_name && (
            <Typography variant="body2" sx={{ mt: 2 }}>
              <strong>OCR Esercizio:</strong> {anomaly.ocr_business_name}
            </Typography>
          )}
          {anomaly.ocr_date && (
            <Typography variant="body2">
              <strong>OCR Data:</strong> {anomaly.ocr_date}
            </Typography>
          )}
          {anomaly.ocr_total_amount && (
            <Typography variant="body2">
              <strong>OCR Totale:</strong> {anomaly.ocr_total_amount}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Dialog per preview immagini */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ m: 0, p: 2 }}>
          Immagine {currentIdx + 1} di {photos.length}
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box
            component="img"
            src={photos[currentIdx]}
            alt={`Prodotto ${currentIdx + 1}`}
            sx={{ width: '100%', height: 'auto', borderRadius: 1 }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AnomalyCard;
