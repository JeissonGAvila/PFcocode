// frontend/src/vistas/tecnico/Dashboard.jsx
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
  Divider,
  LinearProgress,
  Avatar,
  IconButton,
  Tooltip,
  Alert,
  Tab,
  Tabs
} from '@mui/material';
import {
  Engineering as EngineeringIcon,
  Assignment as ReporteIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Upload as UploadIcon,
  Comment as CommentIcon,
  PlayArrow as StartIcon,
  Pause as PauseIcon,
  Done as DoneIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext.jsx';
import LogoutButton from '../../components/common/LogoutButton.jsx';

const DashboardTecnico = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  
  // Estado del técnico
  const [statsPersonales, setStatsPersonales] = useState({
    reportesAsignados: 12,
    reportesEnProceso: 5,
    reportesCompletados: 7,
    reportesUrgentes: 2,
    tiempoPromedioResolucion: '2.3 días',
    eficiencia: 85
  });

  // Reportes filtrados por departamento del técnico
  const [misReportes, setMisReportes] = useState([
    {
      id: 1,
      numero: 'RPT-2025-001',
      titulo: 'Corte de energía en Zona 2',
      descripcion: 'Falta de suministro eléctrico en todo el sector',
      direccion: '5ta Avenida, Zona 2',
      estado: 'Asignado',
      prioridad: 'Alta',
      fechaCreacion: '2025-01-08',
      ciudadano: 'María González',
      telefono: '7712-3456'
    },
    {
      id: 2,
      numero: 'RPT-2025-003',
      titulo: 'Poste de luz caído',
      descripcion: 'Poste eléctrico caído por vientos fuertes',
      direccion: '10ma Calle, Zona 1',
      estado: 'En Proceso',
      prioridad: 'Alta',
      fechaCreacion: '2025-01-07',
      ciudadano: 'Carlos Pérez',
      telefono: '7723-4567'
    },
    {
      id: 3,
      numero: 'RPT-2025-005',
      titulo: 'Transformador con ruido',
      descripcion: 'Transformador hace ruidos extraños',
      direccion: 'Barrio El Centro',
      estado: 'Pendiente Materiales',
      prioridad: 'Media',
      fechaCreacion: '2025-01-06',
      ciudadano: 'Ana López',
      telefono: '7734-5678'
    }
  ]);

  // Herramientas y recursos del técnico
  const [herramientas] = useState([
    { nombre: 'Checklist Energía Eléctrica', icono: '📋', disponible: true },
    { nombre: 'Materiales en Stock', icono: '📦', disponible: true },
    { nombre: 'Mapa de Reportes', icono: '🗺️', disponible: true },
    { nombre: 'Contactos de Emergencia', icono: '📞', disponible: true }
  ]);

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Asignado': return 'info';
      case 'En Proceso': return 'warning';
      case 'Pendiente Materiales': return 'error';
      case 'Resuelto': return 'success';
      default: return 'default';
    }
  };

  const getPrioridadColor = (prioridad) => {
    switch (prioridad) {
      case 'Alta': return 'error';
      case 'Media': return 'warning';
      case 'Baja': return 'success';
      default: return 'default';
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCambiarEstado = (reporteId, nuevoEstado) => {
    setMisReportes(prev => 
      prev.map(reporte => 
        reporte.id === reporteId 
          ? { ...reporte, estado: nuevoEstado }
          : reporte
      )
    );
    console.log(`Cambiando reporte ${reporteId} a ${nuevoEstado}`);
  };

  return (
    <Box>
      {/* Header del Panel Técnico */}
      <Box 
        bgcolor="warning.main" 
        color="white" 
        p={3}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EngineeringIcon sx={{ fontSize: 40 }} /> Panel Técnico
          </Typography>
          <Typography variant="h6">
            Técnico: {user?.nombre}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Departamento: <strong>{user?.departamento || 'No especificado'}</strong> | {user?.correo}
          </Typography>
        </Box>
        
        <LogoutButton variant="text" />
      </Box>

      {/* Contenido Principal */}
      <Box p={3}>
        {/* Alerta de Departamento */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>🔧 Acceso Restringido:</strong> Solo puedes ver y gestionar reportes del departamento de <strong>{user?.departamento}</strong>
        </Alert>

        {/* Estadísticas del Técnico */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2}>
            <Card elevation={3}>
              <CardContent sx={{ textAlign: 'center' }}>
                <ReporteIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" color="primary">
                  {statsPersonales.reportesAsignados}
                </Typography>
                <Typography color="textSecondary" variant="body2">
                  Asignados
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card elevation={3}>
              <CardContent sx={{ textAlign: 'center' }}>
                <ScheduleIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" color="warning.main">
                  {statsPersonales.reportesEnProceso}
                </Typography>
                <Typography color="textSecondary" variant="body2">
                  En Proceso
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card elevation={3}>
              <CardContent sx={{ textAlign: 'center' }}>
                <CheckIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" color="success.main">
                  {statsPersonales.reportesCompletados}
                </Typography>
                <Typography color="textSecondary" variant="body2">
                  Completados
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card elevation={3}>
              <CardContent sx={{ textAlign: 'center' }}>
                <WarningIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" color="error.main">
                  {statsPersonales.reportesUrgentes}
                </Typography>
                <Typography color="textSecondary" variant="body2">
                  Urgentes
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ⏱️ Rendimiento
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Tiempo promedio: {statsPersonales.tiempoPromedioResolucion}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Eficiencia: {statsPersonales.eficiencia}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={statsPersonales.eficiencia} 
                    sx={{ mt: 1 }}
                    color={statsPersonales.eficiencia > 80 ? 'success' : 'warning'}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs para organizar contenido */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} centered>
            <Tab label="📋 Mis Reportes" />
            <Tab label="🛠️ Herramientas" />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {tabValue === 0 && (
          <Grid container spacing={3}>
            {/* Lista de Reportes Asignados */}
            <Grid item xs={12} lg={8}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ReporteIcon color="primary" /> Reportes de {user?.departamento}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {misReportes.map((reporte) => (
                  <Card key={reporte.id} sx={{ mb: 2, border: reporte.prioridad === 'Alta' ? '2px solid #f44336' : '1px solid #e0e0e0' }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Box flex={1}>
                          <Typography variant="h6" gutterBottom>
                            {reporte.titulo}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            #{reporte.numero} | {reporte.fechaCreacion}
                          </Typography>
                          <Typography variant="body1" gutterBottom>
                            {reporte.descripcion}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <LocationIcon fontSize="small" color="action" />
                            <Typography variant="body2">{reporte.direccion}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <PhoneIcon fontSize="small" color="action" />
                            <Typography variant="body2">{reporte.ciudadano} - {reporte.telefono}</Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ ml: 2, textAlign: 'right' }}>
                          <Chip 
                            label={reporte.estado}
                            color={getEstadoColor(reporte.estado)}
                            sx={{ mb: 1, display: 'block' }}
                          />
                          <Chip 
                            label={reporte.prioridad}
                            color={getPrioridadColor(reporte.prioridad)}
                            size="small"
                          />
                        </Box>
                      </Box>

                      {/* Acciones del Reporte */}
                      <Divider sx={{ mb: 2 }} />
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {reporte.estado === 'Asignado' && (
                          <Button
                            size="small"
                            variant="contained"
                            color="warning"
                            startIcon={<StartIcon />}
                            onClick={() => handleCambiarEstado(reporte.id, 'En Proceso')}
                          >
                            Iniciar
                          </Button>
                        )}
                        
                        {reporte.estado === 'En Proceso' && (
                          <>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              startIcon={<DoneIcon />}
                              onClick={() => handleCambiarEstado(reporte.id, 'Resuelto')}
                            >
                              Resolver
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<PauseIcon />}
                              onClick={() => handleCambiarEstado(reporte.id, 'Pendiente Materiales')}
                            >
                              Pendiente Materiales
                            </Button>
                          </>
                        )}

                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<UploadIcon />}
                        >
                          Subir Evidencia
                        </Button>
                        
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<CommentIcon />}
                        >
                          Agregar Comentario
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Paper>
            </Grid>

            {/* Panel de Acciones Rápidas */}
            <Grid item xs={12} lg={4}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  ⚡ Acciones Rápidas
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box display="flex" flexDirection="column" gap={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    startIcon={<ReporteIcon />}
                  >
                    Ver Todos Mis Reportes
                  </Button>
                  
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<UploadIcon />}
                  >
                    Centro de Archivos
                  </Button>
                  
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<LocationIcon />}
                  >
                    Mapa de Reportes
                  </Button>
                  
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<PhoneIcon />}
                  >
                    Contactos de Emergencia
                  </Button>
                </Box>

                {/* Recordatorios */}
                <Box mt={3}>
                  <Typography variant="h6" gutterBottom>
                    📝 Recordatorios
                  </Typography>
                  <Alert severity="warning" sx={{ mb: 1 }}>
                    2 reportes urgentes pendientes
                  </Alert>
                  <Alert severity="info">
                    Reunión técnica: Viernes 10 AM
                  </Alert>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Tab 2 - Herramientas */}
        {tabValue === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  🛠️ Herramientas del Técnico de {user?.departamento}
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2}>
                  {herramientas.map((herramienta, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                      <Card 
                        sx={{ 
                          p: 2, 
                          textAlign: 'center', 
                          cursor: 'pointer',
                          '&:hover': { elevation: 4, transform: 'translateY(-2px)' },
                          transition: 'all 0.2s'
                        }}
                      >
                        <Typography variant="h3" sx={{ mb: 1 }}>
                          {herramienta.icono}
                        </Typography>
                        <Typography variant="h6" gutterBottom>
                          {herramienta.nombre}
                        </Typography>
                        <Chip 
                          label={herramienta.disponible ? "Disponible" : "No Disponible"}
                          color={herramienta.disponible ? "success" : "error"}
                          size="small"
                        />
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Footer Info */}
        <Box mt={4} p={2} bgcolor="warning.50" borderRadius={1} border="1px solid" borderColor="warning.200">
          <Typography variant="body2" color="textSecondary" textAlign="center">
            ⚡ <strong>Permisos de Técnico:</strong> Ver y gestionar reportes de {user?.departamento} | 
            Cambiar estados de reportes | Subir evidencia | Comunicarse con líderes y ciudadanos |
            <strong> NO puedes:</strong> Ver reportes de otros departamentos | Asignar reportes | Gestionar usuarios
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardTecnico;