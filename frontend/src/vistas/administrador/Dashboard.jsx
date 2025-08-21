// frontend/src/vistas/administrador/Dashboard.jsx - CORREGIDO PARA FLUJO
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
  Alert
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
  AssignmentTurnedIn as AssignedIcon
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
  
  // Estados para tabs principales
  const [tabValue, setTabValue] = useState(0);
  
  // Estado para sub-tabs de usuarios
  const [userTabValue, setUserTabValue] = useState(0);
  
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

      // Obtener reportes críticos (simulados por ahora)
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
  };

  // Función para cambiar sub-tabs de usuarios
  const handleUserTabChange = (event, newValue) => {
    setUserTabValue(newValue);
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
            Panel Administrador
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

      {/* Sistema de Tabs Principales */}
      <Paper sx={{ borderRadius: 0 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              minHeight: 64,
              fontSize: '0.95rem',
              fontWeight: 500
            }
          }}
        >
          <Tab 
            label="Dashboard Principal" 
            icon={<DashboardIcon />}
            iconPosition="start"
          />
          <Tab 
            label="Gestión de Reportes" 
            icon={<ReporteIcon />}
            iconPosition="start"
          />
          <Tab 
            label="Gestión de Usuarios" 
            icon={<PeopleIcon />}
            iconPosition="start"
          />
          <Tab 
            label="Reportes y Estadísticas" 
            icon={<TrendingIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Contenido de las Pestañas */}
      <Box p={3}>
        {/* TAB 0: Dashboard Principal */}
        {tabValue === 0 && (
          <Box>
            {/* Alerta informativa del flujo */}
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Flujo Correcto:</strong> Como administrador, asignas reportes que los líderes COCODE ya aprobaron. 
                Los técnicos solo reciben reportes validados por la comunidad.
              </Typography>
            </Alert>

            {/* Estadísticas Específicas de Asignación */}
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingIcon /> Estadísticas de Asignación
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={3}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <ScheduleIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4" color="warning.main">
                      {stats.reportesPendientesAsignacion}
                    </Typography>
                    <Typography color="textSecondary">
                      Pendientes Asignación
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Aprobados por líderes
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={3}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <WarningIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4" color="error.main">
                      {stats.reportesCriticosSinAsignar}
                    </Typography>
                    <Typography color="textSecondary">
                      Críticos Sin Asignar
                    </Typography>
                    <Typography variant="caption" color="error">
                      Requieren atención inmediata
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={3}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <AssignedIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4" color="primary.main">
                      {stats.reportesAsignados}
                    </Typography>
                    <Typography color="textSecondary">
                      Asignados
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      En cola de técnicos
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={3}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <CheckIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4" color="success.main">
                      {stats.reportesEnProceso}
                    </Typography>
                    <Typography color="textSecondary">
                      En Proceso
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Técnicos trabajando
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Reportes Críticos y Resumen Departamentos */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningIcon color="error" /> Reportes Críticos Pendientes
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {reportesCriticos.length > 0 ? (
                    <List>
                      {reportesCriticos.map((reporte) => (
                        <ListItem key={reporte.id}>
                          <ListItemIcon>
                            <ReporteIcon color="error" />
                          </ListItemIcon>
                          <ListItemText
                            primary={reporte.titulo}
                            secondary={`${reporte.tipo_problema} - ${reporte.zona} - Aprobado por líder`}
                          />
                          <Chip 
                            label={reporte.prioridad} 
                            color={getPrioridadColor(reporte.prioridad)} 
                            size="small" 
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="textSecondary" textAlign="center" py={2}>
                      No hay reportes críticos pendientes de asignación
                    </Typography>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PeopleIcon color="primary" /> Carga por Departamentos
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {departamentosResumen.length > 0 ? (
                    <List>
                      {departamentosResumen.map((depto, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <EngineeringIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={depto.departamento}
                            secondary={`${depto.tecnicos_disponibles} técnicos disponibles`}
                          />
                          <Chip 
                            label={`${depto.reportes_asignados} reportes`}
                            color={depto.reportes_asignados > 10 ? 'warning' : 'success'}
                            size="small" 
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="textSecondary" textAlign="center" py={2}>
                      Cargando información de departamentos...
                    </Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>

            {/* Acciones Rápidas */}
            <Box mt={4}>
              <Typography variant="h6" gutterBottom>
                Acciones Rápidas
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    startIcon={<ReporteIcon />}
                    size="large"
                    sx={{ py: 2 }}
                    onClick={() => setTabValue(1)}
                    color="warning"
                  >
                    Asignar Reportes
                    {stats.reportesPendientesAsignacion > 0 && (
                      <Chip 
                        label={stats.reportesPendientesAsignacion} 
                        size="small" 
                        sx={{ ml: 1, bgcolor: 'white', color: 'warning.main' }}
                      />
                    )}
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    startIcon={<PeopleIcon />}
                    size="large"
                    sx={{ py: 2 }}
                    onClick={() => setTabValue(2)}
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
                    onClick={() => setTabValue(3)}
                  >
                    Reportes y Estadísticas
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Box>
        )}

        {/* TAB 1: Gestión de Reportes */}
        {tabValue === 1 && (
          <Box>
            <GestionReportes />
          </Box>
        )}

        {/* TAB 2: Gestión de Usuarios */}
        {tabValue === 2 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Gestión de Usuarios
            </Typography>
            
            {/* Sub-Tabs para diferentes tipos de usuarios */}
            <Paper elevation={2} sx={{ mb: 3 }}>
              <Tabs 
                value={userTabValue} 
                onChange={handleUserTabChange}
                variant="fullWidth"
                sx={{
                  '& .MuiTab-root': {
                    minHeight: 56,
                    fontSize: '0.9rem'
                  }
                }}
              >
                <Tab 
                  label="Administradores" 
                  icon={<AdminIcon />} 
                  iconPosition="start"
                />
                <Tab 
                  label="Técnicos" 
                  icon={<EngineeringIcon />} 
                  iconPosition="start"
                />
                <Tab 
                  label="Líderes COCODE" 
                  icon={<GroupIcon />} 
                  iconPosition="start"
                />
                <Tab 
                  label="Ciudadanos" 
                  icon={<PersonIcon />} 
                  iconPosition="start"
                />
                <Tab 
                  label="Zonas" 
                  icon={<LocationIcon />} 
                  iconPosition="start"
                />
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
                <Box p={2}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EngineeringIcon /> Gestión de Técnicos
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Administrar técnicos por departamento (Energía, Agua, Drenajes, etc.)
                  </Typography>
                  
                  {/* Estadísticas rápidas de técnicos */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card elevation={1}>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" color="primary">{stats.tecnicosActivos}</Typography>
                          <Typography variant="body2">Técnicos Activos</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card elevation={1}>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" color="success.main">{departamentosResumen.length}</Typography>
                          <Typography variant="body2">Departamentos</Typography>
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

        {/* TAB 3: Reportes y Estadísticas */}
        {tabValue === 3 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Reportes y Estadísticas
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              <strong>Funcionalidades disponibles:</strong> Generar reportes ejecutivos, exportar datos a Excel/PDF, métricas de rendimiento y análisis de zonas.
            </Typography>
            
            {/* Vista previa de estadísticas */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Métricas de Asignación
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Tiempo promedio de asignación"
                        secondary="4.2 horas"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Reportes asignados hoy"
                        secondary={`${stats.reportesAsignados} reportes`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Eficiencia de asignación"
                        secondary="92.1%"
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Análisis por Departamentos
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Departamento más solicitado"
                        secondary="Energía Eléctrica - 45%"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Departamento con mejor tiempo"
                        secondary="Agua Potable - 2.1 días promedio"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Reportes críticos resueltos"
                        secondary="85% en menos de 24 horas"
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
            </Grid>
            
            <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
              <TrendingIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Analytics y Reportes Avanzados
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Próximamente implementaremos gráficos interactivos, exportación a Excel/PDF y métricas avanzadas con charts y dashboards dinámicos
              </Typography>
              <Button variant="outlined" disabled>
                En desarrollo
              </Button>
            </Paper>
          </Box>
        )}
      </Box>

      {/* Footer Info */}
      <Box mt={4} p={2} bgcolor="grey.100" borderRadius={1} mx={3}>
        <Typography variant="body2" color="textSecondary" textAlign="center">
          <strong>Permisos de Administrador:</strong> Asignación de reportes aprobados por líderes | 
          Gestión completa de usuarios | Control de departamentos técnicos | 
          Acceso a todas las configuraciones y estadísticas
        </Typography>
      </Box>
    </Box>
  );
};

export default DashboardAdmin;