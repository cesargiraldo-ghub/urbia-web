import { createClient } from "@/lib/supabase/server";
import ProjectCard from "@/components/ProjectCard";
import AISearch from "@/components/AISearch";
import { Project } from "@/lib/types";
import Link from "next/link";

export const revalidate = 60;

export default async function Home() {
  const supabase = createClient();
  const { data } = await supabase
    .from("projects")
    .select("*, organizations(name, logo_url)")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(6);
  const projects = (data ?? []) as Project[];

  const steps = [
    ["1", "Describe lo que buscas", "Habla con el buscador IA como con un asesor. Filtra por ubicación, presupuesto, tipología y entrega."],
    ["2", "Explora con detalle", "Renders, amenidades, plazos de entrega, simulador de crédito y cuota inicial en cada proyecto."],
    ["3", "URBIA te califica", "Por WhatsApp o en el portal, la IA entiende tu intención real y resuelve tus dudas al instante."],
    ["4", "Agenda tu cita", "Reserva una videollamada o visita presencial directamente con la constructora."],
  ];

  return (
    <>
      <section className="wrap" style={{ padding: "78px 0 34px", textAlign: "center" }}>
        <span className="pill">✦ Impulsado por inteligencia artificial</span>
        <h1 className="font-display grad-text" style={{ fontSize: "clamp(38px,6vw,64px)", margin: "18px auto", maxWidth: "14ch" }}>
          Encuentra tu próximo hogar o inversión, conversando con IA
        </h1>
        <p className="muted" style={{ fontSize: "clamp(16px,2vw,20px)", maxWidth: "60ch", margin: "0 auto 30px" }}>
          El primer portal de LATAM exclusivo para constructoras y desarrolladoras. Describe lo que buscas en lenguaje natural y URBIA te conecta con el proyecto ideal — y agenda tu cita.
        </p>
        <AISearch />
      </section>

      <section className="wrap" style={{ padding: "44px 0" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 26, flexWrap: "wrap", gap: 14 }}>
          <div>
            <span className="eyebrow">Destacados</span>
            <h2 className="font-display" style={{ fontSize: "clamp(26px,3.4vw,36px)" }}>Proyectos recomendados</h2>
          </div>
        </div>
        {projects.length === 0 ? (
          <div className="glass" style={{ padding: 30, textAlign: "center" }}>
            <p className="muted">No hay proyectos aún. Conecta Supabase y corre <code>urbia-schema.sql</code> para ver datos demo.</p>
          </div>
        ) : (
          <div className="grid-cards">
            {projects.map((p, i) => <ProjectCard key={p.id} p={p} match={97 - i * 3} />)}
          </div>
        )}
      </section>

      <section className="wrap" style={{ padding: "44px 0" }}>
        <span className="eyebrow">Así funciona</span>
        <h2 className="font-display" style={{ fontSize: "clamp(26px,3.4vw,36px)", marginBottom: 24 }}>De la búsqueda a la cita, sin fricción</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 18 }}>
          {steps.map(([n, t, d]) => (
            <div key={n} className="glass-soft" style={{ padding: 24 }}>
              <div className="font-display" style={{ width: 42, height: 42, borderRadius: 12, display: "grid", placeItems: "center", fontWeight: 800, background: "linear-gradient(100deg,var(--violet),var(--cyan))", color: "#06101f", marginBottom: 14 }}>{n}</div>
              <h3 className="font-display" style={{ fontSize: 18, marginBottom: 8 }}>{t}</h3>
              <p className="muted" style={{ fontSize: 14, lineHeight: 1.5 }}>{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap" style={{ padding: "44px 0" }}>
        <div className="glass" style={{ padding: 40, textAlign: "center", background: "linear-gradient(120deg,rgba(124,92,255,.16),rgba(34,211,238,.12))" }}>
          <span className="eyebrow">Para constructoras y desarrolladoras</span>
          <h2 className="font-display" style={{ fontSize: "clamp(26px,3.4vw,38px)", margin: "14px auto", maxWidth: "20ch" }}>
            ¿Vendes proyectos? URBIA te genera citas calificadas con IA
          </h2>
          <p className="muted" style={{ maxWidth: "60ch", margin: "0 auto 24px" }}>
            Publica tu proyecto pegando solo el link de tu web. En el plan Premium, URBIA llena tu calendario de citas con clientes listos para comprar.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link className="btn btn-primary" href="/login">Empezar como constructora</Link>
            <Link className="btn btn-ghost" href="/login">Ver planes</Link>
          </div>
        </div>
      </section>
    </>
  );
}
