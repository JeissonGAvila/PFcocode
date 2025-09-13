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
  IconButton,
  useTheme,
  useMediaQuery,
  Fade,
  Collapse,
  Divider
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  AccountBalance as BuildingIcon
} from '@mui/icons-material';
import { authService } from '../../services/authService.js';

const LoginForm = ({ onLoginSuccess }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Estados del formulario
  const [formData, setFormData] = useState({
    correo: '',
    contrasena: ''
  });
  
  // Estados UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showTestUsers, setShowTestUsers] = useState(false);

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

  // Toggle mostrar usuarios de prueba
  const toggleTestUsers = () => {
    setShowTestUsers(!showTestUsers);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, 
          ${theme.palette.primary.light}20 0%, 
          ${theme.palette.secondary.light}20 50%, 
          ${theme.palette.primary.main}10 100%)`,
        display: 'flex',
        alignItems: 'center',
        py: { xs: 2, sm: 4 },
        px: { xs: 1, sm: 2 }
      }}
    >
      <Container 
        maxWidth="sm" 
        sx={{ 
          width: '100%',
          maxWidth: { xs: '100%', sm: '500px' }
        }}
      >
        <Fade in timeout={800}>
          <Paper 
            elevation={isMobile ? 2 : 12}
            sx={{ 
              p: { xs: 3, sm: 4, md: 5 },
              borderRadius: { xs: 2, sm: 3, md: 4 },
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: isMobile 
                ? '0 4px 20px rgba(0, 0, 0, 0.1)'
                : '0 8px 40px rgba(0, 0, 0, 0.15)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, 
                  ${theme.palette.primary.main}, 
                  ${theme.palette.secondary.main})`,
                borderRadius: '4px 4px 0 0'
              }
            }}
          >
            {/* Header */}
            <Box textAlign="center" mb={{ xs: 3, sm: 4 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: { xs: 60, sm: 80 },
                  height: { xs: 60, sm: 80 },
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, 
                    ${theme.palette.primary.main}, 
                    ${theme.palette.primary.dark})`,
                  mb: 2,
                  boxShadow: `0 8px 25px ${theme.palette.primary.main}30`
                }}
              >
                <BuildingIcon 
                  sx={{ 
                    fontSize: { xs: 30, sm: 40 }, 
                    color: 'white' 
                  }} 
                />
              </Box>
              
              <Typography 
                variant={isMobile ? "h5" : "h4"} 
                component="h1" 
                gutterBottom 
                sx={{
                  fontWeight: 700,
                  background: `linear-gradient(135deg, 
                    ${theme.palette.primary.main}, 
                    ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  mb: 1
                }}
              >
                Sistema Municipal
              </Typography>
              
              <Typography 
                variant={isMobile ? "subtitle1" : "h6"} 
                sx={{
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  mb: 0.5
                }}
              >
                COCODE Huehuetenango
              </Typography>
              
              <Typography 
                variant="body2" 
                color="textSecondary"
                sx={{ 
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
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
                size={isMobile ? "medium" : "large"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                placeholder="admin@municipalidad.gob.gt"
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    },
                    '&.Mui-focused': {
                      transform: 'translateY(-1px)',
                      boxShadow: `0 4px 20px ${theme.palette.primary.main}20`
                    }
                  }
                }}
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
                size={isMobile ? "medium" : "large"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        onClick={toggleShowPassword} 
                        edge="end" 
                        disabled={loading}
                        sx={{ 
                          transition: 'transform 0.2s',
                          '&:hover': { transform: 'scale(1.1)' }
                        }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                placeholder="••••••••"
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    },
                    '&.Mui-focused': {
                      transform: 'translateY(-1px)',
                      boxShadow: `0 4px 20px ${theme.palette.primary.main}20`
                    }
                  }
                }}
              />

              {/* Error */}
              <Collapse in={!!error}>
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 2,
                    borderRadius: 2,
                    '& .MuiAlert-message': {
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }
                  }}
                >
                  {error}
                </Alert>
              </Collapse>

              {/* Botón Login */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                sx={{ 
                  mt: 2, 
                  mb: 3, 
                  py: { xs: 1.5, sm: 2 },
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  fontWeight: 700,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, 
                    ${theme.palette.primary.main}, 
                    ${theme.palette.primary.dark})`,
                  boxShadow: `0 6px 20px ${theme.palette.primary.main}40`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 25px ${theme.palette.primary.main}50`,
                    background: `linear-gradient(135deg, 
                      ${theme.palette.primary.dark}, 
                      ${theme.palette.primary.main})`
                  },
                  '&:disabled': {
                    transform: 'none',
                    background: theme.palette.grey[400]
                  }
                }}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Footer con usuarios de prueba */}
            <Box textAlign="center">
              <Button
                variant="text"
                size="small"
                onClick={toggleTestUsers}
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  textTransform: 'none',
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    backgroundColor: 'transparent',
                    color: theme.palette.primary.main
                  }
                }}
              >
                🧪 {showTestUsers ? 'Ocultar' : 'Mostrar'} usuarios de prueba
              </Button>
              
              <Collapse in={showTestUsers}>
                <Box 
                  sx={{ 
                    mt: 2, 
                    p: 2, 
                    borderRadius: 2,
                    backgroundColor: theme.palette.grey[50],
                    border: `1px solid ${theme.palette.grey[200]}`
                  }}
                >
                  <Typography 
                    variant="caption" 
                    color="textSecondary" 
                    display="block"
                    sx={{ 
                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                      lineHeight: 1.4,
                      mb: 1
                    }}
                  >
                    Usuarios de prueba disponibles:
                  </Typography>
                  
                  <Box 
                    sx={{ 
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: { xs: 1, sm: 2 },
                      flexWrap: 'wrap',
                      justifyContent: 'center'
                    }}
                  >
                    {[
                      { role: 'Admin', email: 'admin@municipalidad.gob.gt', pass: 'admin123' },
                      { role: 'Técnico', email: 'energia@municipalidad.gob.gt', pass: 'tecnico123' },
                      { role: 'Líder', email: 'lider@cocode.gt', pass: 'lider123' },
                      { role: 'Ciudadano', email: 'ciudadano@email.com', pass: 'ciudadano123' }
                    ].map((user, index) => (
                      <Paper
                        key={index}
                        elevation={0}
                        sx={{
                          p: 1,
                          backgroundColor: 'white',
                          border: `1px solid ${theme.palette.grey[300]}`,
                          borderRadius: 1,
                          fontSize: { xs: '0.65rem', sm: '0.7rem' },
                          textAlign: 'center',
                          minWidth: { xs: '100%', sm: 'auto' },
                          flex: { sm: 1 }
                        }}
                      >
                        <Typography variant="caption" fontWeight="bold" display="block">
                          {user.role}
                        </Typography>
                        <Typography variant="caption" display="block" sx={{ wordBreak: 'break-all' }}>
                          {user.email}
                        </Typography>
                        <Typography variant="caption" display="block">
                          {user.pass}
                        </Typography>
                      </Paper>
                    ))}
                  </Box>
                </Box>
              </Collapse>
            </Box>
          </Paper>
        </Fade>

        {/* Loading Overlay */}
        {loading && (
          <Fade in={loading}>
            <Box
              position="fixed"
              top={0}
              left={0}
              width="100%"
              height="100%"
              bgcolor="rgba(0, 0, 0, 0.4)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              zIndex={9999}
              sx={{
                backdropFilter: 'blur(4px)'
              }}
            >
              <Paper 
                sx={{ 
                  // Responsive padding for loading overlay
                  p: { xs: 2, sm: 2.5, md: 3 }, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: { xs: 1.5, sm: 2 },
                  // Responsive border radius
                  borderRadius: { xs: 1.5, sm: 2, md: 2.5 },
                  // Responsive minimum width
                  minWidth: { xs: '180px', sm: '220px', md: '250px' },
                  // Responsive max width to prevent overflow on small screens
                  maxWidth: { xs: 'calc(100vw - 32px)', sm: '400px' }
                }}
              >
                <CircularProgress 
                  size={isMobile ? 20 : isTablet ? 22 : 24} 
                />
                <Typography 
                  sx={{ 
                    // Responsive font size for loading text
                    fontSize: { 
                      xs: '0.875rem',   // Móvil: pequeño
                      sm: '1rem',       // Tablet pequeña: medio
                      md: '1.125rem',   // Tablet: medio-grande
                      lg: '1.25rem'     // Desktop: grande
                    }
                  }}
                >
                  Verificando credenciales...
                </Typography>
              </Paper>
            </Box>
          </Fade>
        )}
      </Container>
    </Box>
  );
};

export default LoginForm;