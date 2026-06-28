import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import CreditSimulator from "@/components/CreditSimulator";
import { Project, UnitType, Media, money } from "@/lib/types";

export const revalidate = 60;

export default async function ProjectDetail({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("*, organizations(name, logo_url)")
    .eq("slug", params.slug)
    .single();

  if (!project) return notFound();
  const p = project as Project;

  const [{ data: units }, { data: media }] = await Promise.all([
    supabase.from("unit_types").select("*").eq("project_id", p.id),
    supabase.from("media").select("*").eq("project_id", p.id).order("ord"),
  ]);
  const gallery = [p.cover_url, ...((media as Media[] | null)?.map((m) => m.url) ?? [])].filter(Boolean) as string[];

  return (
    <section className="wrap" style={{ paddingTop: 26 }}>
      <div style={{ marginBottom: 16 }}>
        <Link className="muted" href="/">← Volver</Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10, borderRadius: 20, overflow: "hidden", maxHeight: 320 }}>
        <div style={{ backgroundImage: `url('${gallery[0] ?? ""}')`, backgroundSize: "cover", backgroundPosition: "center", minHeight: 320 }} />
        <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: 10 }}>
          <div style={{ backgroundImage: `url('${gallery[1] ?? gallery[0]}')`, backgroundSize: "cover", backgroundPosition: "center" }} />
          <div style={{ backgroundImage: `url('${gallery[2] ?? gallery[0]}')`, backgroundSize: "cover", backgroundPosition: "center" }} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, marginTop: 26, alignItems: "start" }}>
        <div>
          <span className="pill">{p.tag} · {p.type === "houses" ? "Casas" : "Apartamentos"}</span>
          <h1 className="font-display" style={{ fontSize: 38, margin: "14px 0 6px" }}>{p.name}</h1>
          <div className="loc muted" style={{ fontSize: 15 }}>📍 {p.city} · por {p.organizations?.name}</div>
          <p style={{ margin: "18px 0", color: "#CDD7F5", lineHeight: 1.6, fontSize: 15.5 }}>{p.description}</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 16, margin: "22px 0" }}>
            <div className="kpi glass-soft"><div className="lab">Desde</div><b>{money(p.price_from, p.currency ?? "COP")}</b></div>
            <div className="kpi glass-soft"><div className="lab">Cuota inicial</div><b>{p.down_payment_pct}%</b></div>
            <div className="kpi glass-soft"><div className="lab">Entrega</div><b style={{ fontSize: 20 }}>{p.delivery_date}</b></div>
          </div>

          {units && units.length > 0 && (
            <>
              <h3 className="font-display" style={{ fontSize: 20, margin: "26px 0 12px" }}>Tipologías disponibles</h3>
              <div style={{ display: "grid", gap: 10 }}>
                {(units as UnitType[]).map((u) => (
                  <div key={u.id} className="glass-soft" style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <b className="font-display">{u.name}</b>
                      <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>{u.bedrooms} hab · {u.area_m2} m² · {u.bathrooms} baño(s)</p>
                    </div>
                    <b className="price">{money(u.price, p.currency ?? "COP")}</b>
                  </div>
                ))}
              </div>
            </>
          )}

          <h3 className="font-display" style={{ fontSize: 20, margin: "30px 0 12px" }}>Amenidades</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {(p.amenities ?? []).map((a) => (
              <span key={a} style={{ fontSize: 13, padding: "9px 13px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid var(--stroke-soft)" }}>{a}</span>
            ))}
          </div>
        </div>

        <div>
          <CreditSimulator priceFrom={p.price_from ?? 400} downPct={p.down_payment_pct ?? 10} currency={p.currency ?? "COP"} />
          <div className="glass-soft" style={{ padding: 18, marginTop: 16, textAlign: "center" }}>
            <p className="muted" style={{ fontSize: 13.5 }}>¿Prefieres que te contactemos? URBIA te califica y agenda por WhatsApp.</p>
            <button className="btn btn-ghost" style={{ width: "100%", marginTop: 12 }}>Hablar por WhatsApp</button>
          </div>
        </div>
      </div>
    </section>
  );
}
