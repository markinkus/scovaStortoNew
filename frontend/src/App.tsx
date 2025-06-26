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
                <Button color="inherit" onClick={logout}>Logout</Button>
              </>
            ) : (
              <>
                <Button color="inherit" component={Link} to="/login">Login</Button>
                <Button color="inherit" component={Link} to="/register">Register</Button>
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
              <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
                <Box
                  sx={{
                    width: { xs: '100%', sm: '30%', md: '25%' },
                    overflowY: 'auto',
                    borderRight: 1,
                    borderColor: 'divider'
                  }}
                >
                  <BusinessMenu
                    businesses={businesses}
                    selectedBusiness={selectedBusiness}
                    onSelectBusiness={(b) => { setSelectedBusiness(b); setInfoOpen(true); }}
                  />
                </Box>
                <Box sx={{ flexGrow: 1, height: '100%' }}>
                  <BusinessMap
                    onBusinessesLoaded={setBusinesses}
                    selectedBusiness={selectedBusiness}
                    onSelectBusiness={(b) => { setSelectedBusiness(b); setInfoOpen(true); }}
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
      </Box>
            {selectedBusiness && (
        <BusinessInfoDialog
          businessId={selectedBusiness.id}
          open={infoOpen}
          onClose={() => setInfoOpen(false)}
        />
      )}
    </Router>
  );
}

export default App;
