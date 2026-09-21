# Chord Progression Manager Next.js Full-stack TODO

개발 기준 문서:

- `development_plan.md`
- `functional_specification.md`
- `product_plan.md`
- `progression/README.md`

## 개발 원칙

- Next.js App Router, TypeScript, Node.js 22+와 SQLite를 기준으로 개발한다.
- Client UI와 Backend API는 하나의 Next.js 앱에서 제공한다.
- 현재 프로젝트 루트의 `app/` 아래에 애플리케이션 코드를 구현한다.
- UI는 `app/`과 React Component, Backend는 `app/api/**/route.ts`와 `app/lib/server/` 모듈로 구성한다.
- 프론트엔드 없이 Node 내장 테스트와 HTTP API 테스트로 각 단계를 검증한다.
- 프로젝트 편집은 클라이언트 초안으로 유지하고, 명시적인 전체 저장 요청에서만 SQLite에 반영한다.
- 기본 추천 진행과 사용자 진행을 분리한다.
- 모든 내부 도수는 대문자 로마 숫자로 정규화한다.
- 코드 속성은 유한 카탈로그로 검증한다.
- 추천은 4마디·4코드 블록 단위로만 처리한다.

## 병렬 작업 운영 규칙

- `[P]`는 같은 Wave에서 동시에 진행할 수 있는 작업이다.
- `[G]`는 다음 Wave로 넘어가기 전에 반드시 통과해야 하는 Gate다.
- 병렬 작업은 서로 다른 모듈·파일을 담당한다. 공통 계약 파일을 동시에 수정하지 않는다.
- DB 스키마, 도수 정규화, 코드 카탈로그가 바뀌면 관련 병렬 작업을 멈추고 계약을 먼저 갱신한다.
- 실제 병렬 실행 시에는 각 작업의 테스트가 통과한 뒤 통합한다.

## 병렬 실행 Wave

### Wave 0. 개발 기반 준비

선행 조건: 없음

- `[P]` Next.js App Router 프로젝트·TypeScript 설정
- `[P]` App Router 레이아웃·기본 Client UI 셸 작성
- `[P]` Route Handler API 라우팅 뼈대 작성
- `[P]` `app/lib/server/` 서버 전용 모듈 구조 작성
- `[P]` SQLite 연결·DB 경로 모듈 작성
- `[P]` `node:test` 테스트 러너와 테스트 DB 유틸리티 작성
- `[P]` API 공통 응답·에러 형식 정의

`[G0]` Next.js 앱 실행, 기본 UI 표시, Route Handler 호출, 테스트 실행, 테스트 DB 생성·삭제가 모두 가능해야 한다.

### Wave 1. 도메인·스키마·시드 기반

선행 조건: `[G0]`

- `[P]` 조성·도수·코드 카탈로그 정의
- `[P]` 11개 테이블 마이그레이션 작성
- `[P]` JSON 추천 데이터 로더·정규화기 작성
- `[P]` 기법 `rule_type`별 JSON 스키마와 규칙 시드 작성

의존성:

- JSON 정규화기는 도수·코드 카탈로그 확정 후 통합한다.
- 시드 적재는 마이그레이션과 정규화기가 모두 준비된 후 실행한다.

`[G1]` clean DB에서 11개 테이블 생성, 추천 160행·스텝 640행 적재, 카탈로그 검증이 통과해야 한다.

### Wave 2. 순수 도메인 엔진

선행 조건: `[G1]`과 카탈로그 계약

- `[P]` 장조 다이어토닉 코드 생성
- `[P]` 도수·코드 속성 → 실제 코드명 변환
- `[P]` 슬래시 코드 베이스 계산
- `[P]` 4마디 블록 분할·복수 코드 제외 판정
- `[P]` 사용자 진행 4토큰·와일드카드 매칭

`[G2]` DB와 HTTP 서버 없이 순수 로직 테스트가 통과해야 한다.

### Wave 3. 저장소·Meta API

선행 조건: `[G2]` 및 마이그레이션

- `[P]` 프로젝트 Repository와 전체 저장 트랜잭션
- `[P]` 사용자 진행 Repository
- `[P]` Meta API와 코드 변환 API
- `[P]` 프로젝트 payload 검증기

의존성:

- 프로젝트 API는 프로젝트 Repository 완료 후 시작한다.
- 사용자 진행 API는 사용자 진행 Repository 완료 후 시작한다.

`[G3]` 프로젝트 저장·롤백·CASCADE와 Meta API 통합 테스트가 통과해야 한다.

### Wave 4. 프로젝트·조회 API·기본 UI

