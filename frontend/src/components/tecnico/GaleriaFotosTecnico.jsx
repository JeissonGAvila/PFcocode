// frontend/src/components/tecnico/GaleriaFotosTecnico.jsx
import React, { useState } from 'react';
import {
  Box,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  IconButton,
  Dialog,
  DialogContent,
  Chip,
  Typography,
  Paper,
  Alert
} from '@mui/material';
import {
  ZoomIn as ZoomIcon,
  Close as CloseIcon,
  PhotoCamera as CameraIcon,
  BrokenImage as BrokenImageIcon,
  Engineering as TecnicoIcon
} from '@mui/icons-material';

const GaleriaFotosTecnico = ({ fotos = [], maxHeight = 200, titulo = "Evidencia del Ciudadano" }) => {
  const [open, setOpen] = useState(false);
  const [fotoSeleccionada, setFotoSeleccionada] = useState(null);
  const [erroresImagenes, setErroresImagenes] = useState({});

  if (!fotos || fotos.length === 0) {
    return (
      <Paper elevation={1} sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
        <CameraIcon sx={{ fontSize: 50, color: 'grey.400', mb: 2 }} />
        <Typography variant="h6" color="textSecondary" gutterBottom>
          Sin Evidencia Fotográfica
        </Typography>
        <Typography variant="body2" color="textSecondary">
          El ciudadano no proporcionó fotos de este problema
        </Typography>
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Para técnicos:</strong> Puedes solicitar fotos adicionales contactando directamente al ciudadano
          </Typography>
        </Alert>
      </Paper>
    );
  }

  const handleErrorImagen = (fotoId) => {
    setErroresImagenes(prev => ({ ...prev, [fotoId]: true }));
  };

  const abrirModal = (foto) => {
    setFotoSeleccionada(foto);
    setOpen(true);
  };

  const cerrarModal = () => {
    setOpen(false);
    setFotoSeleccionada(null);
  };

  const getImageUrl = (foto) => {
    if (!foto.url_archivo) {
      console.warn('Foto sin url_archivo:', foto);
      return '';
    }
    
    if (foto.url_archivo.startsWith('http')) {
      return foto.url_archivo;
    }
    
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? window.location.origin 
      : 'http://localhost:3001';
    
    const ruta = foto.url_archivo.startsWith('/') 
      ? foto.url_archivo 
      : `/${foto.url_archivo}`;
    
    const urlCompleta = `${baseUrl}${ruta}`;
    return urlCompleta;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TecnicoIcon color="warning" /> {titulo}
      </Typography>
      
      {process.env.NODE_ENV === 'development' && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="caption">
            Debug Técnico: {fotos.length} fotos encontradas. 
            URLs: {fotos.map(f => f.url_archivo).join(', ')}
          </Typography>
        </Alert>
      )}

      {/* Información de evidencia para técnico */}
      <Alert severity="success" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Evidencia original del ciudadano:</strong> {fotos.length} foto{fotos.length !== 1 ? 's' : ''} 
          subida{fotos.length !== 1 ? 's' : ''} como evidencia del problema reportado.
        </Typography>
      </Alert>

      {/* Galería en miniatura */}
      <ImageList sx={{ maxHeight, overflow: 'auto' }} cols={3} gap={8}>
        {fotos.map((foto, index) => {
          const imageUrl = getImageUrl(foto);
          const tieneError = erroresImagenes[foto.id || index];
          const fotoId = foto.id || `foto-${index}`;
          
          return (
            <ImageListItem key={fotoId} sx={{ cursor: 'pointer' }}>
              {tieneError ? (
                <Box
                  sx={{
                    height: 120,
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'grey.100',
                    borderRadius: 1,
                    border: '1px dashed grey'
                  }}
                  onClick={() => abrirModal(foto)}
                >
                  <BrokenImageIcon color="error" />
                  <Typography variant="caption" sx={{ ml: 1 }}>
                    Error al cargar
                  </Typography>
                </Box>
              ) : (
                <img
                  src={imageUrl}
                  alt={`Evidencia problema ${index + 1}`}
                  loading="lazy"
                  style={{ 
                    height: 120, 
                    width: '100%', 
                    objectFit: 'cover',
                    borderRadius: 4
                  }}
                  onClick={() => abrirModal(foto)}
                  onError={() => {
                    console.error('Error cargando imagen técnico:', imageUrl);
                    handleErrorImagen(fotoId);
                  }}
                  onLoad={() => console.log('Imagen técnico cargada:', imageUrl)}
                />
              )}
              <ImageListItemBar
                title={`Evidencia ${index + 1}`}
                subtitle={foto.tamano_kb ? `${foto.tamano_kb} KB` : ''}
                actionIcon={
                  <IconButton
                    sx={{ color: 'white' }}
                    onClick={() => abrirModal(foto)}
                    size="small"
                  >
                    <ZoomIcon />
                  </IconButton>
                }
              />
            </ImageListItem>
          );
        })}
      </ImageList>

      {/* Información adicional para técnico */}
      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Chip 
          icon={<CameraIcon />}
          label={`${fotos.length} evidencia${fotos.length !== 1 ? 's' : ''} inicial${fotos.length !== 1 ? 'es' : ''}`}
          size="small"
          color="warning"
          variant="outlined"
        />
        <Chip 
          label="Subido por ciudadano"
          size="small"
          color="info"
          variant="outlined"
        />
        <Typography variant="caption" color="textSecondary">
          Haz clic para ampliar y analizar
        </Typography>
      </Box>

      {/* Consejos para técnico */}
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>Para técnicos:</strong> Estas imágenes te ayudarán a diagnosticar el problema antes de llegar al sitio. 
          Puedes usarlas para planificar herramientas y materiales necesarios.
        </Typography>
      </Alert>

      {/* Modal para vista ampliada */}
      <Dialog open={open} onClose={cerrarModal} maxWidth="lg" fullWidth>
        <DialogContent sx={{ position: 'relative', p: 0 }}>
          {fotoSeleccionada && (
            <>
              <IconButton
                onClick={cerrarModal}
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  bgcolor: 'rgba(255,152,0,0.8)',
                  color: 'white',
                  zIndex: 1000,
                  '&:hover': {
                    bgcolor: 'rgba(255,152,0,0.9)'
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
              
              <Box
                component="img"
                src={getImageUrl(fotoSeleccionada)}
                alt="Evidencia ampliada"
                sx={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '85vh',
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  console.error('Error en modal técnico con imagen:', getImageUrl(fotoSeleccionada));
                  e.target.style.display = 'none';
                }}
              />
              
              <ImageListItemBar
                title={fotoSeleccionada.nombre_archivo || `Evidencia ${fotos.indexOf(fotoSeleccionada) + 1}`}
                subtitle={
                  <Box>
                    <Typography variant="caption" display="block">
                      {fotoSeleccionada.tamano_kb && `Tamaño: ${fotoSeleccionada.tamano_kb} KB`}
                    </Typography>
                    <Typography variant="caption" display="block">
                      {fotoSeleccionada.fecha_subida && `Subido: ${new Date(fotoSeleccionada.fecha_subida).toLocaleDateString()}`}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Tipo: {fotoSeleccionada.tipo_archivo || 'image/jpeg'}
                    </Typography>
                    <Typography variant="caption" display="block" color="warning.main">
                      Evidencia inicial - Vista técnico
                    </Typography>
                    {process.env.NODE_ENV === 'development' && (
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        URL: {getImageUrl(fotoSeleccionada)}
                      </Typography>
                    )}
                  </Box>
                }
                sx={{
                  background: 'linear-gradient(to top, rgba(255,152,0,0.8) 0%, rgba(255,152,0,0.4) 70%, rgba(0,0,0,0) 100%)'
                }}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default GaleriaFotosTecnico;