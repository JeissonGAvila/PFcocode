// frontend/src/components/ciudadano/MapaUbicacion.jsx - INTEGRADO CON GPS EXISTENTE
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
  CardContent
} from '@mui/material';
import {
  MyLocation as GPSIcon,
  Map as MapIcon,
  Refresh as RefreshIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Fullscreen as FullscreenIcon,
  Close as CloseIcon,
  LocationOn as LocationIcon
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
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

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
    if (ubicacion.lat && ubicacion.lng && mapInstanceRef.current) {
      // Centrar mapa en la nueva ubicación GPS
      mapInstanceRef.current.setView([ubicacion.lat, ubicacion.lng], 16);
      
      // Agregar/actualizar marker
      agregarMarker(ubicacion.lat, ubicacion.lng);
    }
  }, [ubicacion.lat, ubicacion.lng]);
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
        zoomControl: false // Lo agregamos manualmente
      });

      // Agregar tiles de OpenStreetMap
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      // Controles personalizados
      if (showControls) {
        window.L.control.zoom({
          position: 'topright'
        }).addTo(map);
      }

      mapInstanceRef.current = map;

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

    } catch (error) {
      console.error('Error inicializando mapa:', error);
    }
  }, [mapLoaded, ubicacion.lat, ubicacion.lng]);

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
              width: 20px; 
              height: 20px; 
              border-radius: 50%; 
              background: #4285F4; 
              border: 3px solid white; 
              box-shadow: 0 0 10px rgba(66, 133, 244, 0.6);
              animation: pulse 2s infinite;
            "></div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });
        
        marker = window.L.marker([lat, lng], { icon: gpsIcon }).addTo(mapInstanceRef.current);
      } else {
        // Marker normal para selección manual
        marker = window.L.marker([lat, lng]).addTo(mapInstanceRef.current);
      }
      
      // Popup con información
      const precision = ubicacion.precision ? `Precisión: ${Math.round(ubicacion.precision)}m` : '';
      const metodoTexto = ubicacion.metodo === 'gps' ? 'Ubicación GPS' : 'Ubicación seleccionada';
      
      marker.bindPopup(`
        <div style="text-align: center;">
          <strong>${metodoTexto}</strong><br>
          <small>Lat: ${lat.toFixed(6)}</small><br>
          <small>Lng: ${lng.toFixed(6)}</small><br>
          ${precision ? `<small style="color: #4285F4;">${precision}</small>` : ''}
        </div>
      `);

      markerRef.current = marker;

      // Si es GPS, abrir el popup automáticamente y hacer una animación
      if (ubicacion.metodo === 'gps') {
        marker.openPopup();
        
        // Animación de zoom suave hacia la ubicación
        mapInstanceRef.current.flyTo([lat, lng], 17, {
          animate: true,
          duration: 1.5
        });
      } else {
        // Para selección manual, solo centrar
        mapInstanceRef.current.setView([lat, lng], 16);
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
      mapInstanceRef.current.setView([ubicacion.lat, ubicacion.lng], 16);
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  if (mapLoading) {
    return (
      <Card sx={{ height: height }}>
        <CardContent sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '100%',
          flexDirection: 'column',
          gap: 2
        }}>
          <CircularProgress />
          <Typography variant="body2" color="textSecondary">
            Cargando mapa...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Paper 
        elevation={3} 
        sx={{ 
          position: fullscreen ? 'fixed' : 'relative',
          top: fullscreen ? 0 : 'auto',
          left: fullscreen ? 0 : 'auto',
          width: fullscreen ? '100vw' : '100%',
          height: fullscreen ? '100vh' : height,
          zIndex: fullscreen ? 9999 : 1,
          borderRadius: fullscreen ? 0 : 1
        }}
      >
        {/* Header con controles */}
        <Box 
          sx={{ 
            p: 2, 
            borderBottom: 1, 
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'primary.main',
            color: 'white'
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <MapIcon />
            <Typography variant="h6">
              Ubicación del Problema
            </Typography>
          </Box>

          <Box display="flex" gap={1}>
            {/* Botón GPS - usar función existente */}
            <Button
              variant="contained"
              color="secondary"
              size="small"
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <GPSIcon />}
              onClick={handleObtenerGPS}
              disabled={loading}
            >
              {loading ? 'Obteniendo...' : 'GPS'}
            </Button>

            {ubicacion.lat && (
              <IconButton 
                color="inherit" 
                onClick={centrarEnUbicacion}
                title="Centrar en ubicación"
              >
                <RefreshIcon />
              </IconButton>
            )}

            <IconButton 
              color="inherit" 
              onClick={toggleFullscreen}
              title={fullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
            >
              {fullscreen ? <CloseIcon /> : <FullscreenIcon />}
            </IconButton>
          </Box>
        </Box>

        {/* Información de ubicación */}
        {ubicacion.lat && ubicacion.lng && (
          <Box sx={{ p: 2, backgroundColor: 'success.50' }}>
            <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
              <Chip 
                icon={<LocationIcon />}
                label={`${ubicacion.lat.toFixed(6)}, ${ubicacion.lng.toFixed(6)}`}
                color="success"
                size="small"
              />
              <Chip 
                label={`Método: ${ubicacion.metodo === 'gps' ? 'GPS' : ubicacion.metodo === 'mapa' ? 'Mapa' : 'Manual'}`}
                variant="outlined"
                size="small"
              />
              {ubicacion.precision && (
                <Chip 
                  label={`Precisión: ${Math.round(ubicacion.precision)}m`}
                  variant="outlined"
                  size="small"
                />
              )}
            </Box>
            {ubicacion.direccion_aproximada && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Dirección aproximada:</strong> {ubicacion.direccion_aproximada}
              </Typography>
            )}
          </Box>
        )}

        {/* Mapa */}
        <Box 
          ref={mapRef} 
          sx={{ 
            width: '100%', 
            height: fullscreen ? 'calc(100vh - 140px)' : height - 140,
            minHeight: 200
          }} 
        />

        {/* Instrucciones */}
        {allowManualSelection && (
          <Box sx={{ p: 1, backgroundColor: 'info.50', borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="caption" color="info.main">
              💡 Haz clic en el mapa para seleccionar la ubicación exacta del problema
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default MapaUbicacion;