// =====================================================
//  FAB LAB INACAP — Google Apps Script
//  Pegar este código en script.google.com y redesplegar
//  como Web App: "Ejecutar como: Yo" + "Acceso: Todos"
// =====================================================

var ADMIN_TOKEN = 'fablab2024'; // Cambiar por contraseña segura

// =====================================================
//  MIGRACIÓN: Ejecutar UNA VEZ desde el editor del script
//  Menú superior → Ejecutar → mergeHoja1ToVisitas
//  Une los registros de "Hoja 1" con "Visitas" sin duplicar.
// =====================================================
function mergeHoja1ToVisitas() {
  var ss   = SpreadsheetApp.getActiveSpreadsheet();
  var src  = ss.getSheetByName('Hoja 1');
  var dest = getOrCreateSheet('Visitas', [
    'fecha','nombre','rut','telefono','correo','tipoVisita','proposito','etiquetas'
  ]);

  if (!src) {
    Logger.log('No se encontró la hoja "Hoja 1". Verifica el nombre exacto.');
    return;
  }

  var srcData = src.getDataRange().getValues();
  if (srcData.length <= 1) {
    Logger.log('Hoja 1 está vacía o solo tiene encabezado.');
    return;
  }

  // --- Leer encabezados de Hoja 1 ---
  var srcHeaders = srcData[0].map(function(h) { return String(h).trim().toLowerCase(); });
  Logger.log('Columnas en Hoja 1: ' + srcHeaders.join(' | '));

  // --- Mapeo flexible de columnas ---
  function findCol(candidates) {
    for (var i = 0; i < candidates.length; i++) {
      var idx = srcHeaders.indexOf(candidates[i]);
      if (idx >= 0) return idx;
    }
    return -1;
  }

  var colFecha     = findCol(['fecha','timestamp','date','fecha de registro','fecha y hora']);
  var colNombre    = findCol(['nombre','nombre completo','name','nombres']);
  var colRut       = findCol(['rut','rut/dni','dni']);
  var colTelefono  = findCol(['telefono','teléfono','tel','phone','fono','celular']);
  var colCorreo    = findCol(['correo','correo electrónico','email','mail','e-mail']);
  var colTipo      = findCol(['tipovisita','tipo de visita','tipo','type','tipodevisita']);
  var colProposito = findCol(['proposito','propósito','descripcion','descripción','motivo','purpose','proposito de la visita']);
  var colEtiquetas = findCol(['etiquetas','tags','etiqueta','actividad','actividades']);

  Logger.log('Mapeo → fecha:'+colFecha+' nombre:'+colNombre+' rut:'+colRut+
             ' tel:'+colTelefono+' correo:'+colCorreo+' tipo:'+colTipo+
             ' proposito:'+colProposito+' etiquetas:'+colEtiquetas);

  // --- Construir set de RUTs ya existentes en Visitas (para evitar duplicados) ---
  var destData = dest.getDataRange().getValues();
  var destHeaders = destData[0].map(function(h) { return String(h).toLowerCase(); });
  var rutColDest = destHeaders.indexOf('rut');
  var fechaColDest = destHeaders.indexOf('fecha');

  var existing = {};
  for (var i = 1; i < destData.length; i++) {
    var key = String(destData[i][rutColDest]).replace(/[.\-]/g,'').toLowerCase() +
              '|' + String(destData[i][fechaColDest]).slice(0, 16);
    existing[key] = true;
  }

  // --- Copiar filas de Hoja 1 → Visitas ---
  var added = 0;
  var skipped = 0;

  for (var r = 1; r < srcData.length; r++) {
    var row = srcData[r];

    var fecha     = colFecha     >= 0 ? row[colFecha]     : '';
    var nombre    = colNombre    >= 0 ? row[colNombre]    : '';
    var rut       = colRut       >= 0 ? row[colRut]       : '';
    var telefono  = colTelefono  >= 0 ? row[colTelefono]  : '';
    var correo    = colCorreo    >= 0 ? row[colCorreo]    : '';
    var tipo      = colTipo      >= 0 ? row[colTipo]      : '';
    var proposito = colProposito >= 0 ? row[colProposito] : '';
    var etiquetas = colEtiquetas >= 0 ? row[colEtiquetas] : '';

    // Formatear fecha si es objeto Date
    if (fecha instanceof Date) {
      fecha = Utilities.formatDate(fecha, 'America/Santiago', 'dd/MM/yyyy HH:mm');
    }

    // Clave de deduplicación: rut (sin puntos ni guión) + primeros 16 chars de fecha
    var key = String(rut).replace(/[.\-]/g,'').toLowerCase() + '|' + String(fecha).slice(0, 16);

    if (existing[key]) {
      skipped++;
      continue;
    }

    dest.appendRow([fecha, nombre, rut, telefono, correo, tipo, proposito, etiquetas]);
    existing[key] = true;
    added++;
  }

  var msg = '✅ Migración completa: ' + added + ' registros importados, ' + skipped + ' duplicados omitidos.';
  Logger.log(msg);
  try { SpreadsheetApp.getUi().alert(msg); } catch(e) { /* ejecutado fuera de contexto UI */ }
}

