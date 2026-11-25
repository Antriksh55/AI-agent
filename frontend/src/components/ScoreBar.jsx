import React from "react";

export default function ScoreBar({ score, max = 100, category }) {
  const pct = Math.round((score / max) * 100);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: ".78rem" }}>
        <span style={{ color: "var(--text-secondary)" }}>Score</span>
        <span style={{ fontWeight: 600 }}>{score}/{max}</span>
      </div>
      <div className="score-bar">
        <div
          className={`score-bar-fill ${category || "cold"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
