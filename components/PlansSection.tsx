"use client";
import { useState } from "react";

const PLANS = [
  {
    key: "free", name: "Gratis", price: "$0", per: "para empezar",
    features: ["Publica 1 proyecto", "Ficha con IA (pega el link)", "Aparece en el buscador", "Recibe leads del portal"],
  },
  {
    key: "basic", name: "Básico", price: "$250.000", per: "COP / mes",
    features: ["Proyectos ilimitados", "Creación de fichas con IA", "Buscador inteligente", "Renders, amenidades y simulador", "Leads del portal"],
  },
  {
    key: "premium", name: "Premium", price: "$2.500.000", per: "COP / mes", featured: true,
    features: ["Todo lo del Básico", "Citas calificadas garantizadas", "Marketing con IA (Meta + Google)", "Calificación por WhatsApp", "Auto-agendamiento", "Gerente de cuenta"],
  },
];

export default function PlansSection({ currentPlan }: { currentPlan: string }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function request(plan: string) {
    setBusy(plan);
    try {
      const r = await fetch("/api/request-plan", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan }),
      });
      if (r.ok) setDone(plan);
    } finally { setBusy(null); }
  }

  return (
    <>
      <h2 className="font-display" style={{ fontSize: 22, margin: "40px 0 6px" }}>Planes</h2>
      <p className="muted" style={{ fontSize: 13.5, marginBottom: 16 }}>
        Tu plan actual: <b style={{ color: "var(--cyan)" }}>{PLANS.find((p) => p.key === currentPlan)?.name ?? "Gratis"}</b>.
        Para subir de plan, solicítalo y URBIA te contacta.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20 }}>
        {PLANS.map((p) => {
          const isCurrent = p.key === currentPlan;
          const requested = done === p.key;
          return (
            <div key={p.key} className="glass" style={{ padding: 26, border: p.featured ? "1px solid rgba(245,201,123,0.4)" : undefined, position: "relative" }}>
              {isCurrent && <span className="badge b-ok" style={{ position: "absolute", top: 16, right: 16 }}>Plan actual</span>}
              <span className="pill">{p.key === "premium" ? "Máximo rendimiento" : p.key === "basic" ? "Crecer" : "Para empezar"}</span>
              <h3 className="font-display" style={{ fontSize: 22, marginTop: 12 }}>{p.name}</h3>
              <div className="font-display" style={{ fontSize: 34, margin: "8px 0 2px" }}>{p.price} <small className="muted" style={{ fontSize: 13 }}>{p.per}</small></div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, margin: "16px 0" }}>
                {p.features.map((f) => (
                  <li key={f} style={{ display: "flex", gap: 9, fontSize: 13.5, color: "#D6DFFA" }}>
                    <span style={{ color: p.featured ? "#F5C97B" : "#22D3EE", fontWeight: 800 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <button className="btn btn-ghost" style={{ width: "100%" }} disabled>Plan actual</button>
              ) : requested ? (
                <div className="glass-soft" style={{ padding: 12, fontSize: 13, textAlign: "center", color: "#34E0A1" }}>
                  ✓ Hemos enviado un correo a URBIA para que te contacten y te ayuden a activar el plan.
                </div>
              ) : (
                <button className={`btn ${p.featured ? "btn-gold" : "btn-primary"}`} style={{ width: "100%" }} onClick={() => request(p.key)} disabled={busy === p.key}>
                  {busy === p.key ? "Enviando…" : `Solicitar ${p.name}`}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
