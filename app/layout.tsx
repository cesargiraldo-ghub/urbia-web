import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });

export const metadata: Metadata = {
  title: "URBIA · Portal inmobiliario impulsado por IA",
  description:
    "El primer portal de LATAM exclusivo para constructoras y desarrolladoras, impulsado por IA que genera citas calificadas.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${jakarta.variable} ${sora.variable} font-sans`}>
        <div className="bg-mesh" />
        <div className="bg-orbs">
          <span className="orb a" /><span className="orb b" /><span className="orb c" />
        </div>
        <Nav />
        <main>{children}</main>
        <footer style={{ padding: "40px 0", borderTop: "1px solid var(--stroke-soft)", marginTop: 40, color: "var(--muted)", fontSize: 13 }}>
          <div className="wrap" style={{ display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
            <span>URBIA — El primer portal de LATAM impulsado por IA que genera citas calificadas.</span>
            <span>© {new Date().getFullYear()} URBIA</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
