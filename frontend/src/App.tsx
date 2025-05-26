import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import { useAuth } from './contexts/AuthContext'; // Import useAuth
import LoginForm from './components/LoginForm'; // Import LoginForm
import RegisterForm from './components/RegisterForm'; // Import RegisterForm
import BusinessMap from './components/BusinessMap'; // Import BusinessMap

// Placeholder components for now
// LoginPage and RegisterPage will be replaced by actual components
// HomePage will be replaced by BusinessMap or a more complex dashboard


function App() {
  const { token, user, logout, isLoading } = useAuth(); // Use auth state

  if (isLoading) {
    return <Typography>Loading...</Typography>; // Or a proper spinner
  }

  return (
    <Router>
      <AppBar position="static">
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
      <Container sx={{ marginTop: 0, padding:0, maxWidth: '100% !important' }} disableGutters>
        <Routes>
          <Route path="/" element={<BusinessMap />} /> {/* Use BusinessMap for HomePage */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          {/* Add other routes here, e.g., for a protected dashboard or profile */}
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
