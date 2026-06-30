// WhatsApp de contacto por defecto (se usa si el proyecto no tiene uno propio).
export const WA_DEFAULT = "https://wa.link/saxwr3";

// Secciones de imágenes del proyecto.
export const MEDIA_SECTIONS: { key: string; label: string }[] = [
  { key: "galeria", label: "Galería principal" },
  { key: "casa", label: "Casas" },
  { key: "apartamento", label: "Apartamentos" },
  { key: "lote", label: "Lotes" },
  { key: "amenidades", label: "Amenidades" },
  { key: "zonas-comunes", label: "Zonas comunes" },
  { key: "sitios-cercanos", label: "Sitios cercanos" },
  { key: "planos", label: "Planos" },
];

export const SECTION_LABEL: Record<string, string> = Object.fromEntries(
  MEDIA_SECTIONS.map((s) => [s.key, s.label])
);
