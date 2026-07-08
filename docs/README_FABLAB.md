# Documentación Técnica — FAB LAB INACAP

> Este archivo contiene notas técnicas de implementación. Para la documentación general del proyecto, ver el [README principal](../README.md).

---

## Flujo de datos completo

### Registro de visita (formulario público)

```
Usuario llena index.html
  └─► fetch POST no-cors → GOOGLE_SCRIPT_URL
        body: JSON.stringify({ nombre, rut, telefono, correo, tipoVisita, proposito })
        Content-Type: text/plain   ← obligatorio para no-cors
        └─► Google Apps Script doPost()
              └─► Sheets.getActiveSpreadsheet().getSheetByName('Visitas').appendRow([...])
```

> No se puede leer la respuesta en modo `no-cors`. El estado local se actualiza optimistamente.

### Lectura de datos en el dashboard (JSONP)

```
dashboard.html crea <script src="GOOGLE_SCRIPT_URL?action=getAll&token=...&callback=_cb_xxx">
  └─► Google Apps Script doGet()
        └─► devuelve: _cb_xxx([{ nombre, rut, ... }, ...])
              └─► window['_cb_xxx'] se ejecuta con los datos
```

> JSONP evita el problema de CORS que genera el redirect 302 de Apps Script hacia `script.googleusercontent.com`. Un fetch normal falla en ese redirect; un `<script>` tag no tiene esa restricción.

### Operaciones de inventario (Supabase REST)

```
dashboard.html
  └─► supabase.from('assets').select('*')
        └─► HTTPS → https://jcojygzofplajvnpobpw.supabase.co/rest/v1/assets
              Headers: apikey: <anon_key>, Authorization: Bearer <anon_key>
              └─► PostgreSQL RLS: política anon permite SELECT/INSERT/UPDATE/DELETE
```

---

## Esquema Supabase

```sql
-- assets: inventario de activos
CREATE TABLE assets (
  id          TEXT PRIMARY KEY,   -- código NFC / identificador
  name        TEXT NOT NULL,
  description TEXT,
  category    TEXT,               -- Herramientas | Insumos | Electrónica | Químicos
  owner       TEXT,               -- Laboratorio | Prestado
  status      TEXT,               -- active | maintenance | lost
  total       INTEGER DEFAULT 1,
  available   INTEGER DEFAULT 1,
  borrowed    INTEGER DEFAULT 0,
  location    TEXT,
  image       TEXT,               -- base64 de la foto
  nfc_configured BOOLEAN DEFAULT FALSE  -- true tras grabar el tag NFC físico
);

-- loans: historial de movimientos
CREATE TABLE loans (
  id            SERIAL PRIMARY KEY,
  asset_id      TEXT REFERENCES assets(id),
  asset_name    TEXT,
  user_name     TEXT,             -- nombre del solicitante
  borrower_rut  TEXT,
  action        TEXT,             -- loan | return
  qty           INTEGER DEFAULT 1,
  condition     TEXT,             -- good | damaged | incomplete (solo en return)
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- users: solo para inventariofablab standalone
CREATE TABLE users (
  id       SERIAL PRIMARY KEY,
  name     TEXT NOT NULL,
  email    TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role     TEXT DEFAULT 'operator',  -- admin | operator
  active   BOOLEAN DEFAULT TRUE
);
```

**Migración para bases `assets` creadas antes de la columna `nfc_configured`:**
```sql
ALTER TABLE assets ADD COLUMN IF NOT EXISTS nfc_configured BOOLEAN DEFAULT FALSE;
```

**Políticas RLS (Row Level Security):**
```sql
-- Acceso abierto para anon (el dashboard no usa auth de Supabase)
CREATE POLICY "anon_all" ON assets FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON loans  FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON users  FOR ALL TO anon USING (true) WITH CHECK (true);
```

---

## Librerías cargadas en dashboard.html

| Librería | CDN | Uso |
|----------|-----|-----|
| SheetJS (xlsx) | cdn.sheetjs.com | Exportar Excel en visitas e inventario |
| jsPDF | cdnjs.cloudflare.com | Exportar PDF en visitas e inventario |
| jspdf-autotable | cdnjs.cloudflare.com | Tablas en los PDF |
| Supabase JS (UMD) | cdn.jsdelivr.net | Cliente REST para inventario |
| Google Fonts (Montserrat) | fonts.googleapis.com | Tipografía |

---

## Variables globales en dashboard.html

```javascript
const GOOGLE_SCRIPT_URL = '...'   // URL del Apps Script
const ADMIN_TOKEN       = 'fablab2024'
const SUPABASE_URL      = 'https://jcojygzofplajvnpobpw.supabase.co'
const SUPABASE_KEY      = 'sb_publishable_...'
const supabaseClient    = supabase.createClient(SUPABASE_URL, SUPABASE_KEY)

let db = {
  visitas:    [],   // cargado via JSONP desde Google Sheets
  ocupaciones:[],   // cargado via JSONP
  secciones:  [],   // cargado via JSONP
  assets:     []    // cargado desde Supabase
}
```

---

## Notas de implementación

### Por qué `Content-Type: text/plain` en el POST del formulario
`fetch` con `mode: 'no-cors'` solo permite "simple requests". Un body con `Content-Type: application/json` convierte la petición en "preflighted" (CORS), lo que hace que el navegador envíe un OPTIONS previo que Apps Script no sabe responder. Con `text/plain` la petición es simple y pasa sin OPTIONS.

### Por qué JSONP y no fetch para las lecturas del dashboard
Apps Script responde a GET con un redirect 302 hacia `script.googleusercontent.com`. `fetch` no sigue ese redirect en modo cors (falla con "opaque response"). Un `<script>` tag sigue redirects sin restricciones, por eso JSONP funciona donde fetch no.

### Por qué la imagen del activo se guarda como base64
El plan gratuito de Supabase incluye Storage, pero implica una URL pública y un bucket separado. Para simplificar, la imagen se convierte a base64 con `FileReader` y se guarda directamente en la columna `image` de la tabla `assets`. Esto funciona bien para imágenes pequeñas (< 200 KB recomendado).

### Cambio de estado automático en devolución
Cuando se registra una devolución con condición `damaged` o `incomplete`, la función `saveInvReturn()` actualiza el campo `status` del activo a `maintenance` en Supabase, bloqueando futuros préstamos de esa unidad hasta que sea reparada.

---

## Historial de versiones

| Fecha | Cambio |
|-------|--------|
| Jun 2026 | Integración del inventario Supabase en el dashboard; historial de préstamos; exportación Excel/PDF del inventario; stat card Baja/Perdidos |
| Jun 2026 | Módulo NFC (lectura real + simulación) y modales completos para activos |
| Jun 2026 | Primera integración del inventario en el dashboard (tabla básica) |
| Jun 2026 | Link directo al inventario en el sidebar footer |
| Jun 2026 | Normalización de fechas/horas de Sheets; fixes de overlay móvil |
| 2025 | Versión inicial: formulario de visitas + dashboard Google Sheets |
