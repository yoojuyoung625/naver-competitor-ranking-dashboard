# 네이버 경쟁사 검색 순위 분석 대시보드

키워드·디바이스·시간대별 경쟁사 노출 순위를 수집하고 비교하는 분석 도구입니다. 기존 폐쇄망용 보고서의 정보 구조를 기준으로, 유지보수 가능한 React·TypeScript 프로젝트로 처음부터 다시 구성했습니다.

> 현재 화면은 공개 가능한 샘플 데이터로 동작합니다. 실제 네이버 검색화면 수집기는 정책 검토와 수집 조건 확정 후 `collector/SearchCaptureAdapter`로 연결합니다.

## 현재 구현

- 키워드, PC·모바일·통합, 월별 필터
- 평균 순위, 수집 성공률, 표본 수 KPI
- 업체별 고정 색상을 적용한 완만한 순위 추이 그래프
- 업체별 평균 순위·1위 점유율·노출률 비교
- 업체 클릭 집중 분석
- 모바일·태블릿 반응형 레이아웃
- 수집 결과와 실패 이력을 보존하는 데이터 계약
- 증빙 스크린샷을 분리 보관하는 API 설계

## 파일 구조

```text
DESIGN.md                 화면·데이터·보안 설계 기준
src/types.ts              공통 데이터 타입
src/config.ts             키워드·업체·색상·시간대 설정
src/data/sample.ts        공개용 샘플 데이터
src/lib/analytics.ts      평균 순위와 점유율 계산
src/components/           필터·차트·표 컴포넌트
src/App.tsx               대시보드 화면 조합
collector/                예약 수집 및 캡처 인터페이스
server/schema.sql         누적 저장 스키마
server/API.md             조회·재시도·스크린샷 API 계약
```

## 실행

```bash
pnpm install
pnpm dev
```

개발 화면은 기본적으로 `http://localhost:5173`에서 열립니다.

## 빌드

```bash
pnpm build
```

생성된 `dist` 폴더는 GitHub Pages 같은 정적 호스팅에 배포할 수 있습니다.

## 실제 수집 연결 전 확인사항

1. 키워드별 PC·모바일 수집 시간과 빈도
2. 순위로 인정할 네이버 광고 영역
3. 회사명과 광고 도메인 매핑 기준
4. 비로그인·지역·브라우저 화면 크기 고정값
5. 네이버 이용약관 및 robots 정책
6. 스크린샷 보존 기간과 접근 권한

CAPTCHA 또는 접근 제한을 우회하는 기능은 구현하지 않습니다.

예약 시각은 GitHub Actions의 UTC 기준으로 설정되어 있습니다.

- 매시 5분: PC·모바일 순위 수집 및 원본 누적
- 매일 00:00 UTC = 한국시간 오전 9시: 전일 데이터 확정 및 `latest.json` 갱신
- GitHub 예약 작업은 플랫폼 상황에 따라 몇 분 정도 지연될 수 있습니다.

## Google Apps Script 연결

기존 보고서의 Apps Script 주소는 사용하지 않습니다. 본인 계정에서 새 웹 앱을 만든 뒤 서버의 `.env`에만 다음 값을 입력합니다.

```env
COLLECTOR_GAS_WEB_APP_URL=https://script.google.com/macros/s/본인_배포_ID/exec
COLLECTOR_SHARED_SECRET=충분히_긴_임의값
```

Apps Script 주소와 공유 비밀값을 `src` 파일, GitHub Actions 로그 또는 공개 HTML에 직접 작성하지 않습니다. 브라우저는 Apps Script를 직접 호출하지 않고 내부 서버 API를 통해 필요한 집계 데이터만 조회하도록 구성합니다.

## 보안

- 비밀키는 `.env`에만 저장하며 Git에 커밋하지 않습니다.
- 실제 스크린샷과 내부 원본 데이터는 `screenshots/`, `data/private/`에 저장하며 Git에서 제외합니다.
- 브라우저로 전달되는 환경변수에는 비밀값을 넣지 않습니다.
- 공개 포트폴리오에는 샘플 데이터만 사용합니다.
- 저장소를 공개해도 실제 Apps Script 주소와 운영 데이터는 포함하지 않습니다.
