"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function myOrg(supabase: ReturnType<typeof createClient>) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return null;
  const { data: prof } = await supabase.from("profiles").select("org_id").eq("id", auth.user.id).single();
  return prof?.org_id ?? null;
}

export async function addLead(lead: { client_name: string; phone?: string; email?: string; status?: string; project_id?: string | null }) {
  const supabase = createClient();
  const orgId = await myOrg(supabase);
  if (!orgId) return { error: "Sin organización" };
  const { error } = await supabase.from("leads").insert({
    org_id: orgId,
    client_name: lead.client_name,
    phone: lead.phone || null,
    email: lead.email || null,
    status: lead.status || "Nuevo",
    project_id: lead.project_id || null,
    source: "portal",
  });
  if (error) return { error: error.message };
  revalidatePath("/panel/clientes");
  revalidatePath("/panel");
  return { ok: true };
}

export async function importLeads(rows: { client_name: string; phone?: string; email?: string }[]) {
  const supabase = createClient();
  const orgId = await myOrg(supabase);
  if (!orgId) return { error: "Sin organización" };
  const clean = rows
    .filter((r) => (r.client_name || "").trim())
    .map((r) => ({ org_id: orgId, client_name: String(r.client_name).trim(), phone: r.phone ? String(r.phone).trim() : null, email: r.email ? String(r.email).trim() : null, status: "Importado", source: "portal" as const }));
  if (!clean.length) return { error: "No se encontraron filas válidas (revisa la columna nombre)." };
  const { error } = await supabase.from("leads").insert(clean);
  if (error) return { error: error.message };
  revalidatePath("/panel/clientes");
  revalidatePath("/panel");
  return { ok: true, count: clean.length };
}

export async function updateLeadStatus(id: string, status: string) {
  const supabase = createClient();
  const { error } = await supabase.from("leads").update({ status }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/panel/clientes");
  return { ok: true };
}

export async function deleteLead(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/panel/clientes");
  revalidatePath("/panel");
  return { ok: true };
}
