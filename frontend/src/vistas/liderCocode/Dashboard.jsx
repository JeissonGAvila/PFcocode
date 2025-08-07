// frontend/src/vistas/liderCocode/Dashboard.jsx
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
  ListItemButton,
  Chip,
  Paper,
  Divider,
  Avatar,
  Badge,
  Alert,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Group as GroupIcon,
  LocationCity as CityIcon,
  Assignment as ReporteIcon,
  People as PeopleIcon,
  Verified as VerifiedIcon,
  Engineering as EngineeringIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  TrendingUp as TrendingIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Campaign as CampaignIcon,
  Event as EventIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext.jsx';
import LogoutButton from '../../components/common/LogoutButton.jsx';

const DashboardLider = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [openNuevoReporte, setOpenNuevoReporte] = useState(false);
  
  // Estadísticas comunitarias
  const [statsComunitarias, setStatsComunitarias] = useState({
    ciudadanosZona: 245,
    ciudadanosVerificados: 198,
    ciudadanosPendientes: 47,
    reportesZona: 28,
    reportesActivos: 15,
    reportesResueltos: 13,
    reunionesRealizadas: 3,
    proximaReunion: '2025-01-15'
  });

  // Reportes de la zona del líder
  const [reportesZona, setReportesZona] = useState([
    {
      id: 1,
      numero: 'RPT-2025-008',
      titulo: 'Falta de alumbrado público',
      descripcion: 'Varias lámparas fundidas en el parque central',
      ciudadano: 'José Mendoza',
      telefono: '7745-6789',
      direccion: 'Parque Central, Zona 1',
      estado: 'Nuevo',
      prioridad: 'Media',
      tipo: 'Alumbrado Público',
      fechaCreacion: '2025-01-08',
      validadoLider: false
    },
    {
      id: 2,
      numero: 'RPT-2025-009',
      titulo: 'Bache grande en calle principal',
      descripcion: 'Bache que afecta el tránsito vehicular',
      ciudadano: 'María Rodríguez',
      telefono: '7756-7890',
      direccion: '3ra Calle, Zona 1',
      estado: 'Asignado',
      prioridad: 'Alta',
      tipo: 'Infraestructura',
      fechaCreacion: '2025-01-07',
      validadoLider: true,
      tecnicoAsignado: 'Ing. Pedro García'
    }
  ]);

  // Ciudadanos de la zona
  const [ciudadanosZona, setCiudadanosZona] = useState([
    {
      id: 1,
      nombre: 'Carlos Morales',
      correo: 'carlos.morales@email.com',
      telefono: '7712-1234',
      direccion: '1ra Calle 2-15, Zona 1',
      verificado: true,
      reportesCreados: 3,
      fechaRegistro: '2024-12-15'
    },
    {
      id: 2,
      nombre: 'Ana Pérez',
      correo: 'ana.perez@email.com',
      telefono: '7723-2345',
      direccion: '2da Avenida 5-20, Zona 1',
      verificado: false,
      reportesCreados: 1,
      fechaRegistro: '2025-01-05'
    },
    {
      id: 3,
      nombre: 'Luis González',
      correo: 'luis.gonzalez@email.com',
      telefono: '7734-3456',
      direccion: '4ta Calle 8-10, Zona 1',
      verificado: true,
      reportesCreados: 0,
      fechaRegistro: '2024-11-20'
    }
  ]);

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Nuevo': return 'info';
      case 'Asignado': return 'warning';
      case 'En Proceso': return 'primary';
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

  const handleValidarReporte = (reporteId) => {
    setReportesZona(prev => 
      prev.map(reporte => 
        reporte.id === reporteId 
          ? { ...reporte, validadoLider: true }
          : reporte
      )
    );
    console.log(`Reporte ${reporteId} validado por líder`);
  };

  const handleVerificarCiudadano = (ciudadanoId) => {
    setCiudadanosZona(prev => 
      prev.map(ciudadano => 
        ciudadano.id === ciudadanoId 
          ? { ...ciudadano, verificado: true }
          : ciudadano
      )
    );
    console.log(`Ciudadano ${ciudadanoId} verificado`);
  };

  return (
    <Box>
      {/* Header del Panel Líder */}
      <Box 
        bgcolor="success.main" 
        color="white" 
        p={3}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GroupIcon sx={{ fontSize: 40 }} /> Panel Líder COCODE
          </Typography>
          <Typography variant="h6">
            Líder: {user?.nombre}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Zona: <strong>{user?.zona || 'Zona 1 Centro'}</strong> | 
            Cargo: <strong>Presidente COCODE</strong> | {user?.correo}
          </Typography>
        </Box>
        
        <LogoutButton variant="text" />
      </Box>

      {/* Contenido Principal */}
      <Box p={3}>
        {/* Alerta de Responsabilidad Comunitaria */}
        <Alert severity="success" sx={{ mb: 3 }}>
          <strong>👥 Responsabilidad Comunitaria:</strong> Gestionas los reportes y ciudadanos de <strong>{user?.zona || 'tu zona'}</strong>. 
          Coordinas con técnicos y validas reportes comunitarios.
        </Alert>

        {/* Estadísticas Comunitarias */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={3}>
              <CardContent sx={{ textAlign: 'center' }}>
                <PeopleIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" color="primary">
                  {statsComunitarias.ciudadanosZona}
                </Typography>
                <Typography color="textSecondary" variant="body2">
                  Ciudadanos Zona
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={3}>
              <CardContent sx={{ textAlign: 'center' }}>
                <VerifiedIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" color="success.main">
                  {statsComunitarias.ciudadanosVerificados}
                </Typography>
                <Typography color="textSecondary" variant="body2">
                  Verificados
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={3}>
              <CardContent sx={{ textAlign: 'center' }}>
                <ReporteIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" color="warning.main">
                  {statsComunitarias.reportesZona}
                </Typography>
                <Typography color="textSecondary" variant="body2">
                  Reportes Zona
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={3}>
              <CardContent sx={{ textAlign: 'center' }}>
                <EventIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" color="info.main">
                  {statsComunitarias.reunionesRealizadas}
                </Typography>
                <Typography color="textSecondary" variant="body2">
                  Reuniones 2025
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs para organizar contenido */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="📋 Reportes de mi Zona" />
            <Tab label="👥 Ciudadanos" />
            <Tab label="🤝 Coordinación" />
          </Tabs>
        </Paper>

        {/* Tab 1 - Reportes de la Zona */}
        {tabValue === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ReporteIcon color="primary" /> Reportes de {user?.zona || 'mi Zona'}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenNuevoReporte(true)}
                  >
                    Crear Reporte Comunitario
                  </Button>
                </Box>
                <Divider sx={{ mb: 3 }} />
                
                {reportesZona.map((reporte) => (
                  <Card key={reporte.id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Box flex={1}>
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <Typography variant="h6">
                              {reporte.titulo}
                            </Typography>
                            {!reporte.validadoLider && (
                              <Chip label="Pendiente Validación" color="warning" size="small" />
                            )}
                          </Box>
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            #{reporte.numero} | {reporte.fechaCreacion} | {reporte.tipo}
                          </Typography>
                          <Typography variant="body1" gutterBottom>
                            {reporte.descripcion}
                          </Typography>
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <HomeIcon fontSize="small" /> {reporte.direccion}
                          </Typography>
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                            <PhoneIcon fontSize="small" /> {reporte.ciudadano} - {reporte.telefono}
                          </Typography>
                          {reporte.tecnicoAsignado && (
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                              <EngineeringIcon fontSize="small" /> Técnico: {reporte.tecnicoAsignado}
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

                      <Divider sx={{ mb: 2 }} />
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {!reporte.validadoLider && (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<CheckIcon />}
                            onClick={() => handleValidarReporte(reporte.id)}
                          >
                            Validar Reporte
                          </Button>
                        )}
                        
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<ViewIcon />}
                        >
                          Ver Detalles
                        </Button>
                        
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<PhoneIcon />}
                        >
                          Contactar Ciudadano
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Paper>
            </Grid>

            {/* Panel lateral con información comunitaria */}
            <Grid item xs={12} lg={4}>
              <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  📊 Resumen Comunitario
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary">
                    Reportes Activos
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {statsComunitarias.reportesActivos}
                  </Typography>
                </Box>
                
                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary">
                    Reportes Resueltos
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {statsComunitarias.reportesResueltos}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Próxima Reunión
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {statsComunitarias.proximaReunion}
                  </Typography>
                </Box>
              </Paper>

              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  🚀 Acciones Rápidas
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box display="flex" flexDirection="column" gap={1}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<CampaignIcon />}
                  >
                    Convocar Reunión
                  </Button>
                  
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<TrendingIcon />}
                  >
                    Reporte Comunitario
                  </Button>
                  
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<EngineeringIcon />}
                  >
                    Contactar Técnicos
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Tab 2 - Gestión de Ciudadanos */}
        {tabValue === 1 && (
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PeopleIcon color="primary" /> Ciudadanos de {user?.zona || 'mi Zona'}
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={2}>
              {ciudadanosZona.map((ciudadano) => (
                <Grid item xs={12} md={6} lg={4} key={ciudadano.id}>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Avatar sx={{ bgcolor: ciudadano.verificado ? 'success.main' : 'warning.main', mr: 2 }}>
                          {ciudadano.nombre.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Box flex={1}>
                          <Typography variant="h6">
                            {ciudadano.nombre}
                          </Typography>
                          <Chip 
                            label={ciudadano.verificado ? "Verificado" : "Pendiente"}
                            color={ciudadano.verificado ? "success" : "warning"}
                            size="small"
                          />
                        </Box>
                      </Box>
                      
                      <Box mb={2}>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                          <EmailIcon fontSize="small" /> {ciudadano.correo}
                        </Typography>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                          <PhoneIcon fontSize="small" /> {ciudadano.telefono}
                        </Typography>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                          <HomeIcon fontSize="small" /> {ciudadano.direccion}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Reportes: {ciudadano.reportesCreados} | Registro: {ciudadano.fechaRegistro}
                        </Typography>
                      </Box>

                      <Box display="flex" gap={1}>
                        {!ciudadano.verificado && (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<VerifiedIcon />}
                            onClick={() => handleVerificarCiudadano(ciudadano.id)}
                          >
                            Verificar
                          </Button>
                        )}
                        
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<PhoneIcon />}
                        >
                          Contactar
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}

        {/* Tab 3 - Coordinación */}
        {tabValue === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  🤝 Coordinación con Técnicos
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Alert severity="info" sx={{ mb: 2 }}>
                  Facilita el acceso de técnicos a tu zona para resolver reportes
                </Alert>
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <EngineeringIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Técnico de Energía Eléctrica"
                      secondary="2 reportes pendientes en tu zona"
                    />
                    <Button size="small" variant="outlined">
                      Coordinar Visita
                    </Button>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <EngineeringIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Técnico de Infraestructura"
                      secondary="1 reporte urgente - bache en calle principal"
                    />
                    <Button size="small" variant="contained" color="warning">
                      Coordinar Urgente
                    </Button>
                  </ListItem>
                </List>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  📅 Actividades Comunitarias
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <EventIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Reunión Mensual COCODE"
                      secondary="Próxima: 15 de Enero, 6:00 PM"
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <CampaignIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Campaña de Limpieza"
                      secondary="Sábado 20 de Enero, 8:00 AM"
                    />
                  </ListItem>
                </List>

                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  sx={{ mt: 2 }}
                >
                  Planificar Nueva Actividad
                </Button>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Footer Info */}
        <Box mt={4} p={2} bgcolor="success.50" borderRadius={1} border="1px solid" borderColor="success.200">
          <Typography variant="body2" color="textSecondary" textAlign="center">
            👥 <strong>Permisos de Líder COCODE:</strong> Gestionar ciudadanos de {user?.zona || 'tu zona'} | 
            Ver y validar reportes comunitarios | Crear reportes en nombre de ciudadanos | 
            Coordinar con técnicos | Organizar actividades comunitarias |
            <strong> NO puedes:</strong> Ver reportes de otras zonas | Asignar técnicos | Cambiar configuraciones del sistema
          </Typography>
        </Box>
      </Box>

      {/* Dialog para nuevo reporte comunitario */}
      <Dialog open={openNuevoReporte} onClose={() => setOpenNuevoReporte(false)} maxWidth="md" fullWidth>
        <DialogTitle>📝 Crear Reporte Comunitario</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              fullWidth
              label="Título del Problema"
              variant="outlined"
              placeholder="Ej: Falta de alumbrado en parque central"
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Descripción Detallada"
              variant="outlined"
              placeholder="Describe el problema detalladamente..."
            />
            <TextField
              fullWidth
              label="Ubicación/Dirección"
              variant="outlined"
              placeholder="Dirección exacta del problema"
            />
            <TextField
              fullWidth
              label="Ciudadano Reportante (opcional)"
              variant="outlined"
              placeholder="Nombre del ciudadano que reportó"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNuevoReporte(false)}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={() => setOpenNuevoReporte(false)}>
            Crear Reporte
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardLider;