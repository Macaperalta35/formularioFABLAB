# FAB LAB INACAP — Panel de Administración Central

Sistema de gestión integral para el **FAB LAB INACAP Sede San Pedro de la Paz**. Centraliza el registro de visitas, la gestión del inventario de activos, la ocupación del laboratorio y el control de secciones de alumnos desde un único panel de administración.

---

## Enlaces Rápidos

| Página | URL |
|--------|-----|
| Formulario de registro (público) | https://macaperalta35.github.io/formularioFABLAB/ |
| Código QR imprimible | https://macaperalta35.github.io/formularioFABLAB/qr.html |
| **Panel de administración** | https://macaperalta35.github.io/formularioFABLAB/dashboard.html |
| **Informe de presentación** (para usuarios) | https://macaperalta35.github.io/formularioFABLAB/informe-sistema.html |
| **Informe de entrega** (técnico) | https://macaperalta35.github.io/formularioFABLAB/informe.html |
| Google Sheets (visitas) | https://docs.google.com/spreadsheets/d/1wQmC5H388sfJoZpvT3kj-59BPUyNjK9J4YLW5wiNKo8/edit |
| Supabase (inventario) | https://supabase.com/dashboard/project/jcojygzofplajvnpobpw |

---

## Características Principales

### Módulo de Visitas (Google Sheets)
- Formulario público de registro con validación de RUT, correo y teléfono
- Panel de administración con tabla de visitas, filtros por nombre, RUT y tipo
- Estadísticas por tipo de visitante (Estudiante, Docente, Externo, Empresa)
- Exportación a **CSV**, **Excel (.xlsx)** y **PDF** del conjunto filtrado actualmente visible

### Módulo de Inventario (Supabase)
- Tabla completa de activos agrupada por categoría con miniatura de fotografía
- Tarjetas de estadísticas: Total activos / Disponibles / Prestados / Mantenimiento / Baja
- Búsqueda por nombre o código NFC, filtro por categoría y por estado
- **Agregar / Editar activos** con formulario completo (código NFC, nombre, descripción, categoría, propietario, stock, estado, ubicación, foto)
- **Eliminar activos** con confirmación
- **Registrar préstamo**: descuenta stock disponible y registra solicitante en historial
- **Registrar devolución**: con condición (Bueno / Dañado / Incompleto) — si el activo llega dañado transiciona automáticamente a estado Mantenimiento
- **Scan NFC**: lectura real via Web NFC API + modo simulación para dispositivos no compatibles
- **Historial de préstamos**: tabla con los últimos 30 movimientos (préstamos y devoluciones) desde Supabase
- Exportación a **Excel** y **PDF** del inventario completo

### Módulo de Ocupación del Laboratorio (Google Sheets)
- Registro de clases, talleres y eventos con fecha, hora, docente y capacidad
- Vista por pestañas: Hoy / Próximas / Todas
- Edición y eliminación de registros

### Módulo de Secciones y Alumnos (Google Sheets)
- Creación de secciones con lista de alumnos inscritos (nombre, RUT, correo)
- Visualización expandible por sección

---

## Arquitectura

```
Visitante
   │
   ▼
index.html ──POST no-cors──► Google Apps Script ──► Google Sheets (hoja "Visitas")

Administrador
   │
   ├─ Visitas / Ocupación / Secciones
   │     dashboard.html ──JSONP GET──►  Google Apps Script ──► Google Sheets (lectura)
   │                    ──POST no-cors─► Google Apps Script ──► Google Sheets (escritura)
   │
   └─ Inventario
         dashboard.html ──HTTPS──► Supabase REST API ──► PostgreSQL
                                   (anon key, RLS abierta)
```

- **Frontend:** HTML5 + CSS3 + JavaScript vanilla. Sin frameworks, sin build step. Desplegado en GitHub Pages.
- **Backend visitas:** Google Apps Script como API serverless (JSONP para lectura, POST no-cors para escritura).
- **Base de datos inventario:** Supabase (PostgreSQL cloud, plan gratuito). Tablas: `assets`, `users`, `loans`.
- **Base de datos visitas:** Google Sheets con 4 hojas: Visitas, Ocupaciones, Secciones, Alumnos.

---

## Módulo de Inventario — Supabase

### Tablas

| Tabla | Descripción |
|-------|-------------|
| `assets` | Inventario completo de activos (herramientas, insumos, electrónica, químicos) |
| `loans` | Historial de préstamos y devoluciones con condición y notas |
| `users` | Usuarios del sistema de inventario (solo para inventariofablab standalone) |

### Configuración del proyecto Supabase

