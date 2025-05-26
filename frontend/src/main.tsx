import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Basic global styles (optional)
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { AuthProvider } from './contexts/AuthContext'; // Import AuthProvider

// Wooden Theme Definition
const woodenTheme = createTheme({
  palette: {
    primary: {
      main: '#7a6a5c', // Marrone medio
      contrastText: '#f0e5d8',
    },
    secondary: {
      main: '#a08a7c', // Un altro marrone per accenti
      contrastText: '#f0e5d8',
    },
    background: {
      default: '#d7c7b7', // Sfondo principale - beige/marrone chiaro
      paper: '#f0e5d8',   // Sfondo per componenti come Card, Modal - crema
    },
    text: {
      primary: '#4a3b31', // Testo scuro
      secondary: '#6a5a4c',
    },
  },
  typography: {
    fontFamily: '"Georgia", "serif"', // Un font che potrebbe adattarsi bene
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px', // Bottoni leggermente arrotondati
                  // Potresti aggiungere un leggero box-shadow per dare profondità
        }
      }
    },
    MuiPaper: { // Per Modals, Cards, Menu
      styleOverrides: {
        root: {
          border: '2px solid #4a3b31', // Bordo scuro
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#4a3b31', // AppBar scura
          color: '#f0e5d8',
        }
      }
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={woodenTheme}>
      <CssBaseline /> {/* Normalize CSS and apply baseline styles */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
