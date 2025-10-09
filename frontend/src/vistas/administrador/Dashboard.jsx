// frontend/src/vistas/administrador/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button, List, ListItem,
  ListItemText, ListItemIcon, Chip, Paper, Divider, Tabs, Tab, Alert,
  IconButton, Tooltip, Badge, Stack, Container, Collapse, useTheme,
  useMediaQuery, Drawer, AppBar, Toolbar
} from '@mui/material';
import {
  Dashboard as DashboardIcon, Assignment as ReporteIcon, People as PeopleIcon,
  Settings as SettingsIcon, TrendingUp as TrendingIcon, Warning as WarningIcon,
  CheckCircle as CheckIcon, Schedule as ScheduleIcon, Person as PersonIcon,
  Engineering as EngineeringIcon, Group as GroupIcon, LocationCity as LocationIcon,
  AdminPanelSettings as AdminIcon, AssignmentTurnedIn as AssignedIcon,
  ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon, Close as CloseIcon,
  Menu as MenuIcon, Notifications as NotificationsIcon, Refresh as RefreshIcon,
  Map as MapIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext.jsx';
import LogoutButton from '../../components/common/LogoutButton.jsx';
import GestionTecnicos from '../../components/admin/GestionTecnicos.jsx';
import GestionReportes from '../../components/admin/GestionReportes.jsx';
import GestionCiudadanos from '../../components/admin/GestionCiudadanos.jsx';
import GestionLideres from '../../components/admin/GestionLideres.jsx';
import GestionAdministradores from '../../components/admin/GestionAdministradores.jsx';
import GestionZonas from '../../components/admin/GestionZonas.jsx';
import GestionCocode from '../../components/admin/GestionCocode.jsx';
import GestionSubcocode from '../../components/admin/GestionSubcocode.jsx';
import reportesService from '../../services/admin/reportesService.js';

const DashboardAdmin = () => {
  const { user } = useAuth();
  const theme = useTheme();
  
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
  
  const [tabValue, setTabValue] = useState(0);
  const [userTabValue, setUserTabValue] = useState(0);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    critical: !isMobile,
    departments: !isMobile,
    tips: false
  });
  
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

  useEffect(() => {
    cargarDatosDashboard();
  }, []);

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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (isMobile) {
      setMobileDrawerOpen(false);
    }
  };

  const handleUserTabChange = (event, newValue) => {
    setUserTabValue(newValue);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const mainTabs = [
    { label: isMobile ? "Dashboard" : "Dashboard Principal", icon: <DashboardIcon /> },
    { label: isMobile ? "Reportes" : "Gestión de Reportes", icon: <ReporteIcon /> },
    { label: isMobile ? "Usuarios" : "Gestión de Usuarios", icon: <PeopleIcon /> },
    { label: isMobile ? "Zonas" : "Gestión de Zonas", icon: <MapIcon /> },
    { label: isMobile ? "COCODEs" : "Gestión de COCODEs", icon: <LocationIcon /> },
    { label: isMobile ? "Sectores" : "Gestión de Sectores", icon: <LocationIcon /> },
    { label: isMobile ? "Estadísticas" : "Reportes y Estadísticas", icon: <TrendingIcon /> }
  ];

  const userTabs = [
    { label: isMobile ? "Admin" : "Administradores", icon: <AdminIcon /> },
    { label: isMobile ? "Técnicos" : "Técnicos", icon: <EngineeringIcon /> },
    { label: isMobile ? "Líderes" : "Líderes COCODE", icon: <GroupIcon /> },
    { label: isMobile ? "Ciudadanos" : "Ciudadanos", icon: <PersonIcon /> }
  ];

  const HeaderResponsivo = () => (
    <Box bgcolor="primary.main" color="white">
      {isMobile && (
        <AppBar position="static" color="transparent" elevation={0}>
          <Toolbar>
            <IconButton color="inherit" edge="start" onClick={() => setMobileDrawerOpen(true)}>
              <MenuIcon />
            </IconButton>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" noWrap>Panel Administrador</Typography>
            </Box>
            <Badge badgeContent={stats.reportesPendientesAsignacion + stats.reportesCriticosSinAsignar} color="warning">
              <NotificationsIcon />
            </Badge>
          </Toolbar>
        </AppBar>
      )}

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
                <Chip label="Control Total del Sistema" size="small" sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                <Chip label="Gestión Municipal" size="small" sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                {!isMobile && (
                  <Chip label={user?.correo} size="small" sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={2} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                <Tooltip title="Reportes pendientes y críticos">
                  <Badge badgeContent={stats.reportesPendientesAsignacion + stats.reportesCriticosSinAsignar} color="warning">
                    <NotificationsIcon />
                  </Badge>
                </Tooltip>
                <IconButton color="inherit" onClick={cargarDatosDashboard} disabled={loading} size={isMobile ? "small" : "medium"}>
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

  const NavigationDrawer = () => (
    <Drawer anchor="left" open={mobileDrawerOpen} onClose={() => setMobileDrawerOpen(false)} PaperProps={{ sx: { width: 280 } }}>
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
        
        <Box>
          <Typography variant="subtitle2" gutterBottom>Estado Actual</Typography>
          <Stack spacing={1}>
            <Chip label={`${stats.reportesPendientesAsignacion} Pendientes`} color="warning" size="small" />
            <Chip label={`${stats.reportesCriticosSinAsignar} Críticos`} color="error" size="small" />
          </Stack>
        </Box>

        <Divider sx={{ my: 2 }} />
        
        <Box>
          <Typography variant="subtitle2" gutterBottom>{user?.nombre}</Typography>
          <Typography variant="body2" color="textSecondary">{user?.correo}</Typography>
          <Chip label="Administrador" size="small" sx={{ mt: 1 }} color="primary" />
        </Box>
      </Box>
    </Drawer>
  );

  return (
    <Box>
      <HeaderResponsivo />
      <NavigationDrawer />

      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
        <Alert severity="info" sx={{ mb: 3, '& .MuiAlert-message': { fontSize: { xs: '0.8rem', sm: '0.875rem' } } }}>
          <Typography variant="body2">
            <strong>Flujo Correcto:</strong> Como administrador, asignas reportes que los líderes COCODE ya aprobaron. 
            Los técnicos solo reciben reportes validados por la comunidad.
          </Typography>
        </Alert>

        {!isMobile && (
          <Paper sx={{ borderRadius: 2, mb: 3 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              variant={isTablet ? "scrollable" : "fullWidth"}
              scrollButtons="auto"
              sx={{ '& .MuiTab-root': { minHeight: { xs: 56, md: 64 }, fontSize: { xs: '0.75rem', md: '0.85rem' }, fontWeight: 500, px: { xs: 1, md: 2 } } }}
            >
              {mainTabs.map((tab, index) => (
                <Tab key={index} label={tab.label} icon={tab.icon} iconPosition="start" />
              ))}
            </Tabs>
          </Paper>
        )}

        {/* TAB 0: Dashboard Principal */}
        {tabValue === 0 && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexDirection={{ xs: 'column', sm: 'row' }} gap={{ xs: 2, sm: 0 }}>
              <Typography variant={isMobile ? "h6" : "h5"} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingIcon /> Estadísticas de Asignación
              </Typography>
              
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={cargarDatosDashboard} disabled={loading} size={isMobile ? "small" : "medium"}>
                Actualizar
              </Button>
            </Box>
            
            <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 4 }}>
              <Grid item xs={6} sm={6} md={3}>
                <Card elevation={3} sx={{ height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center', p: { xs: 1.5, sm: 2, md: 3 }, '&:last-child': { pb: { xs: 1.5, sm: 2, md: 3 } } }}>
                    <ScheduleIcon color="warning" sx={{ fontSize: { xs: 24, sm: 32, md: 40 }, mb: 1 }} />
                    <Typography variant={isMobile ? "h6" : "h4"} color="warning.main" sx={{ fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2.125rem' } }}>
                      {stats.reportesPendientesAsignacion}
                    </Typography>
                    <Typography color="textSecondary" variant={isMobile ? "caption" : "body1"} sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem', md: '1rem' } }}>
                      Pendientes Asignación
                    </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                      Aprobados por líderes
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={6} sm={6} md={3}>
                <Card elevation={3} sx={{ height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center', p: { xs: 1.5, sm: 2, md: 3 }, '&:last-child': { pb: { xs: 1.5, sm: 2, md: 3 } } }}>
                    <WarningIcon color="error" sx={{ fontSize: { xs: 24, sm: 32, md: 40 }, mb: 1 }} />
                    <Typography variant={isMobile ? "h6" : "h4"} color="error.main" sx={{ fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2.125rem' } }}>
                      {stats.reportesCriticosSinAsignar}
                    </Typography>
                    <Typography color="textSecondary" variant={isMobile ? "caption" : "body1"} sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem', md: '1rem' } }}>
                      Críticos Sin Asignar
                    </Typography>
                    <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                      Requieren atención inmediata
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={6} sm={6} md={3}>
                <Card elevation={3} sx={{ height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center', p: { xs: 1.5, sm: 2, md: 3 }, '&:last-child': { pb: { xs: 1.5, sm: 2, md: 3 } } }}>
                    <AssignedIcon color="primary" sx={{ fontSize: { xs: 24, sm: 32, md: 40 }, mb: 1 }} />
                    <Typography variant={isMobile ? "h6" : "h4"} color="primary.main" sx={{ fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2.125rem' } }}>
                      {stats.reportesAsignados}
                    </Typography>
                    <Typography color="textSecondary" variant={isMobile ? "caption" : "body1"} sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem', md: '1rem' } }}>
                      Asignados
                    </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                      En cola de técnicos
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={6} sm={6} md={3}>
                <Card elevation={3} sx={{ height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center', p: { xs: 1.5, sm: 2, md: 3 }, '&:last-child': { pb: { xs: 1.5, sm: 2, md: 3 } } }}>
                    <CheckIcon color="success" sx={{ fontSize: { xs: 24, sm: 32, md: 40 }, mb: 1 }} />
                    <Typography variant={isMobile ? "h6" : "h4"} color="success.main" sx={{ fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2.125rem' } }}>
                      {stats.reportesEnProceso}
                    </Typography>
                    <Typography color="textSecondary" variant={isMobile ? "caption" : "body1"} sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem', md: '1rem' } }}>
                      En Proceso
                    </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                      Técnicos trabajando
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Typography variant="h6" sx={{ mb: 2, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Acciones Rápidas
            </Typography>
            
            <Grid container spacing={{ xs: 2, sm: 2 }}>
              <Grid item xs={12} sm={6} lg={3}>
                <Button fullWidth variant="contained" startIcon={<ReporteIcon />} size="large" onClick={() => setTabValue(1)} color="warning" sx={{ py: 2 }}>
                  Asignar Reportes
                </Button>
              </Grid>
              
              <Grid item xs={12} sm={6} lg={3}>
                <Button fullWidth variant="outlined" startIcon={<PeopleIcon />} size="large" onClick={() => setTabValue(2)} sx={{ py: 2 }}>
                  Gestión de Usuarios
                </Button>
              </Grid>
              
              <Grid item xs={12} sm={6} lg={3}>
                <Button fullWidth variant="outlined" startIcon={<MapIcon />} size="large" onClick={() => setTabValue(3)} sx={{ py: 2 }}>
                  Gestión de Zonas
                </Button>
              </Grid>
              
              <Grid item xs={12} sm={6} lg={3}>
                <Button fullWidth variant="outlined" startIcon={<TrendingIcon />} size="large" onClick={() => setTabValue(6)} sx={{ py: 2 }}>
                  Estadísticas
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

        {/* TAB 2: Gestión de Usuarios */}
        {tabValue === 2 && (
          <Box>
            <Typography variant={isMobile ? "h6" : "h5"} gutterBottom>
              Gestión de Usuarios
            </Typography>
            
            <Paper elevation={2} sx={{ mb: 3 }}>
              <Tabs 
                value={userTabValue} 
                onChange={handleUserTabChange}
                variant={isMobile ? "scrollable" : "fullWidth"}
                scrollButtons={isMobile ? "auto" : false}
                sx={{ '& .MuiTab-root': { minHeight: { xs: 48, sm: 56 }, fontSize: { xs: '0.75rem', sm: '0.9rem' }, minWidth: { xs: 80, sm: 'auto' } } }}
              >
                {userTabs.map((tab, index) => (
                  <Tab key={index} label={tab.label} icon={tab.icon} iconPosition={isMobile ? "top" : "start"} />
                ))}
              </Tabs>
            </Paper>

            {userTabValue === 0 && <GestionAdministradores />}
            
            {userTabValue === 1 && (
              <Paper elevation={3}>
                <Box p={{ xs: 2, sm: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    <EngineeringIcon /> Gestión de Técnicos
                  </Typography>
                  <GestionTecnicos />
                </Box>
              </Paper>
            )}
            
            {userTabValue === 2 && <GestionLideres />}
            
            {userTabValue === 3 && <GestionCiudadanos />}
          </Box>
        )}
        
        {/* TAB 3: Gestión de Zonas */}
        {tabValue === 3 && (
          <Box>
            <Typography variant={isMobile ? "h6" : "h5"} gutterBottom>
              Gestión de Zonas
            </Typography>
            <GestionZonas />
          </Box>
        )}

        {/* TAB 4: Gestión de COCODEs */}
        {tabValue === 4 && (
          <Box>
            <Typography variant={isMobile ? "h6" : "h5"} gutterBottom>
              Gestión de COCODEs
            </Typography>
            <GestionCocode />
          </Box>
        )}

        {/* TAB 5: Gestión de Sectores/SUBCOCODEs */}
        {tabValue === 5 && (
          <Box>
            <Typography variant={isMobile ? "h6" : "h5"} gutterBottom>
              Gestión de Sectores/SUBCOCODEs
            </Typography>
            <GestionSubcocode />
          </Box>
        )}

        {/* TAB 6: Reportes y Estadísticas */}
        {tabValue === 6 && (
          <Box>
            <Typography variant={isMobile ? "h6" : "h5"} gutterBottom>
              Reportes y Estadísticas
            </Typography>
            <Paper elevation={3} sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
              <TrendingIcon sx={{ fontSize: { xs: 60, sm: 80 }, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Analytics y Reportes Avanzados
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Próximamente implementaremos gráficos interactivos, exportación a Excel/PDF y métricas avanzadas
              </Typography>
              <Button variant="outlined" disabled>
                En desarrollo
              </Button>
            </Paper>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default DashboardAdmin;