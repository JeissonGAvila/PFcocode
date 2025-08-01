import { useState } from 'react';
import {
  Container, Typography, AppBar, Toolbar, Button, Box, Paper,
  Grid, Card, CardContent, IconButton, Drawer, List, ListItem,
  ListItemIcon, ListItemText, useTheme, useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Category as CategoryIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Assignment as AssignmentIcon,
  Flag as FlagIcon,
  BugReport as BugIcon,
  People as PeopleIcon,
  AdminPanelSettings as AdminIcon,
  Home as HomeIcon
} from '@mui/icons-material';

// Importar componentes de vistas
import CategoriasProblema from './vistas/CategoriasProblema/CategoriasProblema.jsx';
import EstadosReporte from './vistas/EstadosReporte/EstadosReporte.jsx';
import Zonas from './vistas/Zonas/Zonas.jsx';
import Administradores from './vistas/Administradores/Administradores.jsx';

// TODO: Migrar tipos_problema a la nueva estructura
const TiposProblemaLegacy = () => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Tipos de Problema (Legacy)
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Esta vista será migrada a la nueva estructura modular.
        <br />
        Ubicación futura: /vistas/TiposProblema/
      </Typography>
    </Paper>
  );
};

function App() {
  const [vistaActual, setVistaActual] = useState('dashboard');
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Configuración del menú
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <DashboardIcon />,
      categoria: 'principal'
    },
    {
      id: 'divider1',
      type: 'divider',
      label: 'TABLAS PADRE (Nivel 0)'
    },
    {
      id: 'categorias_problema',
      label: 'Categorías Problema',
      icon: <CategoryIcon />,
      categoria: 'padre',
      status: 'pendiente'
    },
    {
      id: 'estados_reporte',
      label: 'Estados Reporte',
      icon: <FlagIcon />,
      categoria: 'padre',
      status: 'pendiente'
    },
    {
      id: 'administradores',
      label: 'Administradores',
      icon: <AdminIcon />,
      categoria: 'padre',
      status: 'pendiente'
    },
    {
      id: 'configuraciones_sistema',
      label: 'Configuraciones',
      icon: <SettingsIcon />,
      categoria: 'padre',
      status: 'pendiente'
    },
    {
      id: 'divider2',
      type: 'divider',
      label: 'NIVEL 1'
    },
    {
      id: 'zonas',
      label: 'Zonas',
      icon: <LocationIcon />,
      categoria: 'nivel1',
      status: 'pendiente'
    },
    {
      id: 'tipos_problema',
      label: 'Tipos Problema',
      icon: <BugIcon />,
      categoria: 'nivel1',
      status: 'implementado'
    },
    {
      id: 'divider3',
      type: 'divider',
      label: 'OTROS NIVELES'
    },
    {
      id: 'cocode',
      label: 'COCODE',
      icon: <HomeIcon />,
      categoria: 'nivel2',
      status: 'futuro'
    },
    {
      id: 'subcocode',
      label: 'Sub-COCODE',
      icon: <HomeIcon />,
      categoria: 'nivel3',
      status: 'futuro'
    },
    {
      id: 'usuarios',
      label: 'Usuarios/Líderes',
      icon: <PersonIcon />,
      categoria: 'nivel4',
      status: 'futuro'
    },
    {
      id: 'ciudadanos',
      label: 'Ciudadanos',
      icon: <PeopleIcon />,
      categoria: 'nivel4',
      status: 'futuro'
    },
    {
      id: 'reportes',
      label: 'Reportes',
      icon: <AssignmentIcon />,
      categoria: 'central',
      status: 'futuro'
    }
  ];

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleMenuClick = (itemId) => {
    setVistaActual(itemId);
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  // Función para obtener el color del estado
  const getStatusColor = (status) => {
    switch (status) {
      case 'implementado':
        return '#4caf50'; // Verde
      case 'pendiente':
        return '#ff9800'; // Naranja
      case 'futuro':
        return '#9e9e9e'; // Gris
      default:
        return theme.palette.text.primary;
    }
  };

  // Función para renderizar cada vista
  const renderVista = () => {
    switch (vistaActual) {
      case 'dashboard':
        return (
          <Box>
            <Typography variant="h3" gutterBottom align="center" sx={{ mb: 4 }}>
              Sistema COCODE - Dashboard
            </Typography>
            
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h5" gutterBottom color="primary">
                      📊 Estado del Proyecto
                    </Typography>
                    <Typography variant="body1" paragraph>
                      Sistema de gestión para Consejos Comunitarios de Desarrollo (COCODE)
                    </Typography>
                    <Typography variant="body2">
                      <strong>Base de datos:</strong> PostgreSQL<br/>
                      <strong>Backend:</strong> Express.js<br/>
                      <strong>Frontend:</strong> React + Material-UI<br/>
                      <strong>Estructura:</strong> MVC
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h5" gutterBottom color="secondary">
                      🚀 Próximos Pasos
                    </Typography>
                    <Typography variant="body1" paragraph>
                      Desarrollo de vistas en progreso:
                    </Typography>
                    <Typography variant="body2">
                      1. Refactorizar tipos_problema<br/>
                      2. Implementar tablas base<br/>
                      3. Completar navegación<br/>
                      4. Agregar funcionalidades
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid size={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h5" gutterBottom>
                      🗂️ Estructura de Vistas Planificada
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-line' }}>
{`frontend/src/vistas/
├── TiposProblema/
│   ├── TiposProblema.jsx (lógica + MVC)
│   └── TiposProblema.styles.js (estilos)
├── CategoriasProblema/
│   ├── CategoriasProblema.jsx
│   └── CategoriasProblema.styles.js
├── EstadosReporte/
├── Zonas/
├── Administradores/
└── ConfiguracionesSistema/`}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );
      
      case 'tipos_problema':
        return <TiposProblemaLegacy />;
      
      case 'categorias_problema':
        return <CategoriasProblema />;
      
      case 'estados_reporte':
        return <EstadosReporte />;
      
      case 'zonas':
        return <Zonas />;
      
      case 'administradores':
        return <Administradores />;
      
      default:
        return (
          <Box textAlign="center" sx={{ py: 8 }}>
            <Typography variant="h4" gutterBottom>
              🚧 Vista en Desarrollo
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {menuItems.find(item => item.id === vistaActual)?.label || 'Vista'}
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              Esta vista será implementada próximamente en la carpeta:
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 1, color: 'primary.main' }}>
              /vistas/{vistaActual.charAt(0).toUpperCase() + vistaActual.slice(1)}/
            </Typography>
          </Box>
        );
    }
  };

  // Componente del menú lateral
  const menuContent = (
    <Box sx={{ width: 280, height: '100%', bgcolor: 'background.paper' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" color="primary" fontWeight="bold">
          Sistema COCODE
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Gestión Comunitaria
        </Typography>
      </Box>
      
      <List sx={{ p: 0 }}>
        {menuItems.map((item) => {
          if (item.type === 'divider') {
            return (
              <Box key={item.id}>
                <Box sx={{ px: 2, py: 1, bgcolor: 'grey.100' }}>
                  <Typography variant="caption" fontWeight="bold" color="text.secondary">
                    {item.label}
                  </Typography>
                </Box>
              </Box>
            );
          }
          
          return (
            <ListItem
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              selected={vistaActual === item.id}
              sx={{
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  },
                },
                '&:hover': {
                  bgcolor: 'action.hover',
                },
                cursor: 'pointer',
              }}
            >
              <ListItemIcon sx={{ color: getStatusColor(item.status) }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label}
                secondary={item.status && (
                  <Typography variant="caption" sx={{ color: getStatusColor(item.status) }}>
                    {item.status}
                  </Typography>
                )}
              />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find(item => item.id === vistaActual)?.label || 'Dashboard'} - Sistema COCODE
          </Typography>
          
          <Button color="inherit" size="small">
            Desarrollo v1.0
          </Button>
        </Toolbar>
      </AppBar>

      {/* Menú lateral para desktop */}
      <Drawer
        variant="permanent"
        sx={{
          width: 280,
          flexShrink: 0,
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            top: 64, // Altura del AppBar
            height: 'calc(100% - 64px)',
          },
        }}
      >
        {menuContent}
      </Drawer>

      {/* Menú lateral para mobile */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={toggleDrawer}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
          },
        }}
      >
        {menuContent}
      </Drawer>

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8, // Espacio para el AppBar
          ml: { md: '280px' }, // Espacio para el drawer en desktop
        }}
      >
        <Container maxWidth="xl">
          {renderVista()}
        </Container>
      </Box>
    </Box>
  );
}

export default App;