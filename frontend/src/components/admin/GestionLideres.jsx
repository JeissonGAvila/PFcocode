// frontend/src/components/admin/GestionLideres.jsx - CON SELECTS EN CASCADA
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Chip, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, FormControl, InputLabel,
  Select, MenuItem, Grid, Alert, Snackbar, CircularProgress, Tooltip, Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Lock as LockIcon,
  Refresh as RefreshIcon,
  Group as GroupIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import lideresService from '../../services/admin/lideresService.js';

const GestionLideres = () => {
  const [lideres, setLideres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cocodesPrincipales, setCocodesPrincipales] = useState([]);
  const [subCocodes, setSubCocodes] = useState([]);
  const [subCocodesFiltered, setSubCocodesFiltered] = useState([]);

  // Estados para modales
  const [openModal, setOpenModal] = useState(false);
  const [openPasswordModal, setOpenPasswordModal] = useState(false);
  const [editingLider, setEditingLider] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    contrasena: '',
    telefono: '',
    dpi: '',
    id_cocode_principal: '',
    id_subcocode: ''
  });
  const [passwordData, setPasswordData] = useState({ nueva_contrasena: '', confirmar_contrasena: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => { cargarDatos(); }, []);

  useEffect(() => {
    if (formData.id_cocode_principal) {
      const filtered = subCocodes.filter(sub => sub.cocode_principal_id === parseInt(formData.id_cocode_principal));
      setSubCocodesFiltered(filtered);
      if (formData.id_subcocode && !filtered.find(s => s.id === formData.id_subcocode)) {
        setFormData(prev => ({ ...prev, id_subcocode: '' }));
      }
    } else {
      setSubCocodesFiltered([]);
    }
  }, [formData.id_cocode_principal, subCocodes]);

  // Filtrar Sub-COCODEs cuando cambia el COCODE seleccionado
  useEffect(() => {
    if (formData.id_cocode_principal) {
      const filtered = subCocodes.filter(
        sub => sub.cocode_principal_id === parseInt(formData.id_cocode_principal)
      );
      setSubCocodesFiltered(filtered);
    } else {
      setSubCocodesFiltered([]);
      // Limpiar subcocode si no hay cocode seleccionado
      if (formData.id_subcocode) {
        setFormData(prev => ({ ...prev, id_subcocode: '' }));
      }
    }
  }, [formData.id_cocode_principal, subCocodes]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError('');
      const [lideresResponse, datosResponse] = await Promise.all([
        lideresService.getAll(),
        lideresService.getDatosSelect()
      ]);
      if (lideresResponse.success) setLideres(lideresResponse.lideres);
      if (datosResponse.success) {
        setCocodesPrincipales(datosResponse.cocode_principales);
        setSubCocodes(datosResponse.sub_cocode);
      }
    } catch (error) {
      setError(error.message);
      mostrarSnackbar('Error al cargar datos: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const mostrarSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const abrirModalCrear = () => {
    setFormData({
      nombre: '',
      apellido: '',
      correo: '',
      contrasena: '',
      telefono: '',
      dpi: '',
      id_cocode_principal: '',
      id_subcocode: ''
    });
    setSubCocodesFiltered([]);
    setEditingLider(null);
    setIsEditing(false);
    setOpenModal(true);
  };

  const abrirModalEditar = (lider) => {
    // Encontrar el COCODE del subcocode para pre-llenar el filtro
    const subcocode = subCocodes.find(s => s.id === lider.id_subcocode);
    setFormData({
      nombre: lider.nombre || '',
      apellido: lider.apellido || '',
      correo: lider.correo || '',
      contrasena: '',
      telefono: lider.telefono || '',
      dpi: lider.dpi || '',
      id_cocode_principal: lider.id_cocode_principal || '',
      id_subcocode: lider.id_subcocode || ''
    });
    setEditingLider(lider);
    setIsEditing(true);
    setOpenModal(true);
  };

  const abrirModalPassword = (lider) => {
    setEditingLider(lider);
    setPasswordData({ nueva_contrasena: '', confirmar_contrasena: '' });
    setOpenPasswordModal(true);
  };

  const cerrarModales = () => {
    setOpenModal(false);
    setOpenPasswordModal(false);
    setEditingLider(null);
    setIsEditing(false);
    setSubCocodesFiltered([]);

    setFormData({
      nombre: '',
      apellido: '',
      correo: '',
      contrasena: '',
      telefono: '',
      dpi: '',
      id_cocode_principal: '',
      id_subcocode: ''
    });
    setPasswordData({
      nueva_contrasena: '',
      confirmar_contrasena: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Si cambia el COCODE, limpiar el Sub-COCODE
    if (name === 'id_cocode_principal') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        id_subcocode: '' // Limpiar subcocode cuando cambia cocode
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async () => {
    try {

      // Validaciones básicas
      if (!formData.nombre || !formData.apellido || !formData.correo) {
        mostrarSnackbar('Por favor completa los campos obligatorios: nombre, apellido y correo', 'error');
        return;
      }
      if (!isEditing && !formData.contrasena) {
        mostrarSnackbar('La contraseña es requerida', 'error');
        return;
      }
      if (formData.contrasena && formData.contrasena.length < 6) {
        mostrarSnackbar('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.correo)) {
        mostrarSnackbar('El formato del correo electrónico no es válido', 'error');
        return;
      }

      // Validar que haya seleccionado un Sub-COCODE (obligatorio)
      if (!formData.id_subcocode) {
        mostrarSnackbar('Debe seleccionar un Sub-COCODE (sector) específico', 'error');
        return;
      }

      setLoading(true);

      // Preparar datos: SOLO enviar id_subcocode, NO enviar id_cocode_principal
      const dataToSend = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        correo: formData.correo,
        telefono: formData.telefono,
        dpi: formData.dpi,
        id_subcocode: formData.id_subcocode, // Solo este se guarda
        es_lider_principal: false // Siempre false porque es líder de sector
      };

      // Agregar contraseña solo si no es edición
      if (!isEditing) {
        dataToSend.contrasena = formData.contrasena;
      }

      if (isEditing) {
        await lideresService.update(editingLider.id, dataToSend);
        mostrarSnackbar('Líder actualizado exitosamente', 'success');
      } else {
        await lideresService.create(dataToSend);
        mostrarSnackbar('Líder creado exitosamente', 'success');
      }

      cerrarModales();
      cargarDatos();
    } catch (error) {
      mostrarSnackbar(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    try {
      if (!passwordData.nueva_contrasena || !passwordData.confirmar_contrasena) {
        mostrarSnackbar('Complete ambos campos', 'error');
        return;
      }
      if (passwordData.nueva_contrasena !== passwordData.confirmar_contrasena) {
        mostrarSnackbar('Las contraseñas no coinciden', 'error');
        return;
      }
      if (passwordData.nueva_contrasena.length < 6) {
        mostrarSnackbar('Mínimo 6 caracteres', 'error');
        return;
      }
      setLoading(true);
      await lideresService.updatePassword(editingLider.id, passwordData.nueva_contrasena);
      mostrarSnackbar('Contraseña actualizada', 'success');
      cerrarModales();
    } catch (error) {
      mostrarSnackbar(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (lider) => {
    if (window.confirm(`¿Desactivar a ${lider.nombre} ${lider.apellido}?`)) {
      try {
        setLoading(true);
        await lideresService.delete(lider.id);
        mostrarSnackbar('Líder desactivado', 'success');
        cargarDatos();
      } catch (error) {
        mostrarSnackbar(error.message, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && lideres.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>Cargando...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Gestión de Líderes COCODE ({lideres.length} total)
        </Typography>
        <Box display="flex" gap={2}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={cargarDatos} disabled={loading}>
            Actualizar
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={abrirModalCrear} disabled={loading}>
            Agregar Líder
          </Button>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Instrucciones:</strong> Selecciona un COCODE principal. Si deseas asignar un Sub-COCODE específico, selecciónalo de la lista filtrada.
          Si solo seleccionas COCODE, será líder principal. Si seleccionas COCODE + Sub-COCODE, será líder de ese sector específico.
        </Typography>
      </Alert>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'grey.100' }}>
              <TableCell><strong>Nombre</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Tipo</strong></TableCell>
              <TableCell><strong>Asignación</strong></TableCell>
              <TableCell><strong>Zona</strong></TableCell>
              <TableCell><strong>Teléfono</strong></TableCell>
              <TableCell><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lideres.map((lider) => (
              <TableRow key={lider.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {lider.nombre} {lider.apellido}
                  </Typography>
                  {lider.dpi && (
                    <Typography variant="caption" color="textSecondary">
                      DPI: {lider.dpi}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {lider.correo}
                  </Typography>
                  {lider.dpi && (
                    <Typography variant="caption" color="textSecondary">DPI: {lider.dpi}</Typography>
                  )}
                </TableCell>
                <TableCell>{lider.correo}</TableCell>
                <TableCell>
                  <Chip
                    label={lider.es_lider_principal ? 'Líder Principal' : 'Líder Sub-COCODE'}
                    color={lider.es_lider_principal ? 'primary' : 'secondary'}
                    size="small"
                    icon={lider.es_lider_principal ? <CheckCircleIcon /> : <GroupIcon />}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {lider.es_lider_principal 
                      ? lider.cocode_nombre || 'Sin asignar'
                      : lider.subcocode_nombre 
                        ? `${lider.subcocode_nombre} (${lider.subcocode_sector})`
                        : 'Sin asignar'
                    }
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {lider.zona_nombre || 'Sin zona'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {lider.telefono || 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Tooltip title="Editar">
                      <IconButton size="small" color="primary" onClick={() => abrirModalEditar(lider)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Cambiar contraseña">
                      <IconButton size="small" color="warning" onClick={() => abrirModalPassword(lider)}>
                        <LockIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Desactivar">
                      <IconButton size="small" color="error" onClick={() => handleDelete(lider)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal Crear/Editar */}
      <Dialog open={openModal} onClose={cerrarModales} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <GroupIcon />
            {isEditing ? 'Editar Líder de Sector' : 'Crear Líder de Sector'}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}><Typography variant="subtitle1" fontWeight="bold">Información Personal</Typography><Divider /></Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Nombre *" name="nombre" value={formData.nombre} onChange={handleInputChange} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Apellido *" name="apellido" value={formData.apellido} onChange={handleInputChange} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Correo *" name="correo" type="email" value={formData.correo} onChange={handleInputChange} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Teléfono" name="telefono" value={formData.telefono} onChange={handleInputChange} placeholder="7712-3456" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="DPI"
                name="dpi"
                value={formData.dpi}
                onChange={handleInputChange}
                placeholder="1234567890101"
                inputProps={{ maxLength: 13 }}
              />
            </Grid>
            {!isEditing && (
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Contraseña *" name="contrasena" type="password" value={formData.contrasena} onChange={handleInputChange} required helperText="Mínimo 6 caracteres" />
              </Grid>
            )}

            {/* Asignación Territorial */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Asignación Territorial
              </Typography>
              <Divider />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>COCODE Principal *</InputLabel>
                <Select
                  name="id_cocode_principal"
                  value={formData.id_cocode_principal}
                  onChange={handleInputChange}
                  label="COCODE Principal *"
                >
                  <MenuItem value="">
                    <em>Seleccione un COCODE</em>
                  </MenuItem>
                  {cocodesPrincipales.map((cocode) => (
                    <MenuItem key={cocode.id} value={cocode.id}>
                      {cocode.nombre} - {cocode.zona_nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={!formData.id_cocode_principal || subCocodesFiltered.length === 0}>
                <InputLabel>Sub-COCODE (Opcional)</InputLabel>
                <Select
                  name="id_subcocode"
                  value={formData.id_subcocode}
                  onChange={handleInputChange}
                  label="Sub-COCODE (Opcional)"
                >
                  <MenuItem value="">
                    <em>Ninguno - Será Líder Principal</em>
                  </MenuItem>
                  {subCocodesFiltered.map((subcocode) => (
                    <MenuItem key={subcocode.id} value={subcocode.id}>
                      {subcocode.nombre} ({subcocode.sector})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                {!formData.id_cocode_principal 
                  ? 'Primero selecciona un COCODE principal'
                  : subCocodesFiltered.length === 0
                    ? 'No hay Sub-COCODEs disponibles para este COCODE'
                    : formData.id_subcocode
                      ? 'Será líder de este Sub-COCODE específico'
                      : 'Si no seleccionas, será Líder Principal del COCODE'
                }
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarModales}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : (isEditing ? 'Actualizar' : 'Crear')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Contraseña */}
      <Dialog open={openPasswordModal} onClose={cerrarModales} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <LockIcon />Cambiar Contraseña
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Nueva Contraseña *" name="nueva_contrasena" type="password" value={passwordData.nueva_contrasena} onChange={(e) => setPasswordData(prev => ({ ...prev, nueva_contrasena: e.target.value }))} helperText="Mínimo 6 caracteres" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Confirmar *" name="confirmar_contrasena" type="password" value={passwordData.confirmar_contrasena} onChange={(e) => setPasswordData(prev => ({ ...prev, confirmar_contrasena: e.target.value }))} error={passwordData.confirmar_contrasena && passwordData.nueva_contrasena !== passwordData.confirmar_contrasena} helperText={passwordData.confirmar_contrasena && passwordData.nueva_contrasena !== passwordData.confirmar_contrasena ? "No coinciden" : ""} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarModales}>Cancelar</Button>
          <Button onClick={handlePasswordSubmit} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Cambiar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default GestionLideres;