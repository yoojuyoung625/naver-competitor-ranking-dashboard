export type Device = "ALL" | "PC" | "MOBILE";
export type ObservationDevice = Exclude<Device, "ALL">;
export type CollectionStatus = "SUCCESS" | "PARTIAL" | "FAILED";

export interface RankingObservation {
  id: string;
  keyword: string;
  device: ObservationDevice;
  observedAt: string;
  company: string;
  rank: number | null;
  placement: "POWER_LINK" | "OTHER";
  screenshotPath: string | null;
  status: CollectionStatus;
  naverPay?: boolean;
  collectorVersion: string;
}

export interface DashboardFilters {
  keyword: string;
  device: Device;
  month: string;
  company: string | null;
}

export interface CompanySummary {
  company: string;
  averageRank: number | null;
  firstPlaceShare: number;
  exposureShare: number;
  observations: number;
}
