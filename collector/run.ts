import type { CaptureResult, CollectionTarget, SearchCaptureAdapter } from "./types";

export interface CollectionRepository {
  saveResult(result: CaptureResult): Promise<void>;
}

export async function runCollection(
  targets: CollectionTarget[],
  adapter: SearchCaptureAdapter,
  repository: CollectionRepository,
) {
  const results: CaptureResult[] = [];

  for (const target of targets) {
    try {
      const result = await adapter.capture(target);
      await repository.saveResult(result);
      results.push(result);
    } catch (error) {
      const failed: CaptureResult = {
        target,
        observedAt: new Date().toISOString(),
        screenshotPath: null,
        placements: [],
        status: "FAILED",
        message: error instanceof Error ? error.message : "알 수 없는 수집 오류",
      };
      await repository.saveResult(failed);
      results.push(failed);
    }
  }

  return results;
}
