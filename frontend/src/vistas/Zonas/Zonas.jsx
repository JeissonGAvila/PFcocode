import { useEffect, useState } from 'react';
import {
  Container, Typography, TextField, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Stack, Alert, Box,
  CircularProgress, InputAdornment
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  People as PeopleIcon,
  SquareFoot as AreaIcon
} from '@mui/icons-material';
import { styles } from './Zonas.styles';

const Zonas = () => {
  const [zonas, setZonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState('');
  const [numeroZona, setNumeroZona] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [poblacionEstimada, setPoblacionEstimada] = useState('');
  const [areaKm2, setAreaKm2] = useState('');
  const [coordenadasCentro, setCoordenadasCentro] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [editId, setEditId] = useState(null);

  // Cargar zonas al montar el componente
  useEffect(() => {
    fetchZonas();
  }, []);

  const fetchZonas = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/zonas');
      const data = await response.json();
      setZonas(data);
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener zonas:', error);
      setMensaje('Error al obtener zonas');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');

    if (!nombre.trim() || !numeroZona.trim()) {
      setMensaje('Por favor completa los campos obligatorios (Nombre y Número de Zona).');
      return;
    }

    const numeroZonaNumber = parseInt(numeroZona);
    if (isNaN(numeroZonaNumber) || numeroZonaNumber <= 0) {
      setMensaje('El número de zona debe ser un número positivo.');
      return;
    }

    // Validar población si se proporciona
    let poblacionNumber = null;
    if (poblacionEstimada.trim()) {
      poblacionNumber = parseInt(poblacionEstimada);
      if (isNaN(poblacionNumber) || poblacionNumber < 0) {
        setMensaje('La población estimada debe ser un número válido.');
        return;
      }
    }

    // Validar área si se proporciona
    let areaNumber = null;
    if (areaKm2.trim()) {
      areaNumber = parseFloat(areaKm2);
      if (isNaN(areaNumber) || areaNumber < 0) {
        setMensaje('El área debe ser un número válido.');
        return;
      }
    }

    try {
      if (editId) {
        // Editar zona existente
        const response = await fetch(`http://localhost:3001/api/zonas/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre,
            numero_zona: numeroZonaNumber,
            descripcion: descripcion.trim() || null,
            poblacion_estimada: poblacionNumber,
            area_km2: areaNumber,
            coordenadas_centro: coordenadasCentro.trim() || null,
            usuario_modifica: 'admin'
          })
        });

        if (!response.ok) throw new Error('Error al actualizar');

        const actualizada = await response.json();
        setZonas(zonas.map(zona => zona.id === editId ? actualizada : zona).sort((a, b) => (a.numero_zona || 0) - (b.numero_zona || 0)));
        setMensaje('¡Zona actualizada exitosamente!');
        limpiarFormulario();
      } else {
        // Crear nueva zona
        const response = await fetch('http://localhost:3001/api/zonas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre,
            numero_zona: numeroZonaNumber,
            descripcion: descripcion.trim() || null,
            poblacion_estimada: poblacionNumber,
            area_km2: areaNumber,
            coordenadas_centro: coordenadasCentro.trim() || null,
            usuario_ingreso: 'admin'
          })
        });

        if (!response.ok) throw new Error('Error al crear');

        const nueva = await response.json();
        setZonas([...zonas, nueva].sort((a, b) => (a.numero_zona || 0) - (b.numero_zona || 0)));
        setMensaje('¡Zona creada exitosamente!');
        limpiarFormulario();
      }
    } catch (error) {
      console.error('Error:', error);
      setMensaje('Ocurrió un error al procesar la solicitud.');
    }
  };

  const handleEditar = (zona) => {
    setEditId(zona.id);
    setNombre(zona.nombre);
    setNumeroZona(zona.numero_zona?.toString() || '');
    setDescripcion(zona.descripcion || '');
    setPoblacionEstimada(zona.poblacion_estimada?.toString() || '');
    setAreaKm2(zona.area_km2?.toString() || '');
    setCoordenadasCentro(zona.coordenadas_centro || '');
    setMensaje('');
  };

  const handleDesactivar = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres desactivar esta zona?')) {
      try {
        const response = await fetch(`http://localhost:3001/api/zonas/${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usuario_modifica: 'admin' })
        });

        if (!response.ok) throw new Error('Error al desactivar');

        setZonas(zonas.filter(zona => zona.id !== id));
        setMensaje('Zona desactivada exitosamente.');
      } catch (error) {
        console.error('Error:', error);
        setMensaje('Error al desactivar la zona.');
      }
    }
  };

  const limpiarFormulario = () => {
    setEditId(null);
    setNombre('');
    setNumeroZona('');
    setDescripcion('');
    setPoblacionEstimada('');
    setAreaKm2('');
    setCoordenadasCentro('');
  };

  const handleCancelar = () => {
    limpiarFormulario();
    setMensaje('');
  };

  // Función para obtener el siguiente número de zona disponible
  const getSiguienteNumeroZona = () => {
    if (zonas.length === 0) return 1;
    const numerosUsados = zonas.map(z => z.numero_zona || 0).filter(n => n > 0);
    if (numerosUsados.length === 0) return 1;
    const maxNumero = Math.max(...numerosUsados);
    return maxNumero + 1;
  };

  // Auto-llenar número de zona si está vacío
  useEffect(() => {
    if (!editId && numeroZona === '') {
      setNumeroZona(getSiguienteNumeroZona().toString());
    }
  }, [zonas, editId, numeroZona]);

  // Función para formatear números
  const formatearNumero = (numero) => {
    if (!numero) return 'N/A';
    return numero.toLocaleString();
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
        Gestión de Zonas
      </Typography>

      {/* Formulario */}
      <Paper sx={styles.formPaper}>
        <form onSubmit={handleSubmit}>
          <Stack sx={styles.formStack}>
            {/* Primera fila: Información básica */}
            <Box sx={styles.formRow}>
              <TextField
                label="Nombre *"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                sx={styles.textField}
                placeholder="Ej: Zona Centro"
              />
              
              <TextField
                label="Número de Zona *"
                type="number"
                value={numeroZona}
                onChange={(e) => setNumeroZona(e.target.value)}
                required
                sx={styles.numberField}
                inputProps={{ min: 1, step: 1 }}
                placeholder="1"
              />

              <TextField
                label="Descripción"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                multiline
                rows={2}
                sx={styles.descriptionField}
                placeholder="Descripción de la zona y sus características"
              />
            </Box>

            {/* Segunda fila: Datos demográficos y geográficos */}
            <Box sx={styles.formRow}>
              <TextField
                label="Población Estimada"
                type="number"
                value={poblacionEstimada}
                onChange={(e) => setPoblacionEstimada(e.target.value)}
                sx={styles.textField}
                placeholder="15000"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PeopleIcon />
                    </InputAdornment>
                  ),
                }}
                inputProps={{ min: 0, step: 1 }}
              />

              <TextField
                label="Área (km²)"
                type="number"
                value={areaKm2}
                onChange={(e) => setAreaKm2(e.target.value)}
                sx={styles.areaField}
                placeholder="25.5"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AreaIcon />
                    </InputAdornment>
                  ),
                }}
                inputProps={{ min: 0, step: 0.01 }}
              />

              <TextField
                label="Coordenadas Centro"
                value={coordenadasCentro}
                onChange={(e) => setCoordenadasCentro(e.target.value)}
                sx={styles.coordenadasField}
                placeholder="15.5161, -91.5225"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationIcon />
                    </InputAdornment>
                  ),
                }}
                helperText="Formato: latitud, longitud"
              />

              <Box sx={styles.buttonContainer}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  size="large"
                  sx={styles.submitButton}
                >
                  {editId ? 'Actualizar' : 'Crear Zona'}
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
              <TableCell>Zona #</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Población</TableCell>
              <TableCell>Área (km²)</TableCell>
              <TableCell>Coordenadas</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {zonas.map((zona) => (
              <TableRow key={zona.id} hover>
                <TableCell sx={styles.tableCell}>
                  <Box sx={styles.numeroZonaCell}>
                    <Box sx={styles.numeroZonaBadge}>
                      {zona.numero_zona || '?'}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={styles.tableCell}>
                  <strong>{zona.nombre}</strong>
                </TableCell>
                <TableCell sx={styles.tableCell}>
                  {zona.descripcion || 'Sin descripción'}
                </TableCell>
                <TableCell sx={styles.tableCell}>
                  <Box sx={styles.poblacionCell}>
                    <PeopleIcon fontSize="small" color="action" />
                    {formatearNumero(zona.poblacion_estimada)}
                  </Box>
                </TableCell>
                <TableCell sx={styles.tableCell}>
                  <Box sx={styles.areaCell}>
                    {zona.area_km2 ? (
                      <>
                        <strong>{zona.area_km2} km²</strong>
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        N/A
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell sx={styles.tableCell}>
                  <Box sx={styles.coordenadasCell} title={zona.coordenadas_centro}>
                    {zona.coordenadas_centro || 'N/A'}
                  </Box>
                </TableCell>
                <TableCell align="center" sx={styles.tableCell}>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={() => handleEditar(zona)}
                    sx={styles.actionButton}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDesactivar(zona.id)}
                    sx={styles.actionButton}
                  >
                    Desactivar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {zonas.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} sx={styles.emptyTableMessage}>
                  No hay zonas registradas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Zonas;