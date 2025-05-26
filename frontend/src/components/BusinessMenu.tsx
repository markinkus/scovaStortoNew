import React, { useState, ChangeEvent } from 'react';
import {
  Box,
  TextField,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';

// Define the Business interface
interface Business {
  id: number; // Standardized to number
  name: string;
  address: string;
  // Add other properties if needed from your types.ts or API response
  latitude?: number;
  longitude?: number;
  type?: string;
}

// Define the props for the BusinessMenu component
interface BusinessMenuProps {
  businesses: Business[];
  onSelectBusiness: (business: Business) => void;
}

const BusinessMenu: React.FC<BusinessMenuProps> = ({ businesses, onSelectBusiness }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredBusinesses = businesses.filter((business) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      business.name.toLowerCase().includes(searchTermLower) ||
      business.address.toLowerCase().includes(searchTermLower)
    );
  });

  return (
    <Paper elevation={3} sx={{ padding: 2, maxHeight: '100vh', overflowY: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Businesses
      </Typography>
      <TextField
        fullWidth
        label="Search Businesses"
        variant="outlined"
        value={searchTerm}
        onChange={handleSearchChange}
        sx={{ marginBottom: 2 }}
      />
      <List>
        {filteredBusinesses.length > 0 ? (
          filteredBusinesses.map((business) => (
            <ListItem
              button
              key={business.id}
              onClick={() => onSelectBusiness(business)}
              sx={{
                borderBottom: '1px solid #eee',
                '&:last-child': {
                  borderBottom: 'none',
                },
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                },
              }}
            >
              <ListItemText
                primary={business.name}
                secondary={business.address}
              />
            </ListItem>
          ))
        ) : (
          <ListItem>
            <ListItemText primary="No businesses found." />
          </ListItem>
        )}
      </List>
    </Paper>
  );
};

export default BusinessMenu;
