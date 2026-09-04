import type { CompanySummary, DashboardFilters, RankingObservation } from "../types";
import { TIME_SEGMENTS } from "../config";

export function filterObservations(rows: RankingObservation[], filters: DashboardFilters) {
  return rows.filter((row) => {
    const month = row.observedAt.slice(0, 7);
    return (
      row.keyword === filters.keyword &&
      month === filters.month &&
      (filters.device === "ALL" || row.device === filters.device) &&
      (!filters.company || row.company === filters.company)
    );
  });
}

export function summarizeCompanies(rows: RankingObservation[]): CompanySummary[] {
  const groups = new Map<string, RankingObservation[]>();
  rows.forEach((row) => groups.set(row.company, [...(groups.get(row.company) ?? []), row]));

  return [...groups.entries()].map(([company, values]) => {
    const ranked = values.filter((value) => value.rank !== null);
    const totalSlots = new Set(values.map((value) => value.observedAt)).size || 1;
    return {
      company,
      averageRank: ranked.length
        ? ranked.reduce((sum, value) => sum + (value.rank ?? 0), 0) / ranked.length
        : null,
      weightedAverageRank: (() => {
        const weighted = ranked.filter((value) => value.impressionWeight != null && value.impressionWeight > 0);
        const totalWeight = weighted.reduce((sum, value) => sum + value.impressionWeight!, 0);
        return totalWeight ? weighted.reduce((sum, value) => sum + value.rank! * value.impressionWeight!, 0) / totalWeight : null;
      })(),
      firstPlaceShare: ranked.filter((value) => value.rank === 1).length / totalSlots,
      exposureShare: ranked.length / totalSlots,
      observations: ranked.length,
    };
  });
}

export function hourlySeries(rows: RankingObservation[]) {
  const byHour = new Map<string, Record<string, number | string>>();
  rows.forEach((row) => {
    if (row.rank === null) return;
    const label = new Intl.DateTimeFormat("ko-KR", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
    }).format(new Date(row.observedAt));
    const record = byHour.get(label) ?? { time: label };
    const key = `_${row.company}`;
    const countKey = `${key}_count`;
    record[key] = Number(record[key] ?? 0) + row.rank;
    record[countKey] = Number(record[countKey] ?? 0) + 1;
    byHour.set(label, record);
  });

  return [...byHour.values()].map((record) => {
    const result: Record<string, number | string> = { time: record.time };
    Object.keys(record)
      .filter((key) => key.startsWith("_") && !key.endsWith("_count"))
      .forEach((key) => {
        const company = key.slice(1);
        result[company] = Number(record[key]) / Number(record[`${key}_count`]);
      });
    return result;
  });
}

export function timeSegmentSummary(rows: RankingObservation[]) {
  return TIME_SEGMENTS.map((segment) => {
    const values = rows.filter((row) => row.rank !== null && segment.hours.includes(new Date(row.observedAt).getHours() as never));
    const byCompany = new Map<string, number[]>();
    values.forEach((row) => byCompany.set(row.company, [...(byCompany.get(row.company) ?? []), row.rank!]));
    const rankings = [...byCompany.entries()]
      .map(([company, ranks]) => ({ company, average: ranks.reduce((sum, rank) => sum + rank, 0) / ranks.length }))
      .sort((a, b) => a.average - b.average);
    return { ...segment, rankings };
  });
}
