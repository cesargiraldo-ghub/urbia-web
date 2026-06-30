import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import ProjectManageCard from "@/components/ProjectManageCard";
import ScrapeForm from "@/components/ScrapeForm";
import PlansSection from "@/components/PlansSection";
import LeadContact from "@/components/LeadContact";
import { Project, Lead } from "@/lib/types";

export const dynamic = "force-dynamic";

const tempBadge = (t: string | null) =>
  t === "hot" ? "b-hot" : t === "warm" ? "b-new" : "b-cold";

export default async function Panel() {
  const supabase = createClient();

  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) redirect("/login");
  const { data: prof } = await supabase.from("profiles").select("org_id, role").eq("id", auth.user.id).single();
  if (prof?.role !== "builder" && prof?.role !== "admin") redirect("/");

  const orgId: string | null = prof?.org_id ?? null;
  let orgName = "Tu constructora";
  let plan = "free";
  if (orgId) {
    const { data: org } = await supabase.from("organizations").select("name, plan").eq("id", orgId).single();
    orgName = org?.name ?? orgName;
    plan = org?.plan ?? "free";
  }

  const [{ data: projects }, { data: leads }, { count: leadCount }] = await Promise.all([
    supabase.from("projects").select("*, organizations(name, slug, logo_url)").eq("org_id", orgId ?? "").order("created_at", { ascending: false }),
    supabase.from("leads").select("*, projects(name)").eq("org_id", orgId ?? "").order("created_at", { ascending: false }).limit(5),
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("org_id", orgId ?? ""),
  ]);

  const ps = (projects ?? []) as Project[];
  const ls = (leads ?? []) as Lead[];

  return (
    <section className="wrap" style={{ paddingTop: 28 }}>
      <span className="eyebrow">Panel de constructora</span>
      <h1 className="font-display" style={{ fontSize: 30, margin: "8px 0 22px" }}>Hola, {orgName} 👋</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 16, marginBottom: 26 }}>
        <div className="kpi glass"><div className="lab">Plan</div><b style={{ textTransform: "capitalize" }}>{plan}</b></div>
        <div className="kpi glass"><div className="lab">Proyectos</div><b>{ps.length}</b></div>
        <div className="kpi glass"><div className="lab">Clientes</div><b>{leadCount ?? 0}</b></div>
        <div className="kpi glass"><div className="lab">Calientes</div><b style={{ color: "var(--gold)" }}>{ls.filter((l) => l.temperature === "hot").length}</b></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
        <ScrapeForm />
        <div className="glass" style={{ padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <b className="font-display" style={{ fontSize: 17 }}>Clientes recientes</b>
            <Link className="muted" href="/panel/clientes" style={{ fontSize: 13 }}>Ver más → CRM</Link>
          </div>
          <table>
            <thead><tr><th>Cliente</th><th>Proyecto</th><th>Score</th></tr></thead>
            <tbody>
              {ls.map((l) => (
                <tr key={l.id}>
                  <td><b>{l.client_name}</b><LeadContact lead={l} /></td>
                  <td>{l.projects?.name ?? "—"}</td>
                  <td><span className={`badge ${tempBadge(l.temperature)}`}>{l.ai_score ?? "—"}</span></td>
                </tr>
              ))}
              {ls.length === 0 && <tr><td colSpan={3} className="muted" style={{ padding: 20 }}>Sin clientes aún. Impórtalos en el CRM →</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <h2 className="font-display" style={{ fontSize: 22, margin: "34px 0 6px" }}>Mis proyectos</h2>
      <p className="muted" style={{ fontSize: 13.5, marginBottom: 16 }}>
        Los proyectos creados con IA quedan en <b>Borrador</b> (solo los ves tú). Revísalos y dale <b>Publicar</b> cuando estén listos. En el plan Gratis puedes tener <b>1 proyecto publicado</b>.
      </p>
      {ps.length === 0 ? (
        <p className="muted">Aún no tienes proyectos. Crea uno con IA pegando el link de tu web 👆</p>
      ) : (
        <div className="grid-cards">{ps.map((p) => <ProjectManageCard key={p.id} p={p} />)}</div>
      )}

      <PlansSection currentPlan={plan} />
    </section>
  );
}
