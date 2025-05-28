import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import {
  Paper, Typography, TextField, FormControl, InputLabel,
  Select, MenuItem, List, ListItemButton, ListItemText
} from '@mui/material';
import { Business } from '../App';

interface BusinessMenuProps {
  businesses: Business[];
  selectedBusiness: Business | null;
  onSelectBusiness: (business: Business) => void;
}

const BusinessMenu: React.FC<BusinessMenuProps> = ({
  businesses, selectedBusiness, onSelectBusiness
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const itemRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  // Estrai tipi unici
  const types = Array.from(
    new Set(businesses.map(b => b.type).filter(Boolean) as string[])
  );

  // Filtra
  const filtered = businesses
    .filter(b => filterType === 'all' || b.type === filterType)
    .filter(b => {
      const term = searchTerm.toLowerCase();
      return (
        b.name.toLowerCase().includes(term) ||
        b.address.toLowerCase().includes(term)
      );
    });

  // Scroll all’item selezionato
  useEffect(() => {
    if (selectedBusiness) {
      const el = itemRefs.current[selectedBusiness.id];
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedBusiness]);

  return (
    <Paper elevation={1} sx={{ p: 2, height: '100%', overflowY: 'auto' }}>
      <Typography variant="h6" gutterBottom>Businesses</Typography>

      <TextField
        fullWidth size="small" label="Search"
        value={searchTerm}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
        sx={{ mb: 2 }}
      />

      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel>Type</InputLabel>
        <Select
          value={filterType}
          label="Type"
          onChange={(e) => setFilterType(e.target.value as string)}
        >
          <MenuItem value="all">All</MenuItem>
          {types.map(t => (
            <MenuItem key={t} value={t}>{t}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <List disablePadding>
        {filtered.length > 0 ? filtered.map(b => (
          <ListItemButton
            key={b.id}
            selected={selectedBusiness?.id === b.id}
            onClick={() => onSelectBusiness(b)}
            ref={el => (itemRefs.current[b.id] = el)}
            sx={{
              borderBottom: '1px solid',
              borderColor: 'divider',
              '&:hover': { backgroundColor: 'action.hover' }
            }}
          >
            <ListItemText primary={b.name} secondary={b.address}/>
          </ListItemButton>
        )) : (
          <ListItemButton disabled>
            <ListItemText primary="No businesses found."/>
          </ListItemButton>
        )}
      </List>
    </Paper>
  );
};

export default BusinessMenu;
