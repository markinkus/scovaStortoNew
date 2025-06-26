import React from 'react';
import { Card, CardContent, Typography, CardMedia, Box } from '@mui/material';

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
  business?: { id: number; name: string; address: string } | null;
  createdAt: string;
}

interface AnomalyCardProps {
  anomaly: Anomaly;
}

const AnomalyCard: React.FC<AnomalyCardProps> = ({ anomaly }) => {
  return (
    <Card sx={{ mb: 2 }}>
      {anomaly.receipt_photo_base64 && (
        <CardMedia
          component="img"
          height="140"
          image={anomaly.receipt_photo_base64}
          alt={`Anomaly at ${anomaly.business?.name || 'N/A'}`}
          sx={{ objectFit: 'cover' }}
        />
      )}
      <CardContent>
        <Typography gutterBottom variant="h6" component="div">
          Anomaly Report
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {anomaly.description}
        </Typography>
        {anomaly.business && (
          <Typography variant="caption" display="block">
            Business: {anomaly.business.name} ({anomaly.business.address})
          </Typography>
        )}
        {anomaly.reportedByUser && (
          <Typography variant="caption" display="block">
            Reported by: {anomaly.reportedByUser.username}
          </Typography>
        )}
        <Typography variant="caption" display="block" sx={{mt:1}}>
          Reported on: {new Date(anomaly.createdAt).toLocaleDateString()}
        </Typography>
        {anomaly.ocr_business_name && (
          <Typography variant="body2">Esercizio OCR: {anomaly.ocr_business_name}</Typography>
        )}
        {anomaly.ocr_p_iva && (
          <Typography variant="body2">P.IVA OCR: {anomaly.ocr_p_iva}</Typography>
        )}
        {anomaly.ocr_address && (
          <Typography variant="body2">Indirizzo OCR: {anomaly.ocr_address}</Typography>
        )}
        {anomaly.ocr_date && (
          <Typography variant="body2">Data OCR: {anomaly.ocr_date}</Typography>
        )}
        {anomaly.ocr_total_amount && (
          <Typography variant="body2">Importo OCR: {anomaly.ocr_total_amount}</Typography>
        )}
        {Array.isArray(anomaly.anomaly_photo_base64s) && anomaly.anomaly_photo_base64s.length > 0 && (
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {anomaly.anomaly_photo_base64s.map((src, idx) => (
              <Box key={idx} component="img" src={src} alt="Anomaly" sx={{ width: 80, height: 80, objectFit: 'cover' }} />
            ))}
          </Box>
        )}
      </CardContent>
      {/* Add actions like "View Details on Map", "Edit/Delete" (if owner) here later */}
    </Card>
  );
};

export default AnomalyCard;