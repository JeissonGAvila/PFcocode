// frontend/src/components/ciudadano/MapaUbicacion.jsx - VERSIÓN COMPLETAMENTE RESPONSIVA
import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Stack,
  useTheme,
  useMediaQuery,
  Collapse,
  Fab,
  Backdrop
} from '@mui/material';
import {
  MyLocation as GPSIcon,
  Map as MapIcon,
  Refresh as RefreshIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Fullscreen as FullscreenIcon,
  Close as CloseIcon,
  LocationOn as LocationIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CenterFocusStrong as CenterIcon
} from '@mui/icons-material';

const MapaUbicacion = ({ 
  ubicacion, 
  onUbicacionChange, 
  onUbicacionGPS, 
  loading = false,
  height = 400,
  showControls = true,
  allowManualSelection = true 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(!isMobile); // En móvil colapsado por defecto
  const [mapReady, setMapReady] = useState(false);

  // Altura responsiva
  const getMapHeight = () => {
    if (fullscreen) return '100vh';
    if (isMobile) return Math.min(height, 300);
    if (isTablet) return Math.min(height, 350);
    return height;
  };

  // Cargar Leaflet dinámicamente
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        // Verificar si ya está cargado
        if (window.L && mapLoaded) return;

        // Cargar CSS de Leaflet si no existe
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        // Cargar JS de Leaflet si no existe
        if (!window.L) {
          return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = () => {
              // Fix para iconos de Leaflet
              delete window.L.Icon.Default.prototype._getIconUrl;
              window.L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
              });
              setMapLoaded(true);
              setMapLoading(false);
              resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
          });
        } else {
          setMapLoaded(true);
          setMapLoading(false);
        }
      } catch (error) {
        console.error('Error cargando Leaflet:', error);
        setMapLoading(false);
      }
    };

    loadLeaflet();
  }, []);

  // Actualizar ubicación GPS y centrar mapa automáticamente
  useEffect(() => {
    if (ubicacion.lat && ubicacion.lng && mapInstanceRef.current && mapReady) {
      // Centrar mapa en la nueva ubicación GPS
      mapInstanceRef.current.setView([ubicacion.lat, ubicacion.lng], 16);
      
      // Agregar/actualizar marker
      agregarMarker(ubicacion.lat, ubicacion.lng);
    }
  }, [ubicacion.lat, ubicacion.lng, mapReady]);

  // Inicializar mapa
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || mapInstanceRef.current) return;

    try {
      // Coordenadas por defecto (Guatemala City)
      const defaultLat = ubicacion.lat || 14.6349;
      const defaultLng = ubicacion.lng || -90.5069;
      const defaultZoom = ubicacion.lat ? 16 : 8;

      // Crear mapa
      const map = window.L.map(mapRef.current, {
        center: [defaultLat, defaultLng],
        zoom: defaultZoom,
        zoomControl: false, // Lo agregamos manualmente
        attributionControl: !isMobile // Ocultar en móvil para ahorrar espacio
      });

      // Agregar tiles de OpenStreetMap
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: isMobile ? '' : '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      // Controles personalizados solo si se muestran
      if (showControls && !isMobile) {
        window.L.control.zoom({
          position: 'topright'
        }).addTo(map);
      }

      mapInstanceRef.current = map;
      setMapReady(true);

      // Agregar marker si hay ubicación
      if (ubicacion.lat && ubicacion.lng) {
        agregarMarker(ubicacion.lat, ubicacion.lng);
      }

      // Permitir selección manual haciendo clic
      if (allowManualSelection) {
        map.on('click', (e) => {
          const { lat, lng } = e.latlng;
          
          // Validar que esté en Guatemala
          if (validarCoordenadasGuatemala(lat, lng)) {
            actualizarUbicacion(lat, lng, 'mapa');
          } else {
            alert('Por favor selecciona una ubicación dentro de Guatemala');
          }
        });
      }

      // Manejar resize para responsive
      map.on('resize', () => {
        setTimeout(() => {
          map.invalidateSize();
        }, 100);
      });

    } catch (error) {
      console.error('Error inicializando mapa:', error);
    }
  }, [mapLoaded, isMobile, showControls, allowManualSelection]);

  // Invalidar tamaño cuando cambia fullscreen o responsive
  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current.invalidateSize();
      }, 300);
    }
  }, [fullscreen, isMobile]);

  // Función para validar coordenadas de Guatemala
  const validarCoordenadasGuatemala = (lat, lng) => {
    return lat >= 13.5 && lat <= 18.5 && lng >= -92.5 && lng <= -88.0;
  };

  // Agregar o actualizar marker
  const agregarMarker = (lat, lng) => {
    if (!mapInstanceRef.current) return;

    try {
      // Remover marker anterior
      if (markerRef.current) {
        mapInstanceRef.current.removeLayer(markerRef.current);
      }

      // Crear nuevo marker con icono personalizado para GPS
      let marker;
      
      if (ubicacion.metodo === 'gps') {
        // Marker especial para ubicación GPS (más llamativo)
        const gpsIcon = window.L.divIcon({
          className: 'gps-marker',
          html: `
            <div style="
              width: ${isMobile ? '16px' : '20px'}; 
              height: ${isMobile ? '16px' : '20px'}; 
              border-radius: 50%; 
              background: #4285F4; 
              border: 3px solid white; 
              box-shadow: 0 0 10px rgba(66, 133, 244, 0.6);
              animation: pulse 2s infinite;
            "></div>
          `,
          iconSize: [isMobile ? 16 : 20, isMobile ? 16 : 20],
          iconAnchor: [isMobile ? 8 : 10, isMobile ? 8 : 10]
        });
        
        marker = window.L.marker([lat, lng], { icon: gpsIcon }).addTo(mapInstanceRef.current);
      } else {
        // Marker normal para selección manual
        marker = window.L.marker([lat, lng]).addTo(mapInstanceRef.current);
      }
      
      // Popup con información - más compacto en móvil
      const precision = ubicacion.precision ? `Precisión: ${Math.round(ubicacion.precision)}m` : '';
      const metodoTexto = ubicacion.metodo === 'gps' ? 'Ubicación GPS' : 'Ubicación seleccionada';
      
      const popupContent = isMobile ? `
        <div style="text-align: center; font-size: 12px;">
          <strong>${metodoTexto}</strong><br>
          <small>${lat.toFixed(4)}, ${lng.toFixed(4)}</small><br>
          ${precision ? `<small style="color: #4285F4;">${precision}</small>` : ''}
        </div>
      ` : `
        <div style="text-align: center;">
          <strong>${metodoTexto}</strong><br>
          <small>Lat: ${lat.toFixed(6)}</small><br>
          <small>Lng: ${lng.toFixed(6)}</small><br>
          ${precision ? `<small style="color: #4285F4;">${precision}</small>` : ''}
        </div>
      `;
      
      marker.bindPopup(popupContent);

      markerRef.current = marker;

      // Si es GPS, abrir el popup automáticamente y hacer una animación
      if (ubicacion.metodo === 'gps') {
        marker.openPopup();
        
        // Animación de zoom suave hacia la ubicación
        mapInstanceRef.current.flyTo([lat, lng], isMobile ? 16 : 17, {
          animate: true,
          duration: 1.5
        });
      } else {
        // Para selección manual, solo centrar
        mapInstanceRef.current.setView([lat, lng], isMobile ? 15 : 16);
      }

    } catch (error) {
      console.error('Error agregando marker:', error);
    }
  };

  // Actualizar ubicación y notificar al componente padre
  const actualizarUbicacion = (lat, lng, metodo = 'manual') => {
    if (onUbicacionChange) {
      onUbicacionChange({
        lat,
        lng,
        metodo,
        precision: metodo === 'gps' ? ubicacion.precision : null
      });
    }
    agregarMarker(lat, lng);
  };

  // Manejar obtención de GPS (usar la función existente)
  const handleObtenerGPS = async () => {
    if (onUbicacionGPS) {
      try {
        // Ejecutar la función GPS existente del componente padre
        await onUbicacionGPS();
        
        // Una vez que se obtiene la ubicación, el useEffect se encargará
        // de centrar el mapa y mostrar el marker automáticamente
      } catch (error) {
        console.error('Error obteniendo GPS:', error);
      }
    }
  };

  // Centrar mapa en ubicación actual
  const centrarEnUbicacion = () => {
    if (mapInstanceRef.current && ubicacion.lat && ubicacion.lng) {
      mapInstanceRef.current.setView([ubicacion.lat, ubicacion.lng], isMobile ? 16 : 17);
    }
  };

  // Controles de zoom manual para móvil
  const zoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const zoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  // Toggle información
  const toggleInfo = () => {
    setShowInfo(!showInfo);
  };

  if (mapLoading) {
    return (
      <Card sx={{ height: getMapHeight() }}>
        <CardContent sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '100%',
          flexDirection: 'column',
          gap: 2
        }}>
          <CircularProgress size={isMobile ? 30 : 40} />
          <Typography 
            variant="body2" 
            color="textSecondary"
            sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
          >
            Cargando mapa...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {/* Backdrop para fullscreen en móvil */}
      {fullscreen && isMobile && (
        <Backdrop
          sx={{ color: '#fff', zIndex: 9998 }}
          open={fullscreen}
        />
      )}

      <Paper 
        elevation={3} 
        sx={{ 
          position: fullscreen ? 'fixed' : 'relative',
          top: fullscreen ? 0 : 'auto',
          left: fullscreen ? 0 : 'auto',
          width: fullscreen ? '100vw' : '100%',
          height: fullscreen ? '100vh' : 'auto',
          zIndex: fullscreen ? 9999 : 1,
          borderRadius: fullscreen ? 0 : 1,
          overflow: 'hidden'
        }}
      >
        {/* Header con controles - Responsivo */}
        <Box 
          sx={{ 
            p: { xs: 1, sm: 2 },
            borderBottom: 1, 
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'primary.main',
            color: 'white',
            minHeight: { xs: 56, md: 64 }
          }}
        >
          {/* Título */}
          <Box display="flex" alignItems="center" gap={1}>
            <MapIcon sx={{ fontSize: { xs: 20, md: 24 } }} />
            <Typography 
              variant={isMobile ? "subtitle1" : "h6"}
              sx={{ fontSize: { xs: '0.9rem', md: '1.25rem' } }}
            >
              {isMobile ? 'Ubicación' : 'Ubicación del Problema'}
            </Typography>
          </Box>

          {/* Controles del header */}
          <Stack direction="row" spacing={1}>
            {/* Botón GPS - Responsivo */}
            <Button
              variant="contained"
              color="secondary"
              size={isMobile ? "small" : "small"}
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <GPSIcon />}
              onClick={handleObtenerGPS}
              disabled={loading}
              sx={{
                fontSize: { xs: '0.7rem', md: '0.875rem' },
                px: { xs: 1, md: 2 },
                minWidth: { xs: 'auto', md: 'auto' }
              }}
            >
              {isMobile ? '' : (loading ? 'Obteniendo...' : 'GPS')}
            </Button>

            {/* Botón centrar - Solo si hay ubicación */}
            {ubicacion.lat && (
              <IconButton 
                color="inherit" 
                onClick={centrarEnUbicacion}
                size={isMobile ? "small" : "medium"}
              >
                <CenterIcon sx={{ fontSize: { xs: 18, md: 24 } }} />
              </IconButton>
            )}

            {/* Toggle info en móvil */}
            {isMobile && (
              <IconButton 
                color="inherit" 
                onClick={toggleInfo}
                size="small"
              >
                {showInfo ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            )}

            {/* Fullscreen */}
            <IconButton 
              color="inherit" 
              onClick={toggleFullscreen}
              size={isMobile ? "small" : "medium"}
            >
              {fullscreen ? 
                <CloseIcon sx={{ fontSize: { xs: 18, md: 24 } }} /> : 
                <FullscreenIcon sx={{ fontSize: { xs: 18, md: 24 } }} />
              }
            </IconButton>
          </Stack>
        </Box>

        {/* Información de ubicación - Colapsible en móvil */}
        <Collapse in={showInfo}>
          {ubicacion.lat && ubicacion.lng && (
            <Box sx={{ 
              p: { xs: 1.5, md: 2 }, 
              backgroundColor: 'success.50',
              borderBottom: 1,
              borderColor: 'divider'
            }}>
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={1} 
                alignItems={{ xs: 'flex-start', sm: 'center' }}
              >
                <Chip 
                  icon={<LocationIcon />}
                  label={`${ubicacion.lat.toFixed(isMobile ? 4 : 6)}, ${ubicacion.lng.toFixed(isMobile ? 4 : 6)}`}
                  color="success"
                  size="small"
                  sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}
                />
                <Chip 
                  label={`Método: ${ubicacion.metodo === 'gps' ? 'GPS' : ubicacion.metodo === 'mapa' ? 'Mapa' : 'Manual'}`}
                  variant="outlined"
                  size="small"
                  sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}
                />
                {ubicacion.precision && (
                  <Chip 
                    label={`Precisión: ${Math.round(ubicacion.precision)}m`}
                    variant="outlined"
                    size="small"
                    sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}
                  />
                )}
              </Stack>
              
              {ubicacion.direccion_aproximada && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mt: 1,
                    fontSize: { xs: '0.8rem', md: '0.875rem' },
                    lineHeight: 1.3
                  }}
                >
                  <strong>Dirección aproximada:</strong> {
                    isMobile && ubicacion.direccion_aproximada.length > 50 ?
                      `${ubicacion.direccion_aproximada.substring(0, 50)}...` :
                      ubicacion.direccion_aproximada
                  }
                </Typography>
              )}
            </Box>
          )}
        </Collapse>

        {/* Mapa Container */}
        <Box 
          sx={{ 
            position: 'relative',
            width: '100%',
            height: fullscreen ? 'calc(100vh - 64px)' : getMapHeight(),
            minHeight: isMobile ? 200 : 250
          }}
        >
          {/* Mapa */}
          <Box 
            ref={mapRef} 
            sx={{ 
              width: '100%', 
              height: '100%'
            }} 
          />

          {/* Controles flotantes para móvil */}
          {isMobile && showControls && mapReady && (
            <Box
              sx={{
                position: 'absolute',
                top: 10,
                right: 10,
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                gap: 1
              }}
            >
              <Fab
                size="small"
                color="primary"
                onClick={zoomIn}
                sx={{ width: 35, height: 35 }}
              >
                <ZoomInIcon sx={{ fontSize: 16 }} />
              </Fab>
              <Fab
                size="small"
                color="primary"
                onClick={zoomOut}
                sx={{ width: 35, height: 35 }}
              >
                <ZoomOutIcon sx={{ fontSize: 16 }} />
              </Fab>
            </Box>
          )}

          {/* Botón GPS flotante para móvil si no hay ubicación */}
          {isMobile && !ubicacion.lat && !loading && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 16,
                right: 16,
                zIndex: 1000
              }}
            >
              <Fab
                color="secondary"
                onClick={handleObtenerGPS}
                size="medium"
              >
                <GPSIcon />
              </Fab>
            </Box>
          )}

          {/* Loading overlay */}
          {loading && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1001
              }}
            >
              <Box textAlign="center">
                <CircularProgress size={isMobile ? 30 : 40} />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mt: 1,
                    fontSize: { xs: '0.8rem', md: '0.875rem' }
                  }}
                >
                  Obteniendo ubicación...
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        {/* Instrucciones - Responsivas */}
        {allowManualSelection && (
          <Box sx={{ 
            p: { xs: 1, md: 1.5 }, 
            backgroundColor: 'info.50', 
            borderTop: 1, 
            borderColor: 'divider' 
          }}>
            <Typography 
              variant="caption" 
              color="info.main"
              sx={{ 
                fontSize: { xs: '0.7rem', md: '0.75rem' },
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}
            >
              💡 {isMobile ? 'Toca el mapa para marcar la ubicación exacta' : 'Haz clic en el mapa para seleccionar la ubicación exacta del problema'}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Estilos para animación GPS */}
      <style jsx>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(66, 133, 244, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(66, 133, 244, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(66, 133, 244, 0);
          }
        }
      `}</style>
    </Box>
  );
};

export default MapaUbicacion;