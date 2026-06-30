-- =====================================================================
-- URBIA · Patch: plan Gratis + CRM de clientes
-- Córrelo en Supabase > SQL Editor (una sola vez).
-- =====================================================================

-- 1) Plan 'free' (gratis) y default
alter table public.organizations drop constraint if exists organizations_plan_check;
alter table public.organizations alter column plan set default 'free';
-- Las constructoras existentes sin plan pago pueden pasar a free manualmente si quieres:
-- update public.organizations set plan = 'free' where plan is null;

-- 2) Leads: teléfono y correo
alter table public.leads add column if not exists phone text;
alter table public.leads add column if not exists email text;

-- 3) Solicitudes de cambio de plan (las ve el admin de URBIA)
create table if not exists public.plan_requests (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade,
  org_name text,
  requested_plan text,
  requester_email text,
  status text default 'pending',
  created_at timestamptz default now()
);
alter table public.plan_requests enable row level security;
drop policy if exists plan_req_insert on public.plan_requests;
drop policy if exists plan_req_read on public.plan_requests;
create policy plan_req_insert on public.plan_requests for insert with check (true);
create policy plan_req_read on public.plan_requests for select
  using (public.app_role() = 'admin' or org_id = public.app_org());
