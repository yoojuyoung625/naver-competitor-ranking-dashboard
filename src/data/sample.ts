import { COMPANIES, KEYWORDS } from "../config";
import type { RankingObservation } from "../types";

const start = new Date("2026-09-01T00:00:00+09:00");

export const sampleObservations: RankingObservation[] = Array.from({ length: 72 }, (_, hour) =>
  (["PC", "MOBILE"] as const).flatMap((device, deviceIndex) =>
    KEYWORDS.flatMap((keyword, keywordIndex) =>
      COMPANIES.map((company, companyIndex) => {
        const observedAt = new Date(start.getTime() + hour * 3_600_000).toISOString();
        const rhythm = Math.sin((hour + companyIndex * 2) / 4) * 1.15;
        const base = companyIndex === 0 ? 3.4 : companyIndex + 2.3;
        const rawRank = Math.round((base + rhythm + keywordIndex * 0.22 + deviceIndex * 0.18) * 2) / 2;
        const absent = (hour + companyIndex * 5 + keywordIndex) % 29 === 0;
        return {
          id: `${hour}-${device}-${keywordIndex}-${companyIndex}`,
          keyword,
          device,
          observedAt,
          company,
          rank: absent ? null : Math.max(1, Math.min(10, rawRank)),
          placement: "POWER_LINK",
          screenshotPath: null,
          status: absent ? "PARTIAL" : "SUCCESS",
          collectorVersion: "sample-1.0.0",
        } satisfies RankingObservation;
      }),
    ),
  ),
).flat();
