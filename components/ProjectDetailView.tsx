import Link from "next/link";
import CreditSimulator from "@/components/CreditSimulator";
import { Project, UnitType, Media, money, typeLabel, formatDelivery } from "@/lib/types";
import { WA_DEFAULT, MEDIA_SECTIONS } from "@/lib/constants";

export default function ProjectDetailView({ p, units, media }: { p: Project; units: UnitType[]; media: Media[] }) {
  const galeria = media.filter((m) => (m.section || "galeria") === "galeria");
  const gallery = [p.cover_url, ...galeria.map((m) => m.url)].filter(Boolean) as string[];
  const wa = p.whatsapp_url || WA_DEFAULT;

  // Secciones con imágenes (excluye la galería principal, ya mostrada arriba).
  const sections = MEDIA_SECTIONS.filter((s) => s.key !== "galeria").map((s) => ({
    ...s,
    imgs: media.filter((m) => m.section === s.key),
  })).filter((s) => s.imgs.length > 0);

  const areas: { label: string; v: number | null }[] = [
    { label: "Área lote", v: p.area_lote },
    { label: "Área construida", v: p.area_construida },
    { label: "Área privada", v: p.area_privada },
  ].filter((a) => a.v != null);

  return (
    <section className="wrap" style={{ paddingTop: 26 }}>
      <div style={{ marginBottom: 16 }}>
        <Link className="muted" href="/">← Volver</Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10, borderRadius: 20, overflow: "hidden", maxHeight: 320 }}>
        <div style={{ backgroundImage: `url('${gallery[0] ?? ""}')`, backgroundSize: "cover", backgroundPosition: "center", minHeight: 320, background: gallery[0] ? undefined : "rgba(255,255,255,0.05)" }} />
        <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: 10 }}>
          <div style={{ backgroundImage: `url('${gallery[1] ?? gallery[0] ?? ""}')`, backgroundSize: "cover", backgroundPosition: "center", background: gallery[0] ? undefined : "rgba(255,255,255,0.05)" }} />
          <div style={{ backgroundImage: `url('${gallery[2] ?? gallery[0] ?? ""}')`, backgroundSize: "cover", backgroundPosition: "center", background: gallery[0] ? undefined : "rgba(255,255,255,0.05)" }} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, marginTop: 26, alignItems: "start" }}>
        <div>
          <span className="pill">{p.tag} · {typeLabel(p.type)}</span>
          <h1 className="font-display" style={{ fontSize: 38, margin: "14px 0 6px" }}>{p.name}</h1>
          <div className="loc muted" style={{ fontSize: 15 }}>📍 {p.city} · por {p.organizations?.name}</div>
          <p style={{ margin: "18px 0", color: "#CDD7F5", lineHeight: 1.6, fontSize: 15.5 }}>{p.description}</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 16, margin: "22px 0" }}>
            <div className="kpi glass-soft"><div className="lab">Desde</div><b>{money(p.price_from, p.currency ?? "COP")}</b></div>
            <div className="kpi glass-soft"><div className="lab">Cuota inicial</div><b>{p.down_payment_pct}%</b></div>
            <div className="kpi glass-soft"><div className="lab">Entrega</div><b style={{ fontSize: 20 }}>{formatDelivery(p.delivery_date)}</b></div>
          </div>

          {areas.length > 0 && (
            <>
              <h3 className="font-display" style={{ fontSize: 20, margin: "26px 0 12px" }}>Áreas</h3>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {areas.map((a) => (
                  <div key={a.label} className="glass-soft" style={{ padding: "12px 18px" }}>
                    <div className="lab" style={{ fontSize: 12.5, color: "var(--muted)" }}>{a.label}</div>
                    <b className="font-display" style={{ fontSize: 18 }}>{a.v} m²</b>
                  </div>
                ))}
              </div>
            </>
          )}

          {units.length > 0 && (
            <>
              <h3 className="font-display" style={{ fontSize: 20, margin: "26px 0 12px" }}>Tipologías disponibles</h3>
              <div style={{ display: "grid", gap: 10 }}>
                {units.map((u) => (
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

          {/* Galerías por sección */}
          {sections.map((s) => (
            <div key={s.key}>
              <h3 className="font-display" style={{ fontSize: 20, margin: "30px 0 12px" }}>{s.label}</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 10 }}>
                {s.imgs.map((m) => (
                  <div key={m.id} style={{ height: 140, borderRadius: 12, backgroundImage: `url('${m.url}')`, backgroundSize: "cover", backgroundPosition: "center" }} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div>
          <CreditSimulator priceFrom={p.price_from ?? 400} downPct={p.down_payment_pct ?? 10} currency={p.currency ?? "COP"} calendarUrl={p.calendar_url} waUrl={wa} />
          <div className="glass-soft" style={{ padding: 18, marginTop: 16, textAlign: "center" }}>
            <p className="muted" style={{ fontSize: 13.5 }}>¿Prefieres que te contactemos? URBIA te califica y agenda por WhatsApp.</p>
            <a className="btn btn-primary" href={wa} target="_blank" rel="noopener noreferrer" style={{ width: "100%", marginTop: 12 }}>💬 Hablar por WhatsApp</a>
          </div>
        </div>
      </div>
    </section>
  );
}
