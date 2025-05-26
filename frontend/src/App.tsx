import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { useAuth } from './contexts/AuthContext';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import BusinessMap from './components/BusinessMap';
import BusinessMenu from './components/BusinessMenu';
import 'leaflet/dist/leaflet.css';

interface Business { /* ... */ }

function App() {
  const { token, user, logout, isLoading } = useAuth();
  const [businessesForMenu, setBusinessesForMenu] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

  if (isLoading) return <Typography>Loading...</Typography>;

  return (
    <Router>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <AppBar position="static">
          <Toolbar>
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{ color: 'inherit', textDecoration: 'none', flexGrow: 1 }}
            >
              Anomaly Reporter
            </Typography>
            {token ? (
              <>
                <Typography sx={{ mr: 2 }}>Hi, {user.username}</Typography>
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

        {/* Contenitore principale */}
        <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
          {/* Menu */}
          <Box sx={{
            width: { xs: '100%', sm: '30%', md: '25%' },
            overflowY: 'auto',
            borderRight: '1px solid',
            borderColor: 'divider',
          }}>
            <BusinessMenu
              businesses={businessesForMenu}
              onSelectBusiness={setSelectedBusiness}
            />
          </Box>

          {/* Mappa */}
          <Box sx={{ flexGrow: 1, height: '100%' }}>
            <BusinessMap
              onBusinessesLoaded={setBusinessesForMenu}
              selectedBusiness={selectedBusiness}
            />
          </Box>
        </Box>

        {/* Rotte Login/Register */}
        <Routes>
          <Route path="/login" element={<Container sx={{ pt: 2 }}><LoginForm/></Container>} />
          <Route path="/register" element={<Container sx={{ pt: 2 }}><RegisterForm/></Container>} />
        </Routes>
      </Box>
    </Router>
  );
}
export default App;
