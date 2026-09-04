import { Clock } from "lucide-react";
import { COMPANY_COLORS } from "../config";
import type { RankingObservation } from "../types";
import { timeSegmentSummary } from "../lib/analytics";

export function TimeSegmentPanel({ rows }: { rows: RankingObservation[] }) {
  const segments = timeSegmentSummary(rows);
  return (
    <section className="card">
      <div className="card-head"><div><span className="eyebrow dark">TIME SEGMENTS</span><h2>시간대별 플레이 분석</h2></div><Clock color="#64748b" /></div>
      <div className="segment-grid">
        {segments.map((segment) => {
          const best = segment.rankings[0];
          const worst = segment.rankings.at(-1);
          return <article className="segment" key={segment.id}>
            <span>{segment.label}</span><small>{String(segment.hours[0]).padStart(2,"0")}–{String(segment.hours.at(-1)).padStart(2,"0")}시</small>
            <strong>{best?.company ?? "미수집"}</strong>
            <div className="rank-bar"><i style={{ width: `${Math.max(8, 100 - (best?.average ?? 10) * 8)}%`, background: best ? COMPANY_COLORS[best.company] : "#cbd5e1" }} /></div>
            <small>우위 {best?.average.toFixed(2) ?? "-"}위 · 열위 {worst?.company ?? "-"}</small>
          </article>;
        })}
      </div>
    </section>
  );
}
