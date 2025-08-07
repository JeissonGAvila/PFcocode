// frontend/src/vistas/administrador/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Paper,
  Divider
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as ReporteIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext.jsx';
import LogoutButton from '../../components/common/LogoutButton.jsx';

const DashboardAdmin = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalReportes: 156,
    reportesPendientes: 23,
    reportesEnProceso: 31,
    reportesResueltos: 102,
    tecnicosActivos: 8,
    ciudadanosRegistrados: 1247
  });

  // Datos simulados - después conectaremos con la API
  const reportesCriticos = [
    { id: 1, titulo: 'Falta de agua en Zona 3', tipo: 'Agua Potable', prioridad: 'Alta' },
    { id: 2, titulo: 'Poste caído en 5ta Avenida', tipo: 'Energía Eléctrica', prioridad: 'Alta' },
    { id: 3, titulo: 'Drenaje tapado Centro', tipo: 'Drenajes', prioridad: 'Media' }
  ];

  const tecnicosResumen = [
    { nombre: 'Carlos López', departamento: 'Energía Eléctrica', reportes: 8, estado: 'Ocupado' },
    { nombre: 'Ana Morales', departamento: 'Agua Potable', reportes: 5, estado: 'Disponible' },
    { nombre: 'Pedro García', departamento: 'Drenajes', reportes: 12, estado: 'Ocupado' }
  ];

  const getPrioridadColor = (prioridad) => {
    switch (prioridad) {
      case 'Alta': return 'error';
      case 'Media': return 'warning';
      case 'Baja': return 'success';
      default: return 'default';
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Disponible': return 'success';
      case 'Ocupado': return 'warning';
      case 'No Disponible': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      {/* Header del Panel Admin */}
      <Box 
        bgcolor="primary.main" 
        color="white" 
        p={3}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            🔧 Panel Administrador
          </Typography>
          <Typography variant="h6">
            Bienvenido, {user?.nombre}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Control total del sistema municipal | {user?.correo}
          </Typography>
        </Box>
        
        <LogoutButton variant="text" />
      </Box>

      {/* Contenido Principal */}
      <Box p={3}>
        {/* Estadísticas Generales */}
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingIcon /> Estadísticas Generales
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={3}>
              <CardContent sx={{ textAlign: 'center' }}>
                <ReporteIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" color="primary">
                  {stats.totalReportes}
                </Typography>
                <Typography color="textSecondary">
                  Total Reportes
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={3}>
              <CardContent sx={{ textAlign: 'center' }}>
                <ScheduleIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" color="warning.main">
                  {stats.reportesPendientes}
                </Typography>
                <Typography color="textSecondary">
                  Pendientes
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={3}>
              <CardContent sx={{ textAlign: 'center' }}>
                <WarningIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" color="error.main">
                  {stats.reportesEnProceso}
                </Typography>
                <Typography color="textSecondary">
                  En Proceso
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={3}>
              <CardContent sx={{ textAlign: 'center' }}>
                <CheckIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" color="success.main">
                  {stats.reportesResueltos}
                </Typography>
                <Typography color="textSecondary">
                  Resueltos
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Contenido en Dos Columnas */}
        <Grid container spacing={3}>
          {/* Columna Izquierda - Reportes Críticos */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon color="error" /> Reportes Críticos
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List>
                {reportesCriticos.map((reporte) => (
                  <ListItem key={reporte.id} divider>
                    <ListItemIcon>
                      <ReporteIcon color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary={reporte.titulo}
                      secondary={`Tipo: ${reporte.tipo}`}
                    />
                    <Chip 
                      label={reporte.prioridad}
                      color={getPrioridadColor(reporte.prioridad)}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
              
              <Button 
                fullWidth 
                variant="contained" 
                color="primary"
                sx={{ mt: 2 }}
              >
                Ver Todos los Reportes
              </Button>
            </Paper>
          </Grid>

          {/* Columna Derecha - Estado de Técnicos */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PeopleIcon color="primary" /> Estado de Técnicos
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List>
                {tecnicosResumen.map((tecnico, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={tecnico.nombre}
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            Departamento: {tecnico.departamento}
                          </Typography>
                          <Typography variant="body2">
                            Reportes asignados: {tecnico.reportes}
                          </Typography>
                        </Box>
                      }
                    />
                    <Chip 
                      label={tecnico.estado}
                      color={getEstadoColor(tecnico.estado)}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
              
              <Button 
                fullWidth 
                variant="contained" 
                color="secondary"
                sx={{ mt: 2 }}
              >
                Gestionar Técnicos
              </Button>
            </Paper>
          </Grid>
        </Grid>

        {/* Acciones Rápidas */}
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            🚀 Acciones Rápidas
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button 
                fullWidth 
                variant="outlined" 
                startIcon={<ReporteIcon />}
                size="large"
                sx={{ py: 2 }}
              >
                Gestión de Reportes
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button 
                fullWidth 
                variant="outlined" 
                startIcon={<PeopleIcon />}
                size="large"
                sx={{ py: 2 }}
              >
                Gestión de Usuarios
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button 
                fullWidth 
                variant="outlined" 
                startIcon={<SettingsIcon />}
                size="large"
                sx={{ py: 2 }}
              >
                Configuraciones
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button 
                fullWidth 
                variant="outlined" 
                startIcon={<TrendingIcon />}
                size="large"
                sx={{ py: 2 }}
              >
                Reportes y Estadísticas
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Footer Info */}
        <Box mt={4} p={2} bgcolor="grey.100" borderRadius={1}>
          <Typography variant="body2" color="textSecondary" textAlign="center">
            👑 <strong>Permisos de Administrador:</strong> Control total del sistema | 
            Gestión completa de usuarios | Asignación de reportes | 
            Acceso a todas las configuraciones y estadísticas
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardAdmin;