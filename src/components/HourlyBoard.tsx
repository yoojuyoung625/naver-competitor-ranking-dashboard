import { useState } from "react";
import { Maximize2, X } from "lucide-react";
import { COMPANIES } from "../config";
import type { RankingObservation } from "../types";

export function HourlyBoard({ rows }: { rows: RankingObservation[] }) {
  const [open, setOpen] = useState(false);
  const slots = [...new Set(rows.map((row) => row.observedAt))].slice(-24);
  const findRank = (time: string, company: string) => rows.find((row) => row.observedAt === time && row.company === company)?.rank;
  return <>
    <button className="primary-button" onClick={() => setOpen(true)}><Maximize2 size={15} /> 24H 상세 랭킹보드</button>
    {open && <div className="modal-backdrop" role="presentation" onMouseDown={() => setOpen(false)}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="hourly-title" onMouseDown={(e) => e.stopPropagation()}>
        <div className="card-head"><div><span className="eyebrow dark">HOURLY RANKING</span><h2 id="hourly-title">24H 상세 랭킹보드</h2></div><button className="icon-button" aria-label="닫기" onClick={() => setOpen(false)}><X /></button></div>
        <div className="table-scroll hourly-scroll"><table><thead><tr><th>시간</th>{COMPANIES.map((company) => <th key={company}>{company}</th>)}</tr></thead><tbody>{slots.map((time) => <tr key={time}><td>{new Date(time).toLocaleString("ko-KR",{month:"numeric",day:"numeric",hour:"2-digit"})}</td>{COMPANIES.map((company) => <td key={company}>{findRank(time,company) ? `${findRank(time,company)}위` : "-"}</td>)}</tr>)}</tbody></table></div>
      </section>
    </div>}
  </>;
}
