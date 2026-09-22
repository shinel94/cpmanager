# Chord Progression Manager Test Enhancements TODO (품질 엔지니어링 작업 목록)

개발 및 검증 기준 문서:

- `test-enhancements.md` (테스트 고도화 및 품질 검증 계획서)
- `functional_specification.md` (세부 기능 명세서)
- `development_plan.md` (단계별 개발 계획서)
- `be-enhancements.md` (백엔드 화성 분석 고도화 명세서)
- `fe-enhancements.md` (프론트엔드 고도화 명세서)
- `wave_log/` (기본 Wave 0~6, FE Enhance 0~4, BE Enhance 0~5 아카이브)

---

## 1. 테스트 개발 원칙

1. **제로 리그레션 (Zero Regression Policy)**:
   - 신규 테스트를 작성하거나 인프라를 확장할 때, 현재 100% 통과 중인 **기존 79개 테스트는 단 하나도 실패하지 않아야 한다**.
2. **결정론적 테스트 (Deterministic & Hermetic Testing)**:
   - `Math.random()`이나 `Date.now()`에 의존하는 로직은 고정된 시드(Seed)나 Mock 팩토리를 사용하며, 네트워크 외부 통신이나 공유 파일시스템 오염 없이 완전히 격리된 환경에서 실행되어야 한다.
3. **사용자 행동 중심 검증 (Behavior over Implementation)**:
   - 컴포넌트 내부의 private state 변수명을 직접 단언(Assert)하지 않고, 실제 화면에 나타나는 텍스트(`진행: C - Am...`), 배지(`세컨더리 도미넌트`), 버튼 활성화(`disabled`), 대화상자 알림을 기준으로 테스트하여 리팩터링에 견고한 테스트를 유지한다.
4. **회귀 이슈 선제 방어 (Empirical Regression Defense)**:
   - 개발 과정(Wave Logs)에서 실제로 발생했던 8대 이슈(무한 렌더링 루프, 텐션 비호환, 전체 와일드카드, beat 누락 등)를 독립된 회귀 테스트 케이스로 영구 보존한다.
5. **다계층 검증 피라미드 (Testing Pyramid)**:
   - 빠른 피드백을 주는 **Domain/Unit (Node:test)** → **컴포넌트 인터랙션 (Testing Library)** → **브라우저 실제 여정 (Playwright E2E)**의 3단계 검증 피라미드를 엄격히 준수한다.

---

## 2. 병렬 작업 운영 규칙

- `[P]`는 같은 Phase 내에서 서로 다른 파일 및 모듈을 맡아 독립적으로 작성할 수 있는 병렬 테스트 작업이다.
- `[G]`는 다음 Phase로 넘어가기 전에 반드시 100% 통과해야 하는 품질 게이트(Quality Gate)다.
- 테스트 팩토리(`test/helpers/*`) 변경 시 관련 병렬 작업을 일시 중단하고 팩토리 타입을 먼저 동기화한다.
- 실제 구현 시에는 각 단계별 테스트가 통과된 후 다음 Phase의 테스트를 통합한다.

---

## 3. 단계별 테스트 실행 로드맵 (Phased Execution Waves)

