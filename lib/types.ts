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
  organizations?: { name: string; logo_url: string | null } | null;
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

export type Media = { id: string; project_id: string; url: string; type: string; ord: number };

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
