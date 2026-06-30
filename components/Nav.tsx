import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";

const LOGO = "https://assets.cdn.filesafe.space/Ne8Gd3eTKEAUShnTXouw/media/69753298c1fa0c111e610e4b.png";

export default async function Nav() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let panelHref: string | null = null;
  if (user) {
    const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (prof?.role === "admin") panelHref = "/admin";
    else if (prof?.role === "builder") panelHref = "/panel";
  }

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 50, padding: "14px 0", background: "rgba(7,10,23,0.55)", backdropFilter: "blur(18px)", borderBottom: "1px solid var(--stroke-soft)" }}>
      <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="URBIA" style={{ height: 32 }} />
        </Link>
        <nav style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <Link className="chip" href="/">Explorar</Link>
          {user ? (
            <>
              {panelHref && <Link className="btn btn-ghost" href={panelHref} style={{ padding: "10px 16px" }}>Mi panel</Link>}
              <LogoutButton />
            </>
          ) : (
            <>
              <Link className="btn btn-ghost" href="/login" style={{ padding: "10px 16px" }}>Iniciar sesión</Link>
              <Link className="btn btn-primary" href="/login" style={{ padding: "10px 16px" }}>Publicar proyecto</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
