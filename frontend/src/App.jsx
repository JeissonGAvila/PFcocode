// frontend/src/App.jsx - Aplicación principal con sistema de login
import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, CircularProgress, Typography } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import LoginForm from './components/forms/LoginForm.jsx';
import LogoutButton from './components/common/LogoutButton.jsx';
import DashboardAdmin from './vistas/administrador/Dashboard.jsx';
import DashboardTecnico from './vistas/tecnico/Dashboard.jsx';
import DashboardLider from './vistas/liderCocode/Dashboard.jsx';
import DashboardCiudadano from './vistas/ciudadano/Dashboard.jsx';

// Tema Material-UI personalizado
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Azul gubernamental
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// Componente de carga
const LoadingScreen = () => (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    minHeight="100vh"
    bgcolor="background.default"
  >
    <CircularProgress size={60} />
    <Typography variant="h6" sx={{ mt: 2 }}>
      🏛️ Cargando Sistema Municipal...
    </Typography>
  </Box>
);

// Componente principal de la aplicación
const AppContent = () => {
  const { loading, isAuthenticated, user } = useAuth();

  // Mostrar pantalla de carga mientras verifica autenticación
  if (loading) {
    return <LoadingScreen />;
  }

  // Si no está autenticado, mostrar login
  if (!isAuthenticated) {
    return (
      <Box bgcolor="background.default" minHeight="100vh">
        <LoginForm 
          onLoginSuccess={(response) => {
            console.log('🎉 Usuario logueado:', response.usuario);
          }}
        />
      </Box>
    );
  }

  // Usuario autenticado - mostrar dashboard correspondiente
  return (
    <Box bgcolor="background.default" minHeight="100vh">
      {/* Contenido según el tipo de usuario */}
      {user?.tipo === 'administrador' && (
        <DashboardAdmin />
      )}
      
      {user?.tipo === 'tecnico' && (
        <DashboardTecnico />
      )}
      
      {user?.tipo === 'liderCocode' && (
        <DashboardLider />
      )}
      
      {user?.tipo === 'ciudadano' && (
        <DashboardCiudadano />
      )}
    </Box>
  );
};

// Componente principal con providers
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;