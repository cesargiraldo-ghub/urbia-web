"use client";
import { useState } from "react";

export default function ScrapeForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function scrape() {
    if (!url.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const r = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Error al extraer");
      setResult(data.project);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass" style={{ padding: 22, maxWidth: 640 }}>
      <span className="eyebrow">Crear proyecto con IA</span>
      <h3 className="font-display" style={{ fontSize: 20, margin: "8px 0 6px" }}>Pega el link del proyecto</h3>
      <p className="muted" style={{ fontSize: 14, marginBottom: 14 }}>
        La IA lee la página de tu web y extrae nombre, tipologías, ubicación, precios, amenidades y renders.
      </p>
      <div className="searchbar glass-soft" style={{ padding: "8px 8px 8px 14px" }}>
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://tuconstructora.com/proyecto" />
        <button className="btn btn-primary" onClick={scrape} disabled={loading}>
          {loading ? "Extrayendo…" : "Extraer con IA"}
        </button>
      </div>
      {error && <p style={{ color: "#FF7A8A", marginTop: 12, fontSize: 14 }}>{error}</p>}
      {result && (
        <div className="glass-soft" style={{ padding: 16, marginTop: 16 }}>
          <b className="font-display" style={{ fontSize: 17 }}>{result.name}</b>
          <p className="muted" style={{ fontSize: 13, marginTop: 6 }}>📍 {result.city} · {result.type}</p>
          <p style={{ fontSize: 14, marginTop: 8 }}>{result.description}</p>
          {Array.isArray(result.amenities) && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
              {result.amenities.map((a: string) => (
                <span key={a} style={{ fontSize: 12, padding: "6px 10px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid var(--stroke-soft)" }}>{a}</span>
              ))}
            </div>
          )}
          {Array.isArray(result.images) && result.images.length > 0 && (
            <>
              <p className="muted" style={{ fontSize: 12.5, marginTop: 12 }}>{result.images.length} imágenes encontradas:</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(90px,1fr))", gap: 8, marginTop: 8 }}>
                {result.images.map((u: string, i: number) => (
                  <div key={i} style={{ height: 70, borderRadius: 8, backgroundImage: `url('${u}')`, backgroundSize: "cover", backgroundPosition: "center" }} />
                ))}
              </div>
            </>
          )}
          <p className="muted" style={{ fontSize: 12.5, marginTop: 12 }}>
            ✓ Ficha generada en borrador. Revísala y publícala desde &quot;Mis proyectos&quot;.
          </p>
        </div>
      )}
    </div>
  );
}
