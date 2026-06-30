import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Nav from "@/components/Nav";

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
