import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Nav from "@/components/Nav";
import { WA_DEFAULT } from "@/lib/constants";

const META_PIXEL_ID = "2278603809611463";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });

export const metadata: Metadata = {
  title: "URBIA · Portal inmobiliario impulsado por IA",
  description:
    "El primer portal de LATAM exclusivo para constructoras y desarrolladoras, impulsado por IA que genera citas calificadas.",
  icons: {
    icon: "https://assets.cdn.filesafe.space/Ne8Gd3eTKEAUShnTXouw/media/6a3add5bae7d47683920d46a.jpg",
    apple: "https://assets.cdn.filesafe.space/Ne8Gd3eTKEAUShnTXouw/media/6a3add5bae7d47683920d46a.jpg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${jakarta.variable} ${sora.variable} font-sans`}>
        <Script id="meta-pixel" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');fbq('track','PageView');
        ` }} />
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img height="1" width="1" style={{ display: "none" }} alt="" src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`} />
        </noscript>
        <div className="bg-mesh" />
        <div className="bg-orbs">
          <span className="orb a" /><span className="orb b" /><span className="orb c" />
        </div>
        <Nav />
        <main>{children}</main>
        <a href={WA_DEFAULT} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
          style={{ position: "fixed", right: 22, bottom: 22, zIndex: 60, width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#25D366,#128C7E)", display: "grid", placeItems: "center", boxShadow: "0 12px 30px rgba(37,211,102,0.4)" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
        </a>
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
