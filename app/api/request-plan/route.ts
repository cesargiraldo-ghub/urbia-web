import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const ADMIN_EMAIL = "urbiapropiedades@gmail.com";

// La constructora solicita activar un plan. Registra la solicitud y notifica a URBIA.
export async function POST(req: Request) {
  const { plan } = await req.json();
  if (!plan) return NextResponse.json({ error: "plan requerido" }, { status: 400 });

  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { data: prof } = await supabase.from("profiles").select("org_id, email").eq("id", auth.user.id).single();
  let orgName = "Constructora";
  if (prof?.org_id) {
    const { data: org } = await supabase.from("organizations").select("name").eq("id", prof.org_id).single();
    orgName = org?.name ?? orgName;
  }
  const requesterEmail = prof?.email ?? auth.user.email ?? "";

  // Registrar la solicitud (la ve el admin de URBIA)
  await supabase.from("plan_requests").insert({
    org_id: prof?.org_id ?? null,
    org_name: orgName,
    requested_plan: plan,
    requester_email: requesterEmail,
  });

  // Notificar por correo (best-effort, requiere RESEND_API_KEY)
  if (process.env.RESEND_API_KEY) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "URBIA <onboarding@resend.dev>",
          to: [ADMIN_EMAIL],
          subject: `Solicitud de plan ${plan} — ${orgName}`,
          text: `La constructora ${orgName} (${requesterEmail}) ha solicitado la activación del plan: ${plan}.`,
        }),
      });
    } catch {
      // no bloquear la respuesta si el correo falla
    }
  }

  return NextResponse.json({ ok: true });
}
