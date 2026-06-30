"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updateProjectFields, addMediaUrl, deleteMedia, setCover } from "@/app/panel/actions";
import { MEDIA_SECTIONS } from "@/lib/constants";
import { Project, Media, money } from "@/lib/types";

function numOrNull(v: string | number | null) {
  if (v === "" || v == null) return null;
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(/[^0-9.]/g, ""));
  return isNaN(n) ? null : n;
}
function sanitize(name: string) {
  return name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9.]+/g, "-");
}

export default function ProjectEditor({ project, media }: { project: Project; media: Media[] }) {
  const router = useRouter();
  const [f, setF] = useState({
    name: project.name ?? "",
    type: (project.type as string) ?? "apartments",
    city: project.city ?? "",
    description: project.description ?? "",
    price_from: project.price_from ?? ("" as any),
    currency: project.currency ?? "COP",
    down_payment_pct: project.down_payment_pct ?? ("" as any),
    delivery_date: project.delivery_date ?? "",
    tag: project.tag ?? "",
    area_lote: project.area_lote ?? ("" as any),
    area_construida: project.area_construida ?? ("" as any),
    area_privada: project.area_privada ?? ("" as any),
    whatsapp_url: project.whatsapp_url ?? "",
    amenities: (project.amenities ?? []).join(", "),
  });
  const [items, setItems] = useState<Media[]>(media);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const up = (k: string, v: any) => setF((p) => ({ ...p, [k]: v }));
  const priceN = numOrNull(f.price_from) ?? 0;
  const pctN = numOrNull(f.down_payment_pct) ?? 0;
  const cuotaInicial = Math.round((priceN * pctN) / 100);

  const isCasa = f.type === "houses";
  const isApto = f.type === "apartments";
  const isLote = f.type === "lots";

  async function save() {
    setSaving(true); setMsg(null);
    const res: any = await updateProjectFields(project.id, {
      name: f.name, type: f.type, city: f.city, description: f.description,
      price_from: numOrNull(f.price_from), currency: f.currency,
      down_payment_pct: numOrNull(f.down_payment_pct),
      delivery_date: f.delivery_date || null, tag: f.tag || null,
      area_lote: numOrNull(f.area_lote),
      area_construida: numOrNull(f.area_construida),
      area_privada: numOrNull(f.area_privada),
      whatsapp_url: f.whatsapp_url || null,
      amenities: f.amenities.split(",").map((s) => s.trim()).filter(Boolean),
    });
    setSaving(false);
    setMsg(res.error ? "Error: " + res.error : "Cambios guardados ✓");
    router.refresh();
  }

  async function onUpload(section: string, files: FileList | null) {
    if (!files || !files.length) return;
    setBusy(section);
    const supabase = createClient();
    for (const file of Array.from(files)) {
      const path = `${project.id}/${section}/${Date.now()}-${sanitize(file.name)}`;
      const { error } = await supabase.storage.from("project-media").upload(path, file);
      if (error) { setMsg("Error subiendo: " + error.message); continue; }
      const { data } = supabase.storage.from("project-media").getPublicUrl(path);
      const res: any = await addMediaUrl(project.id, data.publicUrl, section);
      if (res.id) setItems((p) => [...p, { id: res.id, project_id: project.id, url: data.publicUrl, type: "photo", section, ord: 0 }]);
    }
    setBusy(null);
  }

  async function addByUrl(section: string, url: string, clear: () => void) {
    if (!url.trim()) return;
    const res: any = await addMediaUrl(project.id, url.trim(), section);
    if (res.id) { setItems((p) => [...p, { id: res.id, project_id: project.id, url: url.trim(), type: "photo", section, ord: 0 }]); clear(); }
    else if (res.error) setMsg("Error: " + res.error);
  }

  async function removeImg(m: Media) {
    setItems((p) => p.filter((x) => x.id !== m.id));
    await deleteMedia(m.id, project.id, m.url);
  }

  async function makeCover(url: string) {
    await setCover(project.id, url);
    setMsg("Portada actualizada ✓");
    router.refresh();
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 22, maxWidth: 920 }}>
      {/* ====== DATOS ====== */}
      <div className="glass" style={{ padding: 24 }}>
        <h2 className="font-display" style={{ fontSize: 22, marginBottom: 16 }}>Datos del proyecto</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field label="Nombre"><input value={f.name} onChange={(e) => up("name", e.target.value)} /></Field>
          <Field label="Tipo de propiedad">
            <select value={f.type} onChange={(e) => up("type", e.target.value)}>
              <option value="apartments">Apartamentos</option>
              <option value="houses">Casas</option>
              <option value="lots">Lotes</option>
              <option value="mixed">Mixto</option>
            </select>
          </Field>
          <Field label="Ciudad / ubicación"><input value={f.city} onChange={(e) => up("city", e.target.value)} /></Field>
          <Field label="Etiqueta (ej: Sobre planos)"><input value={f.tag} onChange={(e) => up("tag", e.target.value)} /></Field>
        </div>
        <Field label="Descripción"><textarea rows={3} value={f.description} onChange={(e) => up("description", e.target.value)} style={{ width: "100%", padding: "11px 13px", borderRadius: 11, background: "rgba(255,255,255,0.05)", border: "1px solid var(--stroke)", color: "var(--ink)", fontFamily: "inherit", fontSize: 14, resize: "vertical" }} /></Field>
        <Field label="Amenidades (separadas por coma)"><input value={f.amenities} onChange={(e) => up("amenities", e.target.value)} /></Field>
      </div>

      {/* ====== PRECIO Y ENTREGA ====== */}
      <div className="glass" style={{ padding: 24 }}>
        <h2 className="font-display" style={{ fontSize: 22, marginBottom: 16 }}>Precio, cuota y entrega</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          <Field label="Precio desde (millones)"><input type="number" value={f.price_from} onChange={(e) => up("price_from", e.target.value)} /></Field>
          <Field label="Moneda">
            <select value={f.currency} onChange={(e) => up("currency", e.target.value)}><option>COP</option><option>USD</option></select>
          </Field>
          <Field label="% Cuota inicial"><input type="number" value={f.down_payment_pct} onChange={(e) => up("down_payment_pct", e.target.value)} /></Field>
        </div>
        <div className="glass-soft" style={{ padding: "12px 16px", marginTop: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="muted" style={{ fontSize: 13 }}>Cuota inicial calculada ({pctN || 0}% de {money(priceN, f.currency)})</span>
          <b className="font-display" style={{ fontSize: 18 }}>{money(cuotaInicial, f.currency)}</b>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14, marginTop: 14 }}>
          <Field label="Entrega desde"><input type="date" value={/^\d{4}-\d{2}-\d{2}$/.test(f.delivery_date) ? f.delivery_date : ""} onChange={(e) => up("delivery_date", e.target.value)} /></Field>
        </div>
      </div>

      {/* ====== ÁREAS ====== */}
      <div className="glass" style={{ padding: 24 }}>
        <h2 className="font-display" style={{ fontSize: 22, marginBottom: 6 }}>Áreas (m²)</h2>
        <p className="muted" style={{ fontSize: 13, marginBottom: 14 }}>Completa según el tipo de propiedad.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          {(isCasa || isLote) && <Field label="Área lote"><input type="number" value={f.area_lote} onChange={(e) => up("area_lote", e.target.value)} /></Field>}
          {(isCasa || isApto) && <Field label="Área construida"><input type="number" value={f.area_construida} onChange={(e) => up("area_construida", e.target.value)} /></Field>}
          {(isCasa || isApto) && <Field label="Área privada"><input type="number" value={f.area_privada} onChange={(e) => up("area_privada", e.target.value)} /></Field>}
        </div>
      </div>

      {/* ====== CONTACTO ====== */}
      <div className="glass" style={{ padding: 24 }}>
        <h2 className="font-display" style={{ fontSize: 22, marginBottom: 16 }}>Contacto</h2>
        <Field label="Link de WhatsApp de este proyecto"><input placeholder="https://wa.link/..." value={f.whatsapp_url} onChange={(e) => up("whatsapp_url", e.target.value)} /></Field>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", position: "sticky", bottom: 14, zIndex: 5 }}>
        <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? "Guardando…" : "Guardar cambios"}</button>
        {msg && <span className="glass-soft" style={{ padding: "10px 14px", fontSize: 13.5 }}>{msg}</span>}
      </div>

      {/* ====== IMÁGENES POR SECCIÓN ====== */}
      <div className="glass" style={{ padding: 24 }}>
        <h2 className="font-display" style={{ fontSize: 22, marginBottom: 4 }}>Imágenes por sección</h2>
        <p className="muted" style={{ fontSize: 13, marginBottom: 18 }}>Sube fotos, agrégalas por URL, elimínalas o define la portada.</p>
        {MEDIA_SECTIONS.map((s) => (
          <SectionImages
            key={s.key}
            label={s.label}
            sectionKey={s.key}
            items={items.filter((m) => (m.section || "galeria") === s.key)}
            busy={busy === s.key}
            cover={project.cover_url}
            onUpload={(files) => onUpload(s.key, files)}
            onAddUrl={(url, clear) => addByUrl(s.key, url, clear)}
            onRemove={removeImg}
            onCover={makeCover}
          />
        ))}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="field" style={{ marginBottom: 12 }}>
      <label>{label}</label>
      {children}
    </div>
  );
}

