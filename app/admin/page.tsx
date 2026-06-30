import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Admin() {
  const supabase = createClient();

  // Acceso restringido: solo URBIA admin.
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) redirect("/login");
  const { data: me } = await supabase.from("profiles").select("role").eq("id", auth.user.id).single();
  if (me?.role !== "admin") redirect("/");

  const [{ data: orgs }, { count: projCount }, { count: leadCount }, { data: subs }] = await Promise.all([
    supabase.from("organizations").select("*"),
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase.from("subscriptions").select("amount, plan, status"),
  ]);

  const mrr = (subs ?? []).filter((s) => s.status === "active").reduce((a, s) => a + Number(s.amount ?? 0), 0);
  const premium = (subs ?? []).filter((s) => s.plan === "premium").length;

  return (
    <section className="wrap" style={{ paddingTop: 28 }}>
      <span className="eyebrow">Panel interno URBIA</span>
      <h1 className="font-display" style={{ fontSize: 30, margin: "8px 0 22px" }}>Salud del negocio</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 16, marginBottom: 26 }}>
        <div className="kpi glass"><div className="lab">MRR</div><b>${mrr.toLocaleString("es-CO")}</b></div>
        <div className="kpi glass"><div className="lab">Constructoras</div><b>{orgs?.length ?? 0}</b></div>
        <div className="kpi glass"><div className="lab">Premium</div><b>{premium}</b></div>
        <div className="kpi glass"><div className="lab">Proyectos</div><b>{projCount ?? 0}</b></div>
        <div className="kpi glass"><div className="lab">Leads</div><b>{leadCount ?? 0}</b></div>
      </div>

      <h2 className="font-display" style={{ fontSize: 22, marginBottom: 14 }}>Constructoras</h2>
      <div className="glass" style={{ padding: 6 }}>
        <table>
          <thead><tr><th>Empresa</th><th>Ciudad</th><th>Plan</th><th>Estado</th></tr></thead>
          <tbody>
            {(orgs ?? []).map((o: any) => (
              <tr key={o.id}>
                <td><b>{o.name}</b></td>
                <td>{o.city ?? "—"}</td>
                <td><span className={`badge ${o.plan === "premium" ? "b-hot" : "b-new"}`}>{o.plan}</span></td>
                <td><span className="badge b-ok">{o.billing_status ?? "activo"}</span></td>
              </tr>
            ))}
            {(!orgs || orgs.length === 0) && <tr><td colSpan={4} className="muted" style={{ padding: 20 }}>Sin constructoras. Corre urbia-schema.sql para datos demo.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
