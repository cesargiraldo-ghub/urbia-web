"use client";
import { useMemo, useState } from "react";
import LeadContact from "@/components/LeadContact";
import { addLead, importLeads, updateLeadStatus, deleteLead } from "@/app/panel/leads-actions";
import { Lead } from "@/lib/types";

const STATUSES = ["Nuevo", "Contactado", "En conversación", "Cita agendada", "Calificado", "No calificado", "Cerrado"];
const tempBadge = (t: string | null) => (t === "hot" ? "b-hot" : t === "warm" ? "b-new" : "b-cold");

export default function ClientsManager({ initial }: { initial: Lead[] }) {
  const [rows, setRows] = useState<Lead[]>(initial);
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [nf, setNf] = useState({ client_name: "", phone: "", email: "", status: "Nuevo" });

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return rows.filter((r) => !s || `${r.client_name} ${r.phone} ${r.email} ${r.status}`.toLowerCase().includes(s));
  }, [rows, q]);

  async function onAdd() {
    if (!nf.client_name.trim()) return;
    const res: any = await addLead(nf);
    if (res.error) { setMsg("Error: " + res.error); return; }
    setRows((p) => [{ id: crypto.randomUUID(), client_name: nf.client_name, contact: null, phone: nf.phone || null, email: nf.email || null, source: "portal", ai_score: null, temperature: null, status: nf.status } as Lead, ...p]);
    setNf({ client_name: "", phone: "", email: "", status: "Nuevo" });
    setAdding(false);
    setMsg("Cliente agregado ✓");
  }

  async function onImport(file: File | null) {
    if (!file) return;
    setMsg("Leyendo Excel…");
    try {
      const XLSX = await import("xlsx");
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      const mapped = json.map((r) => {
        const keys = Object.keys(r);
        const find = (...names: string[]) => {
          const k = keys.find((kk) => names.some((n) => kk.toLowerCase().trim().includes(n)));
          return k ? String(r[k]).trim() : "";
        };
        return { client_name: find("nombre", "name", "cliente"), phone: find("tel", "celular", "phone", "whats"), email: find("correo", "email", "mail") };
      }).filter((r) => r.client_name);
      if (!mapped.length) { setMsg("No encontré filas válidas. Usa columnas: nombre, telefono, correo."); return; }
      const res: any = await importLeads(mapped);
      if (res.error) { setMsg("Error: " + res.error); return; }
      setRows((p) => [...mapped.map((m) => ({ id: crypto.randomUUID(), client_name: m.client_name, contact: null, phone: m.phone || null, email: m.email || null, source: "portal", ai_score: null, temperature: null, status: "Importado" } as Lead)), ...p]);
      setMsg(`Importados ${res.count} clientes ✓`);
    } catch (e: any) {
      setMsg("Error leyendo el archivo: " + e.message);
    }
  }

  async function onStatus(id: string, status: string) {
    setRows((p) => p.map((r) => (r.id === id ? { ...r, status } : r)));
    await updateLeadStatus(id, status);
  }
  async function onDelete(id: string) {
    if (!confirm("¿Eliminar este cliente?")) return;
    setRows((p) => p.filter((r) => r.id !== id));
    await deleteLead(id);
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
        <input className="" placeholder="Buscar cliente…" value={q} onChange={(e) => setQ(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: "11px 14px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid var(--stroke)", color: "var(--ink)", outline: "none", fontFamily: "inherit" }} />
        <button className="btn btn-primary" onClick={() => setAdding((v) => !v)}>+ Agregar cliente</button>
        <label className="btn btn-ghost" style={{ cursor: "pointer" }}>
          ⬆ Importar Excel
          <input type="file" accept=".xlsx,.xls,.csv" style={{ display: "none" }} onChange={(e) => onImport(e.target.files?.[0] ?? null)} />
        </label>
      </div>
      {msg && <p className="glass-soft" style={{ padding: "10px 14px", fontSize: 13.5, marginBottom: 14, display: "inline-block" }}>{msg}</p>}

      {adding && (
        <div className="glass" style={{ padding: 18, marginBottom: 16, display: "grid", gridTemplateColumns: "1.5fr 1fr 1.5fr auto auto", gap: 10, alignItems: "end" }}>
          <Inp label="Nombre" v={nf.client_name} on={(v) => setNf({ ...nf, client_name: v })} />
          <Inp label="Teléfono" v={nf.phone} on={(v) => setNf({ ...nf, phone: v })} />
          <Inp label="Correo" v={nf.email} on={(v) => setNf({ ...nf, email: v })} />
          <div className="field" style={{ margin: 0 }}>
            <label>Estado</label>
            <select value={nf.status} onChange={(e) => setNf({ ...nf, status: e.target.value })}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
          </div>
          <button className="btn btn-primary" onClick={onAdd}>Guardar</button>
        </div>
      )}

      <div className="glass" style={{ padding: 6 }}>
        <table>
          <thead><tr><th>Cliente</th><th>Teléfono</th><th>Correo</th><th>Score</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.id}>
                <td><b>{l.client_name}</b><LeadContact lead={l} /></td>
                <td className="muted">{l.phone ?? "—"}</td>
                <td className="muted">{l.email ?? "—"}</td>
                <td>{l.ai_score != null ? <span className={`badge ${tempBadge(l.temperature)}`}>{l.ai_score}</span> : "—"}</td>
                <td>
                  <select value={l.status} onChange={(e) => onStatus(l.id, e.target.value)}
                    style={{ padding: "6px 8px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid var(--stroke-soft)", color: "var(--ink)", fontFamily: "inherit", fontSize: 12.5 }}>
                    {STATUSES.includes(l.status) ? null : <option>{l.status}</option>}
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td><button onClick={() => onDelete(l.id)} title="Eliminar" style={{ background: "none", border: "none", color: "#FF7A8A", cursor: "pointer", fontSize: 14 }}>🗑</button></td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} className="muted" style={{ padding: 24, textAlign: "center" }}>Sin clientes. Agrega uno o importa tu Excel.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="muted" style={{ fontSize: 12.5, marginTop: 12 }}>Tip: el Excel debe tener columnas con <b>nombre</b>, <b>telefono</b> y <b>correo</b> (en cualquier orden).</p>
    </div>
  );
}

function Inp({ label, v, on }: { label: string; v: string; on: (v: string) => void }) {
  return (
    <div className="field" style={{ margin: 0 }}>
      <label>{label}</label>
      <input value={v} onChange={(e) => on(e.target.value)} />
    </div>
  );
}
