#!/usr/bin/env bash
# =====================================================================
# URBIA · Despliegue desde terminal (GitHub + Vercel)
# Uso:  chmod +x deploy.sh  &&  ./deploy.sh
# Requisitos: Node 18+, git, y cuentas de GitHub y Vercel.
# =====================================================================
set -e

# ---------- 0) Edita estos valores ----------
GH_USER="cesargiraldo-ghub"
REPO="urbia-web"

# ---------- 1) Dependencias ----------
npm install

# ---------- 2) Variables de entorno locales ----------
if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo ">> Abre .env.local y completa tus keys (Supabase + ANTHROPIC_API_KEY) antes de continuar."
  read -p "Presiona ENTER cuando hayas guardado .env.local..."
fi

# ---------- 3) Prueba de build local ----------
npm run build

# ---------- 4) Git + GitHub ----------
git init
git add .
git commit -m "URBIA MVP"
git branch -M main
# Crea el repo en GitHub (requiere GitHub CLI 'gh' autenticado: gh auth login)
# Si no usas gh, crea el repo manualmente en github.com y omite la línea siguiente.
gh repo create "$GH_USER/$REPO" --public --source=. --remote=origin --push || {
  git remote add origin "https://github.com/$GH_USER/$REPO.git"
  git push -u origin main
}

# ---------- 5) Vercel ----------
npm i -g vercel
vercel login          # abre el navegador para autenticarte
vercel link --yes     # vincula este folder a un proyecto Vercel

# Carga las variables de entorno en Vercel (producción)
for KEY in NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY ANTHROPIC_API_KEY; do
  VAL=$(grep "^$KEY=" .env.local | cut -d= -f2-)
  echo "$VAL" | vercel env add "$KEY" production
done

# ---------- 6) Desplegar a producción ----------
vercel --prod

echo ">> Listo. URBIA desplegado en Vercel."
