import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import ProjectEditor from "@/components/ProjectEditor";
import { Project, Media } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditProject({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) redirect("/login");
  const { data: prof } = await supabase.from("profiles").select("role").eq("id", auth.user.id).single();
  if (prof?.role !== "builder" && prof?.role !== "admin") redirect("/");

  const { data: project } = await supabase
    .from("projects")
    .select("*, organizations(name, slug, logo_url)")
    .eq("id", params.id)
    .maybeSingle();
  if (!project) return notFound();

  const { data: media } = await supabase
    .from("media")
    .select("*")
    .eq("project_id", params.id)
    .order("ord");

  return (
    <section className="wrap" style={{ paddingTop: 28 }}>
      <div style={{ marginBottom: 14 }}>
        <Link className="muted" href="/panel">← Volver al panel</Link>
      </div>
      <span className="eyebrow">Editor de proyecto</span>
      <h1 className="font-display" style={{ fontSize: 28, margin: "8px 0 22px" }}>{(project as Project).name}</h1>
      <ProjectEditor project={project as Project} media={(media as Media[]) ?? []} />
    </section>
  );
}
