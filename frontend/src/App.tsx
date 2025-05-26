import React, { useState } from 'react'; // Import useState
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box, Grid } from '@mui/material'; // Import Grid
import { useAuth } from './contexts/AuthContext'; // Import useAuth
import LoginForm from './components/LoginForm'; // Import LoginForm
import RegisterForm from './components/RegisterForm'; // Import RegisterForm
import BusinessMap from './components/BusinessMap'; // Import BusinessMap
import BusinessMenu from './components/BusinessMenu'; // Import BusinessMenu
// Esempio in main.tsx o App.tsx
import 'leaflet/dist/leaflet.css';
// Define Business interface based on BusinessMap.tsx and BusinessMenu.tsx
// Using 'id: number' as per BusinessMap.tsx which is the data source
interface Business {
  id: number; // Changed from string to number to align with BusinessMap
  name: string;
  address: string;
  latitude?: number; // Optional, as in BusinessMenu
  longitude?: number; // Optional, as in BusinessMenu
  type?: string; // Optional, as in BusinessMenu
  // addedByUser and anomalyCount are specific to BusinessMap's internal state,
  // but might be useful if passed through. For now, keeping it minimal.
}


function App() {
  const { token, user, logout, isLoading } = useAuth(); // Use auth state
  const [businessesForMenu, setBusinessesForMenu] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null); // State for selected business

  const handleSelectBusiness = (business: Business) => {
    console.log('Selected business in App:', business);
    setSelectedBusiness(business); // Update selected business state
  };

  if (isLoading) {
    return <Typography>Loading...</Typography>; // Or a proper spinner
  }

  return (
    <Router>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <AppBar position="static" sx={{ height: '64px' }}> {/* Single AppBar */}
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                Anomaly Reporter
              </Link>
            </Typography>
            {token && user ? (
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
        <Routes>
          <Route
            path="/"
            element={
              <Grid container sx={{ flexGrow: 1, height: 'calc(100vh - 64px)' }}> {/* Grid takes remaining height */}
                <Grid item xs={12} sm={4} md={3} sx={{ height: '100%', overflowY: 'auto', borderRight: { sm: '1px solid #ddd'} }}>
                  <Box sx={{ p: { xs: 1, sm: 2 } , height: '100%'}}>
                    <BusinessMenu
                      businesses={businessesForMenu}
                      onSelectBusiness={handleSelectBusiness}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={8} md={9} sx={{ height: '100%' }}>
                  <Box sx={{ height: '100%' }}> {/* Ensure Box takes full height of Grid item */}
                    <BusinessMap
                      onBusinessesLoaded={setBusinessesForMenu}
                      selectedBusiness={selectedBusiness} // Pass selectedBusiness to BusinessMap
                    />
                  </Box>
                </Grid>
              </Grid>
            }
          />
          <Route path="/login" element={
            <Container sx={{pt: 2}}>
              <LoginForm />
            </Container>
          } />
          <Route path="/register" element={
            <Container sx={{pt: 2}}>
              <RegisterForm />
            </Container>
          } />
          {/* Add other routes here */}
        </Routes>
      </Box>
    </Router>
  );
}

export default App;