```text
┌─────────────────────────────────────────────────────────────────────────┐
│               4단계 테스트 고도화 로드맵 (Execution Waves)                │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ [Phase 1] Backend 엣지 케이스 & 장애 복구 테스트 (node:test 인프라 즉시 활용)│
│ - Projects API 404/400 경계값 & SQLite CASCADE 삭제 무결성 테스트          │
│ - Recommendation API 페이지네이션 초과 & 전체 다양성 배제 방어 테스트       │
│ - 화성 분석 엔진 희소 블록(Sparse Block) 및 비표준 표기 거부 테스트        │
│ - SQLite WAL 동시성 락 대기 및 트랜잭션 롤백 격리성 테스트                 │
│ 🎯 게이트 [G1-TEST]: 기존 79개 + 신규 BE 테스트 100% 통과 (85개+ pass)  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ [Phase 2] Frontend 컴포넌트 & 사용자 인터랙션 테스트 (@testing-library) │
│ - @testing-library/react + happy-dom 환경 설정 및 test/setup.ts 구축    │
│ - WorkspaceShell: 전역 키보드 단축키(1~7, Del, Esc) 및 인풋 충돌 방지    │
│ - FullSongFormView: 누적 마디 번호 렌더링, DND 순서 변경, 카드 접기     │
│ - InlineChordBuilder: 화음 성질/텐션 호환성 가드, 전위 베이스 도수 계산  │
│ - RecommendationPanel: 150ms 디바운스 및 무한 렌더링 방어              │
│ - 마디 축소 시 코드 유실 방지 경고 대화상자(ConfirmDialog) 인터랙션       │
│ 🎯 게이트 [G2-TEST]: 컴포넌트 렌더링 및 브라우저 이벤트 시뮬레이션 통과   │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ [Phase 3] End-to-End (E2E) 브라우저 자동화 테스트 구축 (@playwright/test)│
│ - @playwright/test 설치 및 로컬 서버 자동 기동 파이프라인 구성          │
│ - [E2E-01] 10분 팝 작곡 핵심 골든 패스 (생성 -> 송폼 -> 코드 -> 저장)    │
│ - [E2E-02] 듀얼 뷰 모드 전환 및 실시간 순서 동기화                      │
│ - [E2E-03] 데이터 유실 방지 가드 (ConfirmDialog 취소/확인)               │
│ - [E2E-04] 사용자 진행 보관함 등록, 와일드카드 검색, 비파괴 적용        │
│ - [E2E-05] 인라인 코드 빌더 조작 및 실시간 화성 피드백 루프             │
│ 🎯 게이트 [G3-TEST]: Chromium 헤드리스 환경에서 5대 시나리오 100% 통과  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ [Phase 4] 공통 팩토리, 품질 게이트 및 CI 자동화 파이프라인               │
│ - 공통 테스트 팩토리 (project-factory.ts, api-helpers.ts) 일원화        │
│ - package.json 통합 실행 스크립트 (npm run test:all) 구성               │
│ - GitHub Actions 워크플로우 (.github/workflows/ci.yml) 완비             │
│ 🎯 게이트 [G4-TEST]: CI 환경에서 정적 검사 및 전 계층 테스트 자동 통과    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Phase별 세부 작업 명세 및 체크리스트

### Phase 1. Backend 엣지 케이스 & 장애 복구 테스트 (BE Boundary & Resilience)

선행 조건: 기존 백엔드 테스트 인프라 (`node:test` + `tsx`)

- [ ] `[P]` **Task 1.1: Projects API 경계값 및 CASCADE 삭제 무결성 테스트**
  - **대상 파일**: `test/be-boundary-projects.test.ts` (신규)
  - **세부 검증 내용**:
    - `GET /api/projects/invalid-id`: 숫자가 아닌 문자열 ID 전달 시 400 Bad Request 반환
    - `GET /api/projects/999999`: 존재하지 않는 ID 전달 시 404 Not Found 및 `{ error: "Project not found" }` 반환
    - `PUT /api/projects/999999`: 존재하지 않는 ID 수정 시도 시 404 Not Found 반환
    - `DELETE /api/projects/999999`: 존재하지 않는 ID 삭제 시도 시 404 Not Found 반환
    - `DELETE /api/projects/:id` 삭제 후 무결성: 프로젝트 정상 삭제 후 SQLite의 `sections`, `bars`, `chords` 테이블에 해당 `project_id` 레코드가 0건임을 `SELECT COUNT(*)`로 직접 검증
    - 100개 이상의 섹션이나 500마디 이상의 거대 페이로드 전송 시 유효성 검사기(`validateProjectPayload`)의 안전한 거부 확인

- [ ] `[P]` **Task 1.2: Recommendation API 페이지네이션 초과 & 필터링 극단치 테스트**
  - **대상 파일**: `test/be-boundary-recommendations.test.ts` (신규)
  - **세부 검증 내용**:
    - `page: 100, pageSize: 20`: 전체 결과 수(160개)를 초과하는 오프셋 요청 시 `items: []`, `hasMore: false` 정상 반환
    - `excludeDiversityGroups`: 지원되는 모든 다양성 그룹을 배제 요청했을 때 크래시 없이 빈 배열(`items: []`) 반환
    - `bars` 배열이 4마디가 아닌 3마디이거나 5마디인 경우 `ValidationError: bars must contain exactly four bars` 발생
    - `bars`의 마디 번호가 `1, 2, 4, 5`처럼 비연속적인 경우 `ValidationError: bar positions must be 1 through 4` 발생
    - `sort: "invalid_sort"` 전달 시 `ValidationError: Unsupported recommendation sort` 발생

- [ ] `[P]` **Task 1.3: 화성 분석 엔진 희소 블록(Sparse Block) 및 극단치 테스트**
  - **대상 파일**: `test/be-boundary-analysis.test.ts` (신규)
  - **세부 검증 내용**:
    - **완전 빈 4마디 블록**: 4마디 모두 `chords: []`인 페이로드 전달 시 `technique: null`, `progressionPattern: null` 정상 반환
    - **1개 코드만 있는 블록**: 1마디 1박에만 `I` 코드가 있고 나머지 마디가 비어 있을 때 종지(Cadence)나 5도권 패턴으로 오탐되지 않음
    - **비표준 텐션 페이로드**: `extension: "13"` 또는 `"7#9b13"` 등 카탈로그에 정의되지 않은 텐션 전송 시 `ValidationError` 발생
    - **비-Major 조성 거부**: `tonic: "Am"` 또는 `tonic: "C#"`(플랫 Canonical 표기계가 아닌 샤프 표기) 전송 시 도메인 카탈로그 수준에서 거부
    - **세컨더리 도미넌트 vii° 타깃 거부**: `after` 코드가 `V7`이고 `next` 코드가 `vii°` 감화음일 때 세컨더리 도미넌트로 오탐되지 않음 (`matched: false`)

- [ ] `[P]` **Task 1.4: SQLite 트랜잭션 원자성 및 동시성 장애 롤백 테스트**
  - **대상 파일**: `test/be-db-resilience.test.ts` (신규)
  - **세부 검증 내용**:
    - `saveProjectTransaction` 실행 도중 의도적 강제 에러(throw) 발생 시, `database.exec("ROLLBACK")`이 수행되어 이전 프로젝트 데이터가 100% 원형 보존되는지 검증
    - 인메모리 DB 다중 커넥션 시뮬레이션을 통해 한 연결의 트랜잭션 롤백 시 다른 연결에 잔여 데이터가 남지 않는 격리성 확인
    - `saveUserProgression` 실패 시 태그 및 스텝 테이블에 고아(Orphan) 데이터가 남지 않는지 검증

`[G1-TEST]` 기존 79개 테스트 100% 유지 + Phase 1 신규 BE 4개 테스트 파일이 모두 통과하여 총 테스트 수가 85개 이상이어야 한다.

---

### Phase 2. Frontend 컴포넌트 & 사용자 인터랙션 테스트 (FE Component & Interactions)

선행 조건: `[G1-TEST]` 통과

- [ ] **Task 2.0: FE 컴포넌트 테스트 인프라 환경 구축**
  - `@testing-library/react`, `@testing-library/user-event`, `happy-dom` 패키지 설치
  - `test/setup-dom.ts` 작성: 전역 `window`, `document`, `navigator` DOM 환경 초기화
  - `tsx` 실행 옵션 및 React 19 JSX 트랜스파일 설정 확인

- [ ] `[P]` **Task 2.1: `WorkspaceShell` 전역 키보드 단축키 및 포커스 충돌 방지 테스트**
  - **대상 파일**: `test/components/workspace-shortcuts.test.tsx` (신규)
  - **세부 검증 내용**:
    - 마디 선택 후 키보드 `1` 입력 → 해당 마디 1박에 `I` (Major) 다이어토닉 코드 할당
    - 키보드 `4` 입력 → `IV` (Major) 코드로 즉시 교체
    - 키보드 `Delete` 또는 `Backspace` 입력 → 해당 마디의 코드가 삭제되고 빈 마디로 전환
    - 키보드 `Esc` 입력 → 마디 포커스 및 4마디 블록 선택 해제 (`null`)
    - **인풋 포커스 가드**: 곡명 입력창(`input[type="text"]`)이나 모달 검색창에 포커스가 있을 때 숫자 `1~7`을 타이핑해도 코드 할당 단축키가 실행되지 않고 텍스트 인풋에 숫자가 입력됨

- [ ] `[P]` **Task 2.2: `FullSongFormView` 렌더링, DND 순서 동기화 및 카드 접기 테스트**
  - **대상 파일**: `test/components/full-song-form-view.test.tsx` (신규)
  - **세부 검증 내용**:
    - `sections` 주입 시 누적 마디 뱃지가 `#1~#4`, `#5~#12`, `#13~#20`으로 정확히 렌더링됨
    - 특정 구간 카드의 `[▲ 최소화]` 버튼 클릭 시 해당 마디 그리드가 DOM에서 숨겨지고 컴팩트 뷰로 축소되며 코드 요약 뱃지(`진행: C - G - Am...`)가 표시됨
    - 상단 `[모두 접기]` 버튼 클릭 시 3개 구간 카드가 모두 최소화되고 버튼 레이블이 `[모두 펼치기]`로 전환됨
    - 전체 송폼 화면에서 특정 마디 클릭 시 상단 다이어토닉 팔레트의 타깃 인디케이터에 해당 구간명이 즉시 동기화됨

