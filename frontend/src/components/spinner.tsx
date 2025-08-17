import React from "react";

export default function Spinner({ label = "Processing..." }: { label?: string }) {
  return (
    <div style={{ display:"inline-flex", alignItems:"center", gap:8 }}>
      <div
        aria-label="loading"
        style={{
          width: 16,
          height: 16,
          border: "3px solid #ddd",
          borderTopColor: "#555",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite"
        }}
      />
      <span style={{ fontSize: 14, color: "#444" }}>{label}</span>
      <style>{`@keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
