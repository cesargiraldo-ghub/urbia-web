export type Project = {
  id: string;
  org_id: string | null;
  name: string;
  slug: string;
  type: "apartments" | "houses" | "mixed";
  status: "draft" | "published";
  city: string | null;
  country: string | null;
  price_from: number | null;
  currency: string | null;
  down_payment_pct: number | null;
  delivery_date: string | null;
  tag: string | null;
  description: string | null;
  amenities: string[];
  cover_url: string | null;
  source_url: string | null;
  area_lote: number | null;
  area_construida: number | null;
  area_privada: number | null;
  whatsapp_url: string | null;
  calendar_url: string | null;
  organizations?: { name: string; slug: string | null; logo_url: string | null } | null;
};

export type UnitType = {
  id: string;
  project_id: string;
  name: string;
  bedrooms: string | null;
  bathrooms: number | null;
  area_m2: number | null;
  price: number | null;
};

export type Media = { id: string; project_id: string; url: string; type: string; section: string; ord: number };

export type Lead = {
  id: string;
  client_name: string | null;
  source: string;
  ai_score: number | null;
  temperature: "hot" | "warm" | "cold" | null;
  status: string;
  projects?: { name: string } | null;
};

export function money(n: number | null, currency = "COP") {
  if (n == null) return "—";
  return currency === "USD" ? `$${n.toLocaleString("en-US")}M` : `$${n.toLocaleString("es-CO")}M`;
}

export function typeLabel(t: string | null) {
  return t === "houses" ? "Casas" : t === "lots" ? "Lotes" : t === "mixed" ? "Mixto" : "Apartamentos";
}

export function formatDelivery(s: string | null) {
  if (!s) return "—";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return s;
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  return `${months[parseInt(m[2], 10) - 1]} ${m[1]}`;
}
