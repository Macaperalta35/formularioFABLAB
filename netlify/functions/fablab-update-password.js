// Netlify Function — cambia contraseña de un usuario en Supabase Auth
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

  const { email, password, adminToken } = body;

  if (adminToken !== ADMIN_TOKEN) {
    return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'No autorizado' }) };
  }
  if (!email || !password) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Email y contraseña son requeridos' }) };
  }
  if (password.length < 6) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'La contraseña debe tener al menos 6 caracteres' }) };
  }

  // Buscar usuario en Supabase Auth por email
  const listRes = await fetch(
    `${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=1000`,
    { headers: { 'Authorization': `Bearer ${SERVICE_KEY}`, 'apikey': SERVICE_KEY } }
  );
  const listData = await listRes.json();
  const authUser = listData?.users?.find(u => u.email === email);

  if (!authUser) {
    return { statusCode: 404, headers: CORS, body: JSON.stringify({ error: 'Usuario no encontrado en Supabase Auth. Créalo primero.' }) };
  }

  // Actualizar contraseña
  const updateRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${authUser.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'apikey': SERVICE_KEY
    },
    body: JSON.stringify({ password })
  });

  if (!updateRes.ok) {
    const err = await updateRes.text();
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Error al actualizar: ' + err }) };
  }

  return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true }) };
};
