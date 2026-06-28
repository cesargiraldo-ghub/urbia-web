import Link from "next/link";

const LOGO = "https://assets.cdn.filesafe.space/Ne8Gd3eTKEAUShnTXouw/media/69753298c1fa0c111e610e4b.png";

export default function Nav() {
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 50, padding: "14px 0", background: "rgba(7,10,23,0.55)", backdropFilter: "blur(18px)", borderBottom: "1px solid var(--stroke-soft)" }}>
      <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="URBIA" style={{ height: 32 }} />
        </Link>
        <nav style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <Link className="chip" href="/">Explorar</Link>
          <Link className="chip" href="/panel">Constructora</Link>
          <Link className="chip" href="/admin">Admin</Link>
          <Link className="btn btn-ghost" href="/login" style={{ padding: "10px 16px" }}>Iniciar sesión</Link>
          <Link className="btn btn-primary" href="/panel" style={{ padding: "10px 16px" }}>Publicar proyecto</Link>
        </nav>
      </div>
    </header>
  );
}
