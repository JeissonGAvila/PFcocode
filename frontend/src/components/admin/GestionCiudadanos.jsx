import React, { useEffect, useState } from 'react';
import {
  Container, Typography, TextField, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Stack, Alert, Box,
  CircularProgress, Chip, Modal, Select, MenuItem, FormControl, 
  InputLabel, Grid, Card, CardContent, Divider, IconButton, Tooltip
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  LocationOn as LocationIcon,
  Badge as BadgeIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Lock as LockIcon,
  Verified as VerifiedIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { ciudadanosService } from '../../services/admin/ciudadanosService';

const GestionCiudadanos = () => {
  // Estados principales
  const [ciudadanos, setCiudadanos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [editId, setEditId] = useState(null);
  
  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [telefono, setTelefono] = useState('');
  const [dpi, setDpi] = useState('');
  const [direccion, setDireccion] = useState('');
  
  // 🔧 NUEVO: Estados para selects en cascada (igual que líderes)
  const [cocodeSeleccionado, setCocodeSeleccionado] = useState(''); // Solo para filtrar
  const [subcocodeSeleccionado, setSubcocodeSeleccionado] = useState(''); // Se envía al backend
  
  // Estados para modales
  const [modalPassword, setModalPassword] = useState(false);
  const [ciudadanoSeleccionado, setCiudadanoSeleccionado] = useState(null);
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  
  // Estados para filtros y estadísticas
  const [filtroZona, setFiltroZona] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [estadisticas, setEstadisticas] = useState(null);
  
  // 🔧 NUEVO: Estados para datos de selects
  const [cocodes, setCocodes] = useState([]);
  const [subcodes, setSubcodes] = useState([]);
  const [subcocodesDisponibles, setSubcocodesDisponibles] = useState([]);

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchCiudadanos();
    fetchEstadisticas();
    fetchDatosSelect(); // 👈 NUEVO: Cargar COCODEs y Sub-COCODEs
  }, []);

  // 🔧 NUEVO: Filtrar Sub-COCODEs cuando cambia el COCODE seleccionado
  useEffect(() => {
    if (cocodeSeleccionado) {
      const subcocodesDelCocode = subcodes.filter(
        sub => sub.cocode_principal_id === parseInt(cocodeSeleccionado)
      );
      setSubcocodesDisponibles(subcocodesDelCocode);
      setSubcocodeSeleccionado(''); // Resetear selección de subcocode
    } else {
      setSubcocodesDisponibles([]);
      setSubcocodeSeleccionado('');
    }
  }, [cocodeSeleccionado, subcodes]);

  // 🔧 NUEVO: Obtener datos para selects (COCODEs y Sub-COCODEs)
  const fetchDatosSelect = async () => {
    try {
      const data = await ciudadanosService.getDatosSelect();
      setCocodes(data.cocodes || []);
      setSubcodes(data.subcodes || []);
    } catch (error) {
      console.error('Error al obtener datos para selects:', error);
      setMensaje('Error al cargar datos de zonas y sectores');
    }
  };

  const fetchCiudadanos = async () => {
    try {
      setLoading(true);
      const data = await ciudadanosService.getAll();
      setCiudadanos(data);
    } catch (error) {
      console.error('Error al obtener ciudadanos:', error);
      setMensaje('Error al obtener ciudadanos');
    } finally {
      setLoading(false);
    }
  };

  const fetchEstadisticas = async () => {
    try {
      const data = await ciudadanosService.getEstadisticas();
      setEstadisticas(data);
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');

    // Validaciones
    if (!nombre.trim() || !apellido.trim() || !correo.trim()) {
      setMensaje('Por favor completa los campos obligatorios (Nombre, Apellido y Correo).');
      return;
    }

    if (!editId && !contrasena.trim()) {
      setMensaje('La contraseña es obligatoria para nuevos ciudadanos.');
      return;
    }

    if (!subcocodeSeleccionado) {
      setMensaje('Debes seleccionar un sector (Sub-COCODE).');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      setMensaje('Por favor ingresa un correo electrónico válido.');
      return;
    }

    // Validar DPI si fue proporcionado
    if (dpi && (dpi.length !== 13 || !/^\d+$/.test(dpi))) {
      setMensaje('El DPI debe tener exactamente 13 dígitos.');
      return;
    }

    try {
      const ciudadanoData = {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        correo: correo.trim().toLowerCase(),
        telefono: telefono.trim(),
        dpi: dpi.trim() || null,
        direccion: direccion.trim(),
        id_subcocode: parseInt(subcocodeSeleccionado), // 👈 SOLO enviamos subcocode
        usuario_ingreso: 'admin'
      };

      if (!editId) {
        ciudadanoData.contrasena = contrasena;
      }

      let response;
      if (editId) {
        response = await ciudadanosService.update(editId, {
          ...ciudadanoData,
          usuario_modifica: 'admin'
        });
        setCiudadanos(ciudadanos.map(c => c.id === editId ? response : c));
        setMensaje('¡Ciudadano actualizado exitosamente!');
      } else {
        response = await ciudadanosService.create(ciudadanoData);
        setCiudadanos([...ciudadanos, response]);
        setMensaje('¡Ciudadano creado exitosamente!');
      }

      limpiarFormulario();
      fetchEstadisticas();
      fetchCiudadanos(); // Recargar lista completa con JOINs
    } catch (error) {
      console.error('Error:', error);
      setMensaje(error.message || 'Ocurrió un error al procesar la solicitud.');
    }
  };

  const handleEditar = (ciudadano) => {
    setEditId(ciudadano.id);
    setNombre(ciudadano.nombre);
    setApellido(ciudadano.apellido);
    setCorreo(ciudadano.correo);
    setContrasena('');
    setTelefono(ciudadano.telefono || '');
    setDpi(ciudadano.dpi || '');
    setDireccion(ciudadano.direccion || '');
    
    // 🔧 NUEVO: Establecer COCODE y Sub-COCODE para edición
    if (ciudadano.id_subcocode) {
      const subcocode = subcodes.find(s => s.id === ciudadano.id_subcocode);
      if (subcocode) {
        setCocodeSeleccionado(subcocode.cocode_principal_id.toString());
        setSubcocodeSeleccionado(ciudadano.id_subcocode.toString());
      }
    }
    
    setMensaje('');
  };

  const handleDesactivar = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres desactivar este ciudadano?')) {
      try {
        await ciudadanosService.delete(id, 'admin');
        setCiudadanos(ciudadanos.filter(c => c.id !== id));
        setMensaje('Ciudadano desactivado exitosamente.');
        fetchEstadisticas();
      } catch (error) {
        console.error('Error:', error);
        setMensaje('Error al desactivar el ciudadano.');
      }
    }
  };

  const handleCambiarPassword = (ciudadano) => {
    setCiudadanoSeleccionado(ciudadano);
    setNuevaContrasena('');
    setModalPassword(true);
  };

  const handleSubmitPassword = async () => {
    if (!nuevaContrasena.trim()) {
      setMensaje('Por favor ingresa la nueva contraseña.');
      return;
    }

    if (nuevaContrasena.length < 6) {
      setMensaje('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      await ciudadanosService.updatePassword(ciudadanoSeleccionado.id, nuevaContrasena, 'admin');
      setMensaje('¡Contraseña cambiada exitosamente!');
      setModalPassword(false);
      setCiudadanoSeleccionado(null);
      setNuevaContrasena('');
    } catch (error) {
      console.error('Error:', error);
      setMensaje('Error al cambiar la contraseña.');
    }
  };

  const handleVerificar = async (id, verificado) => {
    try {
      await ciudadanosService.verificar(id, verificado, 'admin');
      setMensaje(verificado ? 'Ciudadano verificado' : 'Verificación removida');
      fetchCiudadanos();
    } catch (error) {
      console.error('Error:', error);
      setMensaje('Error al cambiar estado de verificación.');
    }
  };

  const limpiarFormulario = () => {
    setEditId(null);
    setNombre('');
    setApellido('');
    setCorreo('');
    setContrasena('');
    setTelefono('');
    setDpi('');
    setDireccion('');
    setCocodeSeleccionado('');
    setSubcocodeSeleccionado('');
  };

  const handleCancelar = () => {
    limpiarFormulario();
    setMensaje('');
  };

  const ciudadanosFiltrados = ciudadanos.filter(ciudadano => {
    const matchBusqueda = !busqueda || 
      ciudadano.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      ciudadano.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
      ciudadano.correo.toLowerCase().includes(busqueda.toLowerCase()) ||
      (ciudadano.dpi && ciudadano.dpi.includes(busqueda));
    
    const matchZona = !filtroZona || ciudadano.id_zona === parseInt(filtroZona);
    
    return matchBusqueda && matchZona;
  });

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <PersonIcon sx={{ fontSize: 40 }} />
        Gestión de Ciudadanos
      </Typography>

      {/* Estadísticas */}
      {estadisticas && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" color="primary">
                  {estadisticas.total_ciudadanos}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Ciudadanos
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" color="success.main">
                  {estadisticas.ciudadanos_activos}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Activos
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" color="warning.main">
                  {estadisticas.ciudadanos_inactivos}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Inactivos
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" color="info.main">
                  {estadisticas.zonas_con_ciudadanos}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Zonas con Ciudadanos
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Formulario */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          {editId ? 'Editar Ciudadano' : 'Registrar Nuevo Ciudadano'}
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Información Personal */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre *"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                InputProps={{
                  startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Apellido *"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Correo Electrónico *"
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
                InputProps={{
                  startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="DPI"
                value={dpi}
                onChange={(e) => setDpi(e.target.value)}
                placeholder="1234567890123"
                inputProps={{ maxLength: 13 }}
                InputProps={{
                  startAdornment: <BadgeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            
            {/* Contacto */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Teléfono"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="7712-3456"
                InputProps={{
                  startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>

            {/* 🔧 NUEVO: Selects en cascada (COCODE → Sub-COCODE) */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>COCODE Principal *</InputLabel>
                <Select
                  value={cocodeSeleccionado}
                  onChange={(e) => setCocodeSeleccionado(e.target.value)}
                  label="COCODE Principal *"
                  startAdornment={<LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />}
                >
                  <MenuItem value="">Seleccionar COCODE</MenuItem>
                  {cocodes.map((cocode) => (
                    <MenuItem key={cocode.id} value={cocode.id}>
                      {cocode.nombre} - {cocode.nombre_zona}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required disabled={!cocodeSeleccionado}>
                <InputLabel>Sector (Sub-COCODE) *</InputLabel>
                <Select
                  value={subcocodeSeleccionado}
                  onChange={(e) => setSubcocodeSeleccionado(e.target.value)}
                  label="Sector (Sub-COCODE) *"
                  startAdornment={<LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />}
                >
                  <MenuItem value="">Seleccionar sector</MenuItem>
                  {subcocodesDisponibles.map((subcocode) => (
                    <MenuItem key={subcocode.id} value={subcocode.id}>
                      {subcocode.nombre} {subcocode.sector ? `(${subcocode.sector})` : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Dirección */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dirección Completa"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                multiline
                rows={2}
                placeholder="Calle, número, zona, referencias..."
                InputProps={{
                  startAdornment: <HomeIcon sx={{ mr: 1, color: 'text.secondary', alignSelf: 'flex-start', mt: 1 }} />
                }}
              />
            </Grid>
            
            {/* Contraseña (solo para nuevos) */}
            {!editId && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contraseña *"
                  type="password"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  required
                  inputProps={{ minLength: 6 }}
                  helperText="Mínimo 6 caracteres"
                  InputProps={{
                    startAdornment: <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
            )}
          </Grid>

          {/* Mensaje */}
          {mensaje && (
            <Alert 
              severity={mensaje.includes('Error') || mensaje.includes('error') ? 'error' : 'success'} 
              sx={{ mt: 3 }}
              onClose={() => setMensaje('')}
            >
              {mensaje}
            </Alert>
          )}

          {/* Botones */}
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={editId ? <EditIcon /> : <AddIcon />}
            >
              {editId ? 'Actualizar Ciudadano' : 'Registrar Ciudadano'}
            </Button>
            {editId && (
              <Button
                type="button"
                variant="outlined"
                size="large"
                onClick={handleCancelar}
              >
                Cancelar
              </Button>
            )}
          </Stack>
        </form>
      </Paper>

      {/* Filtros y Búsqueda */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Buscar por nombre, correo o DPI..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => {
                setMensaje('Función de exportación próximamente');
              }}
            >
              Exportar
            </Button>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" color="textSecondary">
              Mostrando {ciudadanosFiltrados.length} de {ciudadanos.length} ciudadanos
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabla de Ciudadanos */}
      <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: 'primary.main' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                  Ciudadano
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                  DPI
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                  Contacto
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                  Sector
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                  Dirección
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ciudadanosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="textSecondary">
                      {busqueda || filtroZona ? 'No se encontraron ciudadanos con los filtros aplicados' : 'No hay ciudadanos registrados'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                ciudadanosFiltrados.map((ciudadano) => (
                  <TableRow key={ciudadano.id} hover>
                    {/* Información del Ciudadano */}
                    <TableCell>
                      <Box>
                        <Typography variant="body1" fontWeight="bold">
                          {ciudadano.nombre} {ciudadano.apellido}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {ciudadano.correo}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    {/* DPI */}
                    <TableCell>
                      {ciudadano.dpi ? (
                        <Typography variant="body2" fontFamily="monospace">
                          {ciudadano.dpi}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          Sin DPI
                        </Typography>
                      )}
                    </TableCell>
                    
                    {/* Contacto */}
                    <TableCell>
                      {ciudadano.telefono ? (
                        <Typography variant="body2">
                          📞 {ciudadano.telefono}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          Sin teléfono
                        </Typography>
                      )}
                    </TableCell>
                    
                    {/* Sector con zona */}
                    <TableCell>
                      <Box>
                        {ciudadano.nombre_subcocode && (
                          <Chip 
                            label={ciudadano.nombre_subcocode} 
                            size="small" 
                            color="primary"
                            sx={{ mb: 0.5 }}
                          />
                        )}
                        {ciudadano.nombre_zona && (
                          <Typography variant="caption" display="block" color="textSecondary">
                            📍 {ciudadano.nombre_zona}
                          </Typography>
                        )}
                        {!ciudadano.nombre_subcocode && !ciudadano.nombre_zona && (
                          <Typography variant="body2" color="textSecondary">
                            Sin asignar
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    
                    {/* Dirección */}
                    <TableCell>
                      {ciudadano.direccion ? (
                        <Tooltip title={ciudadano.direccion}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              maxWidth: 200, 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {ciudadano.direccion}
                          </Typography>
                        </Tooltip>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          Sin dirección
                        </Typography>
                      )}
                    </TableCell>
                    
                    {/* Acciones */}
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Editar">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleEditar(ciudadano)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Cambiar Contraseña">
                          <IconButton 
                            size="small" 
                            color="warning"
                            onClick={() => handleCambiarPassword(ciudadano)}
                          >
                            <LockIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Verificar">
                          <IconButton 
                            size="small" 
                            color={ciudadano.verificado_por_lider ? "success" : "default"}
                            onClick={() => handleVerificar(ciudadano.id, !ciudadano.verificado_por_lider)}
                          >
                            <VerifiedIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Desactivar">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDesactivar(ciudadano.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Modal para cambiar contraseña */}
      <Modal
        open={modalPassword}
        onClose={() => setModalPassword(false)}
        aria-labelledby="modal-password-title"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}>
          <Typography id="modal-password-title" variant="h6" component="h2" gutterBottom>
            Cambiar Contraseña
          </Typography>
          
          {ciudadanoSeleccionado && (
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Usuario: {ciudadanoSeleccionado.nombre} {ciudadanoSeleccionado.apellido}
            </Typography>
          )}
          
          <TextField
            fullWidth
            label="Nueva Contraseña"
            type="password"
            value={nuevaContrasena}
            onChange={(e) => setNuevaContrasena(e.target.value)}
            margin="normal"
            inputProps={{ minLength: 6 }}
            helperText="Mínimo 6 caracteres"
          />
          
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button
              variant="contained"
              onClick={handleSubmitPassword}
              disabled={!nuevaContrasena || nuevaContrasena.length < 6}
            >
              Cambiar Contraseña
            </Button>
            <Button
              variant="outlined"
              onClick={() => setModalPassword(false)}
            >
              Cancelar
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Container>
  );
};

export default GestionCiudadanos;