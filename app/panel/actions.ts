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