선행 조건: `[G3]`

- `[P]` 프로젝트 생성·목록·상세·삭제 API
- `[P]` 명시적 전체 저장 `PUT /api/projects/:id`
- `[P]` 송폼·코드 차트 조회 API
- `[P]` 프로젝트 목록·송폼·조성 선택 기본 화면
- `[P]` 프로젝트 API 오류·트랜잭션 테스트

편집 mutation API는 만들지 않는다. 송폼·코드·추천 적용은 Client Component의 초안 상태에서 처리한다.

`[G4]` 프로젝트 생성 → 조회 → 초안 payload 전체 저장 → 재조회 흐름이 API만으로 동작해야 한다.

### Wave 5. 추천·기법·사용자 진행 UI/API

선행 조건: `[G4]` 및 시스템 시드 데이터

- `[P]` 추천 블록 계산 및 추천 조건 매칭
- `[P]` 추천 정렬·페이지네이션 API
- `[P]` 기법 JSON 규칙 엔진
- `[P]` 기법 분석 API
- `[P]` 사용자 진행 CRUD API
- `[P]` 사용자 진행 와일드카드 검색 API
- `[P]` 4마디 추천 패널·기법 분석 패널·사용자 진행 화면

의존성:

- 추천 API는 추천 Repository와 블록 엔진이 준비된 후 시작한다.
- 기법 API는 typed JSON 스키마와 기법 규칙 시드가 준비된 후 시작한다.
- 사용자 진행 API는 시스템 추천 API와 분리해 독립적으로 진행한다.

`[G5]` 추천·기법·사용자 진행 API가 서로의 데이터를 조회하거나 변경하지 않아야 한다.

### Wave 6. 통합 검증

선행 조건: `[G5]`

- `[P]` clean DB 마이그레이션·시드 재현 테스트
- `[P]` 프로젝트 전체 저장·롤백 테스트
- `[P]` 추천 정렬 4종 테스트
- `[P]` 기법 priority·블록 경계 테스트
- `[P]` 사용자 진행 검색 테스트
- `[P]` API 공통 오류 테스트

`[G6]` 프론트엔드 없이 시나리오 A·B·C를 API 요청으로 검증할 수 있어야 한다.

## 병렬 작업을 시작하지 않는 경우

- 도수 표기 또는 코드 카탈로그가 변경 중인 경우
- 11개 테이블의 관계와 컬럼이 확정되지 않은 경우
- 명시적 저장과 클라이언트 초안 경계가 변경 중인 경우
- 시드 데이터 정규화 규칙이 확정되지 않은 경우

## Phase 0. Next.js 실행 기반

목표: Next.js 전체 스택 앱, 테스트 러너, SQLite 연결을 준비한다.

- [ ] Node.js 22+ 실행 버전 확인
- [ ] Next.js App Router 프로젝트와 TypeScript 설정
- [ ] 프로젝트의 `package.json`과 실행 스크립트 정의
- [ ] `node:test` 기반 테스트 실행 명령 정의
- [ ] `app/layout.tsx`, `app/page.tsx` 기본 UI 페이지 작성
- [ ] `app/api/health/route.ts` Route Handler 진입점 작성
- [ ] `app/lib/server/` 서버 전용 모듈 구조 작성
- [ ] `app/lib/server/db/` SQLite 연결 모듈 작성
- [ ] DB 경로와 환경 설정 정의
- [ ] 외부 DB 연결 없이 로컬 DB 파일 생성 확인
- [ ] `GET /api/health` Route Handler 구현
- [ ] 서버 종료 시 SQLite 연결 정리

완료 기준:

- Next.js 앱이 로컬 포트에서 실행된다.
- 브라우저에서 기본 UI가 표시된다.
- `GET /api/health`가 서버·DB 상태를 반환한다.
- 테스트 DB를 별도로 생성하고 삭제할 수 있다.

## Phase 1. 공통 도메인 카탈로그

목표: 저장·변환·추천·분석에서 공통으로 사용할 입력값을 고정한다.

- [ ] 12개 장조 조성 목록과 혼합 표기 매핑 정의
- [ ] 장조별 으뜸음과 다이어토닉 7코드 정의
- [ ] 대문자 로마 숫자 도수 정규화 함수 작성
- [ ] 임시표 도수(`bVI`, `bVII` 등) 정규화 규칙 작성
- [ ] `quality` 허용값 정의
- [ ] `extension` 허용값 정의
- [ ] `bass_degree` 허용값 정의
- [ ] `degree`, `quality`, `extension`, `bass_degree` 조합 검증 함수 작성
- [ ] 코드 카탈로그 반환 함수 작성
- [ ] 메타데이터 상수의 단위 테스트 작성

