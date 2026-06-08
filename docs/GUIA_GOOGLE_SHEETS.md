# 📋 Guía: Conectar el Formulario con Google Sheets

Esta guía te explica cómo crear una hoja de cálculo en Google que reciba automáticamente los registros del formulario.

## Paso 1: Crear la Hoja de Cálculo

1. Ve a [Google Sheets](https://sheets.google.com) y crea una nueva hoja
2. Ponle nombre: **"FAB LAB - Visitas"**
3. En la **Fila 1**, escribe estos encabezados exactos (uno por columna):

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| Fecha | Nombre | RUT | Correo | Tipo Visita | Teléfono | Propósito |

## Paso 2: Crear el Script

1. En la hoja de cálculo, ve a **Extensiones → Apps Script**
2. **Borra** todo el código que aparece
3. **Pega** este código:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    sheet.appendRow([
      data.fecha || new Date().toLocaleString('es-CL'),
      data.nombre || '',
      data.rut || '',
      data.correo || '',
      data.tipoVisita || '',
      data.telefono || '',
      data.proposito || ''
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Guarda el proyecto (Ctrl+S). Ponle nombre: **"FAB LAB Backend"**

## Paso 3: Desplegar como Web App

1. Haz clic en **Implementar → Nueva implementación**
2. En tipo, selecciona **Aplicación web**
3. Configura:
   - **Descripción**: FAB LAB Registro
   - **Ejecutar como**: **Yo** (tu cuenta)
   - **Quién tiene acceso**: **Cualquier persona**
4. Haz clic en **Implementar**
5. **Autoriza** la app cuando te lo pida (es tu propia cuenta)
6. **Copia la URL** que te da. Se verá algo así:
   ```
   https://script.google.com/macros/s/AKfycbx.../exec
   ```

## Paso 4: Pegar la URL en el formulario

1. Abre el archivo `index.html`
2. Busca esta línea (está arriba en el `<script>`):
   ```javascript
   const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/TU_SCRIPT_ID_AQUI/exec';
   ```
3. Reemplaza `TU_SCRIPT_ID_AQUI` con tu URL real
4. Guarda el archivo

## Paso 5: Probar

1. Abre el formulario y haz un registro de prueba
2. Ve a tu Google Sheets y verifica que apareció la fila nueva

---

## ⚠️ Nota Importante
Cada vez que modifiques el código del Apps Script, debes crear una **nueva implementación** (no editar la anterior) para que los cambios surtan efecto.
