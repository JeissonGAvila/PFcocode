// frontend/src/components/ciudadano/SubidaFotos.jsx - OPTIMIZADO
import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  IconButton,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  PhotoCamera,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  Image as ImageIcon
} from '@mui/icons-material';

const SubidaFotos = ({ fotos = [], onFotosChange, maxFotos = 3, disabled = false }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Configuración de optimización
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB por archivo
  const MAX_WIDTH = 1200; // Redimensionar a máximo 1200px de ancho
  const MAX_HEIGHT = 900; // Redimensionar a máximo 900px de alto
  const QUALITY = 0.8; // Calidad de compresión JPEG (80%)

  // Función para redimensionar y comprimir imagen
  const comprimirImagen = (file) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo aspect ratio
        let { width, height } = img;
        
        if (width > MAX_WIDTH) {
          height = (height * MAX_WIDTH) / width;
          width = MAX_WIDTH;
        }
        
        if (height > MAX_HEIGHT) {
          width = (width * MAX_HEIGHT) / height;
          height = MAX_HEIGHT;
        }

        // Configurar canvas
        canvas.width = width;
        canvas.height = height;

        // Dibujar imagen redimensionada
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir a blob comprimido
        canvas.toBlob(
          (blob) => {
            // Crear archivo optimizado
            const optimizedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(optimizedFile);
          },
          'image/jpeg',
          QUALITY
        );
      };

      img.src = URL.createObjectURL(file);
    });
  };

  // Validar archivo
  const validarArchivo = (file) => {
    // Validar tipo
    if (!file.type.startsWith('image/')) {
      return 'Solo se permiten archivos de imagen';
    }

    // Validar tamaño original
    if (file.size > MAX_FILE_SIZE * 2) { // Permitimos hasta 4MB original
      return `El archivo es demasiado grande. Máximo ${MAX_FILE_SIZE * 2 / 1024 / 1024}MB`;
    }

    return null;
  };

  // Manejar selección de archivos
  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) return;

    // Verificar límite total
    if (fotos.length + files.length > maxFotos) {
      setError(`Solo puedes subir máximo ${maxFotos} fotos`);
      return;
    }

    setUploading(true);
    setError('');
    setProgress(0);

    const nuevasFotos = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validar archivo
        const errorValidacion = validarArchivo(file);
        if (errorValidacion) {
          setError(errorValidacion);
          continue;
        }

        // Actualizar progreso
        setProgress(((i + 1) / files.length) * 50); // 50% para procesamiento

        // Comprimir imagen
        const archivoComprimido = await comprimirImagen(file);
        
        // Crear preview
        const preview = URL.createObjectURL(archivoComprimido);
        
        // Crear objeto foto optimizado
        const fotoOptimizada = {
          id: Date.now() + i,
          file: archivoComprimido,
          preview: preview,
          nombre: file.name,
          tamaño: archivoComprimido.size,
          tamañoOriginal: file.size,
          compresion: Math.round((1 - archivoComprimido.size / file.size) * 100),
          estado: 'procesada'
        };

        nuevasFotos.push(fotoOptimizada);
      }

      setProgress(100);
      
      // Notificar al componente padre
      onFotosChange([...fotos, ...nuevasFotos]);

    } catch (error) {
      console.error('Error procesando imágenes:', error);
      setError('Error al procesar las imágenes');
    } finally {
      setUploading(false);
      setProgress(0);
      // Limpiar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Eliminar foto
  const eliminarFoto = (fotoId) => {
    const fotosActualizadas = fotos.filter(foto => foto.id !== fotoId);
    
    // Liberar memoria del preview
    const fotoEliminada = fotos.find(f => f.id === fotoId);
    if (fotoEliminada && fotoEliminada.preview) {
      URL.revokeObjectURL(fotoEliminada.preview);
    }
    
    onFotosChange(fotosActualizadas);
    setError('');
  };

  // Formatear tamaño de archivo
  const formatearTamaño = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Fotos del problema ({fotos.length}/{maxFotos})
      </Typography>

      {/* Botón de subida */}
      <Box mb={2}>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          disabled={disabled || uploading || fotos.length >= maxFotos}
        />
        
        <Button
          variant="outlined"
          startIcon={uploading ? <CircularProgress size={20} /> : <PhotoCamera />}
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading || fotos.length >= maxFotos}
          fullWidth
        >
          {uploading ? 'Procesando imágenes...' : 'Agregar Fotos'}
        </Button>
      </Box>

      {/* Barra de progreso */}
      {uploading && (
        <Box mb={2}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="caption" color="textSecondary">
            Optimizando imágenes... {Math.round(progress)}%
          </Typography>
        </Box>
      )}

      {/* Errores */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Vista previa de fotos */}
      {fotos.length > 0 && (
        <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            {fotos.map((foto) => (
              <Grid item xs={12} sm={6} md={4} key={foto.id}>
                <Box position="relative">
                  <Paper 
                    elevation={2} 
                    sx={{ 
                      p: 1, 
                      textAlign: 'center',
                      backgroundColor: 'grey.50'
                    }}
                  >
                    {/* Imagen preview */}
                    <Box
                      component="img"
                      src={foto.preview}
                      alt={foto.nombre}
                      sx={{
                        width: '100%',
                        height: 120,
                        objectFit: 'cover',
                        borderRadius: 1,
                        backgroundColor: 'grey.200'
                      }}
                      loading="lazy" // Lazy loading
                    />
                    
                    {/* Información del archivo */}
                    <Box mt={1}>
                      <Typography variant="caption" display="block" noWrap>
                        {foto.nombre}
                      </Typography>
                      <Box display="flex" gap={0.5} justifyContent="center" flexWrap="wrap">
                        <Chip 
                          label={formatearTamaño(foto.tamaño)}
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                        {foto.compresion > 0 && (
                          <Chip 
                            label={`-${foto.compresion}%`}
                            size="small"
                            color="info"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>

                    {/* Botón eliminar */}
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => eliminarFoto(foto.id)}
                      sx={{
                        position: 'absolute',
                        top: 5,
                        right: 5,
                        backgroundColor: 'rgba(255,255,255,0.8)',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.9)'
                        }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Paper>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Información de optimización */}
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          Las imágenes se optimizan automáticamente para acelerar la subida:
        </Typography>
        <Typography variant="caption" display="block">
          • Redimensionadas a máximo {MAX_WIDTH}x{MAX_HEIGHT}px
        </Typography>
        <Typography variant="caption" display="block">
          • Comprimidas al {QUALITY * 100}% de calidad
        </Typography>
        <Typography variant="caption" display="block">
          • Máximo {maxFotos} fotos por reporte
        </Typography>
      </Alert>
    </Box>
  );
};

export default SubidaFotos;