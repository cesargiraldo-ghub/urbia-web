# URBIA · Portal inmobiliario impulsado por IA

MVP en **Next.js 14 (App Router) + Supabase + Claude API**. Portal público con buscador IA, fichas de proyecto con simulador de crédito, panel de constructora (crear proyecto pegando el link de la web) y panel admin.

---

## 1. Requisitos

- Node 18+ y npm
- Cuenta de Supabase con el proyecto **"Urbia Project"** ya creado (ref `bqxoqwipzmkaqfqfykdj`)
- API key de Anthropic (Claude)
- Cuentas de GitHub y Vercel

## 2. Crear la base de datos (corres tú el SQL)

1. Supabase → tu proyecto → **SQL Editor** → **New query**.
2. Pega TODO el archivo `urbia-schema.sql` (incluido en la entrega) y pulsa **Run**.
3. Verifica en **Table Editor**: 8 tablas, 6 proyectos y 3 constructoras de demo.

## 3. Variables de entorno

Copia `.env.example` a `.env.local` y rellena:

```
NEXT_PUBLIC_SUPABASE_URL=https://bqxoqwipzmkaqfqfykdj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...   # Supabase > Project Settings > API > anon/publishable key
SUPABASE_SERVICE_ROLE_KEY=...       # Project Settings > API > service_role (¡secreto!)
ANTHROPIC_API_KEY=sk-ant-...        # console.anthropic.com
```

> El buscador funciona sin `ANTHROPIC_API_KEY` (usa coincidencia simple por texto). Con la key activa el ranking inteligente y la extracción de proyectos por link.

## 4. Correr en local

```bash
npm install
npm run dev
# http://localhost:3000
```

Rutas: `/` portal + buscador · `/proyectos/[slug]` ficha · `/panel` constructora · `/admin` admin · `/login` auth.

## 5. Subir a GitHub

```bash
git init
git add .
git commit -m "URBIA MVP"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/urbia-web.git
git push -u origin main
```

(`.env.local` está en `.gitignore`, no se sube.)

## 6. Desplegar en Vercel

1. [vercel.com](https://vercel.com) → **Add New → Project** → importa el repo `urbia-web`.
2. Framework: **Next.js** (autodetectado).
3. En **Environment Variables** agrega las 4 variables del paso 3.
4. **Deploy**. Quedará en `https://urbia-web.vercel.app` (o tu dominio).
5. Cada `git push` a `main` vuelve a desplegar automáticamente.

> Para correcciones futuras en VS Code: edita → `git commit` → `git push` → Vercel redespliega solo.

## 7. Crear un usuario admin / constructora

Tras registrarte en `/login`, en Supabase → **Table Editor → profiles**, cambia tu `role` a `admin` o `builder` y asigna un `org_id` (de la tabla `organizations`) para ver el panel con datos.

---

## Estructura

```
app/
  page.tsx                 Portal + buscador IA
  proyectos/[slug]/        Ficha de proyecto + simulador
  panel/                   Panel constructora (scraping IA, leads, planes)
  admin/                   Panel admin (métricas, constructoras)
  login/                   Auth Supabase
  api/search/route.ts      Buscador IA (Claude)
  api/scrape/route.ts      Crear proyecto desde link (Claude)
components/                Nav, ProjectCard, AISearch, CreditSimulator, ScrapeForm
lib/supabase/              Clientes server/client/admin
lib/types.ts              Tipos
urbia-schema.sql           Esquema + RLS + datos demo
```

## Roadmap (siguientes fases)

Pasarela de pagos (Wompi/Stripe) para suscripciones · WhatsApp Cloud API para calificación · Meta/Google Ads para el motor de citas Premium · búsqueda semántica con pgvector · subida de renders a Supabase Storage.

---

Hecho para URBIA — el primer portal de LATAM impulsado por IA que genera citas calificadas.
