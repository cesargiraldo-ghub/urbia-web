import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ProjectDetailView from "@/components/ProjectDetailView";
import { Project, UnitType, Media } from "@/lib/types";

export const dynamic = "force-dynamic";

// URL bonita: /<constructora>/proyectos/<proyecto>
export default async function OrgProjectDetail({ params }: { params: { org: string; slug: string } }) {
  const supabase = createClient();

  const { data: org } = await supabase
    .from("organizations")
    .select("id, name, slug, logo_url")
    .eq("slug", params.org)
    .maybeSingle();
  if (!org) return notFound();

  const { data: project } = await supabase
    .from("projects")
    .select("*, organizations(name, slug, logo_url)")
    .eq("org_id", org.id)
    .eq("slug", params.slug)
    .maybeSingle();
  if (!project) return notFound();

  const p = project as Project;
  const [{ data: units }, { data: media }] = await Promise.all([
    supabase.from("unit_types").select("*").eq("project_id", p.id),
    supabase.from("media").select("*").eq("project_id", p.id).order("ord"),
  ]);

  return <ProjectDetailView p={p} units={(units as UnitType[]) ?? []} media={(media as Media[]) ?? []} />;
}