- [ ] `[P]` **Task 2.3: `InlineChordBuilder` 인터랙션 및 텐션/전위 호환성 가드 테스트**
  - **대상 파일**: `test/components/inline-chord-builder.test.tsx` (신규)
  - **세부 검증 내용**:
    - 마디 미선택 시 안내 가이드 텍스트 노출 및 모든 버튼 `disabled` 처리
    - 마디 선택 시 해당 마디의 현재 속성이 활성 하이라이트로 자동 선택됨
    - 화음 성질을 `dominant`로 변경 시 Extension에서 `maj7`은 비활성화되고 `7`, `9`만 활성화됨
    - 화음 성질을 `minor`로 변경 시 `COMPATIBLE_EXTENSIONS` 규칙에 따라 `maj7`, `sus4`가 비활성화됨
    - 전위 버튼 `/3` 클릭 시 베이스 도수가 `III`(단화음은 `bIII`)로 즉시 계산되어 슬래시 코드로 적용됨
    - 퀵 프리셋 `V7/ii` 클릭 시 1회의 클릭으로 `VI dominant 7`이 마디에 주입되고 우측 분석 카드에 즉시 반영됨

- [ ] `[P]` **Task 2.4: `RecommendationPanel` 150ms 디바운스 & 무한 렌더링 방어 테스트**
  - **대상 파일**: `test/components/recommendation-panel.test.tsx` (신규)
  - **세부 검증 내용**:
    - 마디 코드가 50ms 간격으로 3회 연속 변경될 때 추천 API 호출이 단 1회만 디바운스 실행됨을 가상 타이머로 검증
    - `setExcludedDiversityGroups` 호출 시 빈 배열 참조가 흔들려도 `useEffect` 재실행 순환 루프가 발생하지 않음을 검증 (회귀 방어)
    - 4마디 블록이 모두 채워졌을 때 `all_filled` 예외 배너가 즉시 렌더링됨
    - 마디 내 복수 코드가 생성되었을 때 `multi_chord_excluded` 예외 배너가 즉시 렌더링됨
    - `[이 진행 적용하기]` 클릭 시 빈 마디에만 코드가 채워지고 기존 마디 코드가 유지되는 비파괴 병합 검증

