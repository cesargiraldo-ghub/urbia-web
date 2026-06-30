import Link from "next/link";
import { Project, money } from "@/lib/types";

export default function ProjectCard({ p, match }: { p: Project; match?: number }) {
  const href = p.organizations?.slug ? `/${p.organizations.slug}/proyectos/${p.slug}` : `/proyectos/${p.slug}`;
  return (
    <Link href={href} className="card glass">
      <div className="img" style={{ backgroundImage: `url('${p.cover_url ?? ""}')` }}>
        {p.tag && <span className="tag">{p.tag}</span>}
        {match != null && <span className="match">{match}% match</span>}
      </div>
      <div className="body">
        <h3 className="font-display" style={{ fontSize: 18, marginBottom: 4 }}>{p.name}</h3>
        <div className="loc">📍 {p.city}</div>
        <div className="price">
          {money(p.price_from, p.currency ?? "COP")}{" "}
          <small style={{ display: "block", fontSize: 11.5, color: "var(--muted)", fontWeight: 500 }}>
            desde · cuota inicial {p.down_payment_pct}%
          </small>
        </div>
        <div className="meta">
          <span>🏠 {p.type === "houses" ? "Casas" : p.type === "mixed" ? "Mixto" : "Apartamentos"}</span>
          <span>🗓 {p.delivery_date}</span>
        </div>
      </div>
    </Link>
  );
}
