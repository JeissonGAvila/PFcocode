// frontend/src/components/common/ComentariosSection.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  Avatar,
  Stack,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Collapse
} from '@mui/material';
import {
  Comment as CommentIcon,
  Send as SendIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Engineering as TecnicoIcon,
  Groups as LiderIcon
} from '@mui/icons-material';
import ciudadanoService from '../../services/ciudadano/ciudadanoService';

const ComentariosSection = ({ reporteId, onComentarioAgregado }) => {
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingComentarios, setLoadingComentarios] = useState(true);
  const [error, setError] = useState('');
  const [expandido, setExpandido] = useState(false);
  const [totalComentarios, setTotalComentarios] = useState(0);

  // Cargar comentarios al inicializar
  useEffect(() => {
    if (reporteId) {
      cargarComentarios();
    }
  }, [reporteId]);

  const cargarComentarios = async () => {
    try {
      setLoadingComentarios(true);
      const response = await ciudadanoService.obtenerComentarios(reporteId);
      if (response.success) {
        setComentarios(response.comentarios || []);
        setTotalComentarios(response.total || 0);
      }
    } catch (error) {
      console.error('Error al cargar comentarios:', error);
      setError('Error al cargar comentarios');
    } finally {
      setLoadingComentarios(false);
    }
  };

  const handleAgregarComentario = async () => {
    if (!nuevoComentario.trim()) {
      setError('El comentario no puede estar vacío');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await ciudadanoService.agregarComentario(reporteId, nuevoComentario.trim());
      
      if (response.success) {
        setNuevoComentario('');
        await cargarComentarios(); // Recargar comentarios
        
        // Notificar al componente padre si hay callback
        if (onComentarioAgregado) {
          onComentarioAgregado(response.comentario);
        }
      }
    } catch (error) {
      console.error('Error al agregar comentario:', error);
      setError(error.message || 'Error al agregar comentario');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && event.ctrlKey) {
      handleAgregarComentario();
    }
  };

  const getIconoTipoUsuario = (tipoUsuario) => {
    switch (tipoUsuario) {
      case 'admin': return <AdminIcon fontSize="small" />;
      case 'tecnico': return <TecnicoIcon fontSize="small" />;
      case 'lider': return <LiderIcon fontSize="small" />;
      case 'ciudadano': return <PersonIcon fontSize="small" />;
      default: return <PersonIcon fontSize="small" />;
    }
  };

  const getColorTipoUsuario = (tipoUsuario) => {
    switch (tipoUsuario) {
      case 'admin': return 'error';
      case 'tecnico': return 'warning';
      case 'lider': return 'info';
      case 'ciudadano': return 'success';
      default: return 'default';
    }
  };

  const getNombreTipoUsuario = (tipoUsuario) => {
    switch (tipoUsuario) {
      case 'admin': return 'Administrador';
      case 'tecnico': return 'Técnico';
      case 'lider': return 'Líder COCODE';
      case 'ciudadano': return 'Ciudadano';
      default: return 'Usuario';
    }
  };

  const formatearFecha = (fecha) => {
    const ahora = new Date();
    const fechaComentario = new Date(fecha);
    const diffMs = ahora - fechaComentario;
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDias = Math.floor(diffHoras / 24);

    if (diffHoras < 1) {
      const diffMinutos = Math.floor(diffMs / (1000 * 60));
      return diffMinutos < 1 ? 'Hace un momento' : `Hace ${diffMinutos} min`;
    } else if (diffHoras < 24) {
      return `Hace ${diffHoras} hora${diffHoras > 1 ? 's' : ''}`;
    } else if (diffDias < 7) {
      return `Hace ${diffDias} día${diffDias > 1 ? 's' : ''}`;
    } else {
      return fechaComentario.toLocaleDateString();
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      {/* Header de comentarios */}
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="space-between"
        sx={{ cursor: 'pointer' }}
        onClick={() => setExpandido(!expandido)}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <CommentIcon color="action" />
          <Typography variant="subtitle2" color="text.secondary">
            Comentarios {totalComentarios > 0 && `(${totalComentarios})`}
          </Typography>
        </Box>
        
        <IconButton size="small">
          {expandido ? <CollapseIcon /> : <ExpandIcon />}
        </IconButton>
      </Box>

      <Collapse in={expandido}>
        <Box sx={{ mt: 2 }}>
          {/* Lista de comentarios */}
          {loadingComentarios ? (
            <Box display="flex" justifyContent="center" py={2}>
              <CircularProgress size={24} />
            </Box>
          ) : comentarios.length > 0 ? (
            <Stack spacing={2} sx={{ maxHeight: 300, overflowY: 'auto', mb: 2 }}>
              {comentarios.map((comentario) => (
                <Paper 
                  key={comentario.id} 
                  elevation={1} 
                  sx={{ p: 2, bgcolor: 'grey.50' }}
                >
                  <Box display="flex" gap={2}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: getColorTipoUsuario(comentario.tipo_usuario_comentario) + '.main' }}>
                      {getIconoTipoUsuario(comentario.tipo_usuario_comentario)}
                    </Avatar>
                    
                    <Box flex={1}>
                      <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {comentario.nombre_usuario}
                        </Typography>
                        
                        <Chip 
                          label={getNombreTipoUsuario(comentario.tipo_usuario_comentario)}
                          size="small"
                          color={getColorTipoUsuario(comentario.tipo_usuario_comentario)}
                          variant="outlined"
                        />
                        
                        {comentario.es_interno && (
                          <Chip 
                            label="INTERNO"
                            size="small"
                            color="warning"
                            variant="filled"
                          />
                        )}
                        
                        <Typography variant="caption" color="text.secondary">
                          {formatearFecha(comentario.fecha_comentario)}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {comentario.comentario}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
              No hay comentarios aún. ¡Sé el primero en comentar!
            </Typography>
          )}

          {/* Formulario para agregar comentario */}
          <Box>
            <Divider sx={{ mb: 2 }} />
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                multiline
                minRows={2}
                maxRows={4}
                placeholder="Escribe un comentario... (Ctrl + Enter para enviar)"
                value={nuevoComentario}
                onChange={(e) => setNuevoComentario(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={loading}
                variant="outlined"
                size="small"
              />
              
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={16} /> : <SendIcon />}
                onClick={handleAgregarComentario}
                disabled={loading || !nuevoComentario.trim()}
                sx={{ minWidth: 100 }}
              >
                {loading ? 'Enviando...' : 'Enviar'}
              </Button>
            </Box>
            
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Máximo 1000 caracteres. Presiona Ctrl + Enter para enviar rápidamente.
            </Typography>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
};

export default ComentariosSection;