- [ ] `[P]` **Task 2.5: 마디 축소 시 코드 유실 방지 경고 대화상자(`ConfirmDialog`) 인터랙션**
  - **대상 파일**: `test/components/loss-prevention-dialog.test.tsx` (신규)
  - **세부 검증 내용**:
    - 마지막 8번째 마디에 코드가 있는 상태에서 마디 수 축소 버튼(`-`) 클릭 시 `ConfirmDialog` 모달 팝업
    - 경고 대화상자에서 `[취소]` 클릭 시 마디 수는 8마디로 유지되고 8번째 마디 코드 보존
    - 경고 대화상자에서 `[확인]` 클릭 시 7마디로 축소되고 코드가 안전하게 삭제됨

`[G2-TEST]` React 19 컴포넌트를 실제 DOM 환경에 마운트하여 단축키, 인라인 빌더, 뷰 모드 토글, 디바운스 및 모달 인터랙션 테스트가 모두 통과해야 한다.

---

### Phase 3. End-to-End (E2E) 브라우저 자동화 테스트 구축 (Playwright E2E)

선행 조건: `[G2-TEST]` 통과 및 Next.js 로컬 서버 구동 환경

- [ ] **Task 3.0: Playwright 설치 및 테스트 러너 설정**
  - `@playwright/test` 설치 및 Chromium 브라우저 바이너리 설치
  - `playwright.config.ts` 작성: `webServer` 옵션으로 `npm run dev` 자동 실행, 테스트 전용 격리 DB (`test-e2e.sqlite`) 바인딩

