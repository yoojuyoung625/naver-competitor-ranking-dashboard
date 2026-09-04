# Google Apps Script 설치

1. 본인 Google 계정에서 새 Google 스프레드시트를 만듭니다.
2. `확장 프로그램 → Apps Script`를 엽니다.
3. `Code.gs` 내용을 붙여 넣고 저장합니다.
4. 프로젝트 설정의 스크립트 속성에 `COLLECTOR_SHARED_SECRET`을 추가합니다.
5. `배포 → 새 배포 → 웹 앱`에서 실행 사용자를 본인으로 설정합니다.
6. 웹 앱 URL을 GitHub 저장소 Secret `COLLECTOR_GAS_WEB_APP_URL`에 저장합니다.
7. 같은 공유 비밀값을 GitHub Secret `COLLECTOR_SHARED_SECRET`에 저장합니다.

실제 URL과 공유 비밀값은 코드나 README에 기록하지 않습니다.
