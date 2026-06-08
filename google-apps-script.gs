// =====================================================
//  FAB LAB INACAP — Google Apps Script
//  Pegar este código en script.google.com y redesplegar
//  como Web App: "Ejecutar como: Yo" + "Acceso: Todos"
// =====================================================

var ADMIN_TOKEN = 'fablab2024'; // Cambiar por contraseña segura

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
  return data.slice(1).map(function(row) {
    var obj = {};
    headers.forEach(function(h, i) {
      obj[h] = row[i] === '' ? null : row[i];
    });
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
      var sheet = getOrCreateSheet('Visitas', [
        'fecha','nombre','rut','telefono','correo','tipoVisita','proposito','etiquetas'
      ]);
      sheet.appendRow([
        body.fecha     || Utilities.formatDate(new Date(), 'America/Santiago', 'dd/MM/yyyy HH:mm'),
        body.nombre    || '',
        body.rut       || '',
        body.telefono  || '',
        body.correo    || '',
        body.tipoVisita|| '',
        body.proposito || '',
        body.etiquetas || ''
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

    return jsonResponse({ ok: true });

  } catch(err) {
    return jsonResponse({ error: err.toString() });
  }
}
