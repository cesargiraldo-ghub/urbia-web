import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProjectCard from "@/components/ProjectCard";
import ScrapeForm from "@/components/ScrapeForm";
import { Project, Lead } from "@/lib/types";

export const dynamic = "force-dynamic";

const tempBadge = (t: string | null) =>
  t === "hot" ? "b-hot" : t === "warm" ? "b-new" : "b-cold";

export default async function Panel() {
  const supabase = createClient();

  // Acceso restringido: solo constructoras (builder) o admin.
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) redirect("/login");
  const { data: prof } = await supabase
    .from("profiles")
    .select("org_id, role")
    .eq("id", auth.user.id)
    .single();
  if (prof?.role !== "builder" && prof?.role !== "admin") redirect("/");

  const orgId: string | null = prof?.org_id ?? null;
  let orgName = "Tu constructora";
  if (orgId) {
    const { data: org } = await supabase.from("organizations").select("name").eq("id", orgId).single();
    orgName = org?.name ?? orgName;
  }

  const [{ data: projects }, { data: leads }] = await Promise.all([
    supabase.from("projects").select("*, organizations(name, slug, logo_url)").eq("org_id", orgId ?? "").order("created_at", { ascending: false }),
    supabase.from("leads").select("*, projects(name)").eq("org_id", orgId ?? "").order("created_at", { ascending: false }).limit(10),
  ]);

  const ps = (projects ?? []) as Project[];
  const ls = (leads ?? []) as Lead[];

  return (
    <section className="wrap" style={{ paddingTop: 28 }}>
      <span className="eyebrow">Panel de constructora</span>
      <h1 className="font-display" style={{ fontSize: 30, margin: "8px 0 22px" }}>Hola, {orgName} 👋</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 16, marginBottom: 26 }}>
        <div className="kpi glass"><div className="lab">Proyectos</div><b>{ps.length}</b></div>
        <div className="kpi glass"><div className="lab">Leads</div><b>{ls.length}</b></div>
        <div className="kpi glass"><div className="lab">Calientes</div><b style={{ color: "var(--gold)" }}>{ls.filter((l) => l.temperature === "hot").length}</b></div>
        <div className="kpi glass"><div className="lab">Citas agendadas</div><b style={{ color: "#34E0A1" }}>{ls.filter((l) => l.status?.toLowerCase().includes("cita")).length}</b></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
        <ScrapeForm />
        <div className="glass" style={{ padding: 6 }}>
          <table>
            <thead><tr><th>Cliente</th><th>Proyecto</th><th>Score</th><th>Estado</th></tr></thead>
            <tbody>
              {ls.map((l) => (
                <tr key={l.id}>
                  <td><b>{l.client_name}</b></td>
                  <td>{l.projects?.name ?? "—"}</td>
                  <td><span className={`badge ${tempBadge(l.temperature)}`}>{l.ai_score ?? "—"}</span></td>
                  <td><span className="badge b-ok">{l.status}</span></td>
                </tr>
              ))}
              {ls.length === 0 && <tr><td colSpan={4} className="muted" style={{ padding: 20 }}>Sin leads aún.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <h2 className="font-display" style={{ fontSize: 22, margin: "34px 0 16px" }}>Mis proyectos</h2>
      {ps.length === 0 ? (
        <p className="muted">Aún no tienes proyectos. Crea uno con IA pegando el link de tu web 👆</p>
      ) : (
        <div className="grid-cards">{ps.map((p) => <ProjectCard key={p.id} p={p} />)}</div>
      )}

      <Plans />
    </section>
  );
}

function Plans() {
  const check = (t: string, gold?: boolean) => (
    <li style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, color: "#D6DFFA" }}>
      <span style={{ color: gold ? "#F5C97B" : "#22D3EE", fontWeight: 800 }}>✓</span>
      <span dangerouslySetInnerHTML={{ __html: t }} />
    </li>
  );
  return (
    <>
      <h2 className="font-display" style={{ fontSize: 22, margin: "40px 0 16px" }}>Planes</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="glass" style={{ padding: 28 }}>
          <span className="pill">Para empezar</span>
          <h3 className="font-display" style={{ fontSize: 22, marginTop: 12 }}>Básico</h3>
          <div className="font-display" style={{ fontSize: 36, margin: "10px 0 2px" }}>$250.000 <small className="muted" style={{ fontSize: 14 }}>COP / mes</small></div>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 11, margin: "18px 0" }}>
            {check("Publica proyectos ilimitados")}
            {check("Creación de fichas con IA (pega el link)")}
            {check("Aparición en el buscador inteligente")}
            {check("Ficha con renders, amenidades y simulador")}
            {check("Recibe leads desde el portal")}
          </ul>
          <button className="btn btn-ghost" style={{ width: "100%" }}>Plan actual</button>
        </div>
        <div className="glass" style={{ padding: 28, border: "1px solid rgba(245,201,123,0.4)" }}>
          <span className="pill" style={{ borderColor: "rgba(245,201,123,.4)", color: "var(--gold)" }}>Recomendado</span>
          <h3 className="font-display" style={{ fontSize: 22, marginTop: 12 }}>Premium</h3>
          <div className="font-display" style={{ fontSize: 36, margin: "10px 0 2px" }}>$2.500.000 <small className="muted" style={{ fontSize: 14 }}>COP / mes</small></div>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 11, margin: "18px 0" }}>
            {check("Todo lo del plan Básico", true)}
            {check("<b>Citas calificadas garantizadas</b> cada mes", true)}
            {check("Marketing avanzado con IA (Meta + Google)", true)}
            {check("Calificación de leads por WhatsApp con IA", true)}
            {check("Auto-agendamiento en tu calendario", true)}
            {check("Lead scoring y reporte de intención de compra", true)}
          </ul>
          <button className="btn btn-gold" style={{ width: "100%" }}>Activar Premium</button>
        </div>
      </div>
    </>
  );
}