- [ ] `[P]` **Task 3.1: [E2E-01] 10분 팝 작곡 골든 패스 자동화**
  - **대상 파일**: `e2e/01-golden-path-composition.spec.ts` (신규)
  - **시나리오**:
    1. 브라우저 접속 (`http://localhost:3000`)
    2. `[새 프로젝트]` 클릭 → 다중 송폼 빌더로 Intro(4), Verse(8), Chorus(8) 설정 및 `G Major` 선택 후 생성
    3. 상단 G 다이어토닉 팔레트(G, Am, Bm, C, D, Em, F#dim) 렌더링 확인
    4. Intro 1~4마디에 단축키 `1, 5, 6, 4`로 `G - D - Em - C` 입력
    5. 우측 분석 패널에 `정격 종지` 배지 및 신뢰도 게이지 표시 확인
    6. Verse 1~4마디 선택 후 추천 패널에서 '대중성 우선' 1위 진행 [적용] 클릭
    7. 상단 `[프로젝트 저장]` 클릭 → Toast 알림 확인
    8. `page.reload()` 후 저장했던 G Major 조성 및 8마디 코드가 100% 동일하게 복원됨을 검증

- [ ] `[P]` **Task 3.2: [E2E-02] 듀얼 뷰 모드 전환 및 실시간 순서 동기화 자동화**
  - **대상 파일**: `e2e/02-songform-dual-view.spec.ts` (신규)
  - **시나리오**:
    1. `[구간별 보기]` 모드에서 Intro와 Verse에 각각 다른 코드 입력
    2. `[📄 전체 송폼 보기]` 토글 버튼 클릭
    3. 전체 송폼 화면에 Intro(`#1~#4`)와 Verse(`#5~#12`)가 일체형으로 노출됨을 확인
    4. 좌측 SectionList에서 Verse의 `▲` 버튼 클릭하여 순서 교체
    5. 전체 송폼 화면에서 Verse가 맨 위(`#1~#8`)로, Intro가 아래(`#9~#12`)로 실시간 재배치됨을 검증

- [ ] `[P]` **Task 3.3: [E2E-03] 데이터 유실 방지 가드(`ConfirmDialog`) 자동화**
  - **대상 파일**: `e2e/03-loss-prevention.spec.ts` (신규)
  - **시나리오**:
    1. Verse 8번째 마디에 `C` 코드 입력
    2. 좌측 송폼 패널에서 마디 수 축소 버튼(`-`) 클릭 (8 → 7)
    3. `ConfirmDialog` 경고 팝업 확인
    4. `[취소]` 클릭 시 8마디 유지 및 코드 보존 확인
    5. 다시 `-` 클릭 후 `[확인]` 클릭 시 7마디 축소 및 코드 삭제 확인

- [ ] `[P]` **Task 3.4: [E2E-04] 사용자 진행 보관함(Vault) 등록 및 와일드카드 검색 자동화**
  - **대상 파일**: `e2e/04-user-progression-vault.spec.ts` (신규)
  - **시나리오**:
    1. 차트에 `I - V - vi - IV` 입력
    2. 상단 `[⭐ 사용자 진행]` 클릭 → `[+ 새 진행 등록]` 탭 클릭
    3. `[현재 작업 중인 4마디에서 복사]` 클릭 → 4개 스텝 도수 자동 채움 확인
    4. 이름에 `"나만의 팝 캐논"` 입력 후 저장
    5. 검색 탭에서 4자리 도수 슬롯에 `x - V - x - IV` 입력 후 패턴 검색 클릭
    6. 저장한 진행이 검색 결과에 정확히 매칭됨을 확인
    7. 빈 4마디 블록에 `[이 진행 4마디에 적용]` 클릭 시 코드가 비파괴적으로 주입됨을 검증

- [ ] `[P]` **Task 3.5: [E2E-05] 인라인 코드 빌더 조작 및 실시간 화성 피드백 루프 자동화**
  - **대상 파일**: `e2e/05-inline-builder-analysis.spec.ts` (신규)
  - **시나리오**:
    1. 마디의 `Dm (II)` 코드 선택
    2. 하단 `InlineChordBuilder`에서 퀵 프리셋 `V7/V (D7)` 클릭
    3. 마디의 코드가 즉시 `D7`으로 변경됨 확인
    4. 우측 `TechniqueCard`가 모달 없이 즉시 반응하여 `세컨더리 도미넌트` 배지 및 근거 목록이 렌더링됨을 검증

`[G3-TEST]` 실제 헤드리스 브라우저 환경에서 5대 E2E 사용자 여정 스크립트가 100% 통과해야 한다.

---

### Phase 4. 공통 팩토리, 품질 게이트 및 CI 자동화 파이프라인

선행 조건: `[G3-TEST]` 통과

- [ ] **Task 4.1: 공통 테스트 팩토리 및 헬퍼 일원화**
  - `test/helpers/project-factory.ts` 작성: `createTestProject`, `createTestSection`, `createTestBar`, `createTestChord`
  - `test/helpers/api-helpers.ts` 작성: Next.js `Request` 생성 헬퍼
  - 기존 25개 테스트 파일의 중복 팩토리 함수 점진적 치환

- [ ] **Task 4.2: 통합 테스트 CLI 스크립트 구성**
  - `package.json` 스크립트 보강:
    ```json
    {
      "test": "tsx --test --test-concurrency=1 \"test/**/*.test.ts\"",
      "test:components": "tsx --test --test-concurrency=1 \"test/components/**/*.test.tsx\"",
      "test:e2e": "playwright test",
      "test:all": "npm run typecheck && npm run test && npm run test:components && npm run test:e2e"
    }
    ```

- [ ] **Task 4.3: GitHub Actions CI 파이프라인 구성**
  - `.github/workflows/ci.yml` 작성:
    - Node.js 20 & 22 매트릭스 빌드
    - `npm run typecheck`
    - `npm run db:migrate && npm run db:seed`
    - `npm run test:all`
    - Playwright 브라우저 캐시 및 아티팩트 보존

`[G4-TEST]` 모든 커밋과 PR에 대해 CI 파이프라인이 단 한 번의 실패 없이 자동으로 정적 검사 및 전 계층 테스트를 통과해야 한다.

---

## 5. 검증 명령어 및 품질 확인 가이드

```bash
# 1. 정적 타입 무결성 검사 (0 errors)
npm run typecheck

# 2. 현재 전체 단위/통합 테스트 실행 (79 passed)
npm test

# 3. Phase 1 BE 경계값 보강 테스트 단독 실행
npx tsx --test "test/be-boundary-*.test.ts"

# 4. Phase 2 FE 컴포넌트 인터랙션 테스트 단독 실행
npx tsx --test "test/components/**/*.test.tsx"

# 5. Phase 3 Playwright E2E 브라우저 테스트 실행
npx playwright test

# 6. 전 계층 완전 통합 테스트 실행 (품질 게이트)
npm run test:all
```
