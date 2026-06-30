-- =====================================================================
-- URBIA · Asignar roles a los usuarios
-- Córrelo en Supabase > SQL Editor DESPUÉS de crear los 2 usuarios
-- (Authentication > Users > Add user, con Auto Confirm activado).
-- =====================================================================

-- 1) Organización de la constructora Gamboa (si no existe)
insert into public.organizations (name, plan, city)
select 'Gamboa Constructora', 'premium', 'Colombia'
where not exists (select 1 from public.organizations where name = 'Gamboa Constructora');

-- 2) Admin de URBIA
update public.profiles
set role = 'admin'
where email = 'urbiapropiedades@gmail.com';

-- 3) Constructora (builder) + su organización
update public.profiles
set role = 'builder',
    org_id = (select id from public.organizations where name = 'Gamboa Constructora' limit 1)
where email = 'citasgamboaconstructora@gmail.com';

-- 4) Verificar
select email, role, org_id from public.profiles
where email in ('urbiapropiedades@gmail.com','citasgamboaconstructora@gmail.com');
