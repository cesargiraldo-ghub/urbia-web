import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import ClientsManager from "@/components/ClientsManager";
import { Lead } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Clientes() {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) redirect("/login");
  const { data: prof } = await supabase.from("profiles").select("org_id, role").eq("id", auth.user.id).single();
  if (prof?.role !== "builder" && prof?.role !== "admin") redirect("/");

  const orgId = prof?.org_id ?? "";
  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  const ls = (leads ?? []) as Lead[];

  return (
    <section className="wrap" style={{ paddingTop: 28 }}>
      <div style={{ marginBottom: 14 }}>
        <Link className="muted" href="/panel">← Volver al panel</Link>
      </div>
      <span className="eyebrow">CRM de clientes</span>
      <h1 className="font-display" style={{ fontSize: 28, margin: "8px 0 6px" }}>Gestiona tus leads</h1>
      <p className="muted" style={{ fontSize: 14, marginBottom: 22 }}>{ls.length} clientes en total. Contáctalos, cambia su estado o importa tu base en Excel.</p>
      <ClientsManager initial={ls} />
    </section>
  );
}
