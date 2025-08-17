import React from "react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  };

  return (
    <button
      onClick={copy}
      style={{
        padding: "6px 10px",
        fontSize: 12,
        borderRadius: 8,
        border: "1px solid #ddd",
        background: copied ? "#e8f8ed" : "#f7f7f7",
        cursor: "pointer"
      }}
      title="Copy response"
    >
      {copied ? "Copied ✓" : "Copy"}
    </button>
  );
}
