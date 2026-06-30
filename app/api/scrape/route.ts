import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

function absolutize(src: string, base: string): string | null {
  try { return new URL(src, base).href; } catch { return null; }
}

// Extrae URLs de imágenes (og:image + <img src/data-src>), absolutas y filtradas.
function extractImages(html: string, base: string): string[] {
  const urls = new Set<string>();
  const og = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
  if (og) { const u = absolutize(og[1], base); if (u) urls.add(u); }
  const re = /<img[^>]+(?:data-src|data-lazy-src|src)=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) && urls.size < 30) {
    const u = absolutize(m[1], base);
    if (u && /\.(jpe?g|png|webp|avif)(\?|$)/i.test(u) && !/(logo|icon|sprite|favicon|avatar|placeholder)/i.test(u)) {
      urls.add(u);
    }
  }
  return [...urls].slice(0, 8);
}

async function uniqueSlug(supabase: any, orgId: string, base: string): Promise<string> {
  let slug = base || "proyecto";
  let n = 1;
  // Busca colisiones dentro de la misma constructora y agrega sufijo si hace falta.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { data } = await supabase.from("projects").select("id").eq("org_id", orgId).eq("slug", slug).maybeSingle();
    if (!data) return slug;
    n++; slug = `${base}-${n}`;
    if (n > 50) return `${base}-${Date.now().toString(36)}`;
  }
}

export async function POST(req: Request) {
  const { url } = await req.json();
  if (!url) return NextResponse.json({ error: "url requerida" }, { status: 400 });
  if (!process.env.ANTHROPIC_API_KEY)
    return NextResponse.json({ error: "Falta ANTHROPIC_API_KEY en el servidor." }, { status: 500 });

  // 1) Descargar el HTML
  let html = "";
  try {
    const res = await fetch(url, { headers: { "User-Agent": "URBIA-Bot/1.0" } });
    html = await res.text();
  } catch {
    return NextResponse.json({ error: "No se pudo acceder a la URL." }, { status: 400 });
  }

  // 2) Imágenes (desde el HTML crudo, antes de limpiar etiquetas)
  const images = extractImages(html, url);

  // 3) Texto visible para la IA
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 12000);

  // 4) Extracción estructurada con Claude
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
  project.cover_url = images[0] ?? null;
  project.images = images;

  // 5) Guardar como borrador si es una constructora con organización
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  let saved: { id: string; slug: string } | null = null;
  if (auth?.user) {
    const { data: profile } = await supabase.from("profiles").select("org_id, role").eq("id", auth.user.id).single();
    if (profile?.org_id) {
      const slug = await uniqueSlug(supabase, profile.org_id, slugify(project.name || "proyecto"));
      project.slug = slug;
      const { data: inserted, error } = await supabase
        .from("projects")
        .insert({
          org_id: profile.org_id,
          name: project.name,
          slug,
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
          cover_url: images[0] ?? null,
          source_url: url,
        })
        .select("id, slug")
        .single();
      if (!error && inserted) {
        saved = inserted;
        if (images.length) {
          await supabase.from("media").insert(
            images.map((u, i) => ({ project_id: inserted.id, url: u, type: "render", ord: i }))
          );
        }
      }
    }
  }

  return NextResponse.json({ project, saved, imageCount: images.length });
}
