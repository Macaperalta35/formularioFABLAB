# 🧪 Guía de Prueba - Sistema de Registro FAB LAB

## ✅ Checklist de Verificación

### 1. Inicialización del Sistema

- [x] Flask server ejecutándose en `http://127.0.0.1:5000`
- [x] Servidor HTTP ejecutándose en `http://localhost:8000`
- [x] Base de datos SQLite creada automáticamente
- [x] Openpyxl instalado para exportar Excel

### 2. Prueba del Formulario

1. **Acceder al formulario**
   - Abre: http://localhost:8000/fablab-simple.html
   - Deberías ver el formulario con logo INACAP y campos de entrada

2. **Validación de campos en tiempo real**
   - Intenta escribir un nombre corto (< 2 caracteres) → debe mostrar error
   - Intenta un RUT sin formato → debe mostrar "Formato RUT inválido"
   - Intenta un email sin @ → debe mostrar "Correo inválido"
   - Intenta dejar campos vacíos → botón debe estar deshabilitado

3. **Envío de datos**
   - Completa todos los campos correctamente:
     - Nombre: Juan Pérez
     - RUT: 12.345.678-9
     - Correo: juan@example.com
     - Tipo de Visita: Estudiante (selecciona radio button)
     - Teléfono: +56 9 1234 5678 (opcional)
     - Propósito: Conocer las máquinas del FAB LAB

   - Haz clic en "Registrar Visita"
   - Deberías ver mensaje de éxito: "¡Registro Exitoso! Bienvenido al FAB LAB INACAP"

### 3. Prueba del Panel Administrativo

1. **Acceder al panel**
   - Abre: http://localhost:8000/admin-visitas.html
   - Deberías ver estadísticas y tabla de registros

2. **Verificar datos guardados**
   - La tabla debe mostrar el registro que acabas de crear
   - Todas las columnas deben estar pobladas correctamente

3. **Descargar Excel**
   - Haz clic en "Descargar Excel"
   - Un archivo `visitas_fablab.xlsx` debe descargarse
   - Ábrelo en Excel o Calc
   - Debe contener:
     - Encabezado azul con formato profesional
     - Todas las columnas: ID, Nombre, RUT, Correo, Teléfono, Tipo, Propósito, Fecha
     - Tus datos registrados

4. **Descargar CSV**
   - Haz clic en "Descargar CSV"
   - Un archivo `visitas_fablab.csv` debe descargarse
   - Ábrelo en Excel
   - Debe contener los mismos datos en formato CSV

### 4. Prueba de API directa

Puedes usar curl o Postman para probar los endpoints:

```bash
# Crear un registro
curl -X POST http://127.0.0.1:5000/api/visitas \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "María García",
    "rut": "15.234.567-8",
    "correo": "maria@example.com",
    "tipoVisita": "docente",
    "telefono": "+56 9 9876 5432",
    "proposito": "Capacitación de estudiantes"
  }'

# Obtener todos los registros
curl http://127.0.0.1:5000/api/visitas

# Descargar Excel
curl http://127.0.0.1:5000/api/visitas/export?format=excel -o visitas.xlsx

# Descargar CSV
curl http://127.0.0.1:5000/api/visitas/export?format=csv -o visitas.csv
```

### 5. Casos de Error

1. **Campos faltantes**
   - Intenta registrarse sin llenar nombre
   - El botón debe estar deshabilitado

2. **Formato incorrecto**
   - RUT sin puntos: debe rechazar
   - Email sin dominio: debe rechazar

3. **Conexión fallida**
   - Detén el servidor Flask
   - Intenta registrarte
   - Debe mostrar: "Error al conectar con el servidor"

## 📊 Archivos de Prueba

### Datos de ejemplo para copiar-pegar:

**Registro 1 - Estudiante:**
- Nombre: Carlos López
- RUT: 18.123.456-5
- Correo: carlos.lopez@student.com
- Teléfono: +56 9 2456 7890
- Tipo: Estudiante
- Propósito: Trabajo de física

**Registro 2 - Docente:**
- Nombre: Dr. Francisco Rodríguez
- RUT: 14.567.890-1
- Correo: francisco@inacap.cl
- Teléfono: +56 2 2123 4567
- Tipo: Docente
- Propósito: Capacitar estudiantes

**Registro 3 - Empresa:**
- Nombre: Tech Solutions S.A.
- RUT: 76.543.210-0
- Correo: contacto@techsolutions.cl
- Teléfono: +56 2 2876 5432
- Tipo: Empresa
- Propósito: Consultoría en fabricación digital

## 🔍 Verificación de Base de Datos

Para verificar que los datos se guardan correctamente:

```bash
# Acceder a la base de datos SQLite
cd backend
python

# En Python:
from models import db, Visita
from app import app

with app.app_context():
    visitas = Visita.query.all()
    for v in visitas:
        print(f"{v.nombre} - {v.rut} - {v.tipo_visita}")
```

## 📈 Métricas de Éxito

✅ Sistema considerado exitoso cuando:
- [ ] Formulario valida campos correctamente
- [ ] Se pueden crear registros sin errores
- [ ] Panel administrativo muestra todos los registros
- [ ] Excel se descarga con formato correcto
- [ ] CSV se descarga con datos legibles
- [ ] Base de datos persiste datos entre sesiones
- [ ] API responde correctamente a todas las solicitudes

## 🚨 Logs Esperados

**Servidor Flask debe mostrar:**
```
* Running on http://127.0.0.1:5000
POST /api/visitas 201 Created
GET /api/visitas 200 OK
GET /api/visitas/export 200 OK
```

## 📞 Soporte

Si algo no funciona:
1. Verifica que ambos servidores están corriendo
2. Abre DevTools (F12) en el navegador
3. Revisa la consola de errores
4. Verifica los logs del servidor Flask
5. Comprueba que los puertos 5000 y 8000 están disponibles

---

**Fecha de creación**: 2024
**Estado**: Listo para pruebas
