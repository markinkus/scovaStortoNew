import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import {
  Paper, Typography, TextField, FormControl, InputLabel,
  Select, MenuItem, List, ListItemButton, ListItemText
} from '@mui/material';
import { Business } from '../App';
interface BusinessMenuProps {
  businesses: Business[];
  selectedBusiness: Business | null;
  onSelectBusiness: (b: Business) => void;
  filterType: string;
  onFilterChange: (type: string) => void;
}

const BusinessMenu: React.FC<BusinessMenuProps> = ({
  businesses = [],
  selectedBusiness,
  onSelectBusiness,
  filterType,
  onFilterChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const itemRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Estraggo i tipi unici
  const types = Array.from(new Set(businesses.map(b => b.type).filter(Boolean))) as string[];

  // Filtro per tipo + ricerca
  const filtered = businesses
    .filter(b => filterType === 'all' || b.type === filterType)
    .filter(b => {
      const term = searchTerm.toLowerCase();
      return b.name.toLowerCase().includes(term) 
      || b.address.toLowerCase().includes(term)
      || b.p_iva.toLowerCase().includes(term);
    });

  // Scrolla sull’item selezionato
  useEffect(() => {
    if (selectedBusiness) {
      const el = itemRefs.current[selectedBusiness.id];
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedBusiness]);

  return (
    <Paper elevation={1} sx={{ p: 2, height: '100%', overflowY: 'auto' }}>
      <Typography variant="h6" gutterBottom>Attività</Typography>

      <TextField
        fullWidth size="small" label="Cerca..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        sx={{ mb: 2 }}
      />

      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel>Tipo</InputLabel>
        <Select
          value={filterType}
          label="Tipo"
          onChange={e => onFilterChange(e.target.value as string)}
        >
          <MenuItem value="all">Tutti</MenuItem>
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
            ref={el => { itemRefs.current[b.id] = el; }}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '&:hover': { backgroundColor: 'action.hover' }
            }}
          >
            <ListItemText primary={b.name} secondary={b.address} />
          </ListItemButton>
        )) : (
          <ListItemButton disabled>
            <ListItemText primary="Nessuna attività trovata." />
          </ListItemButton>
        )}
      </List>
    </Paper>
  );
};
export default BusinessMenu;


// export default BusinessMenu;
