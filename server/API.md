# API 계약

## `GET /api/observations`

Query: `keyword`, `device`, `from`, `to`, `company`

응답은 `RankingObservation[]`이며, 완료된 관측값은 수정하지 않습니다.

## `GET /api/collection-runs`

수집 작업의 요청·성공·실패 개수와 재시도 상태를 반환합니다.

## `POST /api/collection-runs/:id/retry`

실패한 대상만 재시도 큐에 넣습니다. 기존 성공 데이터는 덮어쓰지 않습니다.

## `GET /api/screenshots/:id`

인증된 내부 사용자에게만 증빙 이미지를 반환합니다. 공개 대시보드에서는 호출하지 않습니다.
