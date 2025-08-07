// frontend/src/components/forms/LoginForm.jsx
import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Login as LoginIcon
} from '@mui/icons-material';
import { authService } from '../../services/authService.js';

const LoginForm = ({ onLoginSuccess }) => {
  // Estados del formulario
  const [formData, setFormData] = useState({
    correo: '',
    contrasena: ''
  });
  
  // Estados UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Manejar cambios en inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error cuando usuario empiece a escribir
    if (error) {
      setError('');
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validaciones básicas
      if (!formData.correo.trim()) {
        setError('El correo electrónico es requerido');
        setLoading(false);
        return;
      }

      if (!formData.contrasena) {
        setError('La contraseña es requerida');
        setLoading(false);
        return;
      }

      // Llamar al servicio de autenticación
      const response = await authService.login(formData.correo, formData.contrasena);

      if (response.success) {
        // Login exitoso
        console.log('✅ Login exitoso:', response.usuario);
        
        // Callback para el componente padre
        if (onLoginSuccess) {
          onLoginSuccess(response);
        }
        
        // Redirigir según el tipo de usuario
        setTimeout(() => {
          window.location.href = response.redirigir;
        }, 500);
        
      } else {
        setError(response.error || 'Error al iniciar sesión');
      }

    } catch (error) {
      console.error('❌ Error en login:', error);
      setError(error.message || 'Error de conexión. Verifica que el servidor esté corriendo.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle mostrar/ocultar contraseña
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={6} sx={{ p: 4, borderRadius: 3 }}>
        {/* Header */}
        <Box textAlign="center" mb={4}>
          <Typography variant="h4" component="h1" gutterBottom color="primary" fontWeight="bold">
            🏛️ Sistema Municipal
          </Typography>
          <Typography variant="h6" color="textSecondary">
            COCODE Huehuetenango
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Ingresa tus credenciales para acceder
          </Typography>
        </Box>

        {/* Formulario */}
        <Box component="form" onSubmit={handleSubmit}>
          {/* Email */}
          <TextField
            fullWidth
            margin="normal"
            name="correo"
            label="Correo Electrónico"
            type="email"
            variant="outlined"
            value={formData.correo}
            onChange={handleChange}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="action" />
                </InputAdornment>
              ),
            }}
            placeholder="admin@municipalidad.gob.gt"
          />

          {/* Contraseña */}
          <TextField
            fullWidth
            margin="normal"
            name="contrasena"
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            value={formData.contrasena}
            onChange={handleChange}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={toggleShowPassword} edge="end" disabled={loading}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            placeholder="••••••••"
          />

          {/* Error */}
          {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Botón Login */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
            sx={{ 
              mt: 3, 
              mb: 2, 
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </Box>

        {/* Footer con usuarios de prueba */}
        <Box textAlign="center" mt={4}>
          <Typography variant="caption" color="textSecondary" display="block">
            🧪 Usuarios de prueba disponibles:
          </Typography>
          <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
            <strong>Admin:</strong> admin@municipalidad.gob.gt / admin123<br />
            <strong>Técnico:</strong> energia@municipalidad.gob.gt / tecnico123<br />
            <strong>Líder:</strong> lider@cocode.gt / lider123<br />
            <strong>Ciudadano:</strong> ciudadano@email.com / ciudadano123
          </Typography>
        </Box>
      </Paper>

      {/* Loading Overlay */}
      {loading && (
        <Box
          position="fixed"
          top={0}
          left={0}
          width="100%"
          height="100%"
          bgcolor="rgba(0, 0, 0, 0.3)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={9999}
        >
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <CircularProgress />
            <Typography>Verificando credenciales...</Typography>
          </Paper>
        </Box>
      )}
    </Container>
  );
};

export default LoginForm;