"use client";
import { useMemo, useState } from "react";

export default function CreditSimulator({ priceFrom, downPct, currency, calendarUrl, waUrl }: { priceFrom: number; downPct: number; currency: string; calendarUrl?: string | null; waUrl?: string }) {
  const [val, setVal] = useState(priceFrom);
  const [pct, setPct] = useState(downPct);
  const [months, setMonths] = useState(180);

  const { cuotaInicial, mensual } = useMemo(() => {
    const ci = (val * pct) / 100;
    const principal = (val - ci) * 1_000_000;
    const r = 0.0105;
    const m = (principal * r) / (1 - Math.pow(1 + r, -months));
    return { cuotaInicial: Math.round(ci), mensual: Math.round(m) };
  }, [val, pct, months]);

  const fmtM = (n: number) => (currency === "USD" ? `$${n.toLocaleString("en-US")}M` : `$${n.toLocaleString("es-CO")}M`);

  return (
    <div className="glass" style={{ padding: 20, position: "sticky", top: 90 }}>
      <span className="eyebrow">Simulador de crédito</span>
      <h3 className="font-display" style={{ fontSize: 19, margin: "8px 0 16px" }}>Calcula tu cuota mensual</h3>
      <div className="field" style={{ marginBottom: 14 }}>
        <label>Valor del inmueble (millones)</label>
        <input type="range" min={200} max={2000} value={val} onChange={(e) => setVal(+e.target.value)} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 4 }}>
          <span className="muted">Precio</span><b>{fmtM(val)}</b>
        </div>
      </div>
      <div className="field" style={{ marginBottom: 14 }}>
        <label>Cuota inicial ({pct}%)</label>
        <input type="range" min={10} max={40} value={pct} onChange={(e) => setPct(+e.target.value)} />
      </div>
      <div className="field" style={{ marginBottom: 14 }}>
        <label>Plazo</label>
        <select value={months} onChange={(e) => setMonths(+e.target.value)}>
          <option value={120}>10 años</option>
          <option value={180}>15 años</option>
          <option value={240}>20 años</option>
        </select>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", borderTop: "1px dashed var(--stroke)" }}>
        <span className="muted">Cuota inicial</span><b className="font-display" style={{ fontSize: 18 }}>{fmtM(cuotaInicial)}</b>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", borderTop: "1px dashed var(--stroke)" }}>
        <span className="muted">Cuota mensual aprox.</span>
        <b className="font-display" style={{ fontSize: 22 }}>${mensual.toLocaleString("es-CO")}</b>
      </div>
      <a className="btn btn-primary" href={calendarUrl || waUrl || "#"} target="_blank" rel="noopener noreferrer" style={{ width: "100%", marginTop: 16, textAlign: "center" }}>📅 Agendar cita</a>
      <p className="muted" style={{ fontSize: 12, marginTop: 10, textAlign: "center" }}>
        Cálculo aproximado (~13,4% E.A.). No constituye oferta de crédito.
      </p>
    </div>
  );
}
