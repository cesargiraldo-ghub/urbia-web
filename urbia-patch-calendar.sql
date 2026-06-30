-- =====================================================================
-- URBIA · Patch: calendario de citas por proyecto
-- Córrelo en Supabase > SQL Editor (una sola vez).
-- =====================================================================
alter table public.projects add column if not exists calendar_url text;
