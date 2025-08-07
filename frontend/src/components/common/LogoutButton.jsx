// frontend/src/components/common/LogoutButton.jsx
import React, { useState } from 'react';
import {
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  CircularProgress
} from '@mui/material';
import {
  Logout as LogoutIcon,
  ExitToApp as ExitIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext.jsx';

const LogoutButton = ({ variant = 'button', showConfirmation = true }) => {
  const { logout, userName } = useAuth();
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogoutClick = () => {
    if (showConfirmation) {
      setOpenDialog(true);
    } else {
      performLogout();
    }
  };

  const performLogout = async () => {
    try {
      setLoading(true);
      await logout();
      // El contexto ya maneja la redirección
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Incluso si hay error, el contexto limpia los datos locales
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmLogout = () => {
    setOpenDialog(false);
    performLogout();
  };

  const handleCancelLogout = () => {
    setOpenDialog(false);
  };

  // Renderizar según la variante
  const renderButton = () => {
    if (variant === 'icon') {
      return (
        <IconButton
          onClick={handleLogoutClick}
          disabled={loading}
          color="inherit"
          title="Cerrar Sesión"
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : <LogoutIcon />}
        </IconButton>
      );
    }

    if (variant === 'text') {
      return (
        <Button
          onClick={handleLogoutClick}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <ExitIcon />}
          color="inherit"
          sx={{ textTransform: 'none' }}
        >
          {loading ? 'Cerrando...' : 'Cerrar Sesión'}
        </Button>
      );
    }

    // variant === 'button' (default)
    return (
      <Button
        onClick={handleLogoutClick}
        disabled={loading}
        variant="outlined"
        color="error"
        startIcon={loading ? <CircularProgress size={20} /> : <LogoutIcon />}
        sx={{ textTransform: 'none' }}
      >
        {loading ? 'Cerrando Sesión...' : 'Cerrar Sesión'}
      </Button>
    );
  };

  return (
    <>
      {renderButton()}

      {/* Dialog de confirmación */}
      <Dialog
        open={openDialog}
        onClose={handleCancelLogout}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          🚪 Cerrar Sesión
        </DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro que deseas cerrar la sesión?
          </Typography>
          {userName && (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Usuario actual: <strong>{userName}</strong>
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelLogout} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmLogout}
            disabled={loading}
            color="error"
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <LogoutIcon />}
          >
            {loading ? 'Cerrando...' : 'Cerrar Sesión'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LogoutButton;