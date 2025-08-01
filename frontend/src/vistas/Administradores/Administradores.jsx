import { useEffect, useState } from 'react';
import {
  Container, Typography, TextField, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Stack, Alert, Box,
  CircularProgress, Switch, FormControlLabel, Chip, Modal, Select,
  MenuItem, FormControl, InputLabel, InputAdornment
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Security as SecurityIcon,
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { styles } from './Administradores.styles';

// Roles disponibles
const rolesDisponibles = [
  'Administrador General',
  'Supervisor',
  'Coordinador',
  'Asistente',
  'Técnico'
];

// Departamentos disponibles  
const departamentosDisponibles = [
  'Obras Públicas',
  'Servicios Municipales',
  'Administración',
  'Recursos Humanos',
  'Tecnología',
  'Planificación',
  'Finanzas',
  'Secretaría'
];

const Administradores = () => {
  const [administradores, setAdministradores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [telefono, setTelefono] = useState('');
  const [rol, setRol] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [puedeAsignar, setPuedeAsignar] = useState(false);
  const [zonasResponsabilidad, setZonasResponsabilidad] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [editId, setEditId] = useState(null);
  
  // Estados para modal de contraseña
  const [modalPassword, setModalPassword] = useState(false);
  const [adminSeleccionado, setAdminSeleccionado] = useState(null);
  const [nuevaContrasena, setNuevaContrasena] = useState('');

  // Cargar administradores al montar el componente
  useEffect(() => {
    fetchAdministradores();
  }, []);

  const fetchAdministradores = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/administradores');
      const data = await response.json();
      setAdministradores(data);
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener administradores:', error);
      setMensaje('Error al obtener administradores');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');

    if (!nombre.trim() || !apellido.trim() || !correo.trim()) {
      setMensaje('Por favor completa los campos obligatorios (Nombre, Apellido y Correo).');
      return;
    }

    if (!editId && !contrasena.trim()) {
      setMensaje('La contraseña es obligatoria para nuevos administradores.');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      setMensaje('Por favor ingresa un correo electrónico válido.');
      return;
    }

    try {
      if (editId) {
        // Editar administrador existente (SIN contraseña)
        const response = await fetch(`http://localhost:3001/api/administradores/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre,
            apellido,
            correo,
            telefono: telefono.trim() || null,
            rol: rol || null,
            departamento: departamento || null,
            puede_asignar: puedeAsignar,
            zonas_responsabilidad: zonasResponsabilidad.trim() || null,
            usuario_modifica: 'admin'
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al actualizar');
        }

        const actualizado = await response.json();
        setAdministradores(administradores.map(admin => 
          admin.id === editId ? actualizado : admin
        ));
        setMensaje('¡Administrador actualizado exitosamente!');
        limpiarFormulario();
      } else {
        // Crear nuevo administrador
        const response = await fetch('http://localhost:3001/api/administradores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre,
            apellido,
            correo,
            contrasena,
            telefono: telefono.trim() || null,
            rol: rol || null,
            departamento: departamento || null,
            puede_asignar: puedeAsignar,
            zonas_responsabilidad: zonasResponsabilidad.trim() || null,
            usuario_ingreso: 'admin'
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al crear');
        }

        const nuevo = await response.json();
        setAdministradores([...administradores, nuevo]);
        setMensaje('¡Administrador creado exitosamente!');
        limpiarFormulario();
      }
    } catch (error) {
      console.error('Error:', error);
      setMensaje(error.message || 'Ocurrió un error al procesar la solicitud.');
    }
  };

  const handleEditar = (admin) => {
    setEditId(admin.id);
    setNombre(admin.nombre);
    setApellido(admin.apellido);
    setCorreo(admin.correo);
    setContrasena(''); // No mostrar contraseña existente
    setTelefono(admin.telefono || '');
    setRol(admin.rol || '');
    setDepartamento(admin.departamento || '');
    setPuedeAsignar(admin.puede_asignar || false);
    setZonasResponsabilidad(admin.zonas_responsabilidad || '');
    setMensaje('');
  };

  const handleDesactivar = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres desactivar este administrador?')) {
      try {
        const response = await fetch(`http://localhost:3001/api/administradores/${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usuario_modifica: 'admin' })
        });

        if (!response.ok) throw new Error('Error al desactivar');

        setAdministradores(administradores.filter(admin => admin.id !== id));
        setMensaje('Administrador desactivado exitosamente.');
      } catch (error) {
        console.error('Error:', error);
        setMensaje('Error al desactivar el administrador.');
      }
    }
  };

  const handleCambiarPassword = (admin) => {
    setAdminSeleccionado(admin);
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
      const response = await fetch(`http://localhost:3001/api/administradores/${adminSeleccionado.id}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nueva_contrasena: nuevaContrasena,
          usuario_modifica: 'admin'
        })
      });

      if (!response.ok) throw new Error('Error al cambiar contraseña');

      setMensaje('¡Contraseña cambiada exitosamente!');
      setModalPassword(false);
      setAdminSeleccionado(null);
      setNuevaContrasena('');
    } catch (error) {
      console.error('Error:', error);
      setMensaje('Error al cambiar la contraseña.');
    }
  };

  const limpiarFormulario = () => {
    setEditId(null);
    setNombre('');
    setApellido('');
    setCorreo('');
    setContrasena('');
    setTelefono('');
    setRol('');
    setDepartamento('');
    setPuedeAsignar(false);
    setZonasResponsabilidad('');
  };

  const handleCancelar = () => {
    limpiarFormulario();
    setMensaje('');
  };

  // Función para formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return 'Nunca';
    return new Date(fecha).toLocaleString('es-GT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={styles.container}>
        <Box sx={styles.loadingContainer}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={styles.container}>
      <Typography variant="h4" sx={styles.titulo}>
        Gestión de Administradores
      </Typography>

      {/* Formulario */}
      <Paper sx={styles.formPaper}>
        <form onSubmit={handleSubmit}>
          <Stack sx={styles.formStack}>
            {/* Primera fila: Información personal */}
            <Box sx={styles.formRow}>
              <TextField
                label="Nombre *"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                sx={styles.textField}
                placeholder="Nombre"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                label="Apellido *"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                required
                sx={styles.textField}
                placeholder="Apellido"
              />

              <TextField
                label="Correo Electrónico *"
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
                sx={styles.emailField}
                placeholder="correo@municipalidad.gob.gt"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
              />

              {!editId && (
                <TextField
                  label="Contraseña *"
                  type="password"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  required={!editId}
                  sx={styles.passwordField}
                  placeholder="Mínimo 6 caracteres"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            </Box>

            {/* Segunda fila: Información laboral */}
            <Box sx={styles.formRow}>
              <TextField
                label="Teléfono"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                sx={styles.textField}
                placeholder="7712-3456"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon />
                    </InputAdornment>
                  ),
                }}
              />

              <FormControl sx={styles.textField}>
                <InputLabel>Rol</InputLabel>
                <Select
                  value={rol}
                  onChange={(e) => setRol(e.target.value)}
                  label="Rol"
                >
                  {rolesDisponibles.map((rolItem) => (
                    <MenuItem key={rolItem} value={rolItem}>
                      {rolItem}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={styles.textField}>
                <InputLabel>Departamento</InputLabel>
                <Select
                  value={departamento}
                  onChange={(e) => setDepartamento(e.target.value)}
                  label="Departamento"
                >
                  {departamentosDisponibles.map((deptItem) => (
                    <MenuItem key={deptItem} value={deptItem}>
                      {deptItem}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Zonas de Responsabilidad"
                value={zonasResponsabilidad}
                onChange={(e) => setZonasResponsabilidad(e.target.value)}
                multiline
                rows={2}
                sx={styles.zonasField}
                placeholder="Ej: Zona 1, Zona 3, Zona Centro..."
                helperText="Especifica las zonas que puede gestionar"
              />
            </Box>

            {/* Tercera fila: Permisos y botones */}
            <Box sx={styles.formRow}>
              <Box sx={styles.switchContainer}>
                <Typography variant="body2" fontWeight="medium" color="text.secondary">
                  Puede Asignar Reportes
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={puedeAsignar}
                      onChange={(e) => setPuedeAsignar(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={puedeAsignar ? 'Sí' : 'No'}
                  sx={styles.switchField}
                />
              </Box>

              <Box sx={styles.buttonContainer}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  size="large"
                  sx={styles.submitButton}
                >
                  {editId ? 'Actualizar' : 'Crear Administrador'}
                </Button>

                {editId && (
                  <Button 
                    variant="outlined" 
                    color="secondary" 
                    onClick={handleCancelar}
                    size="large"
                    sx={styles.cancelButton}
                  >
                    Cancelar
                  </Button>
                )}
              </Box>
            </Box>
          </Stack>
        </form>

        {mensaje && (
          <Alert 
            severity={mensaje.startsWith('¡') ? 'success' : 'error'} 
            sx={styles.alert}
          >
            {mensaje}
          </Alert>
        )}
      </Paper>

      {/* Tabla */}
      <TableContainer component={Paper} sx={styles.tablePaper}>
        <Table sx={styles.table}>
          <TableHead sx={styles.tableHead}>
            <TableRow>
              <TableCell>Administrador</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Departamento</TableCell>
              <TableCell align="center">Puede Asignar</TableCell>
              <TableCell>Zonas</TableCell>
              <TableCell>Último Acceso</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {administradores.map((admin) => (
              <TableRow key={admin.id} hover>
                <TableCell sx={styles.tableCell}>
                  <Box sx={styles.nombreCell}>
                    <Typography sx={styles.nombrePrincipal}>
                      {admin.nombre} {admin.apellido}
                    </Typography>
                    <Typography sx={styles.correoSecundario}>
                      {admin.correo}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={styles.tableCell}>
                  {admin.telefono || 'N/A'}
                </TableCell>
                <TableCell sx={styles.tableCell}>
                  <Box sx={styles.rolCell}>
                    {admin.rol ? (
                      <Chip
                        icon={<SecurityIcon />}
                        label={admin.rol}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Sin rol
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell sx={styles.tableCell}>
                  <Box sx={styles.departamentoCell} title={admin.departamento}>
                    {admin.departamento || 'N/A'}
                  </Box>
                </TableCell>
                <TableCell align="center" sx={styles.tableCell}>
                  <Box sx={styles.puedeAsignarCell}>
                    <Chip
                      icon={admin.puede_asignar ? <CheckCircleIcon /> : <CancelIcon />}
                      label={admin.puede_asignar ? 'Sí' : 'No'}
                      color={admin.puede_asignar ? 'success' : 'default'}
                      variant={admin.puede_asignar ? 'filled' : 'outlined'}
                      sx={styles.puedeAsignarChip}
                      size="small"
                    />
                  </Box>
                </TableCell>
                <TableCell sx={styles.tableCell}>
                  <Box sx={styles.zonasCell} title={admin.zonas_responsabilidad}>
                    {admin.zonas_responsabilidad || 'Todas las zonas'}
                  </Box>
                </TableCell>
                <TableCell sx={styles.tableCell}>
                  <Typography sx={styles.ultimoAccesoCell}>
                    {formatearFecha(admin.ultimo_acceso)}
                  </Typography>
                </TableCell>
                <TableCell align="center" sx={styles.tableCell}>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={() => handleEditar(admin)}
                    sx={styles.actionButton}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outlined"
                    color="warning"
                    size="small"
                    onClick={() => handleCambiarPassword(admin)}
                    sx={styles.passwordButton}
                    startIcon={<LockIcon />}
                  >
                    Contraseña
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDesactivar(admin.id)}
                    sx={styles.actionButton}
                  >
                    Desactivar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {administradores.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} sx={styles.emptyTableMessage}>
                  No hay administradores registrados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal para cambiar contraseña */}
      <Modal
        open={modalPassword}
        onClose={() => setModalPassword(false)}
        sx={styles.modal}
      >
        <Paper sx={styles.modalPaper}>
          <Typography variant="h6" sx={styles.modalTitle}>
            Cambiar Contraseña
          </Typography>
          
          {adminSeleccionado && (
            <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
              Administrador: <strong>{adminSeleccionado.nombre} {adminSeleccionado.apellido}</strong>
            </Typography>
          )}

          <TextField
            label="Nueva Contraseña"
            type="password"
            value={nuevaContrasena}
            onChange={(e) => setNuevaContrasena(e.target.value)}
            fullWidth
            placeholder="Mínimo 6 caracteres"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon />
                </InputAdornment>
              ),
            }}
            helperText="La contraseña debe tener al menos 6 caracteres"
          />

          <Box sx={styles.modalButtons}>
            <Button
              variant="outlined"
              onClick={() => setModalPassword(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="warning"
              onClick={handleSubmitPassword}
              startIcon={<LockIcon />}
            >
              Cambiar Contraseña
            </Button>
          </Box>
        </Paper>
      </Modal>
    </Container>
  );
};

export default Administradores;