El proyecto Supabase ya está configurado y en producción. Si necesitas replicarlo:

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Ve a **SQL Editor → New query**, pega el contenido del schema (disponible en el repo [inventariofablab](https://github.com/Macaperalta35/inventariofablab/blob/main/supabase/schema.sql)) y ejecútalo.
3. Las credenciales ya están integradas directamente en `dashboard.html` como constantes:

```javascript
const SUPABASE_URL = 'https://jcojygzofplajvnpobpw.supabase.co'
const SUPABASE_KEY = 'sb_publishable_...'
```

> Las credenciales son la `anon key` pública de Supabase, diseñada para exponerse en el frontend. Las políticas RLS controlan el acceso a los datos.

---

## Acceso al Panel

**URL:** https://macaperalta35.github.io/formularioFABLAB/dashboard.html

El panel se abre directamente sin contraseña. El token de administración (`fablab2024`) está configurado como constante en el código y se usa internamente para autenticar las llamadas al Google Apps Script.

---

## Google Apps Script

**URL del script:**
```
https://script.google.com/macros/s/AKfycbxqySNZqlHt2Iy6_v6xUE4X0pUWoQO2IwxRea2XfEUFSE1qohRE22Qlg3oL43a5Drozmw/exec
```

### Hojas de Google Sheets

| Hoja | Columnas principales |
|------|---------------------|
| Visitas | fecha, nombre, rut, telefono, correo, tipoVisita, proposito |
| Ocupaciones | id, nombre, tipo, docente, asignatura, fecha, horaInicio, horaFin, capacidad |
| Secciones | id, nombre, tipo, docente, fecha, horaInicio, horaFin |
| Alumnos | seccionId, id, nombre, rut, correo |

### Acciones del script

**GET (requieren `?token=fablab2024`):**
- `?action=getAll` — todas las visitas
- `?action=getOcupaciones` — eventos de ocupación
- `?action=getSecciones` — secciones con alumnos

**POST sin token** (formulario público):
- Sin campo `action` → guarda nueva visita

**POST con token** (acciones de admin):
- `saveOcupacion`, `deleteOcupacion`
- `saveSeccion`, `deleteSeccion`
- `saveAlumno`, `deleteAlumno`

### Actualizar el script

Cada vez que modifiques `google-apps-script.gs`:

1. Abre [script.google.com](https://script.google.com) y entra al proyecto del FAB LAB.
2. Pega el código actualizado y guarda (`Ctrl+S`).
3. **Implementar → Nueva implementación** (Tipo: Aplicación web · Ejecutar como: Yo · Acceso: Todos).
4. Copia la nueva URL y reemplaza `GOOGLE_SCRIPT_URL` en `index.html` y `dashboard.html`.

---

## Archivos del Proyecto

| Archivo | Descripción |
|---------|-------------|
| `index.html` | Formulario público de registro de visitas |
| `dashboard.html` | Panel de administración central (visitas + inventario + ocupación + secciones) |
| `qr.html` | Página con código QR imprimible para el laboratorio |
| `dashboard.css` | Estilos del panel de administración |
| `google-apps-script.gs` | Código del Google Apps Script (referencia para redespliegue) |
| `fablab_app.py` | Backend Flask + SQLite para uso local sin internet (legacy) |
| `docs/` | Documentación técnica adicional |

---

## Validaciones del Formulario de Visitas

| Campo | Regla |
|-------|-------|
| Nombre | Solo letras y espacios, mínimo 2 caracteres |
| RUT | Formato chileno `XX.XXX.XXX-X`, autoformateado al escribir |
| Teléfono | Obligatorio, mínimo 8 dígitos |
| Correo | Validación de estructura estándar |
| Tipo de visita | Estudiante / Docente / Visitante Externo / Empresa |
| Propósito | Mínimo 5 caracteres. Botones de etiquetas rápidas disponibles |

---

## Acción Pendiente — Migración de Registros Históricos

La hoja **"Hoja 1"** de Google Sheets contiene ~105 registros anteriores al dashboard. Para importarlos a la hoja "Visitas":

1. Abre [script.google.com](https://script.google.com) y entra al proyecto del FAB LAB.
2. En el selector de función, selecciona `mergeHoja1ToVisitas`.
3. Haz clic en **▶ Ejecutar**.
4. La función omite duplicados (compara RUT + fecha), es seguro ejecutarla más de una vez.

---

## Backend Flask (uso local / red interna)

`fablab_app.py` es un servidor alternativo con SQLite para cuando el laboratorio opera sin internet.

```bash
pip install flask flask-cors flask-sqlalchemy openpyxl
python fablab_app.py
# Servidor en http://0.0.0.0:5000
```

Contraseña del panel local: `fablab2024` (variable de entorno `ADMIN_PASSWORD`)

---

## Relación con inventariofablab

El inventario también está disponible como aplicación standalone con login propio en:
**https://macaperalta35.github.io/inventariofablab/**

Ambos proyectos comparten la misma base de datos Supabase. Cualquier cambio en el inventario desde el dashboard del formulario se refleja inmediatamente en inventariofablab y viceversa.

| Proyecto | URL | Auth | Tecnología datos |
|----------|-----|------|-----------------|
| formularioFABLAB | macaperalta35.github.io/formularioFABLAB/ | Sin login (token hardcoded) | Google Sheets + Supabase |
| inventariofablab | macaperalta35.github.io/inventariofablab/ | Login con email/contraseña | Supabase (solo) |

---

## QA — Resultados de Verificación

### Formulario `index.html` ✅
- Todos los campos validados correctamente
- `Content-Type: text/plain` en POST a Apps Script (corrección crítica para modo `no-cors`)
- Sin pantalla de login

### Panel `dashboard.html` ✅
- Acceso directo sin login
- JSONP para lecturas (resuelve CORS con redirects de Apps Script)
- POST `no-cors` + `text/plain` para escrituras
- Módulo Visitas: tabla, filtros, estadísticas, exportación CSV/Excel/PDF
- Módulo Inventario: tabla con acciones, modales add/edit/préstamo/devolución, NFC, historial de loans, exportación Excel/PDF
- Módulo Ocupación: registro, edición, eliminación, vistas por pestaña
- Módulo Secciones: creación con alumnos, visualización expandible
- 15 puntos de auditoría QA pasados sin bugs (junio 2026)

### Google Sheets API ✅
| Test | Resultado |
|------|-----------|
| GET sin token | PASS — rechazado con 401 |
| GET con token válido | PASS — datos retornados correctamente |
| POST visita pública | PASS — guardada y visible en Sheets |
| POST admin con token | PASS — operaciones CRUD correctas |
| JSONP callback | PASS — formato correcto |

---

*Desarrollado para el ecosistema de innovación y transferencia tecnológica de INACAP San Pedro de la Paz.*
