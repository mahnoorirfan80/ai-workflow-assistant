import React from "react";

type Item = { label: string; value: string };

export default function PredefinedPrompts({
  title = "Quick picks",
  items,
  onPick
}: {
  title?: string;
  items: Item[];
  onPick: (value: string) => void;
}) {
  return (
    <div style={{ margin: "12px 0" }}>
      <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>{title}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {items.map((it) => (
          <button
            key={it.label}
            onClick={() => onPick(it.value)}
            style={{
              border: "1px solid #e2e2e2",
              background: "#fff",
              padding: "6px 10px",
              borderRadius: 10,
              fontSize: 12,
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
            }}
            title={it.label}
          >
            {it.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export const EMAIL_TEMPLATES: Item[] = [
  { label: "Sick Leave", value: "Write a professional sick leave email for 2 days; tone: polite, concise." },
  { label: "Resignation", value: "Draft a 2-weeks notice resignation email; appreciative tone; handover mentioned." },
  { label: "Follow-up", value: "Follow up on previous email regarding interview schedule; friendly yet professional." },
  { label: "Offer Acceptance", value: "Accept internship offer; confirm start date and required documents; appreciative tone." }
];

export const CHAT_QUICK_ASKS: Item[] = [
  { label: "Summarize text", value: "Summarize the following text in 5 bullet points:" },
  { label: "Improve tone", value: "Rewrite this to be concise and professional:" },
  { label: "Explain code", value: "Explain this code step-by-step like I'm a beginner:" },
  { label: "Draft email", value: "Help me draft an email for:" }
];
