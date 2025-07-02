// src/components/BusinessCard.tsx
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info'; // or your InfoCircleIcon

interface Business {
  id: number;
  name: string;
  type: string; // e.g. 'ristorante', 'bar', etc.
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

const BusinessCard: React.FC<BusinessCardProps> = ({
  business,
  onSelectBusiness,
  onOpenDetails
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Card
      onClick={() => onSelectBusiness(business.id)}
      sx={{
        mb: isMobile ? 1 : 2,
        cursor: 'pointer',
        p: isMobile ? 1 : 2
      }}
    >
      <CardContent sx={{ p: 0 }}>
        <Box
          display="flex"
          flexDirection={isMobile ? 'column' : 'row'}
          justifyContent="space-between"
          alignItems={isMobile ? 'stretch' : 'center'}
        >
          {/* Info */}
          <Box flexGrow={1}>
            <Typography
              variant={isMobile ? 'subtitle1' : 'h6'}
              noWrap
            >
              {business.name}
              {business.type}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: isMobile ? 1 : 1.5 }}
              noWrap
            >
              {business.address}
            </Typography>
            {!isMobile && (
              <Typography variant="caption" color="text.secondary">
                Coords: ({business.latitude.toFixed(4)}, {business.longitude.toFixed(4)})
              </Typography>
            )}
            {business.addedByUser && (
              <Typography
                variant="caption"
                display="block"
                sx={{ mt: isMobile ? 0.5 : 1 }}
              >
                Added by: {business.addedByUser.username}
              </Typography>
            )}
            {business.anomalyCount !== undefined && (
              <Chip
                label={`Anomalies: ${business.anomalyCount}`}
                size="small"
                sx={{ mt: isMobile ? 0.5 : 1 }}
              />
            )}
          </Box>

          {/* Details button */}
          <Box
            sx={{
              mt: isMobile ? 1 : 0,
              ml: isMobile ? 0 : 2,
              width: isMobile ? '100%' : 'auto'
            }}
          >
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetails(business.id);
              }}
              fullWidth={isMobile}
              size={isMobile ? 'small' : 'medium'}
              variant="outlined"
              startIcon={<InfoIcon fontSize={isMobile ? 'small' : 'medium'} />}
            >
              {isMobile ? 'Dettagli' : ''}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BusinessCard;
