-- =====================================================================
-- URBIA · Esquema MVP para Supabase  (Postgres 17)
-- Pega TODO este archivo en: Supabase > SQL Editor > New query > Run
-- Crea tablas, seguridad (RLS), trigger de perfiles y datos demo.
-- =====================================================================

create extension if not exists vector;

-- ========================= TABLAS =========================
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null, nit text, website text, logo_url text,
  plan text not null default 'basic' check (plan in ('basic','premium')),
  calendar_url text, whatsapp text, city text,
  billing_status text default 'active', created_at timestamptz default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text, full_name text,
  role text not null default 'client' check (role in ('admin','builder','client')),
  org_id uuid references public.organizations(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade,
  name text not null, slug text unique,
  type text not null default 'apartments' check (type in ('apartments','houses','mixed')),
  status text not null default 'draft' check (status in ('draft','published')),
  city text, country text default 'Colombia', lat double precision, lng double precision,
  price_from numeric, currency text default 'COP', down_payment_pct numeric,
  delivery_date text, tag text, description text,
  amenities jsonb default '[]'::jsonb, cover_url text, source_url text,
  created_at timestamptz default now(), published_at timestamptz
);

create table if not exists public.unit_types (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  name text not null, bedrooms text, bathrooms int, area_m2 numeric, price numeric, floor_plan_url text
);

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  url text not null, type text default 'render' check (type in ('render','photo','plan')), ord int default 0
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete set null,
  org_id uuid references public.organizations(id) on delete cascade,
  client_name text, contact text,
  source text default 'portal' check (source in ('search','whatsapp','ads','portal')),
  ai_score int, temperature text check (temperature in ('hot','warm','cold')),
  status text default 'new', notes jsonb default '{}'::jsonb, created_at timestamptz default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  scheduled_at timestamptz, channel text default 'video' check (channel in ('video','onsite')),
  status text default 'scheduled'
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade,
  plan text not null check (plan in ('basic','premium')),
  amount numeric, status text default 'active', current_period_end timestamptz
);

-- ===================== FUNCIONES / TRIGGER =====================
create or replace function public.app_role() returns text
  language sql stable security definer set search_path = public
  as $fn$ select role from public.profiles where id = auth.uid() $fn$;

create or replace function public.app_org() returns uuid
  language sql stable security definer set search_path = public
  as $fn$ select org_id from public.profiles where id = auth.uid() $fn$;

create or replace function public.handle_new_user() returns trigger
  language plpgsql security definer set search_path = public as $fn$
begin
  insert into public.profiles (id,email,full_name,role)
  values (new.id,new.email,coalesce(new.raw_user_meta_data->>'full_name',''),'client')
  on conflict (id) do nothing;
  return new;
end; $fn$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ========================= RLS =========================
alter table public.organizations enable row level security;
alter table public.profiles      enable row level security;
alter table public.projects      enable row level security;
alter table public.unit_types    enable row level security;
alter table public.media         enable row level security;
alter table public.leads         enable row level security;
alter table public.appointments  enable row level security;
alter table public.subscriptions enable row level security;

-- organizations
create policy org_read           on public.organizations for select using (true);
create policy org_admin_all      on public.organizations for all using (public.app_role()='admin') with check (public.app_role()='admin');
create policy org_builder_update on public.organizations for update using (id = public.app_org());
-- profiles
create policy prof_self          on public.profiles for select using (id = auth.uid() or public.app_role()='admin');
create policy prof_update_self   on public.profiles for update using (id = auth.uid());
-- projects
create policy proj_public_read   on public.projects for select using (status='published' or org_id = public.app_org() or public.app_role()='admin');
create policy proj_builder_ins   on public.projects for insert with check (org_id = public.app_org() or public.app_role()='admin');
create policy proj_builder_upd   on public.projects for update using (org_id = public.app_org() or public.app_role()='admin');
create policy proj_builder_del   on public.projects for delete using (org_id = public.app_org() or public.app_role()='admin');
-- unit_types & media
create policy unit_read  on public.unit_types for select using (exists(select 1 from public.projects p where p.id=project_id and (p.status='published' or p.org_id=public.app_org() or public.app_role()='admin')));
create policy unit_write on public.unit_types for all using (exists(select 1 from public.projects p where p.id=project_id and (p.org_id=public.app_org() or public.app_role()='admin'))) with check (true);
create policy media_read  on public.media for select using (exists(select 1 from public.projects p where p.id=project_id and (p.status='published' or p.org_id=public.app_org() or public.app_role()='admin')));
create policy media_write on public.media for all using (exists(select 1 from public.projects p where p.id=project_id and (p.org_id=public.app_org() or public.app_role()='admin'))) with check (true);
-- leads (captura pública de leads desde el portal)
create policy lead_insert on public.leads for insert with check (true);
create policy lead_read   on public.leads for select using (org_id = public.app_org() or public.app_role()='admin');
create policy lead_update on public.leads for update using (org_id = public.app_org() or public.app_role()='admin');
-- appointments
create policy appt_all on public.appointments for all using (exists(select 1 from public.leads l where l.id=lead_id and (l.org_id=public.app_org() or public.app_role()='admin'))) with check (true);
-- subscriptions
create policy sub_read  on public.subscriptions for select using (org_id = public.app_org() or public.app_role()='admin');
create policy sub_admin on public.subscriptions for all using (public.app_role()='admin') with check (public.app_role()='admin');