정규화 기준:

```text
ii  -> degree=II, quality=minor
vi  -> degree=VI, quality=minor
G/B -> degree=V, bass_degree=VII
```

완료 기준:

- C Major의 `I - V - VI - IV`가 `C - G - Am - F`로 변환된다.
- G Major의 같은 진행이 `G - D - Em - C`로 변환된다.
- 잘못된 도수와 코드 속성이 검증 오류로 거부된다.

## Phase 2. 코드 변환 엔진

목표: 화면과 API가 공통으로 사용할 순수 변환 로직을 완성한다.

- [ ] 도수·코드 속성에서 실제 코드명 생성
- [ ] 텐션 코드 표시 규칙 구현
- [ ] 세컨더리 도미넌트 실제 코드명 변환
- [ ] 모달 인터체인지 실제 코드명 변환
- [ ] 슬래시 코드의 베이스 음 계산
- [ ] 조성 변경 시 저장 데이터는 유지하고 표시값만 재계산
- [ ] 다이어토닉 코드 목록 생성
- [ ] 12개 장조 조성 변환 테스트 작성
- [ ] 변환 실패 시 명확한 도메인 오류 반환

완료 기준:

- 순수 함수만으로 주요 변환 사례가 검증된다.
- API나 DB 없이 변환 엔진 테스트가 통과한다.

## Phase 3. SQLite 마이그레이션

목표: 프로젝트·추천·사용자 진행·기법 데이터를 저장할 11개 테이블을 만든다.

생성 테이블:

- [ ] `projects`
- [ ] `sections`
- [ ] `bars`
- [ ] `bar_chords`
- [ ] `system_recommendation_progressions`
- [ ] `system_progression_steps`
- [ ] `system_progression_form_tags`
- [ ] `user_progressions`
- [ ] `user_progression_steps`
- [ ] `user_progression_form_tags`
- [ ] `technique_rules`

공통 DB 작업:

- [ ] 마이그레이션 실행기 작성
- [ ] SQLite foreign key 활성화
- [ ] 프로젝트 하위 데이터의 `ON DELETE CASCADE` 설정
- [ ] `(bar_id, beat)` unique 제약 추가
- [ ] 진행 단계의 `(progression_id, position)` unique 제약 추가
- [ ] 태그 관계의 `(progression_id, form_tag)` primary key 추가
- [ ] 마이그레이션 재실행 시 중복 생성되지 않도록 처리
- [ ] 테스트용 메모리 또는 임시 DB 지원

완료 기준:

- 빈 DB에 마이그레이션을 적용할 수 있다.
- 두 번 실행해도 스키마가 깨지지 않는다.
- 외래키와 unique 제약 테스트가 통과한다.

## Phase 4. 추천·기법 데이터 정규화와 시드

목표: 기존 160개 JSON 진행을 새 저장 규칙에 맞춰 적재한다.

- [ ] JSON 5개 파일 로더 작성
- [ ] 중복 ID 검증
- [ ] 진행마다 정확히 4개 스텝 검증
- [ ] 송폼 태그 허용값 검증
- [ ] 기존 소문자 도수를 대문자 도수와 `quality`로 변환
- [ ] 기존 숫자형 `bass_degree`를 로마 숫자 형식으로 변환
- [ ] extension·quality·bass 조합 카탈로그 검증
- [ ] 시스템 진행 테이블 UPSERT 구현
- [ ] 시스템 진행 스텝을 기존 ID 기준으로 재생성
- [ ] 시스템 진행 송폼 태그 관계를 기존 ID 기준으로 재생성
- [ ] stale step·tag 삭제 처리
- [ ] 160개 진행과 640개 스텝 수 검증
- [ ] 모달 인터체인지 기법 규칙 시드 작성
- [ ] 세컨더리 도미넌트 기법 규칙 시드 작성
- [ ] 텐션·변형·슬래시 코드 기법 규칙 시드 작성
- [ ] `rule_type`별 typed JSON 스키마 검증
- [ ] 시드의 dry-run 모드 제공

완료 기준:

- `system_recommendation_progressions` 160행
- `system_progression_steps` 640행
- 모든 송폼 태그가 관계 테이블에 저장
- 잘못된 JSON은 DB 반영 전에 실패
- 시드 작업은 하나의 트랜잭션으로 동작

## Phase 5. 저장소 계층

목표: API와 도메인 로직에서 사용할 SQLite Repository를 만든다.

### 프로젝트 Repository

