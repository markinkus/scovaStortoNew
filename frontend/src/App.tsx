// frontend/src/App.tsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { useAuth } from './contexts/AuthContext';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import BusinessMap from './components/BusinessMap';
import BusinessMenu from './components/BusinessMenu';
import BusinessInfoDialog from './components/BusinessInfoDialog';

export interface Business {
  id: number;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  type?: string;
  addedByUser?: { id: number; username: string };
  anomalyCount?: number;
  photo_base64?: string | null;
}

function App() {
  const { token, user, logout, isLoading } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Router>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {/* AppBar */}
        <AppBar position="static">
          <Toolbar>
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}
            >
              ScovaStorto
            </Typography>
            {token ? (
              <>
                <Typography sx={{ mr: 2 }}>Hi, {user!.username}</Typography>
                <Button color="inherit" onClick={logout}>Esci</Button>
              </>
            ) : (
              <>
                <Button color="inherit" component={Link} to="/login">Entra</Button>
                <Button color="inherit" component={Link} to="/register">Registrati</Button>
              </>
            )}
          </Toolbar>
        </AppBar>

        {/* Rotte */}
        <Routes>
          {/* Home: menu + mappa */}
          <Route
            path="/"
            element={
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' }, // colonna su xs, riga da sm in su
                  flexGrow: 1,
                  overflow: 'hidden',
                }}
              >
                {/* ─── LISTA ATTIVITÀ ─── */}
                <Box
                  sx={{
                    width: { xs: '100%', sm: '30%', md: '25%' },
                    overflowY: 'auto',
                    borderRight: { xs: 0, sm: 1 },
                    borderColor: 'divider',
                  }}
                >
                  <BusinessMenu
                    businesses={businesses}
                    selectedBusiness={selectedBusiness}
                    onSelectBusiness={b => setSelectedBusiness(b)}
                  />
                </Box>

                {/* ─── MAPPA ─── */}
                <Box
                  sx={{
                    flexGrow: 1,
                    height: { xs: '50vh', sm: '100%' } // mappa 50vh su xs, full su sm+
                  }}
                >
                  <BusinessMap
                    onBusinessesLoaded={setBusinesses}
                    selectedBusiness={selectedBusiness}
                    onSelectBusiness={b => setSelectedBusiness(b)}
                    onOpenDetails={b => {
                      setSelectedBusiness(b);
                      setInfoOpen(true);
                    }}
                  />
                </Box>
              </Box>
            }
          />

          {/* Login / Register */}
          <Route
            path="/login"
            element={
              <Container sx={{ pt: 2 }}>
                <LoginForm />
              </Container>
            }
          />
          <Route
            path="/register"
            element={
              <Container sx={{ pt: 2 }}>
                <RegisterForm />
              </Container>
            }
          />
        </Routes>

        {/* Dialog dettagli */}
        {selectedBusiness && (
          <BusinessInfoDialog
            businessId={selectedBusiness.id}
            open={infoOpen}
            onClose={() => setInfoOpen(false)}
          />
        )}
      </Box>
    </Router>
  );
}

export default App;
