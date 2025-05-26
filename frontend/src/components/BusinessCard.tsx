import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';

interface Business {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  addedByUser?: { id: number; username: string };
  anomalyCount?: number;
  // Potentially add a list of anomalies or a way to view them
}

interface BusinessCardProps {
  business: Business;
}

const BusinessCard: React.FC<BusinessCardProps> = ({ business }) => {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" component="div">
          {business.name}
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          {business.address}
        </Typography>
        <Typography variant="body2">
          Coordinates: ({business.latitude.toFixed(4)}, {business.longitude.toFixed(4)})
        </Typography>
        {business.addedByUser && (
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Added by: {business.addedByUser.username}
          </Typography>
        )}
        {business.anomalyCount !== undefined && (
           <Chip label={`Anomalies: ${business.anomalyCount}`} size="small" sx={{ mt: 1 }} />
        )}
      </CardContent>
      {/* Add actions like "View Details", "Report Anomaly" here later */}
    </Card>
  );
};

export default BusinessCard;
