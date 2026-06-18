// Netlify Function — crea usuario en Supabase Auth + inserta en tabla users
// Variables de entorno requeridas en Netlify:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, FABLAB_ADMIN_TOKEN

exports.handler = async (event) => {
  const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Método no permitido' }) };

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const ADMIN_TOKEN  = process.env.FABLAB_ADMIN_TOKEN;

  let body;
  try { body = JSON.parse(event.body); }
  catch { return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'JSON inválido' }) }; }

  const { name, email, password, role, adminToken } = body;

  if (adminToken !== ADMIN_TOKEN) {
    return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'No autorizado' }) };
  }
  if (!name || !email || !password || !role) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Faltan campos obligatorios' }) };
  }

  // 1. Crear usuario en Supabase Auth
  const authRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'apikey': SERVICE_KEY
    },
    body: JSON.stringify({ email, password, email_confirm: true })
  });
  const authData = await authRes.json();

  if (!authRes.ok) {
    const msg = authData.msg || authData.message || JSON.stringify(authData);
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Error Auth: ' + msg }) };
  }

  // 2. Obtener siguiente ID para tabla users
  const idRes = await fetch(`${SUPABASE_URL}/rest/v1/users?select=id&order=id.desc&limit=1`, {
    headers: { 'Authorization': `Bearer ${SERVICE_KEY}`, 'apikey': SERVICE_KEY }
  });
  const idData = await idRes.json();
  const newId = (idData?.[0]?.id || 0) + 1;

  // 3. Insertar perfil en tabla users
  const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'apikey': SERVICE_KEY,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ id: newId, name, email, role, active: true })
  });

  if (!profileRes.ok) {
    // Rollback: eliminar usuario Auth creado
    await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${authData.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${SERVICE_KEY}`, 'apikey': SERVICE_KEY }
    });
    const profileErr = await profileRes.text();
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Error al guardar perfil: ' + profileErr }) };
  }

  return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true }) };
};
