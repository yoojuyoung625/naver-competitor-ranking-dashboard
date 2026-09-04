const RAW_SHEET = "hourly_observations";
const DAILY_SHEET = "daily_final";

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || "{}");
    assertSecret_(body.secret);
    if (body.action === "appendHourly") return json_(appendHourly_(body.results || []));
    if (body.action === "finalizeYesterday") return json_(finalizeYesterday_());
    throw new Error("지원하지 않는 action입니다.");
  } catch (error) {
    return json_({ ok: false, error: String(error.message || error) });
  }
}

function appendHourly_(results) {
  const sheet = sheet_(RAW_SHEET, ["observed_at", "keyword", "device", "company", "rank", "placement", "status", "screenshot_path", "message", "received_at", "naver_pay", "impression_weight"]);
  const rows = [];
  results.forEach(result => {
    if (!result.placements || !result.placements.length) {
      rows.push([result.observedAt, result.keyword, result.device, "", "", "", result.status, result.screenshotPath || "", result.message || "", new Date(), false, result.impressionWeight || ""]);
      return;
    }
    result.placements.forEach(item => rows.push([result.observedAt, result.keyword, result.device, item.company, item.rank, item.placement, result.status, result.screenshotPath || "", result.message || "", new Date(), Boolean(item.naverPay), item.impressionWeight || result.impressionWeight || ""]));
  });
  if (rows.length) sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
  return { ok: true, inserted: rows.length };
}

function finalizeYesterday_() {
  const tz = "Asia/Seoul";
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const targetDate = Utilities.formatDate(yesterday, tz, "yyyy-MM-dd");
  const raw = sheet_(RAW_SHEET, ["observed_at", "keyword", "device", "company", "rank", "placement", "status", "screenshot_path", "message", "received_at", "naver_pay", "impression_weight"]);
  const values = raw.getDataRange().getValues();
  const observations = values.slice(1).filter(row => dateKey_(row[0], tz) === targetDate && row[3] && row[4] !== "");
  const daily = sheet_(DAILY_SHEET, ["date", "keyword", "device", "company", "average_rank", "samples", "finalized_at"]);
  const existing = daily.getDataRange().getValues().slice(1).some(row => dateKey_(row[0], tz) === targetDate);
  if (existing) return { ok: true, date: targetDate, skipped: true, data: buildPayload_(targetDate, observations) };

  const groups = {};
  observations.forEach(row => {
    const key = [row[1], row[2], row[3]].join("|");
    groups[key] = groups[key] || { keyword: row[1], device: row[2], company: row[3], ranks: [] };
    groups[key].ranks.push(Number(row[4]));
  });
  const rows = Object.values(groups).map(group => [targetDate, group.keyword, group.device, group.company, group.ranks.reduce((a, b) => a + b, 0) / group.ranks.length, group.ranks.length, new Date()]);
  if (rows.length) daily.getRange(daily.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
  return { ok: true, date: targetDate, skipped: false, finalized: rows.length, data: buildPayload_(targetDate, observations) };
}

function buildPayload_(date, rows) {
  return {
    generatedAt: new Date().toISOString(),
    date: date,
    observations: rows.map((row, index) => ({
      id: [date, row[1], row[2], row[3], index].join("-"), keyword: row[1], device: row[2], observedAt: row[0], company: row[3], rank: Number(row[4]), impressionWeight: row[11] === "" || row[11] == null ? null : Number(row[11]), placement: row[5], screenshotPath: null, status: row[6], naverPay: Boolean(row[10]), collectorVersion: "gas-1.2.0"
    }))
  };
}

function sheet_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getLastRow() === 0) sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  if (sheet.getLastColumn() < headers.length) sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  return sheet;
}

function assertSecret_(value) {
  const expected = PropertiesService.getScriptProperties().getProperty("COLLECTOR_SHARED_SECRET");
  if (!expected || value !== expected) throw new Error("인증 실패");
}

function dateKey_(value, tz) {
  const date = value instanceof Date ? value : new Date(value);
  return isNaN(date.getTime()) ? String(value).slice(0, 10) : Utilities.formatDate(date, tz, "yyyy-MM-dd");
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
