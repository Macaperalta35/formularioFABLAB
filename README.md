# FAB LAB INACAP — Sistema de Registro de Visitas

Sistema de registro de visitas del **FAB LAB INACAP Sede San Pedro de la Paz**. Centraliza el ingreso de estudiantes, docentes, empresas y visitantes externos, con panel de administración completo conectado a Google Sheets.

---

## Enlaces Rápidos

| Página | URL |
|--------|-----|
| Formulario de registro | https://macaperalta35.github.io/formularioFABLAB/ |
| Código QR imprimible | https://macaperalta35.github.io/formularioFABLAB/qr.html |
| Panel de administración | https://macaperalta35.github.io/formularioFABLAB/dashboard.html |
| Google Sheets (datos) | https://docs.google.com/spreadsheets/d/1wQmC5H388sfJoZpvT3kj-59BPUyNjK9J4YLW5wiNKo8/edit |

---

## Acceso al Panel de Administración

**URL:** https://macaperalta35.github.io/formularioFABLAB/dashboard.html

El panel se abre directamente sin contraseña. El token de administración (`fablab2024`) está hardcodeado en el código del dashboard y se usa internamente para autenticar las llamadas al Google Apps Script.

El panel permite:
- Ver todas las visitas registradas con filtros por nombre, RUT y tipo
- Exportar visitas a CSV
- Registrar ocupación del laboratorio (clases, talleres, eventos)
- Gestionar secciones de alumnos con lista de inscritos

---

## Arquitectura

```
Visitante
   │
   ▼
index.html  ──POST no-cors──►  Google Apps Script  ──►  Google Sheets (hoja "Visitas")
(formulario)                    (doPost sin token)

Administrador
   │
   ▼
dashboard.html  ──JSONP GET──►  Google Apps Script  ──►  Google Sheets (lectura)
(sin login)     ──POST no-cors─►  Google Apps Script  ──►  Google Sheets (escritura)
                                  (doGet/doPost con token)   Hojas: Visitas
                                                                     Ocupaciones
                                                                     Secciones
                                                                     Alumnos
```

> El dashboard usa **JSONP** para lecturas (evita restricciones CORS de los redirects de Apps Script)
> y **POST sin CORS** para escrituras. Ambas técnicas funcionan desde cualquier navegador.

- **Frontend:** HTML5 + CSS3 + JavaScript vanilla. Desplegado en GitHub Pages.
- **Backend:** Google Apps Script como API serverless (sin costo de servidor).
- **Base de datos:** Google Sheets con 4 hojas estructuradas.

---

## Archivos del Proyecto

| Archivo | Descripción |
|---------|-------------|
| `index.html` | Formulario público de registro de visitas |
| `dashboard.html` | Panel de administración completo (acceso directo, sin login) |
| `admin-visitas.html` | Vista alternativa simplificada del panel |
| `qr.html` | Página con código QR imprimible para el laboratorio |
| `fablab-simple.html` | Formulario alternativo (apunta al backend Flask local) |
| `dashboard.css` | Estilos del panel de administración |
| `google-apps-script.gs` | Código del Google Apps Script (referencia) |
| `fablab_app.py` | Backend Flask + SQLite para uso local/red interna |

---

## Google Apps Script

**URL actual del script:**
```
https://script.google.com/macros/s/AKfycbwjsHdbFXwwn_9dSJZniuEOayd8R3I-6y8c68EC8wV_-WuvB0UNuW7IPrv4zWYpFfPTPA/exec
```

Esta URL está configurada en `index.html` y `dashboard.html` como `GOOGLE_SCRIPT_URL`.

### Hojas de Google Sheets creadas automáticamente

| Hoja | Columnas |
|------|----------|
| Visitas | fecha, nombre, rut, telefono, correo, tipoVisita, proposito, etiquetas |
| Ocupaciones | id, nombre, tipo, docente, asignatura, fecha, horaInicio, horaFin, capacidad, observaciones |
| Secciones | id, nombre, tipo, docente, fecha, horaInicio, horaFin |
| Alumnos | seccionId, id, nombre, rut, correo |

### Acciones soportadas por el script

**GET (requieren `?token=fablab2024`):**
- `?action=getAll` — devuelve todas las visitas
- `?action=getOcupaciones` — devuelve eventos de ocupación del lab
- `?action=getSecciones` — devuelve secciones con alumnos

**POST sin token** (formulario público):
- Sin campo `action` → guarda nueva visita

**POST con token** (acciones de admin):
- `saveOcupacion`, `deleteOcupacion`
- `saveSeccion`, `deleteSeccion`
- `saveAlumno`, `deleteAlumno`

---

## Acción pendiente — Migración de registros históricos

La hoja **"Hoja 1"** contiene ~105 registros anteriores al dashboard que aún no están en la hoja "Visitas". Para importarlos:

