import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

// Buscador IA: interpreta lenguaje natural -> filtros, consulta Supabase,
// y redacta una respuesta conversacional + ranking de afinidad.
export async function POST(req: Request) {
  const { query } = await req.json();
  if (!query) return NextResponse.json({ error: "query requerida" }, { status: 400 });

  const supabase = createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, slug, type, city, country, price_from, currency, down_payment_pct, delivery_date, tag, description, amenities, cover_url")
    .eq("status", "published")
    .limit(50);

  const list = projects ?? [];

  // Sin API key: degradar a coincidencia simple por texto.
  if (!process.env.ANTHROPIC_API_KEY) {
    const q = String(query).toLowerCase();
    const ranked = list
      .map((p) => {
        const hay = `${p.name} ${p.city} ${p.type} ${p.description} ${(p.amenities || []).join(" ")}`.toLowerCase();
        const score = q.split(/\s+/).filter((w) => w.length > 3 && hay.includes(w)).length;
        return { ...p, match: Math.min(98, 70 + score * 6) };
      })
      .sort((a, b) => b.match - a.match)
      .slice(0, 6);
    return NextResponse.json({ reply: `Encontré ${ranked.length} proyectos que pueden encajar con "${query}".`, results: ranked });
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const catalog = list.map((p) => ({
    id: p.id, name: p.name, slug: p.slug, type: p.type, city: p.city, country: p.country,
    price_from: p.price_from, currency: p.currency, down_payment_pct: p.down_payment_pct,
    delivery_date: p.delivery_date, amenities: p.amenities, description: p.description,
  }));

  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system:
      "Eres el asistente de búsqueda de URBIA, un portal inmobiliario en LATAM. " +
      "Recibes la consulta del usuario y un catálogo JSON de proyectos. " +
      "Devuelve EXCLUSIVAMENTE un objeto JSON con la forma: " +
      '{"reply": string (respuesta breve y cálida en español), "ranking": [{"id": string, "match": number 0-100}] }. ' +
      "Ordena por afinidad real con la consulta. No inventes proyectos fuera del catálogo.",
    messages: [
      { role: "user", content: `Consulta: ${query}\n\nCatálogo:\n${JSON.stringify(catalog)}` },
    ],
  });

  const text = msg.content.find((c) => c.type === "text")?.type === "text"
    ? (msg.content[0] as any).text
    : "{}";

  let parsed: any = {};
  try {
    parsed = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
  } catch {
    parsed = { reply: "Aquí tienes algunas opciones.", ranking: [] };
  }

  const byId = new Map(list.map((p) => [p.id, p]));
  const results = (parsed.ranking ?? [])
    .map((r: any) => ({ ...byId.get(r.id), match: r.match }))
    .filter((r: any) => r.id)
    .slice(0, 6);

  return NextResponse.json({ reply: parsed.reply ?? "Estas son mis recomendaciones.", results });
}
