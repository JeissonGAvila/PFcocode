// frontend/src/vistas/administrador/Dashboard.jsx - VERSIÓN COMPLETAMENTE RESPONSIVA
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
  Tabs,
  Tab,
  Alert,
  IconButton,
  Tooltip,
  Badge,
  Stack,
  Container,
  Collapse,
  useTheme,
  useMediaQuery,
  Drawer,
  AppBar,
  Toolbar
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as ReporteIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Engineering as EngineeringIcon,
  Group as GroupIcon,
  LocationCity as LocationIcon,
  AdminPanelSettings as AdminIcon,
  AssignmentTurnedIn as AssignedIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Close as CloseIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext.jsx';
import LogoutButton from '../../components/common/LogoutButton.jsx';
import GestionTecnicos from '../../components/admin/GestionTecnicos.jsx';
import GestionReportes from '../../components/admin/GestionReportes.jsx';
import GestionCiudadanos from '../../components/admin/GestionCiudadanos.jsx';
import GestionLideres from '../../components/admin/GestionLideres.jsx';
import GestionAdministradores from '../../components/admin/GestionAdministradores.jsx';
import GestionZonas from '../../components/admin/GestionZonas.jsx';
import reportesService from '../../services/admin/reportesService.js';

const DashboardAdmin = () => {
  const { user } = useAuth();
  const theme = useTheme();
  
  // Breakpoints responsivos
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  
  // Estados para tabs principales
  const [tabValue, setTabValue] = useState(0);
  
  // Estado para sub-tabs de usuarios
  const [userTabValue, setUserTabValue] = useState(0);
  
  // Estados para UI responsiva
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    critical: !isMobile,
    departments: !isMobile,
    tips: false
  });
  
  // Estados para datos dinámicos
  const [stats, setStats] = useState({
    reportesPendientesAsignacion: 0,
    reportesCriticosSinAsignar: 0,
    reportesAsignados: 0,
    reportesEnProceso: 0,
    tecnicosActivos: 8,
    ciudadanosRegistrados: 1247,
    lideresCocode: 45,
    zonasActivas: 12,
    administradores: 5
  });

  const [reportesCriticos, setReportesCriticos] = useState([]);
  const [departamentosResumen, setDepartamentosResumen] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos del dashboard
  useEffect(() => {
    cargarDatosDashboard();
  }, []);

  // Efecto para manejar el colapso automático en cambios de pantalla
  useEffect(() => {
    setExpandedSections(prev => ({
      ...prev,
      critical: !isMobile,
      departments: !isMobile
    }));
  }, [isMobile]);

  const cargarDatosDashboard = async () => {
    try {
      setLoading(true);
      
      // Obtener estadísticas reales del backend
      const datosResponse = await reportesService.getDatosSelect();
      
      if (datosResponse.success) {
        setStats(prev => ({
          ...prev,
          reportesPendientesAsignacion: datosResponse.estadisticas?.reportes_pendientes_asignacion || 0,
          reportesCriticosSinAsignar: datosResponse.estadisticas?.reportes_criticos_sin_asignar || 0,
          reportesAsignados: datosResponse.estadisticas?.reportes_asignados || 0,
          reportesEnProceso: datosResponse.estadisticas?.reportes_en_proceso || 0
        }));
        
        setDepartamentosResumen(datosResponse.departamentos || []);
      }

      // Obtener reportes críticos
      const reportesResponse = await reportesService.getAll();
      if (reportesResponse.success) {
        const criticos = reportesResponse.reportes
          .filter(r => r.prioridad === 'Alta')
          .slice(0, 5);
        setReportesCriticos(criticos);
      }
      
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    } finally {
      setLoading(false);
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

  // Función para cambiar tabs principales
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (isMobile) {
      setMobileDrawerOpen(false);
    }
  };

  // Función para cambiar sub-tabs de usuarios
  const handleUserTabChange = (event, newValue) => {
    setUserTabValue(newValue);
  };

  // Toggle secciones expandibles (móvil)
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Configuración de tabs principales responsiva
  const mainTabs = [
    { label: isMobile ? "Dashboard" : "Dashboard Principal", icon: <DashboardIcon /> },
    { label: isMobile ? "Reportes" : "Gestión de Reportes", icon: <ReporteIcon /> },
    { label: isMobile ? "Usuarios" : "Gestión de Usuarios", icon: <PeopleIcon /> },
    { label: isMobile ? "Estadísticas" : "Reportes y Estadísticas", icon: <TrendingIcon /> }
  ];

  // Configuración de sub-tabs de usuarios responsiva
  const userTabs = [
    { label: isMobile ? "Admin" : "Administradores", icon: <AdminIcon /> },
    { label: isMobile ? "Técnicos" : "Técnicos", icon: <EngineeringIcon /> },
    { label: isMobile ? "Líderes" : "Líderes COCODE", icon: <GroupIcon /> },
    { label: isMobile ? "Ciudadanos" : "Ciudadanos", icon: <PersonIcon /> },
    { label: isMobile ? "Zonas" : "Zonas", icon: <LocationIcon /> }
  ];

  // Header responsivo
  const HeaderResponsivo = () => (
    <Box 
      bgcolor="primary.main" 
      color="white"
    >
      {/* Móvil Header */}
      {isMobile && (
        <AppBar position="static" color="transparent" elevation={0}>
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileDrawerOpen(true)}
            >
              <MenuIcon />
            </IconButton>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" noWrap>
                Panel Administrador
              </Typography>
            </Box>
            <Badge 
              badgeContent={stats.reportesPendientesAsignacion + stats.reportesCriticosSinAsignar} 
              color="warning"
            >
              <NotificationsIcon />
            </Badge>
          </Toolbar>
        </AppBar>
      )}

      {/* Desktop Header */}
      {!isMobile && (
        <Box p={{ xs: 2, sm: 3 }}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs={12} md={8}>
              <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                <AdminIcon sx={{ fontSize: { xs: 32, md: 40 } }} />
                <Typography variant={{ xs: "h5", md: "h4" }} component="h1">
                  Panel Administrador
                </Typography>
              </Stack>
              
              <Typography variant={{ xs: "subtitle1", md: "h6" }} gutterBottom>
                Bienvenido, {user?.nombre || 'Administrador'}
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, opacity: 0.9 }}>
                <Chip 
                  label="Control Total del Sistema"
                  size="small"
                  sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
                <Chip 
                  label="Gestión Municipal"
                  size="small"
                  sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
                {!isMobile && (
                  <Chip 
                    label={user?.correo}
                    size="small"
                    sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={2} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                <Tooltip title="Reportes pendientes y críticos">
                  <Badge 
                    badgeContent={stats.reportesPendientesAsignacion + stats.reportesCriticosSinAsignar} 
                    color="warning"
                  >
                    <NotificationsIcon />
                  </Badge>
                </Tooltip>
                <IconButton
                  color="inherit"
                  onClick={cargarDatosDashboard}
                  disabled={loading}
                  size={isMobile ? "small" : "medium"}
                >
                  <RefreshIcon />
                </IconButton>
                <LogoutButton variant="text" color="inherit" />
              </Stack>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );

  // Navigation Drawer para móvil
  const NavigationDrawer = () => (
    <Drawer
      anchor="left"
      open={mobileDrawerOpen}
      onClose={() => setMobileDrawerOpen(false)}
      PaperProps={{
        sx: { width: 280 }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Menú Administrador</Typography>
          <IconButton onClick={() => setMobileDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Stack spacing={1}>
          {mainTabs.map((tab, index) => (
            <Button
              key={index}
              fullWidth
              variant={tabValue === index ? "contained" : "text"}
              startIcon={tab.icon}
              onClick={() => handleTabChange(null, index)}
              size="large"
              sx={{ justifyContent: 'flex-start' }}
            >
              {tab.label}
            </Button>
          ))}
        </Stack>

        <Divider sx={{ my: 2 }} />
        
        {/* Estadísticas rápidas en móvil */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Estado Actual
          </Typography>
          <Stack spacing={1}>
            <Chip 
              label={`${stats.reportesPendientesAsignacion} Pendientes`}
              color="warning"
              size="small"
              fullWidth
            />
            <Chip 
              label={`${stats.reportesCriticosSinAsignar} Críticos`}
              color="error"
              size="small"
            />
          </Stack>
        </Box>

        <Divider sx={{ my: 2 }} />
        
        {/* Info del usuario en móvil */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            {user?.nombre}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {user?.correo}
          </Typography>
          <Chip 
            label="Administrador"
            size="small"
            sx={{ mt: 1 }}
            color="primary"
          />
        </Box>
      </Box>
    </Drawer>
  );

  return (
    <Box>
      {/* Header Responsivo */}
      <HeaderResponsivo />
      
      {/* Navigation Drawer para móvil */}
      <NavigationDrawer />

      {/* Contenido Principal */}
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
        {/* Alerta informativa del flujo */}
        <Alert 
          severity="info" 
          sx={{ 
            mb: 3,
            '& .MuiAlert-message': {
              fontSize: { xs: '0.8rem', sm: '0.875rem' }
            }
          }}
        >
          <Typography variant="body2">
            <strong>Flujo Correcto:</strong> Como administrador, asignas reportes que los líderes COCODE ya aprobaron. 
            Los técnicos solo reciben reportes validados por la comunidad.
          </Typography>
        </Alert>

        {/* Sistema de Tabs - Solo desktop */}
        {!isMobile && (
          <Paper sx={{ borderRadius: 2, mb: 3 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              variant={isTablet ? "scrollable" : "fullWidth"}
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  minHeight: { xs: 56, md: 64 },
                  fontSize: { xs: '0.85rem', md: '0.95rem' },
                  fontWeight: 500,
                  px: { xs: 1, md: 3 }
                }
              }}
            >
              {mainTabs.map((tab, index) => (
                <Tab 
                  key={index}
                  label={tab.label} 
                  icon={tab.icon}
                  iconPosition="start"
                />
              ))}
            </Tabs>
          </Paper>
        )}

        {/* TAB 0: Dashboard Principal - COMPLETAMENTE RESPONSIVO */}
        {tabValue === 0 && (
          <Box>
            {/* Estadísticas Específicas de Asignación - Grid Responsivo */}
            <Box 
              display="flex" 
              justifyContent="space-between" 
              alignItems="center" 
              mb={3}
              flexDirection={{ xs: 'column', sm: 'row' }}
              gap={{ xs: 2, sm: 0 }}
            >
              <Typography 
                variant={isMobile ? "h6" : "h5"} 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1
                }}
              >
                <TrendingIcon /> Estadísticas de Asignación
              </Typography>
              
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={cargarDatosDashboard}
                disabled={loading}
                size={isMobile ? "small" : "medium"}
              >
                Actualizar
              </Button>
            </Box>
            
            <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 4 }}>
              <Grid item xs={6} sm={6} md={3}>
                <Card elevation={3} sx={{ height: '100%' }}>
                  <CardContent sx={{ 
                    textAlign: 'center',
                    p: { xs: 1.5, sm: 2, md: 3 },
                    '&:last-child': { pb: { xs: 1.5, sm: 2, md: 3 } }
                  }}>
                    <ScheduleIcon 
                      color="warning" 
                      sx={{ fontSize: { xs: 24, sm: 32, md: 40 }, mb: 1 }} 
                    />
                    <Typography 
                      variant={isMobile ? "h6" : "h4"} 
                      color="warning.main"
                      sx={{ fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2.125rem' } }}
                    >
                      {stats.reportesPendientesAsignacion}
                    </Typography>
                    <Typography 
                      color="textSecondary"
                      variant={isMobile ? "caption" : "body1"}
                      sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem', md: '1rem' } }}
                    >
                      Pendientes Asignación
                    </Typography>
                    <Typography 
                      variant="caption" 
                      color="textSecondary"
                      sx={{ 
                        display: 'block', 
                        mt: 0.5,
                        fontSize: { xs: '0.65rem', sm: '0.75rem' }
                      }}
                    >
                      Aprobados por líderes
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={6} sm={6} md={3}>
                <Card elevation={3} sx={{ height: '100%' }}>
                  <CardContent sx={{ 
                    textAlign: 'center',
                    p: { xs: 1.5, sm: 2, md: 3 },
                    '&:last-child': { pb: { xs: 1.5, sm: 2, md: 3 } }
                  }}>
                    <WarningIcon 
                      color="error" 
                      sx={{ fontSize: { xs: 24, sm: 32, md: 40 }, mb: 1 }} 
                    />
                    <Typography 
                      variant={isMobile ? "h6" : "h4"} 
                      color="error.main"
                      sx={{ fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2.125rem' } }}
                    >
                      {stats.reportesCriticosSinAsignar}
                    </Typography>
                    <Typography 
                      color="textSecondary"
                      variant={isMobile ? "caption" : "body1"}
                      sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem', md: '1rem' } }}
                    >
                      Críticos Sin Asignar
                    </Typography>
                    <Typography 
                      variant="caption" 
                      color="error"
                      sx={{ 
                        display: 'block', 
                        mt: 0.5,
                        fontSize: { xs: '0.65rem', sm: '0.75rem' }
                      }}
                    >
                      Requieren atención inmediata
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={6} sm={6} md={3}>
                <Card elevation={3} sx={{ height: '100%' }}>
                  <CardContent sx={{ 
                    textAlign: 'center',
                    p: { xs: 1.5, sm: 2, md: 3 },
                    '&:last-child': { pb: { xs: 1.5, sm: 2, md: 3 } }
                  }}>
                    <AssignedIcon 
                      color="primary" 
                      sx={{ fontSize: { xs: 24, sm: 32, md: 40 }, mb: 1 }} 
                    />
                    <Typography 
                      variant={isMobile ? "h6" : "h4"} 
                      color="primary.main"
                      sx={{ fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2.125rem' } }}
                    >
                      {stats.reportesAsignados}
                    </Typography>
                    <Typography 
                      color="textSecondary"
                      variant={isMobile ? "caption" : "body1"}
                      sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem', md: '1rem' } }}
                    >
                      Asignados
                    </Typography>
                    <Typography 
                      variant="caption" 
                      color="textSecondary"
                      sx={{ 
                        display: 'block', 
                        mt: 0.5,
                        fontSize: { xs: '0.65rem', sm: '0.75rem' }
                      }}
                    >
                      En cola de técnicos
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={6} sm={6} md={3}>
                <Card elevation={3} sx={{ height: '100%' }}>
                  <CardContent sx={{ 
                    textAlign: 'center',
                    p: { xs: 1.5, sm: 2, md: 3 },
                    '&:last-child': { pb: { xs: 1.5, sm: 2, md: 3 } }
                  }}>
                    <CheckIcon 
                      color="success" 
                      sx={{ fontSize: { xs: 24, sm: 32, md: 40 }, mb: 1 }} 
                    />
                    <Typography 
                      variant={isMobile ? "h6" : "h4"} 
                      color="success.main"
                      sx={{ fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2.125rem' } }}
                    >
                      {stats.reportesEnProceso}
                    </Typography>
                    <Typography 
                      color="textSecondary"
                      variant={isMobile ? "caption" : "body1"}
                      sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem', md: '1rem' } }}
                    >
                      En Proceso
                    </Typography>
                    <Typography 
                      variant="caption" 
                      color="textSecondary"
                      sx={{ 
                        display: 'block', 
                        mt: 0.5,
                        fontSize: { xs: '0.65rem', sm: '0.75rem' }
                      }}
                    >
                      Técnicos trabajando
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Reportes Críticos y Resumen Departamentos - Responsivo */}
            <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 4 }}>
              <Grid item xs={12} lg={6}>
                <Paper elevation={3} sx={{ height: '100%' }}>
                  <Box
                    sx={{
                      p: { xs: 2, sm: 3 },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: { xs: 'pointer', lg: 'default' }
                    }}
                    onClick={isMobile ? () => toggleSection('critical') : undefined}
                  >
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        fontSize: { xs: '1rem', sm: '1.25rem' }
                      }}
                    >
                      <WarningIcon color="error" /> Reportes Críticos Pendientes
                    </Typography>
                    {isMobile && (
                      <IconButton size="small">
                        {expandedSections.critical ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    )}
                  </Box>
                  <Divider />
                  <Collapse in={expandedSections.critical}>
                    <Box sx={{ p: { xs: 2, sm: 3 }, pt: 2 }}>
                      {reportesCriticos.length > 0 ? (
                        <List dense={isMobile}>
                          {reportesCriticos.map((reporte) => (
                            <ListItem 
                              key={reporte.id}
                              sx={{ 
                                px: 0,
                                py: { xs: 1, sm: 1.5 },
                                flexDirection: { xs: 'column', sm: 'row' },
                                alignItems: { xs: 'flex-start', sm: 'center' },
                                gap: { xs: 1, sm: 0 }
                              }}
                            >
                              <ListItemIcon sx={{ minWidth: { xs: 32, sm: 56 } }}>
                                <ReporteIcon color="error" />
                              </ListItemIcon>
                              <ListItemText
                                primary={isMobile && reporte.titulo.length > 40 ? 
                                  `${reporte.titulo.substring(0, 40)}...` : 
                                  reporte.titulo
                                }
                                secondary={`${reporte.tipo_problema} - ${reporte.zona} - Aprobado por líder`}
                                sx={{
                                  '& .MuiListItemText-primary': {
                                    fontSize: { xs: '0.9rem', sm: '1rem' }
                                  },
                                  '& .MuiListItemText-secondary': {
                                    fontSize: { xs: '0.8rem', sm: '0.875rem' }
                                  }
                                }}
                              />
                              <Chip 
                                label={reporte.prioridad} 
                                color={getPrioridadColor(reporte.prioridad)} 
                                size="small"
                                sx={{ alignSelf: { xs: 'flex-end', sm: 'center' } }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Typography 
                          variant="body2" 
                          color="textSecondary" 
                          textAlign="center" 
                          py={2}
                        >
                          Cargando información de departamentos...
                        </Typography>
                      )}
                    </Box>
                  </Collapse>
                </Paper>
              </Grid>
            </Grid>

            {/* Acciones Rápidas - Grid Responsivo */}
            <Box 
              display="flex" 
              justifyContent="space-between" 
              alignItems="center" 
              mb={3}
              flexDirection={{ xs: 'column', sm: 'row' }}
              gap={{ xs: 2, sm: 0 }}
            >
              <Typography 
                variant="h6" 
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
              >
                Acciones Rápidas
              </Typography>
            </Box>
            
            <Grid container spacing={{ xs: 2, sm: 2 }}>
              <Grid item xs={12} sm={6} lg={3}>
                <Button 
                  fullWidth 
                  variant="contained" 
                  startIcon={<ReporteIcon />}
                  size={isMobile ? "large" : "large"}
                  sx={{ 
                    py: { xs: 1.5, sm: 2 },
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    flexDirection: 'column',
                    gap: 1,
                    minHeight: { xs: 80, sm: 64 }
                  }}
                  onClick={() => setTabValue(1)}
                  color="warning"
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ReporteIcon />
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.85rem', sm: '1rem' } }}>
                      {isMobile ? "Asignar" : "Asignar Reportes"}
                    </Typography>
                  </Box>
                  {stats.reportesPendientesAsignacion > 0 && (
                    <Chip 
                      label={`${stats.reportesPendientesAsignacion} pendientes`} 
                      size="small" 
                      sx={{ 
                        bgcolor: 'white', 
                        color: 'warning.main',
                        fontSize: '0.7rem',
                        height: 20
                      }}
                    />
                  )}
                </Button>
              </Grid>
              
              <Grid item xs={12} sm={6} lg={3}>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  startIcon={<PeopleIcon />}
                  size={isMobile ? "large" : "large"}
                  sx={{ 
                    py: { xs: 1.5, sm: 2 },
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    minHeight: { xs: 80, sm: 64 }
                  }}
                  onClick={() => setTabValue(2)}
                >
                  {isMobile ? "Gestión Usuarios" : "Gestión de Usuarios"}
                </Button>
              </Grid>
              
              <Grid item xs={12} sm={6} lg={3}>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  startIcon={<SettingsIcon />}
                  size={isMobile ? "large" : "large"}
                  sx={{ 
                    py: { xs: 1.5, sm: 2 },
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    minHeight: { xs: 80, sm: 64 }
                  }}
                >
                  Configuraciones
                </Button>
              </Grid>
              
              <Grid item xs={12} sm={6} lg={3}>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  startIcon={<TrendingIcon />}
                  size={isMobile ? "large" : "large"}
                  sx={{ 
                    py: { xs: 1.5, sm: 2 },
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    minHeight: { xs: 80, sm: 64 }
                  }}
                  onClick={() => setTabValue(3)}
                >
                  {isMobile ? "Estadísticas" : "Reportes y Estadísticas"}
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* TAB 1: Gestión de Reportes */}
        {tabValue === 1 && (
          <Box>
            <Typography variant={isMobile ? "h6" : "h5"} gutterBottom>
              Gestión de Reportes
            </Typography>
            <GestionReportes />
          </Box>
        )}

        {/* TAB 2: Gestión de Usuarios - COMPLETAMENTE RESPONSIVO */}
        {tabValue === 2 && (
          <Box>
            <Typography 
              variant={isMobile ? "h6" : "h5"} 
              gutterBottom
            >
              Gestión de Usuarios
            </Typography>
            
            {/* Sub-Tabs para diferentes tipos de usuarios - Responsivo */}
            <Paper elevation={2} sx={{ mb: 3 }}>
              <Tabs 
                value={userTabValue} 
                onChange={handleUserTabChange}
                variant={isMobile ? "scrollable" : "fullWidth"}
                scrollButtons={isMobile ? "auto" : false}
                allowScrollButtonsMobile={isMobile}
                sx={{
                  '& .MuiTab-root': {
                    minHeight: { xs: 48, sm: 56 },
                    fontSize: { xs: '0.75rem', sm: '0.9rem' },
                    minWidth: { xs: 80, sm: 'auto' },
                    px: { xs: 1, sm: 2 }
                  },
                  '& .MuiTabs-scrollButtons': {
                    color: 'primary.main'
                  }
                }}
              >
                {userTabs.map((tab, index) => (
                  <Tab 
                    key={index}
                    label={tab.label} 
                    icon={tab.icon} 
                    iconPosition={isMobile ? "top" : "start"}
                  />
                ))}
              </Tabs>
            </Paper>

            {/* Contenido de las Sub-Tabs */}
            
            {/* Sub-Tab 0: Administradores */}
            {userTabValue === 0 && (
              <GestionAdministradores />
            )}
            
            {/* Sub-Tab 1: Técnicos */}
            {userTabValue === 1 && (
              <Paper elevation={3}>
                <Box p={{ xs: 2, sm: 3 }}>
                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      fontSize: { xs: '1rem', sm: '1.25rem' }
                    }}
                  >
                    <EngineeringIcon /> Gestión de Técnicos
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="textSecondary" 
                    sx={{ mb: 2 }}
                  >
                    Administrar técnicos por departamento (Energía, Agua, Drenajes, etc.)
                  </Typography>
                  
                  {/* Estadísticas rápidas de técnicos - Responsivo */}
                  <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 3 }}>
                    <Grid item xs={6} sm={6} md={4}>
                      <Card elevation={1}>
                        <CardContent sx={{ 
                          textAlign: 'center',
                          p: { xs: 1.5, sm: 2 },
                          '&:last-child': { pb: { xs: 1.5, sm: 2 } }
                        }}>
                          <Typography 
                            variant={isMobile ? "h6" : "h5"} 
                            color="primary"
                          >
                            {stats.tecnicosActivos}
                          </Typography>
                          <Typography 
                            variant={isMobile ? "caption" : "body2"}
                          >
                            Técnicos Activos
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6} sm={6} md={4}>
                      <Card elevation={1}>
                        <CardContent sx={{ 
                          textAlign: 'center',
                          p: { xs: 1.5, sm: 2 },
                          '&:last-child': { pb: { xs: 1.5, sm: 2 } }
                        }}>
                          <Typography 
                            variant={isMobile ? "h6" : "h5"} 
                            color="success.main"
                          >
                            {departamentosResumen.length}
                          </Typography>
                          <Typography 
                            variant={isMobile ? "caption" : "body2"}
                          >
                            Departamentos
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                  
                  <GestionTecnicos />
                </Box>
              </Paper>
            )}
            
            {/* Sub-Tab 2: Líderes COCODE */}
            {userTabValue === 2 && (
              <GestionLideres />
            )}
            
            {/* Sub-Tab 3: Ciudadanos */}
            {userTabValue === 3 && (
              <GestionCiudadanos />
            )}
            
            {/* Sub-Tab 4: Zonas */}
            {userTabValue === 4 && (
              <GestionZonas />
            )}
          </Box>
        )}

        {/* TAB 3: Reportes y Estadísticas - RESPONSIVO */}
        {tabValue === 3 && (
          <Box>
            <Typography 
              variant={isMobile ? "h6" : "h5"} 
              gutterBottom
            >
              Reportes y Estadísticas
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 3,
                fontSize: { xs: '0.9rem', sm: '1rem' }
              }}
            >
              <strong>Funcionalidades disponibles:</strong> Generar reportes ejecutivos, exportar datos a Excel/PDF, métricas de rendimiento y análisis de zonas.
            </Typography>
            
            {/* Vista previa de estadísticas - Responsivo */}
            <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ height: '100%' }}>
                  <Box sx={{ p: { xs: 2, sm: 3 } }}>
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                    >
                      Métricas de Asignación
                    </Typography>
                    <List dense={isMobile}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText
                          primary="Tiempo promedio de asignación"
                          secondary="4.2 horas"
                          sx={{
                            '& .MuiListItemText-primary': {
                              fontSize: { xs: '0.9rem', sm: '1rem' }
                            },
                            '& .MuiListItemText-secondary': {
                              fontSize: { xs: '0.8rem', sm: '0.875rem' }
                            }
                          }}
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText
                          primary="Reportes asignados hoy"
                          secondary={`${stats.reportesAsignados} reportes`}
                          sx={{
                            '& .MuiListItemText-primary': {
                              fontSize: { xs: '0.9rem', sm: '1rem' }
                            },
                            '& .MuiListItemText-secondary': {
                              fontSize: { xs: '0.8rem', sm: '0.875rem' }
                            }
                          }}
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText
                          primary="Eficiencia de asignación"
                          secondary="92.1%"
                          sx={{
                            '& .MuiListItemText-primary': {
                              fontSize: { xs: '0.9rem', sm: '1rem' }
                            },
                            '& .MuiListItemText-secondary': {
                              fontSize: { xs: '0.8rem', sm: '0.875rem' }
                            }
                          }}
                        />
                      </ListItem>
                    </List>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ height: '100%' }}>
                  <Box sx={{ p: { xs: 2, sm: 3 } }}>
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                    >
                      Análisis por Departamentos
                    </Typography>
                    <List dense={isMobile}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText
                          primary="Departamento más solicitado"
                          secondary="Energía Eléctrica - 45%"
                          sx={{
                            '& .MuiListItemText-primary': {
                              fontSize: { xs: '0.9rem', sm: '1rem' }
                            },
                            '& .MuiListItemText-secondary': {
                              fontSize: { xs: '0.8rem', sm: '0.875rem' }
                            }
                          }}
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText
                          primary="Departamento con mejor tiempo"
                          secondary="Agua Potable - 2.1 días promedio"
                          sx={{
                            '& .MuiListItemText-primary': {
                              fontSize: { xs: '0.9rem', sm: '1rem' }
                            },
                            '& .MuiListItemText-secondary': {
                              fontSize: { xs: '0.8rem', sm: '0.875rem' }
                            }
                          }}
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText
                          primary="Reportes críticos resueltos"
                          secondary="85% en menos de 24 horas"
                          sx={{
                            '& .MuiListItemText-primary': {
                              fontSize: { xs: '0.9rem', sm: '1rem' }
                            },
                            '& .MuiListItemText-secondary': {
                              fontSize: { xs: '0.8rem', sm: '0.875rem' }
                            }
                          }}
                        />
                      </ListItem>
                    </List>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
            
            <Paper elevation={3} sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
              <TrendingIcon sx={{ 
                fontSize: { xs: 60, sm: 80 }, 
                color: 'grey.400', 
                mb: 2 
              }} />
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
              >
                Analytics y Reportes Avanzados
              </Typography>
              <Typography 
                variant="body2" 
                color="textSecondary" 
                sx={{ 
                  mb: 3,
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  maxWidth: 600,
                  mx: 'auto'
                }}
              >
                Próximamente implementaremos gráficos interactivos, exportación a Excel/PDF y métricas avanzadas con charts y dashboards dinámicos
              </Typography>
              <Button 
                variant="outlined" 
                disabled
                size={isMobile ? "small" : "medium"}
              >
                En desarrollo
              </Button>
            </Paper>
          </Box>
        )}
      </Container>

      {/* Footer Info - Responsivo */}
      <Box 
        mt={4} 
        p={{ xs: 2, sm: 2 }} 
        bgcolor="primary.50" 
        borderRadius={1} 
        border="1px solid" 
        borderColor="primary.200"
        mx={{ xs: 2, sm: 0 }}
      >
        <Typography 
          variant="body2" 
          color="textSecondary" 
          textAlign="center"
          sx={{ 
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            lineHeight: { xs: 1.4, sm: 1.43 }
          }}
        >
          <strong>Permisos de Administrador:</strong> Asignación de reportes aprobados por líderes | 
          Gestión completa de usuarios | Control de departamentos técnicos | 
          Acceso a todas las configuraciones y estadísticas
        </Typography>
      </Box>
    </Box>
  );
};

export default DashboardAdmin; 