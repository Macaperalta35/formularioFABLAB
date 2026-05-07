# 📋 FAB LAB INACAP - Sistema de Registro de Visitas

Sistema completo de registro de visitas para FAB LAB INACAP con formulario web interactivo, validación de datos, almacenamiento en base de datos y exportación a Excel.

## ✨ Características

- **Formulario web 100% compatible** con móviles, tablets y PCs
- **Validación de campos**:
  - Nombre requerido (mínimo 2 caracteres)
  - RUT con formato validado (XX.XXX.XXX-X o XX.XXX.XXX-K)
  - Correo electrónico válido
  - Teléfono opcional con formato flexible
  - Tipo de visita obligatorio (Estudiante, Docente, Externo, Empresa)
  - Campo de propósito opcional
  
- **Base de datos SQLite** para almacenar registros
- **Panel administrativo** para visualizar y descargar datos
- **Exportación a Excel** con formato profesional
- **Diseño corporativo** con colores y logo de INACAP
- **Backend Flask** con API REST
- **Compatibilidad total** con navegadores móviles modernos

## 🚀 Instalación y Configuración

### 1. Instalar dependencias

```bash
cd "c:\Users\SSP_LAB\Desktop\formularioFABLAB"
pip install -r requirements.txt
```

### 2. Iniciar el servidor Flask

```bash
python fablab_app.py
```

El servidor estará disponible en: `http://127.0.0.1:5000`

### 3. Servir el formulario

En otra terminal, ejecuta:

```bash
cd "c:\Users\SSP_LAB\Desktop\formularioFABLAB"
python serve.py
```

### 4. Acceder al formulario

**Para máxima compatibilidad (recomendado):**
- **PC/Tablet:** `http://localhost:8000/index.html`
- **Móvil:** `http://<TU_IP_LOCAL>:8000/index.html` (desde la misma red)

**Versión alternativa:**
- **PC/Tablet:** `http://localhost:8000/fablab-simple.html`

### 5. Solución de problemas comunes

**Problema: "No puedo apretar el botón Registrar Visita en móviles"**
- ✅ **Solucionado**: El formulario `index.html` ahora usa validación directa de datos.
- ✅ **Campo teléfono ahora opcional** (antes se validaba como requerido)
- ✅ **Botón se habilita automáticamente** cuando todos los campos requeridos están completos
- ✅ **Validación de RUT más flexible** para ingreso desde móviles
- ✅ **Feedback visual claro** sobre el estado del formulario

**Problema: "El formulario no funciona en celulares"**
- ✅ **Solucionado**: Eliminada dependencia de React/Babel
- ✅ **JavaScript vanilla puro (index.html)** compatible con todos los navegadores móviles
- ✅ **Detección automática de red** (localhost vs IP de red local)

> **Nota:** La versión `index.html` está optimizada para funcionar en todos los dispositivos móviles, tablets y PCs con máxima compatibilidad.

## 📱 Uso del Formulario

1. Abre [http://localhost:8000/fablab-simple.html](http://localhost:8000/fablab-simple.html)
2. Completa todos los campos obligatorios (marcados con *)
3. El botón "Registrar Visita" se habilitará cuando todos los campos sean válidos
4. Al enviar, los datos se guardarán en la base de datos
5. Verás un mensaje de confirmación

## 📊 Panel Administrativo

Para visualizar y exportar todos los registros:

1. Abre [http://localhost:8000/admin-visitas.html](http://localhost:8000/admin-visitas.html)
2. Verás un resumen de estadísticas (total de visitas, visitas por tipo)
3. **Descargar Excel**: Descarga un archivo .xlsx con formato profesional
4. **Recargar**: Actualiza la tabla con nuevos registros

## 🔌 Endpoints de API

### Crear registro
```
POST /api/visitas
Content-Type: application/json

{
  "nombre": "Juan Pérez",
  "rut": "12.345.678-9",
  "correo": "juan@example.com",
  "tipoVisita": "estudiante",
  "telefono": "+56 9 1234 5678",
  "proposito": "Conocer las herramientas"
}
```

### Obtener todos los registros
```
GET /api/visitas
```

### Descargar Excel
```
GET /api/visitas/export?format=excel
```

## 📁 Estructura de archivos

```
fablab-formulario/
├── fablab-simple.html      # Formulario principal
├── admin-visitas.html       # Panel administrativo
├── serve.py                 # Servidor HTTP local
└── README.md               # Este archivo

backend/
├── app.py                  # Aplicación Flask principal
├── models.py               # Modelos de base de datos
├── requirements.txt        # Dependencias Python
└── routes/
    └── visitas.py         # API de visitas
```

## 🗄️ Base de Datos

La base de datos SQLite se crea automáticamente al iniciar el servidor. Los datos se guardan en:
```
backend/instance/carbo_cheddar_new.db
```

Tabla `visitas`:
- `id` - Identificador único
- `nombre` - Nombre completo del visitante
- `rut` - RUT del visitante
- `correo` - Correo electrónico
- `tipo_visita` - Tipo de visita (estudiante, docente, externo, empresa)
- `telefono` - Teléfono de contacto
- `proposito` - Propósito de la visita
- `created_at` - Fecha y hora de registro

## 🔒 Validaciones

El formulario valida:
- **Nombre**: No vacío, mínimo 2 caracteres
- **RUT**: Formato XX.XXX.XXX-X
- **Correo**: Formato válido de email
- **Tipo de Visita**: Uno de los 4 tipos seleccionados
- **Teléfono**: Opcional, si se proporciona debe tener formato válido

## 🎨 Diseño

- Colores corporativos INACAP (Rojo #ED1C24, Azul marino)
- Interfaz moderna y responsive
- Indicadores visuales de errores en rojo
- Botones deshabilitados hasta completar validación
- Animaciones suaves y transiciones

## 📝 Notas

- El servidor Flask debe estar ejecutándose para que el formulario funcione
- CORS está habilitado para permitir solicitudes desde el navegador
- Los datos se conservan en la base de datos SQLite
- Las exportaciones se descargan automáticamente en el navegador

## 🐛 Solución de problemas

**Error: "Error al conectar con el servidor"**
- Asegúrate que el servidor Flask está ejecutándose en `http://127.0.0.1:5000`
- Verifica que no hay errores en la consola del servidor Flask

**No puedo ver el formulario**
- Asegúrate que el servidor HTTP está ejecutándose en `http://localhost:8000`
- Verifica que ambos servidores están activos (Flask y HTTP)

**Los datos no se guardan**
- Verifica en la consola del navegador (F12) si hay errores en la red
- Comprueba que la base de datos tiene permisos de escritura

## 📞 Soporte

Para reportar problemas o sugerencias, contacta al administrador del sistema.

---

**Versión**: 1.0  
**Última actualización**: 2024  
**Estado**: Producción
