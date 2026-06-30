"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Cambia el estado de un proyecto. RLS asegura que solo la constructora dueña
// (o admin) pueda modificar sus propios proyectos.
export async function setProjectStatus(projectId: string, status: "draft" | "published") {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("projects")
    .update({ status, published_at: status === "published" ? new Date().toISOString() : null })
    .eq("id", projectId);

  if (error) return { error: error.message };
  revalidatePath("/panel");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteProject(projectId: string) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return { error: "No autenticado" };

  const { error } = await supabase.from("projects").delete().eq("id", projectId);
  if (error) return { error: error.message };
  revalidatePath("/panel");
  return { ok: true };
}

type ProjectFields = {
  name?: string;
  type?: string;
  city?: string;
  description?: string;
  price_from?: number | null;
  currency?: string;
  down_payment_pct?: number | null;
  delivery_date?: string | null;
  tag?: string | null;
  area_lote?: number | null;
  area_construida?: number | null;
  area_privada?: number | null;
  whatsapp_url?: string | null;
  calendar_url?: string | null;
  amenities?: string[];
  cover_url?: string | null;
};

// Guarda los campos editables del proyecto.
export async function updateProjectFields(projectId: string, fields: ProjectFields) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return { error: "No autenticado" };

  const { error } = await supabase.from("projects").update(fields).eq("id", projectId);
  if (error) return { error: error.message };
  revalidatePath("/panel");
  revalidatePath(`/panel/proyecto/${projectId}`);
  revalidatePath("/");
  return { ok: true };
}

// Agrega una imagen (por URL ya subida a Storage o externa) a una sección.
export async function addMediaUrl(projectId: string, url: string, section: string) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return { error: "No autenticado" };

  const { data, error } = await supabase
    .from("media")
    .insert({ project_id: projectId, url, section, type: "photo", ord: 0 })
    .select("id")
    .single();
  if (error) return { error: error.message };
  revalidatePath(`/panel/proyecto/${projectId}`);
  return { ok: true, id: data.id as string };
}

// Elimina una imagen (de la tabla media y, si está en Storage, del bucket).
export async function deleteMedia(mediaId: string, projectId: string, url: string) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return { error: "No autenticado" };

  const { error } = await supabase.from("media").delete().eq("id", mediaId);
  if (error) return { error: error.message };

  // Best-effort: borra el archivo de Storage si pertenece al bucket.
  const marker = "/project-media/";
  const i = url.indexOf(marker);
  if (i !== -1) {
    const path = url.slice(i + marker.length);
    try { await supabase.storage.from("project-media").remove([path]); } catch {}
  }
  revalidatePath(`/panel/proyecto/${projectId}`);
  return { ok: true };
}

// Define la portada del proyecto.
export async function setCover(projectId: string, url: string) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return { error: "No autenticado" };
  const { error } = await supabase.from("projects").update({ cover_url: url }).eq("id", projectId);
  if (error) return { error: error.message };
  revalidatePath(`/panel/proyecto/${projectId}`);
  revalidatePath("/");
  return { ok: true };
}
