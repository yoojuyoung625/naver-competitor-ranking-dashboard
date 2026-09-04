export type CaptureDevice = "PC" | "MOBILE";

export interface CollectionTarget {
  keyword: string;
  device: CaptureDevice;
}

export interface CapturedPlacement {
  company: string;
  rank: number;
  placement: "POWER_LINK" | "OTHER";
}

export interface CaptureResult {
  target: CollectionTarget;
  observedAt: string;
  screenshotPath: string | null;
  placements: CapturedPlacement[];
  status: "SUCCESS" | "PARTIAL" | "FAILED";
  message: string | null;
}

export interface SearchCaptureAdapter {
  capture(target: CollectionTarget): Promise<CaptureResult>;
}
