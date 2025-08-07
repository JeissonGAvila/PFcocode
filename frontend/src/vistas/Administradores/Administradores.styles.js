export const styles = {
    // Contenedor principal
    container: {
      mt: 3,
      mb: 3
    },
  
    // Título principal
    titulo: {
      mb: 4,
      fontWeight: 'bold',
      color: 'primary.main',
      textAlign: 'center'
    },
  
    // Paper del formulario
    formPaper: {
      p: 3,
      mb: 4,
      backgroundColor: 'background.paper',
      borderRadius: 2,
      boxShadow: 2
    },
  
    // Stack del formulario
    formStack: {
      spacing: 3,
      alignItems: 'stretch'
    },
  
    // Fila principal del formulario
    formRow: {
      display: 'flex',
      flexDirection: { xs: 'column', lg: 'row' },
      gap: 3,
      alignItems: 'flex-end'
    },
  
    // Campos básicos
    textField: {
      flex: 1,
      minWidth: { xs: '100%', md: 200 },
      '& .MuiOutlinedInput-root': {
        '& fieldset': {
          borderColor: 'primary.light',
        },
        '&:hover fieldset': {
          borderColor: 'primary.main',
        },
      }
    },
  
    // Campo de email (más amplio)
    emailField: {
      flex: 1.5,
      minWidth: { xs: '100%', md: 250 },
      '& .MuiOutlinedInput-root': {
        '& fieldset': {
          borderColor: 'primary.light',
        },
        '&:hover fieldset': {
          borderColor: 'primary.main',
        },
      }
    },
  
    // Campo de contraseña
    passwordField: {
      flex: 1,
      minWidth: { xs: '100%', md: 200 },
      '& .MuiOutlinedInput-root': {
        '& fieldset': {
          borderColor: 'warning.light',
        },
        '&:hover fieldset': {
          borderColor: 'warning.main',
        },
      }
    },
  
    // Campo de zonas responsabilidad (más amplio)
    zonasField: {
      flex: 2,
      minWidth: { xs: '100%', md: 300 },
      '& .MuiOutlinedInput-root': {
        '& fieldset': {
          borderColor: 'primary.light',
        },
        '&:hover fieldset': {
          borderColor: 'primary.main',
        },
      }
    },
  
    // Switch para puede asignar
    switchContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 1,
      minWidth: 140
    },
  
    switchField: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 1
    },
  
    // Contenedor de botones
    buttonContainer: {
      display: 'flex',
      gap: 2,
      flexDirection: { xs: 'column', sm: 'row' },
      minWidth: { xs: '100%', md: 'auto' },
      alignSelf: 'flex-end'
    },
  
    // Botones del formulario
    submitButton: {
      minWidth: 140,
      height: 56,
      fontWeight: 'bold'
    },
  
    cancelButton: {
      minWidth: 100,
      height: 56,
      fontWeight: 'bold'
    },
  
    // Paper de la tabla
    tablePaper: {
      overflow: 'hidden',
      borderRadius: 2,
      boxShadow: 3
    },
  
    // Tabla
    table: {
      minWidth: 1000
    },
  
    // Encabezados de tabla
    tableHead: {
      backgroundColor: 'primary.main',
      '& .MuiTableCell-head': {
        color: 'primary.contrastText',
        fontWeight: 'bold',
        fontSize: '1rem'
      }
    },
  
    // Celdas de la tabla
    tableCell: {
      py: 2,
      px: 2
    },
  
    // Celda de nombre completo
    nombreCell: {
      display: 'flex',
      flexDirection: 'column'
    },
  
    nombrePrincipal: {
      fontWeight: 'bold',
      fontSize: '1rem'
    },
  
    correoSecundario: {
      fontSize: '0.85rem',
      color: 'text.secondary'
    },
  
    // Celda de rol con chip
    rolCell: {
      display: 'flex',
      alignItems: 'center',
      gap: 1
    },
  
    // Celda de departamento
    departamentoCell: {
      maxWidth: 150,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },
  
    // Celda de puede asignar
    puedeAsignarCell: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
  
    // Chip para puede asignar
    puedeAsignarChip: {
      fontWeight: 'bold',
      minWidth: 60
    },
  
    // Celda de zonas responsabilidad
    zonasCell: {
      maxWidth: 200,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      fontSize: '0.85rem'
    },
  
    // Celda de último acceso
    ultimoAccesoCell: {
      fontSize: '0.85rem',
      color: 'text.secondary'
    },
  
    // Botones de acción
    actionButton: {
      minWidth: 70,
      fontWeight: 'bold',
      mr: 1,
      mb: 1
    },
  
    // Botón de cambiar contraseña
    passwordButton: {
      minWidth: 100,
      fontWeight: 'bold',
      mr: 1,
      mb: 1
    },
  
    // Mensaje de tabla vacía
    emptyTableMessage: {
      textAlign: 'center',
      py: 4,
      color: 'text.secondary',
      fontStyle: 'italic'
    },
  
    // Loading state
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      py: 4
    },
  
    // Alert de mensajes
    alert: {
      mt: 2,
      borderRadius: 2
    },
  
    // Modal de contraseña
    modal: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
  
    modalPaper: {
      backgroundColor: 'background.paper',
      borderRadius: 2,
      boxShadow: 24,
      p: 4,
      minWidth: 400,
      maxWidth: 500
    },
  
    modalTitle: {
      mb: 3,
      fontWeight: 'bold',
      color: 'primary.main'
    },
  
    modalButtons: {
      display: 'flex',
      gap: 2,
      justifyContent: 'flex-end',
      mt: 3
    }
  };