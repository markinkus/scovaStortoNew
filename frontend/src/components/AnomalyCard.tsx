import React from 'react';
import { Card, CardContent, Typography, CardMedia, Box } from '@mui/material';

interface Anomaly {
  id: number;
  description: string;
  receipt_photo_base64?: string | null;
  anomaly_photo_base64s?: string[] | null;
  reportedBy?: { id: number; username: string };
  business?: { id: number; name: string; address: string };
  createdAt: string; // Assuming ISO string date
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
        {anomaly.reportedBy && (
          <Typography variant="caption" display="block">
            Reported by: {anomaly.reportedBy.username}
          </Typography>
        )}
        <Typography variant="caption" display="block" sx={{mt:1}}>
          Reported on: {new Date(anomaly.createdAt).toLocaleDateString()}
        </Typography>
      </CardContent>
      {/* Add actions like "View Details on Map", "Edit/Delete" (if owner) here later */}
    </Card>
  );
};

export default AnomalyCard;
