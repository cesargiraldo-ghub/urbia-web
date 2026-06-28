import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

// Extrae un proyecto inmobiliario desde la URL de la web de la constructora.
export async function POST(req: Request) {
  const { url } = await req.json();
  if (!url) return NextResponse.json({ error: "url requerida" }, { status: 400 });
  if (!process.env.ANTHROPIC_API_KEY)
    return NextResponse.json({ error: "Falta ANTHROPIC_API_KEY en el servidor." }, { status: 500 });

  // 1) Descargar el HTML de la página
  let html = "";
  try {
    const res = await fetch(url, { headers: { "User-Agent": "URBIA-Bot/1.0" } });
    html = await res.text();
  } catch {
    return NextResponse.json({ error: "No se pudo acceder a la URL." }, { status: 400 });
  }
  // Recortar para no exceder el contexto (texto visible aproximado)
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 12000);

  // 2) Extracción estructurada con Claude
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    system:
      "Extrae los datos de UN proyecto inmobiliario desde el contenido de una página web. " +
      "Devuelve SOLO un objeto JSON con: name, type ('apartments'|'houses'|'mixed'), city, country, " +
      "price_from (número en millones de la moneda local, o null), currency ('COP'|'USD'), down_payment_pct (número o null), " +
      "delivery_date (texto o null), tag (texto corto o null), description (2-3 frases), amenities (array de strings). " +
      "Si un dato no aparece, usa null o []. No inventes precios.",
    messages: [{ role: "user", content: `URL: ${url}\n\nContenido:\n${text}` }],
  });

  const raw = (msg.content[0] as any)?.text ?? "{}";
  let project: any;
  try {
    project = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1));
  } catch {
    return NextResponse.json({ error: "La IA no pudo estructurar la página." }, { status: 422 });
  }
  project.source_url = url;
  project.slug = String(project.name || "proyecto")
    .toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Math.random().toString(36).slice(2, 6);

  // 3) Guardar como borrador si el usuario es una constructora con organización
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (auth?.user) {
    const { data: profile } = await supabase.from("profiles").select("org_id, role").eq("id", auth.user.id).single();
    if (profile?.org_id) {
      await supabase.from("projects").insert({
        org_id: profile.org_id,
        name: project.name,
        slug: project.slug,
        type: project.type ?? "apartments",
        status: "draft",
        city: project.city,
        country: project.country ?? "Colombia",
        price_from: project.price_from,
        currency: project.currency ?? "COP",
        down_payment_pct: project.down_payment_pct,
        delivery_date: project.delivery_date,
        tag: project.tag,
        description: project.description,
        amenities: project.amenities ?? [],
        source_url: url,
      });
    }
  }

  return NextResponse.json({ project });
}
