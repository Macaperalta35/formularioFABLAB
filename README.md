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

**Contraseña:** `fablab2024`

> No cambiar la contraseña. Está configurada como `ADMIN_TOKEN` en el Google Apps Script y como token esperado en el dashboard.

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
(con login)     ──POST no-cors─►  Google Apps Script  ──►  Google Sheets (escritura)
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
| `dashboard.html` | Panel de administración completo (requiere login) |
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
https://script.google.com/macros/s/AKfycbxRtF1SGLJsBAjyKWtvdo9CxjfQMRIq7ODOc_q_76XosaYTK7wj50bV0IabqRKZpL9d9A/exec
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

## Mantenimiento del Apps Script

Si necesitas redesplegar el script (por ejemplo, para hacer cambios):

1. Abre [script.google.com](https://script.google.com) y entra al proyecto del FAB LAB.
2. Modifica el código usando `google-apps-script.gs` como referencia.
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

*Desarrollado para el ecosistema de innovación y transferencia tecnológica de INACAP San Pedro de la Paz.*
