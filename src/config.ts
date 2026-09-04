export const KEYWORDS = [
  "자동차보험",
  "다이렉트자동차보험",
  "비교견적사이트",
  "자동차보험비교",
] as const;

export const COMPANIES = ["삼성", "KB", "DB", "현대", "AXA", "캐롯", "네이버페이"] as const;

export const COMPANY_COLORS: Record<string, string> = {
  삼성: "#0057D9",
  KB: "#FFBC00",
  DB: "#008D62",
  현대: "#FF7000",
  AXA: "#00008F",
  캐롯: "#E60000",
  네이버페이: "#03C75A",
};

export const TIME_SEGMENTS = [
  { id: "DAWN", label: "새벽", hours: [0, 1, 2, 3, 4, 5] },
  { id: "COMMUTE_AM", label: "출근", hours: [6, 7, 8, 9] },
  { id: "WORK_AM", label: "오전", hours: [10, 11] },
  { id: "LUNCH", label: "점심", hours: [12, 13] },
  { id: "WORK_PM", label: "오후", hours: [14, 15, 16, 17] },
  { id: "COMMUTE_PM", label: "퇴근", hours: [18, 19, 20] },
  { id: "NIGHT", label: "심야", hours: [21, 22, 23] },
] as const;
