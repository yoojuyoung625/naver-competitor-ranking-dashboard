import { useEffect, useMemo, useState } from "react";
import { Activity, Bot, CheckCircle2, Clock3, Database, Sparkles } from "lucide-react";
import { FilterBar } from "./components/FilterBar";
import { RankingChart } from "./components/RankingChart";
import { RankingTable } from "./components/RankingTable";
import { TimeSegmentPanel } from "./components/TimeSegmentPanel";
import { HourlyBoard } from "./components/HourlyBoard";
import { sampleObservations } from "./data/sample";
import { filterObservations, hourlySeries, summarizeCompanies } from "./lib/analytics";
import type { DashboardFilters, RankingObservation } from "./types";

export function App() {
  const [observations, setObservations] = useState<RankingObservation[]>(sampleObservations);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [filters, setFilters] = useState<DashboardFilters>({ keyword: "자동차보험", device: "ALL", month: "2026-09", company: null });
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/latest.json`, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("확정 데이터 없음");
        return response.json();
      })
      .then((payload) => {
        if (Array.isArray(payload.observations) && payload.observations.length) {
          setObservations(payload.observations);
          setGeneratedAt(payload.generatedAt ?? null);
        }
      })
      .catch(() => undefined);
  }, []);
  const scoped = useMemo(() => filterObservations(observations, filters), [observations, filters]);
  const fullScope = useMemo(() => filterObservations(observations, { ...filters, company: null }), [observations, filters]);
  const summaries = useMemo(() => summarizeCompanies(fullScope).sort((a, b) => (a.averageRank ?? 99) - (b.averageRank ?? 99)), [fullScope]);
  const series = useMemo(() => hourlySeries(scoped), [scoped]);
  const visibleCompanies = filters.company ? [filters.company] : summaries.map((row) => row.company);
  const ranked = scoped.filter((row) => row.rank !== null);
  const averageRank = ranked.length ? ranked.reduce((sum, row) => sum + (row.rank ?? 0), 0) / ranked.length : 0;
  const successRate = scoped.length ? scoped.filter((row) => row.status === "SUCCESS").length / scoped.length : 0;

  return (
    <main>
      <header className="hero">
        <div>
          <span className="eyebrow"><Sparkles size={14} /> AI RANKING INTELLIGENCE</span>
          <h1>타사 순위 분석 솔루션 <em>(AI)</em></h1>
          <p>검색 노출 순위의 시간대별 변화와 경쟁사 운영 패턴을 한 화면에서 분석합니다.</p>
        </div>
        <div className="sync-status"><span className="pulse" /><div><strong>{generatedAt ? "전일 데이터 확정" : "데모 데이터 표시"}</strong><small>최근 업데이트 {generatedAt ? new Date(generatedAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }) : "연동 전"}</small></div></div>
      </header>

      <FilterBar filters={filters} onChange={setFilters} />

      <section className="kpi-grid">
        <article className="kpi"><Activity /><span>평균 순위</span><strong>{averageRank.toFixed(2)}위</strong><small>숫자가 낮을수록 우위</small></article>
        <article className="kpi"><CheckCircle2 /><span>수집 성공률</span><strong>{(successRate * 100).toFixed(1)}%</strong><small>부분 수집 별도 표기</small></article>
        <article className="kpi"><Database /><span>분석 표본</span><strong>{ranked.length.toLocaleString()}</strong><small>현재 필터 기준</small></article>
        <article className="kpi"><Clock3 /><span>분석 시간대</span><strong>24H</strong><small>1시간 간격 추적</small></article>
      </section>

      <section className="insight-card">
        <div className="ai-icon"><Bot /></div>
        <div><span className="eyebrow dark">AI OPERATION INSIGHT</span><h2>운영 전략 및 패턴 분석</h2><p><b>{summaries[0]?.company}</b>이 현재 조건에서 가장 높은 평균 순위를 유지하고 있습니다. 오후 시간대의 경쟁 강도가 높아지며, 모바일의 업체 간 순위 변동폭이 PC보다 크게 나타납니다.</p></div>
        <button>상세 인사이트</button>
      </section>

      <section className="card chart-card">
        <div className="card-head"><div><span className="eyebrow dark">RANKING TREND</span><h2>일자별 평균 순위 흐름</h2></div><div className="chart-actions"><div className="legend">{visibleCompanies.map((company) => <span key={company}>{company}</span>)}</div><HourlyBoard rows={scoped} /></div></div>
        <RankingChart data={series} companies={visibleCompanies} />
      </section>

      <TimeSegmentPanel rows={fullScope} />
      <RankingTable rows={summaries} focused={filters.company} onFocus={(company) => setFilters({ ...filters, company })} />

      <footer>무단 전재 및 재배포 금지 · MINDKNOCK</footer>
    </main>
  );
}
