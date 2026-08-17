-- ============================================================
-- FAB LAB INACAP — Políticas RLS para Supabase
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
-- Estado: refleja la configuración activa en producción
-- ============================================================

-- 1. Habilitar RLS en todas las tablas
ALTER TABLE assets    ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans     ENABLE ROW LEVEL SECURITY;
ALTER TABLE ayudantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE users     ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas anon heredadas (si existen)
DROP POLICY IF EXISTS "anon_all_assets"        ON assets;
DROP POLICY IF EXISTS "anon_all_loans"          ON loans;
DROP POLICY IF EXISTS "Anon can select assets"  ON assets;
DROP POLICY IF EXISTS "select_public"           ON assets;
DROP POLICY IF EXISTS "select_public"           ON loans;
DROP POLICY IF EXISTS "select_public"           ON ayudantes;

-- 3. Lecturas: solo usuarios autenticados
--    (el dashboard muestra el login antes de cargar datos)
CREATE POLICY "select_auth" ON assets    FOR SELECT TO authenticated USING (true);
CREATE POLICY "select_auth" ON loans     FOR SELECT TO authenticated USING (true);
CREATE POLICY "select_auth" ON ayudantes FOR SELECT TO authenticated USING (true);
CREATE POLICY "select_auth" ON users     FOR SELECT TO authenticated USING (true);

-- 4. Escrituras: solo usuarios autenticados
CREATE POLICY "insert_auth" ON assets    FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_auth" ON assets    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_auth" ON assets    FOR DELETE TO authenticated USING (true);

CREATE POLICY "insert_auth" ON loans     FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_auth" ON loans     FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_auth" ON loans     FOR DELETE TO authenticated USING (true);

CREATE POLICY "insert_auth" ON ayudantes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_auth" ON ayudantes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_auth" ON ayudantes FOR DELETE TO authenticated USING (true);

-- users: sin INSERT/UPDATE/DELETE desde el cliente
-- La gestión de usuarios se hace exclusivamente desde
-- Supabase Dashboard → Authentication → Users

-- ============================================================
-- ACCESO AL DASHBOARD
-- El login usa el formulario integrado en dashboard.html.
-- Usuario administrador: crear en Supabase → Authentication → Users
-- No colocar credenciales en el código fuente.
-- ============================================================
