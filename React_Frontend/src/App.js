import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import './App.css';

import TaskForm from './modules/TaskForm';
import EpicForm from './modules/EpicForm';
import SubTaskForm from './modules/SubTaskForm';
import TaskView from './modules/TaskView';
import ProjectForm from './modules/ProjectForm';
import ProjectView from './modules/ProjectView';
import HomePage from "./pages/HomePage";
import TestPage from "./pages/TestPage";
import { AuthProvider, useAuth } from './context/AuthContext';
import { CircularProgress, Box, ThemeProvider, createTheme, CssBaseline } from '@mui/material';

// Create Material UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb',
    },
    secondary: {
      main: '#64748b',
    },
  },
});

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  console.log('ProtectedRoute: loading =', loading, 'isAuthenticated =', isAuthenticated());

  if (loading) {
    console.log('ProtectedRoute: Showing loading spinner');
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return isAuthenticated() ? children : <Navigate to="/auth" replace />;
}

// Public Route Component (redirects to dashboard if authenticated)
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  console.log('PublicRoute: loading =', loading, 'isAuthenticated =', isAuthenticated());

  if (loading) {
    console.log('PublicRoute: Showing loading spinner');
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return isAuthenticated() ? <Navigate to="/dashboard" replace /> : children;
}

function AppContent() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/auth" element={<PublicRoute><HomePage /></PublicRoute>} />
      
      {/* Protected routes */}
      <Route path="/dashboard" element={<ProtectedRoute><TaskView /></ProtectedRoute>} />
      <Route path="/projects" element={<ProtectedRoute><ProjectView /></ProtectedRoute>} />
      <Route path="/add-project" element={<ProtectedRoute><ProjectForm /></ProtectedRoute>} />
      <Route path="/edit-project" element={<ProtectedRoute><ProjectForm /></ProtectedRoute>} />
      <Route path="/add-task" element={<ProtectedRoute><TaskForm /></ProtectedRoute>} />
      <Route path="/add-task/:epicId" element={<ProtectedRoute><TaskForm /></ProtectedRoute>} />
      <Route path="/add-epic" element={<ProtectedRoute><EpicForm /></ProtectedRoute>} />
      <Route path="/add-subtask/:taskId" element={<ProtectedRoute><SubTaskForm /></ProtectedRoute>} />
      <Route path="/edit-task" element={<ProtectedRoute><TaskForm /></ProtectedRoute>} />
      <Route path="/edit-epic" element={<ProtectedRoute><EpicForm /></ProtectedRoute>} />
      <Route path="/edit-subtask" element={<ProtectedRoute><SubTaskForm /></ProtectedRoute>} />
      <Route path="/view-tasks" element={<ProtectedRoute><TaskView /></ProtectedRoute>} />
      
      {/* Root redirect */}
      <Route path="/" element={<PublicRoute><HomePage /></PublicRoute>} />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
