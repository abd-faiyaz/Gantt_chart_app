import React, { useState } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
} from '@mui/material';
import { AccountCircle, LockOutlined } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const HomePage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Login form state
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  
  // Signup form state
  const [signupData, setSignupData] = useState({ 
    firstName: '',
    lastName: '',
    email: '', 
    password: '', 
    confirmPassword: '' 
  });

  const { login, signup } = useAuth();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError('');
    setSuccess('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!loginData.email || !loginData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const result = await login(loginData.email, loginData.password);
    
    if (result.success) {
      setSuccess('Login successful! Redirecting...');
      // Redirect will be handled by App.js when user state changes
    } else {
      setError(result.error || 'Login failed');
    }
    
    setLoading(false);
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!signupData.firstName || !signupData.lastName || !signupData.email || !signupData.password || !signupData.confirmPassword) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (signupData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    const result = await signup(signupData);
    
    if (result.success) {
      setSuccess('Account created successfully! Redirecting...');
      // Redirect will be handled by App.js when user state changes
    } else {
      setError(result.error || 'Signup failed');
    }
    
    setLoading(false);
  };

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignupChange = (e) => {
    setSignupData({
      ...signupData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
        <Container maxWidth="sm">
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h1" sx={{ color: 'white', mb: 2 }}>
              Gantt Chart App
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Manage your projects, epics, and tasks efficiently
            </Typography>
          </Box>

          <Paper
            elevation={24}
            sx={{
              p: 4,
              borderRadius: 3,
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                centered
                variant="fullWidth"
                sx={{
                  '& .MuiTab-root': {
                    fontSize: '1rem',
                    fontWeight: 600,
                  },
                }}
              >
                <Tab
                  icon={<AccountCircle />}
                  label="Login"
                  iconPosition="start"
                />
                <Tab
                  icon={<LockOutlined />}
                  label="Sign Up"
                  iconPosition="start"
                />
              </Tabs>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
                {success}
              </Alert>
            )}

            <TabPanel value={tabValue} index={0}>
              <Box component="form" onSubmit={handleLoginSubmit}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  disabled={loading}
                  autoComplete="email"
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  disabled={loading}
                  autoComplete="current-password"
                  variant="outlined"
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ mt: 2, mb: 2, height: 48 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Sign In'}
                </Button>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box component="form" onSubmit={handleSignupSubmit}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={signupData.firstName}
                  onChange={handleSignupChange}
                  disabled={loading}
                  autoComplete="given-name"
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={signupData.lastName}
                  onChange={handleSignupChange}
                  disabled={loading}
                  autoComplete="family-name"
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={signupData.email}
                  onChange={handleSignupChange}
                  disabled={loading}
                  autoComplete="email"
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={signupData.password}
                  onChange={handleSignupChange}
                  disabled={loading}
                  autoComplete="new-password"
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={signupData.confirmPassword}
                  onChange={handleSignupChange}
                  disabled={loading}
                  autoComplete="new-password"
                  variant="outlined"
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ mt: 2, mb: 2, height: 48 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Create Account'}
                </Button>
              </Box>
            </TabPanel>
          </Paper>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              © 2025 Gantt Chart App. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
  );
};

export default HomePage;
