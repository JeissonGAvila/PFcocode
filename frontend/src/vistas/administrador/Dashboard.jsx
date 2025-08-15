// frontend/src/vistas/administrador/Dashboard.jsx - Actualizado con navegación
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';

import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Engineering as EngineeringIcon,
  Report as ReporteIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingIcon,
  AccountCircle as AccountIcon,
  ExitToApp as LogoutIcon
} from '@mui/icons-material';

// Importar componentes
import GestionTecnicos from '../../components/admin/GestionTecnicos';

const DashboardAdmin = () => {
  // 🎛️ ESTADOS
  const [tabActual, setTabActual] = useState(0);
  const [menuUser, setMenuUser] = useState(null);

  // 📊 DATOS DE ESTADÍSTICAS (simulados por ahora)
  const estadisticas = {
    totalReportes: 156,
    reportesPendientes: 23,
    tecnicosActivos: 8,
    reportesResueltos: 133
  };

  // 🎯 MANEJAR CAMBIO DE TABS
  const handleTabChange = (event, newValue) => {
    setTabActual(newValue);
  };

  // 👤 MANEJAR MENÚ DE USUARIO
  const handleUserMenu = (event) => {
    setMenuUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setMenuUser(null);
  };

  // 🚪 LOGOUT (placeholder)
  const handleLogout = () => {
    // TODO: Implementar logout real
    console.log('Logout');
    setMenuUser(null);
  };

  // 🎨 RENDERIZAR CONTENIDO SEGÚN TAB ACTIVO
  const renderTabContent = () => {
    switch (tabActual) {
      case 0: // Dashboard Principal
        return (
          <Box>
            {/* 📊 ESTADÍSTICAS PRINCIPALES */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h4" component="div">
                          {estadisticas.totalReportes}
                        </Typography>
                        <Typography variant="body2">
                          Total de Reportes
                        </Typography>
                      </Box>
                      <ReporteIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h4" component="div">
                          {estadisticas.reportesPendientes}
                        </Typography>
                        <Typography variant="body2">
                          Pendientes
                        </Typography>
                      </Box>
                      <DashboardIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h4" component="div">
                          {estadisticas.tecnicosActivos}
                        </Typography>
                        <Typography variant="body2">
                          Técnicos Activos
                        </Typography>
                      </Box>
                      <EngineeringIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h4" component="div">
                          {estadisticas.reportesResueltos}
                        </Typography>
                        <Typography variant="body2">
                          Resueltos
                        </Typography>
                      </Box>
                      <TrendingIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* 🚀 ACCIONES RÁPIDAS */}
            <Card>
              <CardContent>
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
                      onClick={() => setTabActual(2)}
                    >
                      Gestión de Reportes
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<EngineeringIcon />}
                      size="large"
                      sx={{ py: 2 }}
                      onClick={() => setTabActual(1)}
                    >
                      Gestión de Técnicos
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
                      onClick={() => setTabActual(3)}
                    >
                      Configuraciones
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* 📝 INFO DEL ADMINISTRADOR */}
            <Box mt={4} p={2} bgcolor="grey.100" borderRadius={1}>
              <Typography variant="body2" color="textSecondary" textAlign="center">
                👑 <strong>Permisos de Administrador:</strong> Control total del sistema | 
                Gestión completa de usuarios | Asignación de reportes | 
                Acceso a todas las configuraciones y estadísticas
              </Typography>
            </Box>
          </Box>
        );

      case 1: // Gestión de Técnicos
        return <GestionTecnicos />;

      case 2: // Gestión de Reportes
        return (
          <Box>
            <Typography variant="h4" gutterBottom>
              🚧 Gestión de Reportes
            </Typography>
            <Typography variant="body1">
              Este módulo estará disponible próximamente...
            </Typography>
          </Box>
        );

      case 3: // Configuraciones
        return (
          <Box>
            <Typography variant="h4" gutterBottom>
              🚧 Configuraciones del Sistema
            </Typography>
            <Typography variant="body1">
              Este módulo estará disponible próximamente...
            </Typography>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* 🎯 BARRA DE NAVEGACIÓN SUPERIOR */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <DashboardIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Panel de Administración - COCODE Huehuetenango
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 1 }}>
              Administrador
            </Typography>
            <IconButton
              size="large"
              onClick={handleUserMenu}
              color="inherit"
            >
              <AccountIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* 👤 MENÚ DE USUARIO */}
      <Menu
        anchorEl={menuUser}
        open={Boolean(menuUser)}
        onClose={handleCloseUserMenu}
      >
        <MenuItem onClick={handleCloseUserMenu}>
          <AccountIcon sx={{ mr: 1 }} /> Mi Perfil
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <LogoutIcon sx={{ mr: 1 }} /> Cerrar Sesión
        </MenuItem>
      </Menu>

      {/* 📋 TABS DE NAVEGACIÓN */}
      <Paper square>
        <Tabs
          value={tabActual}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab 
            icon={<DashboardIcon />} 
            label="Dashboard" 
            iconPosition="start"
          />
          <Tab 
            icon={<EngineeringIcon />} 
            label="Técnicos" 
            iconPosition="start"
          />
          <Tab 
            icon={<ReporteIcon />} 
            label="Reportes" 
            iconPosition="start"
          />
          <Tab 
            icon={<SettingsIcon />} 
            label="Configuraciones" 
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* 📄 CONTENIDO PRINCIPAL */}
      <Box sx={{ p: 3 }}>
        {renderTabContent()}
      </Box>
    </Box>
  );
};

export default DashboardAdmin;