-- ========================= DATOS DEMO =========================
do $seed$
declare o_mira uuid; o_andino uuid; o_costa uuid; p1 uuid; p2 uuid; p3 uuid; p4 uuid; p5 uuid; p6 uuid;
begin
  insert into public.organizations (name,nit,website,plan,city,whatsapp,calendar_url)
    values ('Constructora Mira','900.123.456-7','https://constructoramira.com','premium','Medellín','+57 300 123 4567','https://calendly.com/constructora-mira/visita')
    returning id into o_mira;
  insert into public.organizations (name,website,plan,city) values ('Urbanismo Andino','https://urbanismoandino.com','basic','Bogotá') returning id into o_andino;
  insert into public.organizations (name,website,plan,city) values ('Costa Desarrollos','https://costadesarrollos.com','premium','Cartagena') returning id into o_costa;

  insert into public.projects (org_id,name,slug,type,status,city,price_from,down_payment_pct,delivery_date,tag,description,amenities,cover_url,published_at) values
   (o_mira,'Altavista Living','altavista-living','apartments','published','Medellín · El Poblado',420,10,'Dic 2027','Sobre planos','Torre de uso mixto con vistas al valle de Aburrá. Acabados premium, domótica y zonas sociales en el rooftop.','["Piscina infinita","Coworking","Gimnasio","Rooftop","Pet zone","Seguridad 24/7","Salón social","Cine"]'::jsonb,'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900&q=70',now())
   returning id into p1;
  insert into public.projects (org_id,name,slug,type,status,city,price_from,down_payment_pct,delivery_date,tag,description,amenities,cover_url,published_at) values
   (o_andino,'Reserva del Bosque','reserva-del-bosque','houses','published','Bogotá · Usaquén',680,15,'Jun 2027','En construcción','Condominio campestre de casas bioclimáticas rodeado de bosque nativo, a 20 min del centro financiero.','["Club house","Senderos","Cancha múltiple","Parque infantil","Portería","BBQ","Ciclorruta"]'::jsonb,'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=70',now())
   returning id into p2;
  insert into public.projects (org_id,name,slug,type,status,city,price_from,down_payment_pct,delivery_date,tag,description,amenities,cover_url,published_at) values
   (o_costa,'Marea Cartagena','marea-cartagena','apartments','published','Cartagena · Bocagrande',540,20,'Mar 2028','Lanzamiento','Vivir frente al mar Caribe con renta vacacional asistida. Ideal para inversión en dólares.','["Frente al mar","Beach club","Piscina","Spa","Gimnasio","Concierge","Parqueadero visitantes"]'::jsonb,'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=70',now())
   returning id into p3;
  insert into public.projects (org_id,name,slug,type,status,city,price_from,down_payment_pct,delivery_date,tag,description,amenities,cover_url,published_at) values
   (o_mira,'Distrito 90','distrito-90','apartments','published','Medellín · Laureles',390,12,'Sep 2026','Pocas unidades','Micro-apartamentos para vivir o rentar en el corazón de Laureles, a pasos del estadio.','["Coworking","Rooftop bar","Gimnasio","Lavandería","Bike parking","Smart lockers"]'::jsonb,'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&q=70',now())
   returning id into p4;
  insert into public.projects (org_id,name,slug,type,status,city,price_from,down_payment_pct,delivery_date,tag,description,amenities,cover_url,published_at) values
   (o_andino,'Cumbres de Chía','cumbres-de-chia','houses','published','Cundinamarca · Chía',520,10,'Nov 2027','Sobre planos','Casas con diseño contemporáneo y amplias zonas verdes en la sabana norte de Bogotá.','["Club house","Zona húmeda","Parque","Cancha","Portería","Salón comunal"]'::jsonb,'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900&q=70',now())
   returning id into p5;
  insert into public.projects (org_id,name,slug,type,status,city,country,price_from,currency,down_payment_pct,delivery_date,tag,description,amenities,cover_url,published_at) values
   (o_costa,'Horizonte Panamá','horizonte-panama','apartments','published','Ciudad de Panamá · Costa del Este','Panamá',1850,'USD',30,'Ene 2028','Internacional','Residencias de lujo en el distrito financiero, con precios en USD y financiación internacional.','["Sky lounge","Piscina","Spa","Gimnasio","Concierge","Salón de eventos","Seguridad 24/7"]'::jsonb,'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=900&q=70',now())
   returning id into p6;

  insert into public.unit_types (project_id,name,bedrooms,bathrooms,area_m2,price) values
   (p1,'Apartamento tipo A','1',1,48,420),(p1,'Apartamento tipo B','2',2,74,560),(p1,'Penthouse','3',2,112,820),
   (p2,'Casa tipo A','3',3,120,680),(p2,'Casa tipo B','4',4,180,920),
   (p3,'Studio','1',1,42,540),(p3,'Apartamento tipo B','2',2,88,760);

  insert into public.media (project_id,url,type,ord) values
   (p1,'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=70','render',1),
   (p1,'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=900&q=70','render',2),
   (p1,'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=900&q=70','render',3),
   (p1,'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=900&q=70','render',4);

  insert into public.leads (project_id,org_id,client_name,source,ai_score,temperature,status) values
   (p1,o_mira,'Laura Restrepo','whatsapp',91,'hot','Cita agendada'),
   (p3,o_costa,'Andrés Gómez','search',88,'hot','Calificado'),
   (p4,o_mira,'Valentina Ruiz','whatsapp',64,'warm','En conversación'),
   (p2,o_andino,'Daniela Soto','search',83,'hot','Cita agendada');

  insert into public.subscriptions (org_id,plan,amount,status) values
   (o_mira,'premium',2500000,'active'),(o_andino,'basic',250000,'active'),(o_costa,'premium',2500000,'active');
end $seed$;

-- ¡Listo! Revisa Table Editor: deberías ver 6 proyectos publicados y 3 constructoras.
