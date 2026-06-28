"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true); setMsg(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password: pass, options: { data: { full_name: name } },
        });
        if (error) throw error;
        setMsg("Cuenta creada. Revisa tu correo si se requiere confirmación.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) throw error;
        router.push("/panel");
      }
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="wrap" style={{ paddingTop: 60, maxWidth: 460 }}>
      <div className="glass" style={{ padding: 30 }}>
        <span className="eyebrow">{mode === "signin" ? "Iniciar sesión" : "Crear cuenta"}</span>
        <h1 className="font-display" style={{ fontSize: 26, margin: "10px 0 20px" }}>
          {mode === "signin" ? "Bienvenido a URBIA" : "Únete a URBIA"}
        </h1>
        {mode === "signup" && (
          <div className="field" style={{ marginBottom: 14 }}>
            <label>Nombre completo</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        )}
        <div className="field" style={{ marginBottom: 14 }}>
          <label>Correo</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field" style={{ marginBottom: 14 }}>
          <label>Contraseña</label>
          <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} />
        </div>
        {msg && <p style={{ fontSize: 13, color: "var(--gold)", marginBottom: 12 }}>{msg}</p>}
        <button className="btn btn-primary" style={{ width: "100%" }} onClick={submit} disabled={loading}>
          {loading ? "..." : mode === "signin" ? "Entrar" : "Crear cuenta"}
        </button>
        <p className="muted" style={{ fontSize: 13.5, marginTop: 16, textAlign: "center", cursor: "pointer" }}
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
          {mode === "signin" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
        </p>
      </div>
    </section>
  );
}
