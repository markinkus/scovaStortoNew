import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { post } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { TextField, Button, Typography, Container, Box, Alert } from '@mui/material';

interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth(); // Get the login function from AuthContext

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    try {
      const response = await post<LoginResponse>('/auth/login', { email, password });
      login(response.token, response.user); // Update global auth state
      navigate('/'); // Redirect to home page on successful login
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Login failed. Please check your credentials or try again.');
      }
      console.error('Login error:', err);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Entra
        </Typography>
        {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Indirizzo email"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>
          {/* Optionally, add a link to the registration page */}
          {/* <Link href="/register" variant="body2">
            {"Don't have an account? Sign Up"}
          </Link> */}
        </Box>
      </Box>
    </Container>
  );
};

export default LoginForm;
