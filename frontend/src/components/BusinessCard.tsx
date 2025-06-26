import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Button } from '@mui/material';
import { MapPinIcon } from '../../../components/icons/MapPinIcon';
import { InfoCircleIcon } from '../../../components/icons/InfoCircleIcon';

interface Business {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  addedByUser?: { id: number; username: string };
  anomalyCount?: number;
}

interface BusinessCardProps {
  business: Business;
  onSelectBusiness: (businessId: number) => void;
  onOpenDetails: (businessId: number) => void;
}

const BusinessCard: React.FC<BusinessCardProps> = ({ business, onSelectBusiness, onOpenDetails }) => {
  return (
    <Card
      sx={{ mb: 2, cursor: 'pointer' }}
      onClick={() => onSelectBusiness(business.id)}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
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
          </Box>
          <Button
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(business.id);
            }}
          >
            <InfoCircleIcon />
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BusinessCard;
