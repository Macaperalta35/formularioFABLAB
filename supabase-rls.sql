-- ============================================================
-- FAB LAB INACAP — Políticas RLS para Supabase
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- 1. Habilitar RLS en las tres tablas
ALTER TABLE assets    ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans     ENABLE ROW LEVEL SECURITY;
ALTER TABLE ayudantes ENABLE ROW LEVEL SECURITY;

-- 2. Lecturas abiertas (necesario para el dashboard sin login de usuario)
CREATE POLICY "select_public" ON assets    FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "select_public" ON loans     FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "select_public" ON ayudantes FOR SELECT TO anon, authenticated USING (true);

-- 3. Escrituras solo para usuarios autenticados (INSERT / UPDATE / DELETE)
CREATE POLICY "insert_auth" ON assets    FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_auth" ON assets    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_auth" ON assets    FOR DELETE TO authenticated USING (true);

CREATE POLICY "insert_auth" ON loans     FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_auth" ON loans     FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_auth" ON loans     FOR DELETE TO authenticated USING (true);

CREATE POLICY "insert_auth" ON ayudantes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_auth" ON ayudantes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_auth" ON ayudantes FOR DELETE TO authenticated USING (true);

-- ============================================================
-- PASO SIGUIENTE (manual):
-- 1. Ir a Supabase → Authentication → Users → Add User
-- 2. Crear: admin@fablab.cl / [contraseña segura]
-- 3. En dashboard.html, reemplazar las constantes SUPABASE_ADMIN_*
--    con el email y contraseña creados (ya incluido en el código)
-- ============================================================
