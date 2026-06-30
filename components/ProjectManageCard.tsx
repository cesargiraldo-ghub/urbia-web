"use client";
import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setProjectStatus, deleteProject } from "@/app/panel/actions";
import { Project, money } from "@/lib/types";

export default function ProjectManageCard({ p }: { p: Project }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const published = p.status === "published";
  const href = p.organizations?.slug ? `/${p.organizations.slug}/proyectos/${p.slug}` : `/proyectos/${p.slug}`;

  function toggle() {
    start(async () => {
      const res: any = await setProjectStatus(p.id, published ? "draft" : "published");
      if (res?.error) { alert(res.error); return; }
      router.refresh();
    });
  }
  function remove() {
    if (!confirm(`¿Eliminar "${p.name}"? Esta acción no se puede deshacer.`)) return;
    start(async () => {
      await deleteProject(p.id);
      router.refresh();
    });
  }

  return (
    <div className="glass" style={{ overflow: "hidden", borderRadius: 20 }}>
      <div style={{ height: 150, backgroundImage: `url('${p.cover_url ?? ""}')`, backgroundSize: "cover", backgroundPosition: "center", background: p.cover_url ? undefined : "rgba(255,255,255,0.05)", position: "relative" }}>
        <span className={`badge ${published ? "b-ok" : "b-cold"}`} style={{ position: "absolute", top: 12, left: 12 }}>
          {published ? "Publicado" : "Borrador"}
        </span>
      </div>
      <div style={{ padding: "14px 16px 16px" }}>
        <h3 className="font-display" style={{ fontSize: 17 }}>{p.name}</h3>
        <div className="loc" style={{ marginTop: 4 }}>📍 {p.city}</div>
        <div className="price" style={{ fontSize: 17 }}>{money(p.price_from, p.currency ?? "COP")}</div>
        <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
          <button className={`btn ${published ? "btn-ghost" : "btn-primary"}`} style={{ padding: "9px 14px", fontSize: 13 }} onClick={toggle} disabled={pending}>
            {pending ? "..." : published ? "Despublicar" : "Publicar"}
          </button>
          <Link className="btn btn-ghost" href={`/panel/proyecto/${p.id}`} style={{ padding: "9px 14px", fontSize: 13 }}>Editar</Link>
          <Link className="btn btn-ghost" href={href} style={{ padding: "9px 14px", fontSize: 13 }}>Ver</Link>
          <button className="btn btn-ghost" style={{ padding: "9px 12px", fontSize: 13, color: "#FF7A8A" }} onClick={remove} disabled={pending} title="Eliminar">🗑</button>
        </div>
      </div>
    </div>
  );
}
