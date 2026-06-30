"use client";
import { useState } from "react";
import Link from "next/link";
import { Project, money } from "@/lib/types";

type Result = Project & { match?: number };

function projectHref(p: Result) {
  const orgSlug = (p as any).organizations?.slug as string | undefined;
  return orgSlug ? `/${orgSlug}/proyectos/${p.slug}` : `/proyectos/${p.slug}`;
}

export default function AISearch() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState<string | null>(null);
  const [results, setResults] = useState<Result[]>([]);

  async function run(query: string) {
    if (!query.trim()) return;
    setLoading(true);
    setReply(null);
    try {
      const r = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await r.json();
      setReply(data.reply ?? "Encontré estas opciones para ti.");
      setResults(data.results ?? []);
    } catch {
      setReply("Hubo un problema con la búsqueda. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  const chips = [
    "Apartamentos frente al mar en Cartagena",
    "Inversión en dólares en Panamá",
    "Casas campestres cerca de Bogotá",
    "Apartamentos con cuota inicial del 10%",
  ];

  return (
    <div>
      <div className="searchbar glass" style={{ maxWidth: 760, margin: "0 auto" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run(q)}
          placeholder="Ej: apartamento de 2 habitaciones en Medellín, cuota inicial baja, entrega 2027…"
        />
        <button className="btn btn-primary" onClick={() => run(q)} disabled={loading}>
          {loading ? "Buscando…" : "Buscar con IA"}
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginTop: 16 }}>
        {chips.map((c) => (
          <span key={c} className="chip" onClick={() => { setQ(c); run(c); }}>{c}</span>
        ))}
      </div>

      {(reply || loading) && (
        <div className="glass" style={{ maxWidth: 760, margin: "26px auto 0", padding: 18 }}>
          <span className="eyebrow">Asistente URBIA</span>
          <p style={{ marginTop: 10, lineHeight: 1.55 }}>
            {loading ? "Analizando tu búsqueda…" : reply}
          </p>
        </div>
      )}

      {results.length > 0 && (
        <div className="grid-cards" style={{ marginTop: 26 }}>
          {results.map((p) => (
            <Link key={p.id} href={projectHref(p)} className="card glass">
              <div className="img" style={{ backgroundImage: `url('${p.cover_url ?? ""}')` }}>
                {p.tag && <span className="tag">{p.tag}</span>}
                {p.match != null && <span className="match">{p.match}% match</span>}
              </div>
              <div className="body">
                <h3 className="font-display" style={{ fontSize: 18 }}>{p.name}</h3>
                <div className="loc">📍 {p.city}</div>
                <div className="price">{money(p.price_from, p.currency ?? "COP")}{" "}
                  <small style={{ display: "block", fontSize: 11.5, color: "var(--muted)", fontWeight: 500 }}>
                    desde · cuota inicial {p.down_payment_pct}%
                  </small>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
