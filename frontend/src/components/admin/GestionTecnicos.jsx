// frontend/src/components/admin/GestionTecnicos.jsx - VERSIÓN COMPLETAMENTE RESPONSIVA
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  Snackbar,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Divider,
  Container,
  useTheme,
  useMediaQuery,
  Stack,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  AppBar,
  Toolbar,
  Badge
} from '@mui/material';

import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  VpnKey as KeyIcon,
  Engineering as EngineeringIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Business as BusinessIcon
} from '@mui/icons-material';

import { tecnicosService, departamentosTecnicos, rolesTecnicos } from '../../services/admin/tecnicosService';

const GestionTecnicos = () => {
  const theme = useTheme();
  
  // Breakpoints responsivos
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  // Estados principales
  const [tecnicos, setTecnicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados de modales
  const [modalTecnico, setModalTecnico] = useState(false);
  const [modalPassword, setModalPassword] = useState(false);
  const [tecnicoSeleccionado, setTecnicoSeleccionado] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    contrasena: '',
    telefono: '',
    departamento: '',
    rol: '',
    puede_asignar: false
  });

  const [nuevaContrasena, setNuevaContrasena] = useState('');

  // Estados de filtros
  const [filtros, setFiltros] = useState({
    departamento: '',
    busqueda: ''
  });

  // Estados para UI responsiva
  const [expandedCards, setExpandedCards] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  // Estadísticas
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    porDepartamento: {}
  });

  // Cargar técnicos al iniciar
  useEffect(() => {
    cargarTecnicos();
  }, []);

  // Actualizar estadísticas cuando cambian los técnicos
  useEffect(() => {
    actualizarEstadisticas();
  }, [tecnicos]);

  // Función para cargar técnicos
  const cargarTecnicos = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await tecnicosService.getAll();
      
      if (response.success) {
        setTecnicos(response.tecnicos);
      }
      
    } catch (error) {
      console.error('Error al cargar técnicos:', error);
      setError(error.message || 'Error al cargar la lista de técnicos');
    } finally {
      setLoading(false);
    }
  };

  // Actualizar estadísticas
  const actualizarEstadisticas = () => {
    const total = tecnicos.length;
    const porDepartamento = {};
    
    tecnicos.forEach(tecnico => {
      const dept = tecnico.departamento || 'Sin departamento';
      porDepartamento[dept] = (porDepartamento[dept] || 0) + 1;
    });

    setEstadisticas({ total, porDepartamento });
  };

  // Técnicos filtrados
  const tecnicosFiltrados = tecnicos.filter(tecnico => {
    const coincideDepartamento = !filtros.departamento || tecnico.departamento === filtros.departamento;
    const coincideBusqueda = !filtros.busqueda || 
      `${tecnico.nombre} ${tecnico.apellido}`.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      tecnico.correo.toLowerCase().includes(filtros.busqueda.toLowerCase());
    
    return coincideDepartamento && coincideBusqueda;
  });

  // Toggle para expandir cards en móvil
  const toggleCardExpanded = (tecnicoId) => {
    setExpandedCards(prev => ({
      ...prev,
      [tecnicoId]: !prev[tecnicoId]
    }));
  };

  // Abrir modal para crear
  const abrirModalCrear = () => {
    setFormData({
      nombre: '',
      apellido: '',
      correo: '',
      contrasena: '',
      telefono: '',
      departamento: '',
      rol: '',
      puede_asignar: false
    });
    setEditMode(false);
    setModalTecnico(true);
  };

  // Abrir modal para editar
  const abrirModalEditar = (tecnico) => {
    setFormData({
      nombre: tecnico.nombre || '',
      apellido: tecnico.apellido || '',
      correo: tecnico.correo || '',
      contrasena: '', // No mostrar contraseña actual
      telefono: tecnico.telefono || '',
      departamento: tecnico.departamento || '',
      rol: tecnico.rol || '',
      puede_asignar: tecnico.puede_asignar || false
    });
    setTecnicoSeleccionado(tecnico);
    setEditMode(true);
    setModalTecnico(true);
  };

  // Abrir modal para cambiar contraseña
  const abrirModalPassword = (tecnico) => {
    setTecnicoSeleccionado(tecnico);
    setNuevaContrasena('');
    setModalPassword(true);
  };

  // Guardar técnico (crear o editar)
  const guardarTecnico = async () => {
    try {
      setError('');
      
      if (editMode) {
        // Actualizar técnico existente
        const response = await tecnicosService.update(tecnicoSeleccionado.id, formData);
        
        if (response.success) {
          setSuccess(response.message);
          await cargarTecnicos(); // Recargar lista
          cerrarModal();
        }
        
      } else {
        // Crear nuevo técnico
        const response = await tecnicosService.create(formData);
        
        if (response.success) {
          setSuccess(response.message);
          await cargarTecnicos(); // Recargar lista
          cerrarModal();
        }
      }
      
    } catch (error) {
      console.error('Error al guardar técnico:', error);
      setError(error.message || 'Error al guardar el técnico');
    }
  };

  // Cambiar contraseña
  const cambiarContrasena = async () => {
    try {
      setError('');
      
      const response = await tecnicosService.updatePassword(tecnicoSeleccionado.id, nuevaContrasena);
      
      if (response.success) {
        setSuccess(response.message);
        setModalPassword(false);
        setNuevaContrasena('');
        setTecnicoSeleccionado(null);
      }
      
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      setError(error.message || 'Error al cambiar la contraseña');
    }
  };

  // Desactivar técnico
  const desactivarTecnico = async (tecnico) => {
    if (!window.confirm(`¿Estás seguro de que quieres desactivar a ${tecnico.nombre} ${tecnico.apellido}?`)) {
      return;
    }

    try {
      setError('');
      
      const response = await tecnicosService.delete(tecnico.id);
      
      if (response.success) {
        setSuccess(response.message);
        await cargarTecnicos(); // Recargar lista
      }
      
    } catch (error) {
      console.error('Error al desactivar técnico:', error);
      setError(error.message || 'Error al desactivar el técnico');
    }
  };

  // Cerrar modal
  const cerrarModal = () => {
    setModalTecnico(false);
    setTecnicoSeleccionado(null);
    setEditMode(false);
    setFormData({
      nombre: '',
      apellido: '',
      correo: '',
      contrasena: '',
      telefono: '',
      departamento: '',
      rol: '',
      puede_asignar: false
    });
  };

  // Manejar cambios en formulario
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Obtener color para departamento
  const getColorDepartamento = (departamento) => {
    const colores = {
      'Energía Eléctrica': 'primary',
      'Agua Potable': 'info',
      'Drenajes': 'secondary',
      'Alumbrado Público': 'warning',
      'Recolección de Basura': 'success',
      'Mantenimiento Vial': 'error'
    };
    return colores[departamento] || 'default';
  };

  // Vista móvil como cards
  const TecnicosCardView = () => (
    <Stack spacing={2}>
      {tecnicosFiltrados.map((tecnico) => {
        const isExpanded = expandedCards[tecnico.id];
        return (
          <Card key={tecnico.id} elevation={2}>
            <CardContent sx={{ pb: 1 }}>
              {/* Header del card */}
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                <Box flex={1}>
                  <Typography variant="h6" sx={{ fontSize: '1.1rem', lineHeight: 1.2 }}>
                    {tecnico.nombre} {tecnico.apellido}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                    {tecnico.correo}
                  </Typography>
                  <Chip
                    label={tecnico.departamento}
                    color={getColorDepartamento(tecnico.departamento)}
                    size="small"
                  />
                </Box>
                
                <IconButton 
                  size="small" 
                  onClick={() => toggleCardExpanded(tecnico.id)}
                >
                  {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>

              {/* Información expandible */}
              <Collapse in={isExpanded}>
                <Box>
                  <Divider sx={{ my: 2 }} />
                  
                  {tecnico.telefono && (
                    <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PhoneIcon fontSize="small" />
                      {tecnico.telefono}
                    </Typography>
                  )}
                  
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Rol:</strong> {tecnico.rol || 'Sin rol asignado'}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>ID:</strong> {tecnico.id}
                  </Typography>
                  
                  {tecnico.puede_asignar && (
                    <Chip
                      label="Puede Asignar"
                      color="success"
                      size="small"
                      sx={{ mb: 2 }}
                    />
                  )}
                </Box>
              </Collapse>

              {/* Acciones */}
              <Box display="flex" justifyContent="space-between" alignItems="center" pt={1}>
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => abrirModalEditar(tecnico)}
                  variant="outlined"
                >
                  Editar
                </Button>
                
                <Box display="flex" gap={0.5}>
                  <IconButton
                    size="small"
                    color="warning"
                    onClick={() => abrirModalPassword(tecnico)}
                    title="Cambiar contraseña"
                  >
                    <KeyIcon />
                  </IconButton>
                  
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => desactivarTecnico(tecnico)}
                    title="Desactivar técnico"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );

  // Vista desktop como tabla
  const TecnicosTableView = () => (
    <TableContainer component={Paper} elevation={3}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'grey.100' }}>
            <TableCell><strong>Técnico</strong></TableCell>
            <TableCell><strong>Departamento</strong></TableCell>
            <TableCell><strong>Rol</strong></TableCell>
            <TableCell><strong>Contacto</strong></TableCell>
            <TableCell><strong>Puede Asignar</strong></TableCell>
            <TableCell><strong>Acciones</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tecnicosFiltrados.map((tecnico) => (
            <TableRow key={tecnico.id} hover>
              <TableCell>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {tecnico.nombre} {tecnico.apellido}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ID: {tecnico.id}
                  </Typography>
                </Box>
              </TableCell>
              
              <TableCell>
                <Chip
                  label={tecnico.departamento}
                  color={getColorDepartamento(tecnico.departamento)}
                  size="small"
                />
              </TableCell>
              
              <TableCell>
                <Typography variant="body2">
                  {tecnico.rol || 'Sin rol asignado'}
                </Typography>
              </TableCell>
              
              <TableCell>
                <Box>
                  <Typography variant="body2">
                    {tecnico.correo}
                  </Typography>
                  {tecnico.telefono && (
                    <Typography variant="caption" color="text.secondary">
                      {tecnico.telefono}
                    </Typography>
                  )}
                </Box>
              </TableCell>
              
              <TableCell>
                <Chip
                  label={tecnico.puede_asignar ? 'Sí' : 'No'}
                  color={tecnico.puede_asignar ? 'success' : 'default'}
                  size="small"
                />
              </TableCell>
              
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => abrirModalEditar(tecnico)}
                    title="Editar técnico"
                  >
                    <EditIcon />
                  </IconButton>
                  
                  <IconButton
                    size="small"
                    color="warning"
                    onClick={() => abrirModalPassword(tecnico)}
                    title="Cambiar contraseña"
                  >
                    <KeyIcon />
                  </IconButton>
                  
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => desactivarTecnico(tecnico)}
                    title="Desactivar técnico"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          ))}
          
          {tecnicosFiltrados.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary">
                  No se encontraron técnicos
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  if (loading && tecnicos.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Cargando técnicos...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
      {/* Encabezado - Responsivo */}
      <Box 
        sx={{ 
          mb: 3, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 }
        }}
      >
        <Box textAlign={{ xs: 'center', sm: 'left' }}>
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            gutterBottom 
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <EngineeringIcon color="primary" />
            Gestión de Técnicos
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
          >
            Administra los técnicos del sistema municipal
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={cargarTecnicos}
            disabled={loading}
            fullWidth={isMobile}
          >
            Actualizar
          </Button>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={abrirModalCrear}
            size={isMobile ? "large" : "large"}
            fullWidth={isMobile}
          >
            Crear Técnico
          </Button>
        </Box>
      </Box>

      {/* Estadísticas - Grid responsivo */}
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography 
                variant={isMobile ? "h5" : "h4"} 
                color="primary"
                sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}
              >
                {estadisticas.total}
              </Typography>
              <Typography 
                variant="body1"
                sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
              >
                Total Técnicos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
              >
                Por Departamento
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {Object.entries(estadisticas.porDepartamento).map(([dept, cantidad]) => (
                  <Chip
                    key={dept}
                    label={`${dept}: ${cantidad}`}
                    color={getColorDepartamento(dept)}
                    variant="outlined"
                    size={isMobile ? "small" : "medium"}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros - Responsivo */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box 
            display="flex" 
            justifyContent="space-between" 
            alignItems="center" 
            mb={2}
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
              <FilterIcon />
              Filtros
            </Typography>
            
            {isMobile && (
              <IconButton onClick={() => setShowFilters(!showFilters)}>
                {showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            )}
          </Box>
          
          <Collapse in={!isMobile || showFilters}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Departamento</InputLabel>
                  <Select
                    value={filtros.departamento}
                    label="Departamento"
                    onChange={(e) => setFiltros(prev => ({ ...prev, departamento: e.target.value }))}
                    size={isMobile ? "medium" : "medium"}
                  >
                    <MenuItem value="">Todos los departamentos</MenuItem>
                    {departamentosTecnicos.map(dept => (
                      <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Buscar técnico"
                  placeholder="Buscar por nombre o correo..."
                  value={filtros.busqueda}
                  onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
                  size={isMobile ? "medium" : "medium"}
                />
              </Grid>
            </Grid>
          </Collapse>
        </CardContent>
      </Card>

      {/* Vista condicional según dispositivo */}
      <Card>
        <CardContent>
          <Box 
            display="flex" 
            justifyContent="space-between" 
            alignItems="center" 
            mb={2}
          >
            <Typography 
              variant="h6"
              sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
            >
              Lista de Técnicos ({tecnicosFiltrados.length})
            </Typography>
          </Box>
          
          {isMobile ? <TecnicosCardView /> : <TecnicosTableView />}
        </CardContent>
      </Card>

      {/* Modal Crear/Editar Técnico - Responsivo */}
      <Dialog 
        open={modalTecnico} 
        onClose={cerrarModal} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
      >
        {isMobile && (
          <AppBar position="relative">
            <Toolbar>
              <Typography variant="h6" sx={{ flex: 1 }}>
                {editMode ? 'Editar Técnico' : 'Crear Nuevo Técnico'}
              </Typography>
              <IconButton 
                edge="end" 
                color="inherit" 
                onClick={cerrarModal}
              >
                <CloseIcon />
              </IconButton>
            </Toolbar>
          </AppBar>
        )}

        {!isMobile && (
          <DialogTitle>
            {editMode ? 'Editar Técnico' : 'Crear Nuevo Técnico'}
          </DialogTitle>
        )}
        
        <DialogContent sx={{ p: { xs: 2, md: 3 } }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre *"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                size={isMobile ? "medium" : "medium"}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Apellido *"
                value={formData.apellido}
                onChange={(e) => handleInputChange('apellido', e.target.value)}
                size={isMobile ? "medium" : "medium"}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Correo Electrónico *"
                type="email"
                value={formData.correo}
                onChange={(e) => handleInputChange('correo', e.target.value)}
                size={isMobile ? "medium" : "medium"}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Teléfono"
                value={formData.telefono}
                onChange={(e) => handleInputChange('telefono', e.target.value)}
                size={isMobile ? "medium" : "medium"}
              />
            </Grid>
            
            {!editMode && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Contraseña *"
                  type="password"
                  value={formData.contrasena}
                  onChange={(e) => handleInputChange('contrasena', e.target.value)}
                  helperText="Mínimo 6 caracteres"
                  size={isMobile ? "medium" : "medium"}
                />
              </Grid>
            )}
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Departamento *</InputLabel>
                <Select
                  value={formData.departamento}
                  label="Departamento *"
                  onChange={(e) => handleInputChange('departamento', e.target.value)}
                  size={isMobile ? "medium" : "medium"}
                >
                  {departamentosTecnicos.map(dept => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Rol</InputLabel>
                <Select
                  value={formData.rol}
                  label="Rol"
                  onChange={(e) => handleInputChange('rol', e.target.value)}
                  size={isMobile ? "medium" : "medium"}
                >
                  <MenuItem value="">Sin rol específico</MenuItem>
                  {rolesTecnicos.map(rol => (
                    <MenuItem key={rol} value={rol}>{rol}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.puede_asignar}
                    onChange={(e) => handleInputChange('puede_asignar', e.target.checked)}
                  />
                }
                label="¿Puede asignar reportes a otros técnicos?"
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: { xs: 2, md: 3 } }}>
          {!isMobile && (
            <Button onClick={cerrarModal}>
              Cancelar
            </Button>
          )}
          <Button 
            variant="contained" 
            onClick={guardarTecnico}
            fullWidth={isMobile}
            size={isMobile ? "large" : "medium"}
          >
            {editMode ? 'Actualizar' : 'Crear'} Técnico
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Cambiar Contraseña - Responsivo */}
      <Dialog 
        open={modalPassword} 
        onClose={() => setModalPassword(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        {isMobile && (
          <AppBar position="relative">
            <Toolbar>
              <Typography variant="h6" sx={{ flex: 1 }}>
                Cambiar Contraseña
              </Typography>
              <IconButton 
                edge="end" 
                color="inherit" 
                onClick={() => setModalPassword(false)}
              >
                <CloseIcon />
              </IconButton>
            </Toolbar>
          </AppBar>
        )}

        {!isMobile && (
          <DialogTitle>
            Cambiar Contraseña - {tecnicoSeleccionado?.nombre} {tecnicoSeleccionado?.apellido}
          </DialogTitle>
        )}
        
        <DialogContent sx={{ p: { xs: 2, md: 3 } }}>
          {isMobile && (
            <Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>
              {tecnicoSeleccionado?.nombre} {tecnicoSeleccionado?.apellido}
            </Typography>
          )}
          
          <TextField
            fullWidth
            label="Nueva Contraseña"
            type="password"
            value={nuevaContrasena}
            onChange={(e) => setNuevaContrasena(e.target.value)}
            helperText="Mínimo 6 caracteres"
            sx={{ mt: { xs: 1, md: 2 } }}
            size={isMobile ? "medium" : "medium"}
          />
        </DialogContent>
        
        <DialogActions sx={{ p: { xs: 2, md: 3 } }}>
          {!isMobile && (
            <Button onClick={() => setModalPassword(false)}>
              Cancelar
            </Button>
          )}
          <Button 
            variant="contained" 
            onClick={cambiarContrasena}
            fullWidth={isMobile}
            size={isMobile ? "large" : "medium"}
          >
            Cambiar Contraseña
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbars para mensajes - Responsivo */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ 
          vertical: 'bottom', 
          horizontal: isMobile ? 'center' : 'right' 
        }}
      >
        <Alert 
          onClose={() => setSuccess('')} 
          severity="success" 
          sx={{ 
            width: '100%',
            fontSize: { xs: '0.85rem', md: '0.875rem' }
          }}
        >
          {success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ 
          vertical: 'bottom', 
          horizontal: isMobile ? 'center' : 'right' 
        }}
      >
        <Alert 
          onClose={() => setError('')} 
          severity="error" 
          sx={{ 
            width: '100%',
            fontSize: { xs: '0.85rem', md: '0.875rem' }
          }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default GestionTecnicos;