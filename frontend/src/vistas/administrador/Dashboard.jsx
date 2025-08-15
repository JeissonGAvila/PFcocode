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
 Divider,
 Tabs,
 Tab
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
import GestionTecnicos from '../../components/admin/GestionTecnicos.jsx';
import GestionReportes from '../../components/admin/GestionReportes.jsx';
import GestionLideres from '../../components/admin/GestionLideres.jsx';

const DashboardAdmin = () => {
 const { user } = useAuth();
 const [tabValue, setTabValue] = useState(0);
 
 const [stats, setStats] = useState({
   totalReportes: 156,
   reportesPendientes: 23,
   reportesEnProceso: 31,
   reportesResueltos: 102,
   tecnicosActivos: 8,
   ciudadanosRegistrados: 1247
 });

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

 const handleTabChange = (event, newValue) => {
   setTabValue(newValue);
 };

 return (
   <Box>
     {/* Header */}
     <Box bgcolor="primary.main" color="white" p={3} display="flex" justifyContent="space-between" alignItems="center">
       <Box>
         <Typography variant="h4" gutterBottom>🔧 Panel Administrador</Typography>
         <Typography variant="h6">Bienvenido, {user?.nombre}</Typography>
         <Typography variant="body2" sx={{ opacity: 0.9 }}>
           Control total del sistema municipal | {user?.correo}
         </Typography>
       </Box>
       <LogoutButton variant="text" />
     </Box>

     {/* Tabs */}
     <Paper sx={{ borderRadius: 0 }}>
       <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth" sx={{ '& .MuiTab-root': { minHeight: 64, fontSize: '0.95rem', fontWeight: 500 } }}>
         <Tab label="🏠 Dashboard Principal" icon={<DashboardIcon />} iconPosition="start" />
         <Tab label="📊 Gestión de Reportes" icon={<ReporteIcon />} iconPosition="start" />
         <Tab label="👥 Gestión de Usuarios" icon={<PeopleIcon />} iconPosition="start" />
         <Tab label="📈 Reportes y Estadísticas" icon={<TrendingIcon />} iconPosition="start" />
       </Tabs>
     </Paper>

     {/* Content */}
     <Box p={3}>
       {/* TAB 0: Dashboard Principal */}
       {tabValue === 0 && (
         <Box>
           <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
             <TrendingIcon /> Estadísticas Generales
           </Typography>
           
           <Grid container spacing={3} sx={{ mb: 4 }}>
             <Grid item xs={12} sm={6} md={3}>
               <Card elevation={3}>
                 <CardContent sx={{ textAlign: 'center' }}>
                   <ReporteIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                   <Typography variant="h4" color="primary">{stats.totalReportes}</Typography>
                   <Typography color="textSecondary">Total Reportes</Typography>
                 </CardContent>
               </Card>
             </Grid>
             <Grid item xs={12} sm={6} md={3}>
               <Card elevation={3}>
                 <CardContent sx={{ textAlign: 'center' }}>
                   <ScheduleIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
                   <Typography variant="h4" color="warning.main">{stats.reportesPendientes}</Typography>
                   <Typography color="textSecondary">Pendientes</Typography>
                 </CardContent>
               </Card>
             </Grid>
             <Grid item xs={12} sm={6} md={3}>
               <Card elevation={3}>
                 <CardContent sx={{ textAlign: 'center' }}>
                   <WarningIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
                   <Typography variant="h4" color="error.main">{stats.reportesEnProceso}</Typography>
                   <Typography color="textSecondary">En Proceso</Typography>
                 </CardContent>
               </Card>
             </Grid>
             <Grid item xs={12} sm={6} md={3}>
               <Card elevation={3}>
                 <CardContent sx={{ textAlign: 'center' }}>
                   <CheckIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                   <Typography variant="h4" color="success.main">{stats.reportesResueltos}</Typography>
                   <Typography color="textSecondary">Resueltos</Typography>
                 </CardContent>
               </Card>
             </Grid>
           </Grid>

           <Grid container spacing={3} sx={{ mb: 4 }}>
             <Grid item xs={12} md={6}>
               <Paper elevation={3} sx={{ p: 3 }}>
                 <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                   <WarningIcon color="error" /> Reportes Críticos
                 </Typography>
                 <Divider sx={{ mb: 2 }} />
                 <List>
                   {reportesCriticos.map((reporte) => (
                     <ListItem key={reporte.id}>
                       <ListItemIcon><ReporteIcon color="error" /></ListItemIcon>
                       <ListItemText primary={reporte.titulo} secondary={`${reporte.tipo} - Prioridad: ${reporte.prioridad}`} />
                       <Chip label={reporte.prioridad} color={getPrioridadColor(reporte.prioridad)} size="small" />
                     </ListItem>
                   ))}
                 </List>
               </Paper>
             </Grid>
             <Grid item xs={12} md={6}>
               <Paper elevation={3} sx={{ p: 3 }}>
                 <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                   <PeopleIcon color="primary" /> Resumen por Departamentos
                 </Typography>
                 <Divider sx={{ mb: 2 }} />
                 <List>
                   {tecnicosResumen.map((tecnico, index) => (
                     <ListItem key={index}>
                       <ListItemIcon><PeopleIcon /></ListItemIcon>
                       <ListItemText primary={`${tecnico.nombre} - ${tecnico.departamento}`} secondary={`${tecnico.reportes} reportes asignados`} />
                       <Chip label={tecnico.estado} color={getEstadoColor(tecnico.estado)} size="small" />
                     </ListItem>
                   ))}
                 </List>
               </Paper>
             </Grid>
           </Grid>

           <Box mt={4}>
             <Typography variant="h6" gutterBottom>🚀 Acciones Rápidas</Typography>
             <Grid container spacing={2}>
               <Grid item xs={12} sm={6} md={3}>
                 <Button fullWidth variant="outlined" startIcon={<ReporteIcon />} size="large" sx={{ py: 2 }} onClick={() => setTabValue(1)}>
                   Gestión de Reportes
                 </Button>
               </Grid>
               <Grid item xs={12} sm={6} md={3}>
                 <Button fullWidth variant="outlined" startIcon={<PeopleIcon />} size="large" sx={{ py: 2 }} onClick={() => setTabValue(2)}>
                   Gestión de Usuarios
                 </Button>
               </Grid>
               <Grid item xs={12} sm={6} md={3}>
                 <Button fullWidth variant="outlined" startIcon={<SettingsIcon />} size="large" sx={{ py: 2 }}>
                   Configuraciones
                 </Button>
               </Grid>
               <Grid item xs={12} sm={6} md={3}>
                 <Button fullWidth variant="outlined" startIcon={<TrendingIcon />} size="large" sx={{ py: 2 }} onClick={() => setTabValue(3)}>
                   Reportes y Estadísticas
                 </Button>
               </Grid>
             </Grid>
           </Box>
         </Box>
       )}

       {/* TAB 1: Gestión de Reportes */}
       {tabValue === 1 && (<Box><GestionReportes /></Box>)}

       {/* TAB 2: Gestión de Usuarios */}
       {tabValue === 2 && (
         <Box>
           <Typography variant="h5" gutterBottom>👥 Gestión de Usuarios</Typography>
           
           <Paper elevation={3} sx={{ mb: 4 }}>
             <Box p={2}>
               <Typography variant="h6" gutterBottom>🔧 Administradores y Técnicos</Typography>
               <GestionTecnicos />
             </Box>
           </Paper>

           <Paper elevation={3} sx={{ mb: 4 }}>
             <Box p={2}>
               <Typography variant="h6" gutterBottom>👑 Líderes COCODE</Typography>
               <GestionLideres />
             </Box>
           </Paper>

           <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
             <PeopleIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
             <Typography variant="h6" gutterBottom>Lista de Ciudadanos</Typography>
             <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
               Próximamente: Vista de ciudadanos registrados
             </Typography>
             <Button variant="outlined" disabled>En desarrollo</Button>
           </Paper>
         </Box>
       )}

       {/* TAB 3: Reportes y Estadísticas */}
       {tabValue === 3 && (
         <Box>
           <Typography variant="h5" gutterBottom>📈 Reportes y Estadísticas</Typography>
           <Typography variant="body1" sx={{ mb: 3 }}>
             <strong>Funcionalidades disponibles:</strong> Generar reportes ejecutivos, exportar datos a Excel/PDF, métricas de rendimiento y análisis de zonas.
           </Typography>
           <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
             <TrendingIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
             <Typography variant="h6" gutterBottom>Analytics y Reportes</Typography>
             <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
               Próximamente implementaremos charts, exportación y métricas avanzadas
             </Typography>
             <Button variant="outlined" disabled>En desarrollo</Button>
           </Paper>
         </Box>
       )}
     </Box>

     {/* Footer */}
     <Box mt={4} p={2} bgcolor="grey.100" borderRadius={1} mx={3}>
       <Typography variant="body2" color="textSecondary" textAlign="center">
         👑 <strong>Permisos de Administrador:</strong> Control total del sistema | 
         Gestión completa de usuarios | Asignación de reportes | 
         Acceso a todas las configuraciones y estadísticas
       </Typography>
     </Box>
   </Box>
 );
};

export default DashboardAdmin;