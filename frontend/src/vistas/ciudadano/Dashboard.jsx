// frontend/src/vistas/ciudadano/Dashboard.jsx
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
  Avatar,
  Alert,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  Badge
} from '@mui/material';
import {
  Person as PersonIcon,
  Add as AddIcon,
  Assignment as ReporteIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Notifications as NotificationsIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingIcon,
  Camera as CameraIcon,
  Send as SendIcon,
  Star as StarIcon,
  ThumbUp as ThumbUpIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext.jsx';
import LogoutButton from '../../components/common/LogoutButton.jsx';

const DashboardCiudadano = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [openNuevoReporte, setOpenNuevoReporte] = useState(false);
  const [openPerfil, setOpenPerfil] = useState(false);
  
  // Estadísticas personales del ciudadano
  const [statsPersonales, setStatsPersonales] = useState({
    reportesCreados: 5,
    reportesActivos: 2,
    reportesResueltos: 3,
    tiempoPromedioRespuesta: '3.2 días',
    satisfaccionPromedio: 4.2,
    puntosParticipacion: 85
  });

  // Reportes del ciudadano
  const [misReportes, setMisReportes] = useState([
    {
      id: 1,
      numero: 'RPT-2025-012',
      titulo: 'Bache en mi calle',
      descripcion: 'Hay un bache grande frente a mi casa que afecta el tránsito',
      direccion: '5ta Calle 8-20, Zona 1',
      estado: 'En Proceso',
      prioridad: 'Media',
      tipo: 'Infraestructura',
      fechaCreacion: '2025-01-05',
      tecnicoAsignado: 'Ing. Pedro García',
      ultimaActualizacion: '2025-01-07',
      progreso: 60,
      comentarios: 3,
      calificacion: null
    },
    {
      id: 2,
      numero: 'RPT-2025-018',
      titulo: 'Falta de alumbrado',
      descripcion: 'No hay luz en el parque cerca de mi casa',
      direccion: 'Parque Las Flores, Zona 1',
      estado: 'Resuelto',
      prioridad: 'Baja',
      tipo: 'Alumbrado Público',
      fechaCreacion: '2024-12-28',
      fechaResolucion: '2025-01-02',
      tecnicoAsignado: 'Téc. Carlos López',
      progreso: 100,
      comentarios: 1,
      calificacion: 5
    },
    {
      id: 3,
      numero: 'RPT-2025-020',
      titulo: 'Problema con drenaje',
      descripcion: 'El drenaje se desborda cuando llueve',
      direccion: '3ra Avenida 12-15, Zona 1',
      estado: 'Nuevo',
      prioridad: 'Alta',
      tipo: 'Drenajes',
      fechaCreacion: '2025-01-08',
      progreso: 10,
      comentarios: 0,
      calificacion: null
    }
  ]);

  // Reportes populares de la zona (solo lectura)
  const [reportesPopulares] = useState([
    { titulo: 'Mejora del parque central', votos: 23, estado: 'En Proceso' },
    { titulo: 'Semáforo en avenida principal', votos: 18, estado: 'Nuevo' },
    { titulo: 'Ampliación de aceras', votos: 15, estado: 'En Revisión' }
  ]);

  // Formulario nuevo reporte
  const [nuevoReporte, setNuevoReporte] = useState({
    titulo: '',
    descripcion: '',
    direccion: '',
    tipo: '',
    prioridad: 'Media'
  });

  const tiposProblema = [
    'Infraestructura',
    'Energía Eléctrica', 
    'Agua Potable',
    'Drenajes',
    'Alumbrado Público',
    'Recolección de Basura',
    'Seguridad',
    'Medio Ambiente'
  ];

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Nuevo': return 'info';
      case 'En Revisión': return 'warning';
      case 'Asignado': return 'primary';
      case 'En Proceso': return 'warning';
      case 'Resuelto': return 'success';
      case 'Cerrado': return 'default';
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

  const getEstadoStep = (estado) => {
    switch (estado) {
      case 'Nuevo': return 0;
      case 'En Revisión': return 1;
      case 'Asignado': return 2;
      case 'En Proceso': return 3;
      case 'Resuelto': return 4;
      default: return 0;
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleNuevoReporteSubmit = () => {
    if (!nuevoReporte.titulo || !nuevoReporte.descripcion || !nuevoReporte.tipo) {
      return;
    }

    const reporte = {
      id: Date.now(),
      numero: `RPT-2025-${String(Date.now()).slice(-3)}`,
      ...nuevoReporte,
      estado: 'Nuevo',
      fechaCreacion: new Date().toISOString().split('T')[0],
      progreso: 5,
      comentarios: 0,
      calificacion: null
    };

    setMisReportes(prev => [reporte, ...prev]);
    setNuevoReporte({ titulo: '', descripcion: '', direccion: '', tipo: '', prioridad: 'Media' });
    setOpenNuevoReporte(false);
    
    // Actualizar estadísticas
    setStatsPersonales(prev => ({
      ...prev,
      reportesCreados: prev.reportesCreados + 1,
      reportesActivos: prev.reportesActivos + 1
    }));
  };

  const handleCalificarServicio = (reporteId, calificacion) => {
    setMisReportes(prev =>
      prev.map(reporte =>
        reporte.id === reporteId
          ? { ...reporte, calificacion }
          : reporte
      )
    );
    console.log(`Reporte ${reporteId} calificado con ${calificacion} estrellas`);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        fontSize="small"
        color={i < rating ? 'warning' : 'disabled'}
      />
    ));
  };

  return (
    <Box>
      {/* Header del Panel Ciudadano */}
      <Box 
        bgcolor="info.main" 
        color="white" 
        p={3}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon sx={{ fontSize: 40 }} /> Panel Ciudadano
          </Typography>
          <Typography variant="h6">
            {user?.nombre}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Zona: <strong>{user?.zona || 'Zona 1 Centro'}</strong> | 
            Participación Activa | {user?.correo}
          </Typography>
        </Box>
        
        <Box display="flex" alignItems="center" gap={2}>
          <Badge badgeContent={2} color="warning">
            <NotificationsIcon />
          </Badge>
          <LogoutButton variant="text" />
        </Box>
      </Box>

      {/* Contenido Principal */}
      <Box p={3}>
        {/* Bienvenida personalizada */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>👋 ¡Hola {user?.nombre?.split(' ')[0]}!</strong> Aquí puedes crear reportes, hacer seguimiento a tus solicitudes y participar activamente en tu comunidad.
        </Alert>

        {/* Estadísticas Personales */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2}>
            <Card elevation={3}>
              <CardContent sx={{ textAlign: 'center' }}>
                <ReporteIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" color="primary">
                  {statsPersonales.reportesCreados}
                </Typography>
                <Typography color="textSecondary" variant="body2">
                  Mis Reportes
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card elevation={3}>
              <CardContent sx={{ textAlign: 'center' }}>
                <ScheduleIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" color="warning.main">
                  {statsPersonales.reportesActivos}
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
                  {statsPersonales.reportesResueltos}
                </Typography>
                <Typography color="textSecondary" variant="body2">
                  Resueltos
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={3}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  ⭐ Satisfacción
                </Typography>
                <Box display="flex" justifyContent="center" mb={1}>
                  {renderStars(Math.floor(statsPersonales.satisfaccionPromedio))}
                </Box>
                <Typography variant="h5" color="warning.main">
                  {statsPersonales.satisfaccionPromedio}/5
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={3}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  🏆 Participación
                </Typography>
                <Typography variant="h4" color="info.main" gutterBottom>
                  {statsPersonales.puntosParticipacion}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={statsPersonales.puntosParticipacion} 
                  color="info"
                />
                <Typography variant="body2" color="textSecondary">
                  Ciudadano Activo
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Botón principal para crear reporte */}
        <Box textAlign="center" mb={4}>
          <Button
            size="large"
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setOpenNuevoReporte(true)}
            sx={{ 
              py: 2, 
              px: 4, 
              fontSize: '1.1rem',
              borderRadius: 3,
              boxShadow: 3
            }}
          >
            ✨ Crear Nuevo Reporte
          </Button>
        </Box>

        {/* Tabs para organizar contenido */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="📋 Mis Reportes" />
            <Tab label="🌟 Reportes Populares" />
            <Tab label="👤 Mi Perfil" />
          </Tabs>
        </Paper>

        {/* Tab 1 - Mis Reportes */}
        {tabValue === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              {misReportes.map((reporte) => (
                <Card key={reporte.id} sx={{ mb: 3, position: 'relative' }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box flex={1}>
                        <Typography variant="h6" gutterBottom>
                          {reporte.titulo}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          #{reporte.numero} | {reporte.fechaCreacion} | {reporte.tipo}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {reporte.descripcion}
                        </Typography>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                          <LocationIcon fontSize="small" /> {reporte.direccion}
                        </Typography>
                        {reporte.tecnicoAsignado && (
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <PersonIcon fontSize="small" /> Técnico: {reporte.tecnicoAsignado}
                          </Typography>
                        )}
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

                    {/* Progreso del reporte */}
                    <Box mb={2}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2">
                          Progreso: {reporte.progreso}%
                        </Typography>
                        {reporte.comentarios > 0 && (
                          <Chip
                            label={`${reporte.comentarios} comentarios`}
                            size="small"
                            icon={<NotificationsIcon />}
                          />
                        )}
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={reporte.progreso} 
                        color={reporte.estado === 'Resuelto' ? 'success' : 'primary'}
                      />
                    </Box>

                    {/* Stepper de estados */}
                    <Box mb={2}>
                      <Stepper activeStep={getEstadoStep(reporte.estado)} alternativeLabel>
                        <Step>
                          <StepLabel>Nuevo</StepLabel>
                        </Step>
                        <Step>
                          <StepLabel>En Revisión</StepLabel>
                        </Step>
                        <Step>
                          <StepLabel>Asignado</StepLabel>
                        </Step>
                        <Step>
                          <StepLabel>En Proceso</StepLabel>
                        </Step>
                        <Step>
                          <StepLabel>Resuelto</StepLabel>
                        </Step>
                      </Stepper>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    {/* Acciones del reporte */}
                    <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ViewIcon />}
                      >
                        Ver Detalles
                      </Button>
                      
                      {reporte.comentarios > 0 && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<NotificationsIcon />}
                          color="warning"
                        >
                          Ver Actualizaciones
                        </Button>
                      )}

                      {reporte.estado === 'Resuelto' && !reporte.calificacion && (
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2">Calificar:</Typography>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <StarIcon
                              key={star}
                              fontSize="small"
                              sx={{ 
                                cursor: 'pointer',
                                color: 'grey.400',
                                '&:hover': { color: 'warning.main' }
                              }}
                              onClick={() => handleCalificarServicio(reporte.id, star)}
                            />
                          ))}
                        </Box>
                      )}

                      {reporte.calificacion && (
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2">Mi calificación:</Typography>
                          {renderStars(reporte.calificacion)}
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}

              {misReportes.length === 0 && (
                <Paper sx={{ p: 6, textAlign: 'center' }}>
                  <ReporteIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    No has creado reportes aún
                  </Typography>
                  <Typography variant="body2" color="textSecondary" mb={3}>
                    ¡Crea tu primer reporte y ayuda a mejorar tu comunidad!
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenNuevoReporte(true)}
                  >
                    Crear Mi Primer Reporte
                  </Button>
                </Paper>
              )}
            </Grid>

            {/* Panel lateral con información */}
            <Grid item xs={12} lg={4}>
              <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  ⚡ Acciones Rápidas
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box display="flex" flexDirection="column" gap={1}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenNuevoReporte(true)}
                  >
                    Nuevo Reporte
                  </Button>
                  
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => setOpenPerfil(true)}
                  >
                    Editar Perfil
                  </Button>
                  
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<NotificationsIcon />}
                  >
                    Mis Notificaciones
                  </Button>
                </Box>
              </Paper>

              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  💡 Consejos
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Sé específico"
                      secondary="Describe detalladamente el problema y su ubicación"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Incluye fotos"
                      secondary="Las imágenes ayudan a resolver más rápido"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Califica el servicio"
                      secondary="Tu opinión nos ayuda a mejorar"
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Tab 2 - Reportes Populares */}
        {tabValue === 1 && (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              <strong>🌟 Reportes Populares de tu Zona:</strong> Estos son los reportes que más apoyo tienen de otros ciudadanos
            </Alert>
            
            <Grid container spacing={2}>
              {reportesPopulares.map((reporte, index) => (
                <Grid item xs={12} md={6} lg={4} key={index}>
                  <Card>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Typography variant="h6" flex={1}>
                          {reporte.titulo}
                        </Typography>
                        <Chip 
                          label={reporte.estado}
                          color={getEstadoColor(reporte.estado)}
                          size="small"
                        />
                      </Box>
                      
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center" gap={1}>
                          <ThumbUpIcon color="primary" fontSize="small" />
                          <Typography variant="body2">
                            {reporte.votos} ciudadanos apoyan
                          </Typography>
                        </Box>
                        
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<ThumbUpIcon />}
                        >
                          Apoyar
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Tab 3 - Mi Perfil */}
        {tabValue === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  👤 Información Personal
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Box display="flex" alignItems="center" mb={3}>
                  <Avatar 
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      bgcolor: 'info.main',
                      fontSize: '2rem',
                      mr: 3
                    }}
                  >
                    {user?.nombre?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </Avatar>
                  <Box>
                    <Typography variant="h5">
                      {user?.nombre}
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      Ciudadano Activo
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Miembro desde: Diciembre 2024
                    </Typography>
                  </Box>
                </Box>

                <List>
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Correo Electrónico"
                      secondary={user?.correo}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <HomeIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Zona de Residencia"
                      secondary={user?.zona || 'Zona 1 Centro'}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <TrendingIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Nivel de Participación"
                      secondary="Ciudadano Activo - 85 puntos"
                    />
                  </ListItem>
                </List>

                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => setOpenPerfil(true)}
                  sx={{ mt: 2 }}
                >
                  Editar Perfil
                </Button>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  📊 Mi Actividad
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Box mb={3}>
                  <Typography variant="body2" color="textSecondary">
                    Tiempo promedio de respuesta
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {statsPersonales.tiempoPromedioRespuesta}
                  </Typography>
                </Box>

                <Box mb={3}>
                  <Typography variant="body2" color="textSecondary" mb={1}>
                    Satisfacción con el servicio
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    {renderStars(Math.floor(statsPersonales.satisfaccionPromedio))}
                    <Typography variant="h6">
                      {statsPersonales.satisfaccionPromedio}/5
                    </Typography>
                  </Box>
                </Box>

                <Alert severity="success">
                  ¡Gracias por ser un ciudadano activo y comprometido con tu comunidad!
                </Alert>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Footer Info */}
        <Box mt={4} p={2} bgcolor="info.50" borderRadius={1} border="1px solid" borderColor="info.200">
          <Typography variant="body2" color="textSecondary" textAlign="center">
            👤 <strong>Permisos de Ciudadano:</strong> Crear y hacer seguimiento a tus reportes | 
            Calificar servicios recibidos | Ver reportes populares de tu zona | Actualizar tu perfil |
            <strong> NO puedes:</strong> Ver reportes de otros ciudadanos | Cambiar estados | Gestionar usuarios | Acceder a configuraciones
          </Typography>
        </Box>
      </Box>

      {/* Dialog para nuevo reporte */}
      <Dialog open={openNuevoReporte} onClose={() => setOpenNuevoReporte(false)} maxWidth="md" fullWidth>
        <DialogTitle>📝 Crear Nuevo Reporte</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              fullWidth
              label="Título del Problema"
              variant="outlined"
              value={nuevoReporte.titulo}
              onChange={(e) => setNuevoReporte(prev => ({ ...prev, titulo: e.target.value }))}
              placeholder="Ej: Bache en mi calle"
            />
            
            <TextField
              fullWidth
              select
              label="Tipo de Problema"
              value={nuevoReporte.tipo}
              onChange={(e) => setNuevoReporte(prev => ({ ...prev, tipo: e.target.value }))}
            >
              {tiposProblema.map((tipo) => (
                <MenuItem key={tipo} value={tipo}>
                  {tipo}
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Descripción Detallada"
              variant="outlined"
              value={nuevoReporte.descripcion}
              onChange={(e) => setNuevoReporte(prev => ({ ...prev, descripcion: e.target.value }))}
              placeholder="Describe el problema detalladamente..."
            />
            
            <TextField
              fullWidth
              label="Ubicación/Dirección"
              variant="outlined"
              value={nuevoReporte.direccion}
              onChange={(e) => setNuevoReporte(prev => ({ ...prev, direccion: e.target.value }))}
              placeholder="Dirección exacta del problema"
            />
            
            <TextField
              fullWidth
              select
              label="Prioridad"
              value={nuevoReporte.prioridad}
              onChange={(e) => setNuevoReporte(prev => ({ ...prev, prioridad: e.target.value }))}
            >
              <MenuItem value="Baja">Baja</MenuItem>
              <MenuItem value="Media">Media</MenuItem>
              <MenuItem value="Alta">Alta</MenuItem>
            </TextField>

            <Box>
              <Button
                variant="outlined"
                startIcon={<CameraIcon />}
                fullWidth
                sx={{ mb: 1 }}
              >
                Agregar Fotos del Problema
              </Button>
              <Typography variant="caption" color="textSecondary">
                Las fotos ayudan a resolver más rápido tu reporte
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNuevoReporte(false)}>
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            onClick={handleNuevoReporteSubmit}
            startIcon={<SendIcon />}
            disabled={!nuevoReporte.titulo || !nuevoReporte.descripcion || !nuevoReporte.tipo}
          >
            Crear Reporte
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para editar perfil */}
      <Dialog open={openPerfil} onClose={() => setOpenPerfil(false)} maxWidth="sm" fullWidth>
        <DialogTitle>✏️ Editar Mi Perfil</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              fullWidth
              label="Nombre Completo"
              variant="outlined"
              defaultValue={user?.nombre}
            />
            
            <TextField
              fullWidth
              label="Correo Electrónico"
              variant="outlined"
              defaultValue={user?.correo}
              disabled
            />
            
            <TextField
              fullWidth
              label="Teléfono"
              variant="outlined"
              placeholder="7712-3456"
            />
            
            <TextField
              fullWidth
              label="Dirección Completa"
              variant="outlined"
              placeholder="5ta Calle 8-20, Zona 1"
            />
            
            <Alert severity="info">
              <strong>Nota:</strong> Los cambios en tu perfil serán revisados por el líder COCODE de tu zona.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPerfil(false)}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={() => setOpenPerfil(false)}>
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardCiudadano;