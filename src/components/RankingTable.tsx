import { Download } from "lucide-react";
import { COMPANY_COLORS } from "../config";
import type { CompanySummary } from "../types";

type Props = { rows: CompanySummary[]; focused: string | null; onFocus: (company: string | null) => void };

export function RankingTable({ rows, focused, onFocus }: Props) {
  const downloadCsv = () => {
    const body = [
      ["업체명", "평균 순위", "1위 점유율", "노출률", "표본"],
      ...rows.map((row) => [row.company, row.averageRank?.toFixed(1) ?? "", (row.firstPlaceShare * 100).toFixed(1), (row.exposureShare * 100).toFixed(1), row.observations]),
    ].map((line) => line.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob(["\ufeff" + body], { type: "text/csv;charset=utf-8" }));
    link.download = "competitor-ranking-summary.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };
  return (
    <section className="card table-card">
      <div className="card-head">
        <div><span className="eyebrow dark">COMPETITOR PERFORMANCE</span><h2>업체별 통합 분석</h2></div>
        <button className="ghost-button" onClick={downloadCsv}><Download size={15} /> CSV 저장</button>
      </div>
      <div className="table-scroll">
        <table>
          <thead><tr><th>업체명</th><th>평균 순위</th><th>1위 점유율</th><th>노출률</th><th>표본</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.company} className={focused === row.company ? "focused" : ""} onClick={() => onFocus(focused === row.company ? null : row.company)}>
                <td><span className="company-dot" style={{ background: COMPANY_COLORS[row.company] }} />{row.company}</td>
                <td>{row.averageRank ? `${row.averageRank.toFixed(1)}위` : "미수집"}</td>
                <td>{(row.firstPlaceShare * 100).toFixed(1)}%</td>
                <td>{Math.min(100, row.exposureShare * 100).toFixed(1)}%</td>
                <td>{row.observations.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
