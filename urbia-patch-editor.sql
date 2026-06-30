-- =====================================================================
-- URBIA · Patch: editor de proyecto (áreas, whatsapp, secciones, Storage)
-- Córrelo en Supabase > SQL Editor (una sola vez).
-- =====================================================================

-- 1) Campos nuevos en projects
alter table public.projects add column if not exists area_lote numeric;
alter table public.projects add column if not exists area_construida numeric;
alter table public.projects add column if not exists area_privada numeric;
alter table public.projects add column if not exists whatsapp_url text;

-- Permitir tipo 'lots' (Lote) además de apartments/houses/mixed
alter table public.projects drop constraint if exists projects_type_check;

-- 2) Sección en media (galeria, casa, apartamento, lote, amenidades, zonas-comunes, sitios-cercanos, planos)
alter table public.media add column if not exists section text default 'galeria';
alter table public.media drop constraint if exists media_type_check;

-- 3) Bucket de Storage para imágenes subidas
insert into storage.buckets (id, name, public)
values ('project-media', 'project-media', true)
on conflict (id) do nothing;

-- 4) Políticas de Storage: lectura pública, subir/eliminar para usuarios autenticados
drop policy if exists "media public read"  on storage.objects;
drop policy if exists "media auth insert"  on storage.objects;
drop policy if exists "media auth delete"  on storage.objects;

create policy "media public read" on storage.objects
  for select using (bucket_id = 'project-media');

create policy "media auth insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'project-media');

create policy "media auth delete" on storage.objects
  for delete to authenticated using (bucket_id = 'project-media');