- [ ] 프로젝트 생성
- [ ] 프로젝트 목록 조회
- [ ] 이름 검색
- [ ] 프로젝트 전체 조회
- [ ] 프로젝트 전체 저장
- [ ] 프로젝트 삭제
- [ ] 하위 sections·bars·bar_chords CASCADE 확인

### 전체 저장 규칙

- [ ] `projects`, `sections`, `bars`, `bar_chords`를 하나의 트랜잭션으로 저장
- [ ] 저장 전 전체 입력값 검증
- [ ] 구간 마디 수 감소 시 초과 마디·코드 삭제
- [ ] 구간 마디 수 증가 시 빈 마디 생성
- [ ] 저장 중 오류 발생 시 전체 롤백
- [ ] `updated_at`은 명시적 전체 저장에서만 갱신

### 사용자 진행 Repository

- [ ] 사용자 진행 등록
- [ ] 사용자 진행 목록 조회
- [ ] 이름 검색
- [ ] 상세 조회
- [ ] 삭제
- [ ] 사용자 진행 스텝 저장
- [ ] 사용자 진행 송폼 태그 관계 저장

완료 기준:

- 저장 후 조회 결과가 입력 데이터와 일치한다.
- 롤백 후 기존 프로젝트 데이터가 유지된다.
- 시스템 진행 데이터가 사용자 진행 작업으로 변경되지 않는다.

## Phase 6. Meta API

목표: 프론트엔드가 사용할 공통 코드·조성 정보를 API로 제공한다.

- [ ] `GET /api/meta/keys`
- [ ] `GET /api/meta/section-names`
- [ ] `GET /api/meta/chord-catalog`
- [ ] `GET /api/meta/diatonic?tonic=C`
- [ ] `POST /api/meta/realize`
- [ ] 모든 Meta API의 입력 검증
- [ ] 공통 에러 형식 적용
- [ ] Meta API 통합 테스트 작성

## Phase 7. 프로젝트 API

목표: 클라이언트 초안과 명시적 전체 저장을 지원한다.

- [ ] `GET /api/projects`
- [ ] `POST /api/projects`
- [ ] `GET /api/projects/:id`
- [ ] `PUT /api/projects/:id`
- [ ] `DELETE /api/projects/:id`
- [ ] 개별 송폼 mutation API는 만들지 않음
- [ ] 개별 코드 mutation API는 만들지 않음
- [ ] 추천 적용 API는 만들지 않음
- [ ] 클라이언트가 편집 후 전체 payload를 구성할 수 있는 응답 구조 정의
- [ ] 전체 저장 요청의 트랜잭션 테스트
- [ ] 삭제 확인은 API가 아닌 클라이언트 책임으로 유지

## Phase 8. 송폼·코드 차트 조회 API

목표: 편집 화면이 초안을 만들 수 있도록 저장 데이터를 조회한다.

- [ ] `GET /api/projects/:id/chart`
- [ ] 구간·마디·코드의 계층 구조 응답
- [ ] 코드별 `displayName` 생성
- [ ] 조성 변경에 따른 표시 코드 재계산
- [ ] 빈 마디와 복수 코드 마디 구분
- [ ] 존재하지 않는 프로젝트·구간·마디 오류 처리

주의:

- 편집은 클라이언트에서 처리한다.
- 서버 DB는 최종 `PUT /api/projects/:id`에서만 변경한다.

## Phase 9. 추천 엔진과 추천 API

목표: 시스템 추천 데이터로 4마디 추천을 제공한다.

### 도메인 로직

- [ ] 송폼을 겹치지 않는 4마디 블록으로 분할
- [ ] 4마디 미만 블록 제외
- [ ] 4마디 블록에 복수 코드 마디가 있으면 전체 제외
- [ ] 8마디를 1~4, 5~8로 분할
- [ ] 잔여 1~3마디 블록 제외
- [ ] 4개 위치가 모두 입력되면 추천 제외
- [ ] 기존 입력 위치와 후보 진행의 조건 비교
- [ ] 대문자 도수·코드 속성 기준 매칭

### API

- [ ] `GET /api/projects/:id/sections/:sectionId/blocks`
- [ ] `POST /api/recommendations`
- [ ] 기본 추천 테이블만 조회
- [ ] 사용자 진행을 추천 결과에서 제외
- [ ] 송폼 태그 우선 필터
- [ ] 태그 후보 부족 시 도수 조건으로 보완
- [ ] 무작위 정렬
- [ ] 대중성 정렬
- [ ] 코드 연결성 정렬
- [ ] 다양성 그룹 순환 정렬
- [ ] 기본 3개와 페이지네이션
- [ ] `multi_chord_excluded`, `too_short`, `all_filled`, `no_match` 상태 반환
- [ ] 추천 결과에 도수와 실제 코드명을 함께 반환
- [ ] 추천 적용은 클라이언트 초안 병합으로 처리