// ── Utilidades ──────────────────────────────────────

function getOrCreateSheet(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length)
         .setFontWeight('bold')
         .setBackground('#ED1C24')
         .setFontColor('#FFFFFF');
  }
  return sheet;
}

function sheetToJSON(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  var headers = data[0].map(String);
  return data.slice(1).map(function(row, i) {
    var obj = {};
    headers.forEach(function(h, j) {
      obj[h] = row[j] === '' ? null : row[j];
    });
    obj._rowIndex = i + 2; // fila real en Sheets (1=cabecera, datos desde 2)
    return obj;
  });
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// Responde en JSON o JSONP según el parámetro `callback`
function respond(data, cb) {
  var json = JSON.stringify(data);
  if (cb) {
    return ContentService
      .createTextOutput(cb + '(' + json + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return jsonResponse(data);
}

// ── GET: leer datos (con soporte JSONP para el dashboard) ──

function doGet(e) {
  var cb = e.parameter.callback || '';
  try {
    var action = e.parameter.action || 'getAll';
    var token  = e.parameter.token  || '';

    if (token !== ADMIN_TOKEN) {
      return respond({ error: 'No autorizado', status: 401 }, cb);
    }

    if (action === 'getAll') {
      var sheet = getOrCreateSheet('Visitas', [
        'fecha','nombre','rut','telefono','correo','tipoVisita','proposito','etiquetas'
      ]);
      return respond(sheetToJSON(sheet), cb);
    }

    if (action === 'getOcupaciones') {
      var sheet = getOrCreateSheet('Ocupaciones', [
        'id','nombre','tipo','docente','asignatura','fecha','horaInicio','horaFin','capacidad','observaciones'
      ]);
      return respond(sheetToJSON(sheet), cb);
    }

    if (action === 'getSecciones') {
      var secSheet  = getOrCreateSheet('Secciones', ['id','nombre','tipo','docente','fecha','horaInicio','horaFin']);
      var alumSheet = getOrCreateSheet('Alumnos',   ['seccionId','id','nombre','rut','correo']);
      var secciones = sheetToJSON(secSheet);
      var alumnos   = sheetToJSON(alumSheet);
      secciones.forEach(function(sec) {
        sec.alumnos = alumnos.filter(function(a) { return String(a.seccionId) === String(sec.id); });
      });
      return respond(secciones, cb);
    }

    if (action === 'getRecordatorios') {
      var sheet = getOrCreateSheet('Recordatorios', [
        'id','tipo','titulo','descripcion','fechaLimite','prioridad','estado','fechaCreacion'
      ]);
      return respond(sheetToJSON(sheet), cb);
    }

    if (action === 'getImpresiones') {
      var sheet = getOrCreateSheet('Impresiones3D', [
        'id','titulo','solicitante','rut','material','color','impresora',
        'tiempoEstimado','prioridad','archivo','notas','estado','fechaSolicitud'
      ]);
      return respond(sheetToJSON(sheet), cb);
    }

    // Lista todas las hojas con nombre y cantidad de filas
    if (action === 'listSheets') {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheets = ss.getSheets().map(function(s) {
        return { name: s.getName(), rows: s.getLastRow() };
      });
      return respond(sheets, cb);
    }

    // Lee las primeras filas de cualquier hoja por nombre
    if (action === 'getSheetRaw') {
      var sheetName = e.parameter.sheet || '';
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var s = ss.getSheetByName(sheetName);
      if (!s) return respond({ error: 'Hoja no encontrada: ' + sheetName }, cb);
      var data = s.getDataRange().getValues();
      return respond(data, cb);
    }

    return respond({ ok: true }, cb);

  } catch(err) {
    return respond({ error: err.toString() }, cb);
  }
}

// ── POST: escribir datos ─────────────────────────────

function doPost(e) {
  try {
    var body   = JSON.parse(e.postData.contents);
    var action = body.action;

    // ── Visita pública (sin token) ──────────────────
    if (!action) {
      var nombre = String(body.nombre || '').trim();
      var rut    = String(body.rut    || '').trim();
      if (!nombre || !rut) {
        return jsonResponse({ error: 'Nombre y RUT son obligatorios', status: 400 });
      }
      var sheet = getOrCreateSheet('Visitas', [
        'fecha','nombre','rut','telefono','correo','tipoVisita','proposito','etiquetas'
      ]);
      sheet.appendRow([
        body.fecha     || Utilities.formatDate(new Date(), 'America/Santiago', 'dd/MM/yyyy HH:mm'),
        nombre,
        rut,
        String(body.telefono  || '').trim(),
        String(body.correo    || '').trim(),
        String(body.tipoVisita|| '').trim(),
        String(body.proposito || '').trim(),
        String(body.etiquetas || '').trim()
      ]);
      return jsonResponse({ ok: true });
    }

    // ── Acciones de admin (requieren token) ─────────
    if (body.token !== ADMIN_TOKEN) {
      return jsonResponse({ error: 'No autorizado' });
    }

    // Lectura via POST (evita problema de CORS con GET redirect)
    if (action === 'getAll') {
      var sheet = getOrCreateSheet('Visitas', [
        'fecha','nombre','rut','telefono','correo','tipoVisita','proposito','etiquetas'
      ]);
      return jsonResponse(sheetToJSON(sheet));
    }

    if (action === 'getOcupaciones') {
      var sheet = getOrCreateSheet('Ocupaciones', [
        'id','nombre','tipo','docente','asignatura','fecha','horaInicio','horaFin','capacidad','observaciones'
      ]);
      return jsonResponse(sheetToJSON(sheet));
    }

    if (action === 'getSecciones') {
      var secSheet  = getOrCreateSheet('Secciones', ['id','nombre','tipo','docente','fecha','horaInicio','horaFin']);
      var alumSheet = getOrCreateSheet('Alumnos',   ['seccionId','id','nombre','rut','correo']);
      var secciones = sheetToJSON(secSheet);
      var alumnos   = sheetToJSON(alumSheet);
      secciones.forEach(function(sec) {
        sec.alumnos = alumnos.filter(function(a) { return String(a.seccionId) === String(sec.id); });
      });
      return jsonResponse(secciones);
    }

    // ── Gestión de visitas ───────────────────────────

    if (action === 'deleteVisita') {
      var sheet = getOrCreateSheet('Visitas', [
        'fecha','nombre','rut','telefono','correo','tipoVisita','proposito','etiquetas'
      ]);
      var rowIndex = parseInt(body.rowIndex);
      if (rowIndex >= 2 && rowIndex <= sheet.getLastRow()) {
        sheet.deleteRow(rowIndex);
      }
      return jsonResponse({ ok: true });
    }

    if (action === 'updateVisita') {
      var sheet = getOrCreateSheet('Visitas', [
        'fecha','nombre','rut','telefono','correo','tipoVisita','proposito','etiquetas'
      ]);
      var rowIndex = parseInt(body.rowIndex);
      if (rowIndex >= 2 && rowIndex <= sheet.getLastRow()) {
        sheet.getRange(rowIndex, 1, 1, 8).setValues([[
          body.fecha      || '',
          body.nombre     || '',
          body.rut        || '',
          body.telefono   || '',
          body.correo     || '',
          body.tipoVisita || '',
          body.proposito  || '',
          body.etiquetas  || ''
        ]]);
      }
      return jsonResponse({ ok: true });
    }

    // ── Ocupaciones ──────────────────────────────────

    if (action === 'saveOcupacion') {
      var sheet = getOrCreateSheet('Ocupaciones', [
        'id','nombre','tipo','docente','asignatura','fecha','horaInicio','horaFin','capacidad','observaciones'
      ]);
      sheet.appendRow([
        body.id, body.nombre, body.tipo, body.docente,
        body.asignatura || '', body.fecha,
        body.horaInicio, body.horaFin,
        body.capacidad || '', body.observaciones || ''
      ]);
      return jsonResponse({ ok: true });
    }

    if (action === 'deleteOcupacion') {
      var sheet = getOrCreateSheet('Ocupaciones', []);
      var data  = sheet.getDataRange().getValues();
      for (var i = data.length - 1; i >= 1; i--) {
        if (String(data[i][0]) === String(body.id)) { sheet.deleteRow(i + 1); break; }
      }
      return jsonResponse({ ok: true });
    }

    if (action === 'updateOcupacion') {
      var sheet = getOrCreateSheet('Ocupaciones', []);
      var data  = sheet.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(body.id)) {
          sheet.getRange(i + 1, 1, 1, 10).setValues([[
            body.id,
            body.nombre        || '',
            body.tipo          || '',
            body.docente       || '',
            body.asignatura    || '',
            body.fecha         || '',
            body.horaInicio    || '',
            body.horaFin       || '',
            body.capacidad     || '',
            body.observaciones || ''
          ]]);
          break;
        }
      }
      return jsonResponse({ ok: true });
    }

    // ── Secciones ────────────────────────────────────

    if (action === 'saveSeccion') {
      var sheet = getOrCreateSheet('Secciones', ['id','nombre','tipo','docente','fecha','horaInicio','horaFin']);
      sheet.appendRow([body.id, body.nombre, body.tipo, body.docente, body.fecha, body.horaInicio || '', body.horaFin || '']);
      return jsonResponse({ ok: true });
    }

    if (action === 'deleteSeccion') {
      var secSheet  = getOrCreateSheet('Secciones', []);
      var alumSheet = getOrCreateSheet('Alumnos',   []);
      var data = secSheet.getDataRange().getValues();
      for (var i = data.length - 1; i >= 1; i--) {
        if (String(data[i][0]) === String(body.id)) { secSheet.deleteRow(i + 1); break; }
      }
      var alumData = alumSheet.getDataRange().getValues();
      for (var i = alumData.length - 1; i >= 1; i--) {
        if (String(alumData[i][0]) === String(body.id)) { alumSheet.deleteRow(i + 1); }
      }
      return jsonResponse({ ok: true });
    }

    // ── Alumnos ──────────────────────────────────────

    if (action === 'saveAlumno') {
      var sheet = getOrCreateSheet('Alumnos', ['seccionId','id','nombre','rut','correo']);
      var a = body.alumno;
      sheet.appendRow([body.seccionId, a.id, a.nombre, a.rut, a.correo || '']);
      return jsonResponse({ ok: true });
    }

    if (action === 'deleteAlumno') {
      var sheet = getOrCreateSheet('Alumnos', []);
      var data  = sheet.getDataRange().getValues();
      for (var i = data.length - 1; i >= 1; i--) {
        if (String(data[i][1]) === String(body.alumnoId)) { sheet.deleteRow(i + 1); break; }
      }
      return jsonResponse({ ok: true });
    }

    // ── Recordatorios ────────────────────────────────────

    if (action === 'saveRecordatorio') {
      var sheet = getOrCreateSheet('Recordatorios', [
        'id','tipo','titulo','descripcion','fechaLimite','prioridad','estado','fechaCreacion'
      ]);
      sheet.appendRow([
        body.id, body.tipo || 'recordatorio', body.titulo || '',
        body.descripcion || '', body.fechaLimite || '',
        body.prioridad || 'media', body.estado || 'pendiente',
        body.fechaCreacion || Utilities.formatDate(new Date(), 'America/Santiago', 'yyyy-MM-dd')
      ]);
      return jsonResponse({ ok: true });
    }

    if (action === 'updateRecordatorio') {
      var sheet = getOrCreateSheet('Recordatorios', []);
      var data  = sheet.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(body.id)) {
          sheet.getRange(i + 1, 1, 1, 8).setValues([[
            body.id, body.tipo || '', body.titulo || '',
            body.descripcion || '', body.fechaLimite || '',
            body.prioridad || 'media', body.estado || 'pendiente',
            body.fechaCreacion || ''
          ]]);
          break;
        }
      }
      return jsonResponse({ ok: true });
    }

    if (action === 'deleteRecordatorio') {
      var sheet = getOrCreateSheet('Recordatorios', []);
      var data  = sheet.getDataRange().getValues();
      for (var i = data.length - 1; i >= 1; i--) {
        if (String(data[i][0]) === String(body.id)) { sheet.deleteRow(i + 1); break; }
      }
      return jsonResponse({ ok: true });
    }

    // ── Impresiones 3D ───────────────────────────────────

    if (action === 'saveImpresion') {
      var sheet = getOrCreateSheet('Impresiones3D', [
        'id','titulo','solicitante','rut','material','color','impresora',
        'tiempoEstimado','prioridad','archivo','notas','estado','fechaSolicitud'
      ]);
      sheet.appendRow([
        body.id, body.titulo||'', body.solicitante||'', body.rut||'',
        body.material||'PLA', body.color||'', body.impresora||'',
        body.tiempoEstimado||'', body.prioridad||'media',
        body.archivo||'', body.notas||'', body.estado||'pendiente',
        body.fechaSolicitud || Utilities.formatDate(new Date(), 'America/Santiago', 'yyyy-MM-dd')
      ]);
      return jsonResponse({ ok: true });
    }

    if (action === 'updateImpresion') {
      var sheet = getOrCreateSheet('Impresiones3D', []);
      var data  = sheet.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(body.id)) {
          sheet.getRange(i + 1, 1, 1, 13).setValues([[
            body.id, body.titulo||'', body.solicitante||'', body.rut||'',
            body.material||'PLA', body.color||'', body.impresora||'',
            body.tiempoEstimado||'', body.prioridad||'media',
            body.archivo||'', body.notas||'', body.estado||'pendiente',
            body.fechaSolicitud||''
          ]]);
          break;
        }
      }
      return jsonResponse({ ok: true });
    }

    if (action === 'deleteImpresion') {
      var sheet = getOrCreateSheet('Impresiones3D', []);
      var data  = sheet.getDataRange().getValues();
      for (var i = data.length - 1; i >= 1; i--) {
        if (String(data[i][0]) === String(body.id)) { sheet.deleteRow(i + 1); break; }
      }
      return jsonResponse({ ok: true });
    }

    return jsonResponse({ ok: true });

  } catch(err) {
    return jsonResponse({ error: err.toString() });
  }
}