1. Abre [script.google.com](https://script.google.com) y entra al proyecto del FAB LAB.
2. En el selector de función (arriba al centro), selecciona `mergeHoja1ToVisitas`.
3. Haz clic en **▶ Ejecutar** (no es necesario redesplegar).
4. Acepta los permisos si te los pide.
5. Al terminar aparece un diálogo con el número de registros importados.

> La función omite duplicados (compara RUT + fecha), así que es seguro ejecutarla más de una vez.

---

## Mantenimiento del Apps Script

Cada vez que modifiques `google-apps-script.gs` debes pegar el código actualizado en script.google.com **y redesplegar**:

1. Abre [script.google.com](https://script.google.com) y entra al proyecto del FAB LAB.
2. Pega el contenido de `google-apps-script.gs` y guarda (`Ctrl+S`).
3. Haz clic en **Implementar → Nueva implementación**.
   - Tipo: *Aplicación web*
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Todos**
4. Copia la nueva URL generada.
5. Reemplaza `GOOGLE_SCRIPT_URL` en `index.html` y `dashboard.html`.
6. Haz commit y push al repositorio.

---

## Backend Flask (uso local / red interna)

`fablab_app.py` es un servidor Flask alternativo con base de datos SQLite. Se usa cuando el laboratorio opera sin internet o para pruebas locales.

```bash
pip install flask flask-cors flask-sqlalchemy openpyxl
python fablab_app.py
# Servidor en http://0.0.0.0:5000
```

**Contraseña del panel local:** `fablab2024` (variable de entorno `ADMIN_PASSWORD`)

Endpoints:
- `POST /api/visitas` — registrar visita (público)
- `GET /api/visitas` — listar visitas (requiere header `X-Admin-Token`)
- `GET /api/visitas/export?format=excel` — exportar Excel (requiere header `X-Admin-Token`)

---

## Validaciones del Formulario

- **Nombre:** solo letras y espacios, mínimo 2 caracteres
- **RUT:** formato chileno `XX.XXX.XXX-X`, autoformateado
- **Teléfono:** obligatorio, mínimo 8 dígitos
- **Correo:** validación de estructura estándar
- **Tipo de visita:** Estudiante / Docente / Visitante Externo / Empresa
- **Propósito:** mínimo 5 caracteres. Botones de etiquetas rápidas disponibles

---

## QA — Resultados de Verificación (10-06-2026)

Verificación completa del sistema. Todos los módulos pasan.

### Formulario `index.html`
- Todos los campos presentes y validados correctamente (nombre, RUT, teléfono, correo, tipo de visita, propósito)
- `Content-Type: text/plain` en el POST a Apps Script (corrección crítica — el anterior `application/json` causaba que el navegador bloqueara el envío silenciosamente en modo `no-cors`)
- URL del Apps Script actualizada a la implementación vigente
- Sin pantalla de login

### Panel `dashboard.html`
- Acceso directo sin login ni contraseña
- Token de admin hardcodeado como constante (`ADMIN_TOKEN`)
- JSONP para lecturas (evita problema de CORS con redirects de Apps Script)
- POST `no-cors` + `text/plain` para escrituras
- Navegación completa: Visitas, Ocupación, Secciones
- Exportación de visitas en **CSV**, **Excel (.xlsx)** y **PDF** (A4 horizontal, tabla con colores INACAP)
- Exporta el conjunto filtrado actualmente visible (respeta búsqueda y filtro de tipo)

### Panel `admin-visitas.html`
- Formulario de login eliminado por completo
- Dashboard visible por defecto al cargar la página

### Google Sheets (API en vivo)
| Test | Resultado |
|------|-----------|
| GET sin token → rechazado | PASS — `{"error":"No autorizado","status":401}` |
| GET token incorrecto → rechazado | PASS — `{"error":"No autorizado","status":401}` |
| GET con token → retorna datos | PASS — 126 registros reales devueltos con `_rowIndex` |
| POST visita de prueba → guardada y confirmada | PASS |
| POST `deleteVisita` → elimina fila correcta | PASS |
| POST `updateVisita` → actualiza sin alterar otros | PASS |
| JSONP callback → formato correcto | PASS — `_gscb_xxx([...])` |
| POST con campos vacíos → rechazado | PASS — `{"error":"Nombre y RUT son obligatorios","status":400}` |
| POST admin sin token → rechazado | PASS — `{"error":"No autorizado"}` |

### Observaciones
- Los números de teléfono se almacenan como número en Google Sheets (comportamiento automático de la hoja). El CSV y Excel los fuerzan a string para evitar notación científica.
- La hoja "Hoja 1" (~105 registros históricos) requiere migración manual con `mergeHoja1ToVisitas()` — ver sección **Acción pendiente** arriba.

---

*Desarrollado para el ecosistema de innovación y transferencia tecnológica de INACAP San Pedro de la Paz.*
