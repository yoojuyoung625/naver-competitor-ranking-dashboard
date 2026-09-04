import { mkdir, readFile, writeFile } from "node:fs/promises";

const gasUrl = process.env.COLLECTOR_GAS_WEB_APP_URL;
const sharedSecret = process.env.COLLECTOR_SHARED_SECRET;
if (!gasUrl || !sharedSecret) throw new Error("COLLECTOR_GAS_WEB_APP_URL과 COLLECTOR_SHARED_SECRET이 필요합니다.");

const response = await fetch(gasUrl, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ action: "finalizeYesterday", secret: sharedSecret }),
});
if (!response.ok) throw new Error(`전일 확정 실패: ${response.status}`);
const payload = await response.json();
if (!payload.ok) throw new Error(payload.error || "전일 확정 실패");
if (!payload.data?.observations?.length) throw new Error(`${payload.date} 수집 데이터가 없어 기존 공개 데이터를 유지합니다.`);

await mkdir("public/data", { recursive: true });
let previous = { observations: [] };
try {
  previous = JSON.parse(await readFile("public/data/latest.json", "utf8"));
} catch {}
const byId = new Map((previous.observations ?? []).map((row) => [row.id, row]));
for (const row of payload.data.observations) byId.set(row.id, row);
const data = { generatedAt: payload.data.generatedAt, throughDate: payload.date, observations: [...byId.values()] };
await writeFile("public/data/latest.json", JSON.stringify(data, null, 2));
console.log(JSON.stringify({ ok: true, date: payload.date, added: payload.data.observations.length, total: data.observations.length }));