완료 기준:

- 시스템 진행 160개에서 조건에 맞는 결과만 반환된다.
- 추천 API 호출만으로 프로젝트 DB가 변경되지 않는다.
- 추천 결과를 조성별 실제 코드로 확인할 수 있다.

## Phase 10. 기법 분석 엔진과 API

목표: 코드 변경의 음악 이론적 의미를 규칙 기반으로 판별한다.

### 규칙 엔진

- [ ] `rule_type`별 typed JSON 스키마 정의
- [ ] 모달 인터체인지 matcher 구현
- [ ] 세컨더리 도미넌트 matcher 구현
- [ ] 텐션·코드 변형 matcher 구현
- [ ] 슬래시 코드 matcher 구현
- [ ] `before`, `after`, 인접 코드 조건 처리
- [ ] 4마디 블록 범위 계산
- [ ] 블록 경계 분석 차단
- [ ] 복수 코드 마디 자체 분석 차단
- [ ] 인접 분석 시 첫 코드·마지막 코드 예외 처리
- [ ] priority 내림차순 평가
- [ ] 동점 시 rule ID 오름차순 평가

### API

- [ ] `POST /api/analysis`
- [ ] 변경 전·후 코드 입력 검증
- [ ] 분석 결과 기법 1개 또는 null 반환
- [ ] 분석 API 호출만으로 프로젝트 DB가 변경되지 않음
- [ ] 기법 규칙별 테스트 케이스 작성

## Phase 11. 사용자 진행 API

목표: 사용자가 만든 4마디 진행을 기본 추천과 분리해 저장·검색한다.

- [ ] `GET /api/user-progressions`
- [ ] `POST /api/user-progressions`
- [ ] `GET /api/user-progressions/:id`
- [ ] `DELETE /api/user-progressions/:id`
- [ ] `POST /api/user-progressions/search`
- [ ] 진행당 정확히 4개 스텝 검증
- [ ] 대문자 도수 정규화
- [ ] 송폼 태그 관계 저장
- [ ] 이름 검색
- [ ] 4개 위치 도수 검색
- [ ] `x` 와일드카드 검색
- [ ] 모든 `x` 검색 거부
- [ ] 사용자 진행이 추천 API에 섞이지 않는지 검증

## Phase 12. 백엔드 통합 검증

목표: 프론트엔드 없이 MVP 백엔드 전체 흐름을 검증한다.

- [ ] 마이그레이션부터 시드까지 clean DB 테스트
- [ ] 프로젝트 생성 → 조회 → 전체 저장 → 불러오기 테스트
- [ ] 송폼 마디 수 증가·감소 테스트
- [ ] 프로젝트 삭제 CASCADE 테스트
- [ ] 코드 변환 전체 조성 테스트
- [ ] 복수 코드 블록 추천 제외 테스트
- [ ] 4마디 블록 분할 테스트
- [ ] 부분 입력 추천 테스트
- [ ] 4칸 입력 완료 추천 제외 테스트
- [ ] 추천 정렬 4종 테스트
- [ ] 기법 priority 테스트
- [ ] 블록 경계 분석 차단 테스트
- [ ] 사용자 진행 와일드카드 테스트
- [ ] 공통 에러 응답 테스트
- [ ] API가 명시적 저장 외에 프로젝트 DB를 변경하지 않는지 검증
- [ ] 시드 재실행 idempotency 테스트

## Phase 13. 백엔드 완료 기준

- [ ] 모든 P0 백엔드 API가 구현된다.
- [ ] 모든 P0 도메인 규칙 테스트가 통과한다.
- [ ] clean DB에서 마이그레이션과 시드가 재현된다.
- [ ] 추천·분석·사용자 진행 데이터가 서로 섞이지 않는다.
- [ ] 프로젝트 전체 저장은 원자적으로 동작한다.
- [ ] 프론트엔드 없이 API 요청만으로 MVP 시나리오 A·B·C를 검증할 수 있다.
- [ ] 이후 프론트엔드가 사용할 API 계약과 에러 형식이 고정된다.

## 후속 작업

- [ ] 프론트엔드 화면 연결
- [ ] 10분 완성 사용자 테스트
- [ ] BPM·MIDI 재생
- [ ] 설치형 데스크톱 패키징
- [ ] 단조 독립 조성