function SectionImages({ label, sectionKey, items, busy, cover, onUpload, onAddUrl, onRemove, onCover }: {
  label: string; sectionKey: string; items: Media[]; busy: boolean; cover: string | null;
  onUpload: (files: FileList | null) => void;
  onAddUrl: (url: string, clear: () => void) => void;
  onRemove: (m: Media) => void;
  onCover: (url: string) => void;
}) {
  const [url, setUrl] = useState("");
  return (
    <div className="glass-soft" style={{ padding: 16, marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <b className="font-display" style={{ fontSize: 16 }}>{label} <span className="muted" style={{ fontWeight: 400, fontSize: 13 }}>({items.length})</span></b>
        <div style={{ display: "flex", gap: 8 }}>
          <label className="btn btn-ghost" style={{ padding: "8px 12px", fontSize: 13, cursor: "pointer" }}>
            {busy ? "Subiendo…" : "⬆ Subir fotos"}
            <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => onUpload(e.target.files)} />
          </label>
        </div>
      </div>
      {items.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(110px,1fr))", gap: 8 }}>
          {items.map((m) => (
            <div key={m.id} style={{ position: "relative", height: 80, borderRadius: 10, backgroundImage: `url('${m.url}')`, backgroundSize: "cover", backgroundPosition: "center", border: cover === m.url ? "2px solid var(--cyan)" : "1px solid var(--stroke-soft)" }}>
              <button onClick={() => onRemove(m)} title="Eliminar" style={{ position: "absolute", top: 4, right: 4, width: 22, height: 22, borderRadius: 6, border: "none", background: "rgba(7,10,23,0.7)", color: "#FF7A8A", cursor: "pointer", fontSize: 13 }}>✕</button>
              <button onClick={() => onCover(m.url)} title="Usar como portada" style={{ position: "absolute", bottom: 4, left: 4, padding: "2px 6px", borderRadius: 6, border: "none", background: cover === m.url ? "var(--cyan)" : "rgba(7,10,23,0.7)", color: cover === m.url ? "#06101f" : "#fff", cursor: "pointer", fontSize: 10, fontWeight: 700 }}>{cover === m.url ? "Portada" : "Portada"}</button>
            </div>
          ))}
        </div>
      )}
      <div className="searchbar glass" style={{ padding: "6px 6px 6px 12px", marginTop: 10 }}>
        <input placeholder="…o pega una URL de imagen" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") onAddUrl(url, () => setUrl("")); }} style={{ fontSize: 14 }} />
        <button className="btn btn-ghost" style={{ padding: "8px 12px", fontSize: 13 }} onClick={() => onAddUrl(url, () => setUrl(""))}>Agregar</button>
      </div>
    </div>
  );
}
