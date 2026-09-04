export const keywords = ["자동차보험", "다이렉트자동차보험", "비교견적사이트", "자동차보험비교"];

export const companyRules = [
  { company: "삼성", patterns: [/삼성화재/i, /samsungfire\.com/i] },
  { company: "KB", patterns: [/KB손해보험/i, /kbinsure\.co\.kr/i, /kbcarinsure\.co\.kr/i] },
  { company: "DB", patterns: [/DB손해보험/i, /directdb\.co\.kr/i] },
  { company: "현대", patterns: [/현대해상/i, /direct\.hi\.co\.kr/i] },
  { company: "AXA", patterns: [/AXA/i, /axa\.co\.kr/i, /axakorea\.com/i] },
  { company: "캐롯", patterns: [/캐롯/i, /carrotins\.com/i] },
  { company: "네이버페이", patterns: [/네이버페이/i] },
];

export const devices = {
  PC: { viewport: { width: 1440, height: 1600 }, userAgent: undefined, adSelector: "#power_link_body .lst_type > li" },
  MOBILE: {
    viewport: { width: 390, height: 844 },
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1",
    adSelector: "#power_link_body > li",
  },
};
