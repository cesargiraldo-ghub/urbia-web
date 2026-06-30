-- =====================================================================
-- URBIA · Patch: slug por constructora en la URL
-- Córrelo en Supabase > SQL Editor (una sola vez).
-- URL resultante: /<constructora>/proyectos/<proyecto>
-- =====================================================================

-- 1) Slug en organizations
alter table public.organizations add column if not exists slug text;

update public.organizations set slug = 'gamboa-constructora' where name = 'Gamboa Constructora' and slug is null;
update public.organizations set slug = 'constructora-mira'   where name = 'Constructora Mira'   and slug is null;
update public.organizations set slug = 'urbanismo-andino'    where name = 'Urbanismo Andino'    and slug is null;
update public.organizations set slug = 'costa-desarrollos'   where name = 'Costa Desarrollos'   and slug is null;

-- Fallback genérico para cualquier otra constructora
update public.organizations
set slug = trim(both '-' from regexp_replace(lower(name), '[^a-z0-9]+', '-', 'g'))
where slug is null;

create unique index if not exists organizations_slug_key on public.organizations(slug);

-- 2) Proyectos: slug único POR constructora (no global) -> URLs limpias sin sufijo
alter table public.projects drop constraint if exists projects_slug_key;
create unique index if not exists projects_org_slug_key on public.projects(org_id, slug);

-- 3) Limpiar el slug del proyecto de prueba (quita el sufijo aleatorio)
update public.projects set slug = 'canto-verde' where slug like 'canto-verde-%';

-- 4) Verificar
select o.slug as constructora, p.slug as proyecto
from public.projects p join public.organizations o on o.id = p.org_id
order by o.slug, p.slug;
