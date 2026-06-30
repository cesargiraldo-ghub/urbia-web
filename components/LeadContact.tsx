import { Lead, waFromPhone } from "@/lib/types";

const chip = {
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  width: 28, height: 28, borderRadius: 8, fontSize: 14,
  border: "1px solid var(--stroke-soft)", background: "rgba(255,255,255,0.05)",
} as const;

export default function LeadContact({ lead }: { lead: Lead }) {
  const wa = waFromPhone(lead.phone);
  return (
    <span style={{ display: "inline-flex", gap: 6, marginLeft: 8, verticalAlign: "middle" }}>
      {lead.phone && (
        <a href={`tel:${lead.phone}`} title={`Llamar ${lead.phone}`} style={chip}>📞</a>
      )}
      {wa && (
        <a href={wa} target="_blank" rel="noopener noreferrer" title="WhatsApp" style={{ ...chip, color: "#25D366" }}>💬</a>
      )}
      {lead.email && (
        <a href={`mailto:${lead.email}`} title={lead.email} style={chip}>✉️</a>
      )}
    </span>
  );
}
