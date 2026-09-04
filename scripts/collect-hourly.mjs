import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { companyRules, devices, keywords } from "./collector-config.mjs";

const gasUrl = process.env.COLLECTOR_GAS_WEB_APP_URL;
const sharedSecret = process.env.COLLECTOR_SHARED_SECRET;
const dryRun = process.env.COLLECTOR_DRY_RUN === "1";
if (!dryRun && (!gasUrl || !sharedSecret)) throw new Error("COLLECTOR_GAS_WEB_APP_URL과 COLLECTOR_SHARED_SECRET이 필요합니다.");

const observedAt = new Date().toISOString();
const stamp = observedAt.replaceAll(":", "-").replaceAll(".", "-");
const outputDir = `screenshots/${stamp}`;
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const results = [];

try {
  for (const [device, profile] of Object.entries(devices)) {
    const context = await browser.newContext({ viewport: profile.viewport, userAgent: profile.userAgent, locale: "ko-KR", timezoneId: "Asia/Seoul" });
    for (const keyword of keywords) {
      const page = await context.newPage();
      const screenshotPath = `${outputDir}/${device}-${encodeURIComponent(keyword)}.png`;
      const htmlPath = `${outputDir}/${device}-${encodeURIComponent(keyword)}.html`;
      const target = `https://search.naver.com/search.naver?query=${encodeURIComponent(keyword)}`;
      try {
        await page.goto(target, { waitUntil: "domcontentloaded", timeout: 30_000 });
        await page.locator("#power_link_body").waitFor({ state: "visible", timeout: 12_000 });
        const ads = await page.locator(profile.adSelector).evaluateAll((items) =>
          items.map((item, index) => {
            const badges = [...item.querySelectorAll(".icon_npay")];
            const hasNaverPay = badges.some((badge) => {
              const style = getComputedStyle(badge);
              return style.display !== "none" && style.visibility !== "hidden" && badge.getBoundingClientRect().width > 0;
            });
            return { rank: index + 1, text: item.textContent?.replace(/\s+/g, " ").trim() ?? "", hasNaverPay };
          }),
        );
        await page.screenshot({ path: screenshotPath, fullPage: true });
        if (dryRun) await writeFile(htmlPath, await page.content(), "utf8");
        const placements = ads.flatMap((ad) => {
          const rule = companyRules.find((candidate) => candidate.patterns.some((pattern) => pattern.test(ad.text)));
          return rule ? [{ company: rule.company, rank: ad.rank, placement: "POWER_LINK", hasNaverPay: ad.hasNaverPay }] : [];
        }).reduce((selected, item) => {
          const previous = selected.get(item.company);
          if (!previous || (!previous.hasNaverPay && item.hasNaverPay)) selected.set(item.company, item);
          return selected;
        }, new Map());
        const selectedPlacements = [...placements.values()].map(({ hasNaverPay, ...item }) => ({ ...item, naverPay: hasNaverPay }));
        results.push({ keyword, device, observedAt, placements: selectedPlacements, screenshotPath, status: selectedPlacements.length ? "SUCCESS" : "PARTIAL", message: null });
      } catch (error) {
        await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => undefined);
        results.push({ keyword, device, observedAt, placements: [], screenshotPath, status: "FAILED", message: error instanceof Error ? error.message : String(error) });
      } finally {
        await page.close();
      }
    }
    await context.close();
  }
} finally {
  await browser.close();
}

await writeFile(`${outputDir}/results.json`, JSON.stringify(results, null, 2));
if (dryRun) {
  console.log(JSON.stringify({ ok: true, dryRun: true, observedAt, targets: results.length, results }, null, 2));
  process.exit(0);
}
const response = await fetch(gasUrl, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ action: "appendHourly", secret: sharedSecret, results }),
});
if (!response.ok) throw new Error(`Apps Script 저장 실패: ${response.status}`);
const payload = await response.json();
if (!payload.ok) throw new Error(payload.error || "Apps Script 저장 실패");
console.log(JSON.stringify({ ok: true, observedAt, targets: results.length, failed: results.filter((row) => row.status === "FAILED").length }));
