# 🧪 Test Enhancements & Quality Engineering Specification (테스트 고도화 및 품질 검증 계획서)

## 1. 문서 개요 및 목적

- **대상 시스템**: `cpmanager` (Next.js 15.5.0 + React 19.1.0 + SQLite WAL 로컬 작곡 보조 웹 애플리케이션)
- **대상 계층**:
  - **Backend (BE)**: Next.js Route Handlers, SQLite 트랜잭션/마이그레이션(`projects.tempo`, `time_signature`), 도메인 엔진(`harmonic-math`, `technique-matcher`, `progression-analyzer`), 리포지토리
  - **Frontend (FE)**: React 19 컴포넌트(`WorkspaceShell`, `FullSongFormView`, `InlineChordBuilder`, `RecommendationPanel`, `PlaybackToolbar`, `BarCard`, `MidiExportButton` 등), Context/Reducer, 키보드/마우스 이벤트, 비동기 디바운스
  - **Audio & MIDI Engine**: `chord-voicer`(보이싱/음정 계산), `timeline-calculator`(비트 지속시간/타임라인), `audio-engine`(Tone.js PolySynth/Metronome), `audio-scheduler`(실시간 재생/핫 리스케줄링), `midi-exporter`(SMF Type 1 2-Track MIDI 파일 생성)
  - **End-to-End (E2E)**: 헤드리스 브라우저 기반의 핵심 사용자 여정(User Journey), 작곡→청음→MIDI 내보내기, 데이터 영속성, 브라우저 새로고침 복구
- **문서 목적**:
  - 현재 구축된 30개 테스트 파일, **총 101개 테스트 케이스 100% 통과(`101 passed, 0 failed`)**의 성과를 분석하고 남아 있는 사각지대(Testing Gaps)를 명확히 도출
  - 개발 과정(Wave 0~6, FE Enhance 0~4, BE Enhance 0~5, Playable Wave 0~7)에서 실제로 발생했던 트러블슈팅 이슈(무한 렌더링 루프, 텐션 비호환, 와일드카드 가드, 5도 방향성, SSR window 충돌, 재생 중 코드 수정 시 타임라인 불일치, MIDI 빈 마디 붕괴 등)를 회귀 방지 테스트로 공식화
  - 실제 코드베이스의 타입, 함수명, API 페이로드 규격에 100% 정합하는 구체적 테스트 명세 및 구현 스켈레톤 제공
  - 작곡 입문자의 **"10분 팝 송폼 완성 & 실시간 청음 & DAW MIDI 내보내기 시나리오"**와 복잡한 화성학 연산의 데이터 무결성을 보장하는 다계층 품질 게이트(Quality Gate) 확립

---

## 2. 현행 테스트 아키텍처 및 30개 테스트 파일 완전 분석 매트릭스

### 2.1 현행 테스트 러너 구조
- **테스트 프레임워크**: Node.js 내장 테스트 러너 (`node:test`) + `node:assert/strict`
- **실행 CLI**: `tsx --test --test-concurrency=1 "test/**/*.test.ts"`
- **타입 검사**: `npm run typecheck` (`tsc --noEmit`, 0 errors)
- **실행 속도**: 101개 테스트 기준 약 2.5초 (단일 스레드 직렬 실행)

### 2.2 전체 30개 테스트 파일 매핑 분석표

| 번호 | 테스트 파일명 | 주요 검증 대상 모듈 / 함수 | 테스트 수 | 주요 검증 내용 | 커버리지 평가 |
|:---:|---|---|:---:|---|:---:|
| 1 | `client-api.test.ts` | `app/lib/client/api.ts` | 4 | `ApiClientError` 캡슐화, 성공 응답 파싱, 네트워크 단절 에러 핸들링 | 양호 (단위) |
| 2 | `database.test.ts` | `app/lib/server/db/database.ts`, `migrations.ts` | 2 | SQLite 인메모리 연결, 테이블 생성, 증분 마이그레이션(tempo) 데이터 보존 | 우수 (DB/마이그레이션) |
| 3 | `draft-reducer.test.ts` | `app/lib/client/draft-reducer.ts` | 7 | 메타 갱신, 섹션 추가/삭제, DND 재배치, 마디 확장/축소, 코드 할당/삭제 | 우수 (리듀서) |
| 4 | `project-serializer.test.ts` | `app/lib/client/project-serializer.ts` | 3 | 백엔드 페이로드 검증 통과, 서버 응답 역직렬화(String ID), 템플릿 생성 | 우수 (직렬화) |
| 5 | `harmonic-math.test.ts` | `domain/harmonic-math.ts` | 2 | 도수-반음 연산, 완전 5도 하강(Interval 5), 베이스 라인 모션(하강/상승/페달) | 우수 (도메인) |
| 6 | `technique-matchers.test.ts` | `services/technique-matchers/*` | 3 | 13종 매처 레지스트리 등록, 구조적 Evidence 반환, 고급 재화성학 매칭 | 우수 (도메인) |
| 7 | `technique-analysis-baseline.test.ts` | `app/api/analysis/route.ts` | 1 | 기존 Wave 5 분석 결과와의 100% 하위 호환성 (Zero Regression) | 우수 (회귀) |
| 8 | `progression-analyzer.test.ts` | `services/progression-analyzer.ts` | 5 | 정격/반/변격/기만 종지, ii-V-I, 5도권, 루프, 하강 베이스, 복수코드 제외 | 우수 (도메인) |
| 9 | `be-enhance0.test.ts` | `technique-analyzer.ts` | 3 | beat 누락 시 1-indexed fallback, 비연속 박 보존, 중간 박 변경 제외 | 양호 (정규화) |
| 10 | `wave1.test.ts` | `server/db/migrations.ts`, `seed.ts` | 2 | 도수/코드 정규화, 160개 진행 로드, 11개 테이블 마이그레이션 & 시딩 | 우수 (DB) |
| 11 | `wave2.test.ts` | `domain/chord-realizer.ts`, `blocks.ts` | 4 | 12개 장조 실제 코드명 실체화, 다이어토닉 7코드, 4마디 블록 분할 | 우수 (도메인) |
| 12 | `wave3.test.ts` | `repositories/*`, `validation/*` | 3 | 도수 와일드카드 매칭, 페이로드 스키마 검증, 프로젝트/사용자 원자적 저장 | 우수 (DB/Repo) |
| 13 | `wave4.test.ts` | `app/api/meta/route.ts`, `projects/` | 3 | 메타 카탈로그 도메인 계약, 프로젝트 CRUD 및 rehydration, 차트 조회 | 우수 (API) |
| 14 | `wave5.test.ts` | `app/api/recommendations/`, `analysis/` | 4 | 초안 기반 추천, 블록 제외 상태, 미저장 기법 분석, 사용자 진행 와일드카드 | 우수 (API) |
| 15 | `wave6.test.ts` | 통합 백엔드 게이트 G6 | 4 | 클린 DB/시드 멱등성, 추천/분석/보관함 격리성, 트랜잭션 롤백 무결성 | 우수 (통합) |
| 16 | `fe-wave2-project.test.ts` | `WorkspaceShell` 모달 연동 | 1 | 프로젝트 생성, 목록 조회, rehydrate, 키 변경, 삭제 라이프사이클 | 양호 (상태) |
| 17 | `fe-wave3-chordchart.test.ts` | `draft-reducer.ts` 송폼/그리드 | 4 | 섹션 재배치/마디수 조절, 4박 분할 복수 코드, 4마디 블록 상태, 2번째 블록 가드 | 우수 (리듀서) |
| 18 | `fe-wave4-chordedit.test.ts` | `ChordEditModal` 화성 연동 | 4 | 텐션 호환성, 슬래시 코드 전위, 세컨더리 도미넌트 프리셋, 복합 직렬화 | 우수 (화성) |
| 19 | `fe-wave5-recommendation.test.ts` | `RecommendationPanel` 연동 | 4 | 4종 정렬 기준, `multi_chord`/`all_filled` 예외 상태, 실시간 분석, 비파괴 병합 | 우수 (추천) |
| 20 | `fe-wave6-userprogression.test.ts` | `UserProgressionsModal` 연동 | 3 | 사용자 진행 등록/목록, 4자리 와일드카드 검색, 전체 `x` 가드, 비파괴 적용 | 우수 (보관함) |
| 21 | `fe-enhancement-recommendation.test.ts` | `RecommendationPanel` 고도화 | 2 | 코드 상태 지문(Fingerprint) 자동 갱신, 정렬 탭 보존, 디바운스 최적화 | 우수 (상태) |
| 22 | `fe-enhancement-overview.test.ts` | `FullSongFormView.tsx` 연동 | 3 | 전체 곡 누적 마디 메트릭스, 구간 간 코드 편집 격리, 카드 접기/요약 프리뷰 | 우수 (송폼) |
| 23 | `fe-enhancement-analysis.test.ts` | `TechniqueCard.tsx` 고도화 연동 | 3 | 신뢰도(Confidence) & 근거(Evidence) API 결합, 종지 패턴 폴백, 블록 분할 | 우수 (분석) |
| 24 | `fe-enhancement-inline-builder.test.ts` | `InlineChordBuilder.tsx` 연동 | 3 | 텐션 호환성 및 전위 도수 매핑, 인라인 코드 변형, 실시간 기법 분석 트리거 | 우수 (인라인) |
| 25 | `fe-enhancement-bulk-sections.test.ts` | `AddSectionModal.tsx` 벌크 연동 | 3 | `ADD_SECTIONS_BULK` 원자적 추가, 삽입 인덱스 보존, 빈 배열 가드 | 우수 (리듀서) |
| 26 | `chord-voicer.test.ts` | `app/lib/shared/domain/chord-voicer.ts` | 7 | 12음계/MIDI 역변환, 3화음/7화음/텐션/sus4, C3~C5 Smooth Range, 슬래시 베이스 분리 | 우수 (보이싱) |
| 27 | `project-tempo.test.ts` | `projects.tempo`, `draft-reducer.ts` | 3 | DB tempo 컬럼 영속화, 40~240 BPM 유효성 검증, SET_TEMPO 액션 및 직렬화 | 우수 (DB/상태) |
| 28 | `timeline-calculator.test.ts` | `app/lib/client/audio/timeline-calculator.ts` | 3 | 비트 간격 분석(온음표/2분음표/4분음표), 빈 마디 온쉼표, SSR window 안전 가드 | 우수 (오디오) |
| 29 | `audition-playhead.test.ts` | `audition.ts`, `BarCard.tsx` 연동 | 3 | 단일/진행 청음 음표 생성, Node SSR 환경 무동작 가드, 마디/비트 재생헤드 판정 | 우수 (청음/헤드) |
| 30 | `midi-exporter.test.ts` | `app/lib/client/midi/midi-exporter.ts` | 5 | SMF Type 1 바이너리(MThd/MTrk), 2트랙(Chords/Bass), 절대 틱 스케줄링, 섹션 마커 | 우수 (MIDI) |

---

## 3. 개발 로그(Wave Logs) 기반 14대 현실적 결함 및 회귀 취약점 (Empirical Vulnerabilities)

실제 개발 로그(`wave_log/`)에서 보고된 트러블슈팅 이슈들을 분석하여, 향후 시스템 변경 시 반드시 방어해야 하는 핵심 회귀 취약점을 규명했습니다:

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│              개발 과정에서 밝혀진 14대 현실적 결함 (Empirical Vulnerabilities)        │
├──────────────────────────────────────┬──────────────────────────────────────────┤
│ 1. [FE-W6-002] 텐션 비호환성 400 에러 │ V7 코드를 major + 7로 전송 시 정규화기 충돌  │
│ 2. [FE-ENH-0]  useEffect 무한루프    │ excludedDiversityGroups 빈 배열 참조 흔들림│
│ 3. [FE-W6-003] 전체 와일드카드 부하  │ x-x-x-x 검색 시 무의미한 대량 조회 유발      │
│ 4. [BE-ENH-0]  FE의 beat 누락 전송   │ WorkspaceShell이 bars.chords에 beat 생략  │
│ 5. [BE-ENH-1]  완전 5도 방향성 혼선  │ from->to interval 5 vs to-from interval 7 │
│ 6. [BE-ENH-3]  vii° 세컨더리 오탐     │ 감화음은 토닉화가 불가능하나 매처가 오탐함   │
│ 7. [FE-ENH-1]  누적 마디 인덱스 왜곡 │ DND 재배치 시 startTotalBar 재계산 누락    │
│ 8. [FE-ENH-4]  벌크 송폼 position 충돌│ 일괄 추가 시 기존 구간과 position 중복      │
│ 9. [P1-001]    마이너 7th 익스텐션   │ minor + m7 대신 minor + 7 정규화 일치 필요 │
│ 10. [P1-002]   고음역대 음역대 점프  │ F# 이상 루트의 C3~C5 Smooth Range 보정     │
│ 11. [P2-001]   ProjectDraft 템포 호환│ tempo 속성 필수화 시 레거시 픽스처 컴파일 에러│
│ 12. [P3-001]   Tone.js SSR window참조│ Next.js 서버 빌드 시 AudioContext 부재 에러 │
│ 13. [P4-001]   재생 중 코드 수정 지연│ 연주 중 코드 변경 시 핫 리스케줄링 미동작    │
│ 14. [P6-001]   MIDI 빈 마디 타임라인 │ 상대 wait 사용 시 빈 마디로 인한 시간 왜곡   │
└──────────────────────────────────────┴──────────────────────────────────────────┘
```

1. **[FE-W6-002] 화음 성질-텐션 비호환성 검증 에러**:
   - 도미넌트 7코드를 다이어토닉 5도라는 이유로 `quality: "major"`, `extension: "7"`로 설정하면 백엔드 `normalizeStep`에서 400 에러를 반환함.
   - **방어 필요점**: UI 및 리듀서 단에서 `quality` 변경 시 `COMPATIBLE_EXTENSIONS[quality]`에 해당하지 않는 확장은 강제로 `null`로 초기화하는 방어 코드의 100% 회귀 검증.
2. **[FE-ENH-0] `useEffect` 상태 참조 순환에 의한 무한 렌더링 에러**:
   - `RecommendationPanel`에서 `fetchRecommendations` 콜백과 `excludedDiversityGroups` 빈 배열 인스턴스 간의 순환 참조로 인해 `Maximum update depth exceeded` 발생.
   - **방어 필요점**: `useRef` 기반 함수 참조 분리 및 함수형 상태 업데이트(`prev.length === 0 ? prev : []`)의 불변 참조 보존 테스트.
3. **[FE-W6-003] 4자리 도수 와일드카드 검색 시 전체 와일드카드(`x-x-x-x`) 방어**:
   - 4개 슬롯이 모두 비어 있거나 `x`일 때 검색을 허용하면 서버 부하 및 UX 저하 발생.
   - **방어 필요점**: 클라이언트 폼 수준의 disabled 가드 및 백엔드 `searchUserProgressions`의 `all_wildcards_rejected` 예외 발생 검증.
4. **[BE-ENH-0] 프론트엔드의 `beat` 누락 전송에 따른 백엔드 하위 호환성**:
   - 프론트엔드 `WorkspaceShell.tsx:107-112`는 `bars`를 구성할 때 개별 `chord`의 `beat` 필드를 누락한 채 전송함.
   - **방어 필요점**: `technique-analyzer.ts`의 `normalizeAnalysisBars()`가 `beat`가 없는 코드를 에러 없이 1-indexed로 자동 보정하는 관대한 수용(Tolerant Reader) 테스트.
5. **[BE-ENH-1] 완전 5도 하강 음정 방향성 정의**:
   - `V -> I` 진행 시 첫 코드에서 목적 코드까지의 음정 차이는 5(반음 7 하강 = 반음 5 상승)이며, 역감산은 7임.
   - **방어 필요점**: `isPerfectFifthDown(from, to)` 함수와 세컨더리 도미넌트 판정 간의 음정 일관성 검증.
6. **[BE-ENH-3] 세컨더리 도미넌트의 VII 감화음(vii°) 타깃 오탐 방지**:
   - `V7 -> vii°` 진행은 vii°가 감3화음이므로 일시적 으뜸음으로 토닉화될 수 없음.
   - **방어 필요점**: `next.degree === "VII"` 또는 `next.quality === "diminished"`인 경우 세컨더리 도미넌트 매처가 반드시 매칭을 거부(`matched: false`)하는지 검증.
7. **[FE-ENH-1] 전체 송폼 보기의 누적 마디 번호 오프셋 무결성**:
   - DND 순서 변경 시 이전 구간들의 `bar_count` 합계가 즉시 재계산되어야 함.
   - **방어 필요점**: 3개 이상의 구간 순서 교체 시 각 구간의 `startTotalBar`와 `endTotalBar`가 단 1마디의 오차나 중복 없이 연속 정수를 이루는지 검증.
8. **[FE-ENH-4] 다중 송폼 일괄 추가(`ADD_SECTIONS_BULK`) 시 position 충돌 방지**:
   - 중간 삽입(`insertIndex`) 시 기존 구간들의 `position`이 순차적으로 밀려나야 함.
   - **방어 필요점**: `position`이 0부터 N-1까지 빈틈없이 연속되는지 검증.
9. **[P1-001] 마이너 코드의 7th 익스텐션 정규화 불일치**:
   - Dm7을 `quality: "minor", extension: "m7"`으로 잘못 입력 시 카탈로그 비호환 예외 발생. `chord-catalog`의 `COMPATIBLE_EXTENSIONS` 규격상 이미 minor이므로 `extension: "7"`로 결합되어야 함.
   - **방어 필요점**: `chordToVoicedNotes` 및 UI 코드 빌더에서 `minor`에 `extension: "7"`이 정확히 결합되어 Dm7 보이싱 음표를 생성하는지 검증.
10. **[P1-002] 고음역대 루트 코드의 음역대 점프 방지 (Smooth Range)**:
    - C4 기준으로만 화음을 쌓을 경우 G, A, B 코드가 C4~C5를 초과하여 음역대가 치솟는 불균형 발생.
    - **방어 필요점**: 피치 클래스가 F#(6) 이상인 루트 코드는 옥타브 3(G3, B3, D4)부터 쌓이도록 `preferSmoothRange: true`를 적용하여 C3~C5 음역대에 자연스럽게 안착하는지 검증.
11. **[P2-001] ProjectDraft 필수 속성 변경에 따른 기존 테스트 픽스처 타입 에러**:
    - `ProjectDraft`에 `tempo: number`, `time_signature: string`을 필수 속성으로 지정 시 기존 수십 개 레거시 테스트 픽스처가 타입 오류 발생.
    - **방어 필요점**: `ProjectDraft` 속성을 `tempo?: number` 선택적으로 유지하고, 직렬화/역직렬화 시 `120`, `"4/4"` 기본값을 자동 보정하는 하위 호환성 검증.
12. **[P3-001] Tone.js Web Audio 전역 객체 SSR 참조 충돌**:
    - Next.js 서버 사이드 빌드 시 Web Audio API(`window.AudioContext`) 부재로 빌드가 실패할 위험.
    - **방어 필요점**: `AudioEngine`의 `await import("tone")` 동적 임포트 격리 및 `typeof window === "undefined"` SSR 무동작 가드가 Node 테스트 및 서버 빌드에서 100% 안전하게 동작하는지 검증.
13. **[P4-001] 재생 중 코드 수정 시 타임라인 불일치**:
    - 음악이 재생 중일 때 사용자가 코드를 수정하거나 템포를 조절하면 이전 스냅샷이 계속 연주되는 문제.
    - **방어 필요점**: 재생 중 `project` 변경 시 현재 재생 위치를 유지하면서 스케줄 큐를 즉각 교체하는 핫 리스케줄링(`reschedule`) 동작 검증.
14. **[P6-001] MIDI 상대 델타 타임(wait) 사용 시 빈 마디 타임라인 붕괴**:
    - 코드가 없는 빈 마디가 존재할 때 상대 델타 타임(wait)에 의존하면 뒤따르는 마디들이 앞당겨져 DAW 그리드가 붕괴됨.
    - **방어 필요점**: 512틱/마디 기반 절대 틱(`startTick = 512*bar + 128*(beat-1)`) 스케줄링 및 곡 끝 마커(`addMarker("End")`)를 통해 빈 마디가 포함되어도 전체 송폼 길이가 DAW에서 완벽히 보존되는지 검증.

---

## 4. 계층별 정밀 보강 테스트 상세 명세서

### 4.1 Backend (BE) 정밀 보강 명세

#### 📝 [BE-SPEC-01] Projects API 경계값 및 오류 응답 정규화
- **파일 경로**: `test/be-boundary-projects.test.ts`
- **구체적 테스트 케이스**:
  1. `GET /api/projects/abc`: 유효하지 않은 문자열 ID 전달 시 HTTP 400 Bad Request 및 표준 에러 응답 반환.
  2. `GET /api/projects/999999`: 존재하지 않는 ID 전달 시 HTTP 404 Not Found 반환.
  3. `PUT /api/projects/999999`: 존재하지 않는 프로젝트 수정 시도 시 404 반환.
  4. `DELETE /api/projects/999999`: 존재하지 않는 프로젝트 삭제 시도 시 404 반환.
  5. `DELETE /api/projects/:id` (CASCADE 무결성): 정상 프로젝트 삭제 후, SQLite 내부의 `sections`, `bars`, `chords` 테이블에 해당 `project_id` 및 하위 외래키를 참조하는 레코드가 0건임을 직접 쿼리(`SELECT COUNT(*)`)로 검증.
  6. `PUT /api/projects/:id` (거대 페이로드 방어): 100개 이상의 섹션이나 500마디 이상의 극단적 페이로드 전송 시 메모리 누수 없이 `validateProjectPayload`가 적절한 에러를 던지는지 확인.

#### 📝 [BE-SPEC-02] Recommendation API 정렬·필터링 극단치 검증
- **파일 경로**: `test/be-boundary-recommendations.test.ts`
- **구체적 테스트 케이스**:
  1. `page: 100, pageSize: 20`: 결과 인덱스를 초과한 오프셋 요청 시 빈 배열(`items: []`)과 `hasMore: false`를 반환하고 에러가 발생하지 않음.
  2. `excludeDiversityGroups: ["pop", "rnb", "jazz", "ballad", "rock", "anime", "citypop", "folk", "trot", "retro", "kpop", "ungrouped"]`: 160개 진행의 모든 다양성 그룹을 배제 요청했을 때 크래시 없이 빈 배열 반환.
  3. `bars` 배열이 4마디가 아닌 3마디이거나 5마디인 경우 `ValidationError: bars must contain exactly four bars` 반환.
  4. `bars`의 마디 번호가 `1, 2, 4, 5`처럼 중간이 누락된 경우 `ValidationError: bar positions must be 1 through 4` 반환.

#### 📝 [BE-SPEC-03] 화성 분석 엔진 희소 블록(Sparse Block) 및 극단치
- **파일 경로**: `test/be-boundary-analysis.test.ts`
- **구체적 테스트 케이스**:
  1. **완전 빈 4마디 블록**: 4마디 모두 `chords: []`인 상태로 분석 요청 시 `technique: null`, `progressionPattern: null`을 안전하게 반환.
  2. **1개 코드만 존재하는 블록**: 1마디 1박에만 `C` 코드가 있고 2, 3, 4마디가 모두 비어 있을 때 종지(Cadence)나 5도권 패턴으로 오탐되지 않음.
  3. **비표준 텐션 페이로드**: `extension: "13"` 또는 `"7#9b13"` 등 카탈로그에 없는 텐션 전송 시 `ValidationError` 정상 발생.
  4. **비-Major 조성 요청**: `tonic: "Am"` 또는 `tonic: "C#"`(플랫 Canonical 표기계가 아닌 샤프 표기) 전송 시 카탈로그 검증기에서 거부.

#### 📝 [BE-SPEC-04] SQLite 트랜잭션 동시성 및 장애 롤백
- **파일 경로**: `test/be-db-resilience.test.ts`
- **구체적 테스트 케이스**:
  1. **원자적 롤백 검증**: `saveProjectTransaction` 실행 중 `sections` 테이블 삽입 후 강제로 의도적 예외(throw)를 발생시켰을 때, `database.exec("ROLLBACK")`이 즉각 수행되어 이전 프로젝트 데이터가 100% 원형 보존되는지 검증.
  2. **동시성 락 대기 검증**: 별도의 SQLite 연결 2개를 열어 한 연결에서 긴 쓰기 트랜잭션을 잡고 있을 때, 다른 읽기 연결이 WAL 모드 덕분에 블로킹 없이 읽기 쿼리를 수행할 수 있는지 검증.

---

### 4.2 Frontend (FE) 컴포넌트 & 인터랙션 보강 명세

*(FE 컴포넌트 테스트는 `@testing-library/react` + `happy-dom` 환경에서 구동)*

#### 📝 [FE-SPEC-01] `WorkspaceShell` 키보드 단축키 및 전역 포커스 충돌 방지
- **파일 경로**: `test/components/workspace-shortcuts.test.tsx`
- **구체적 테스트 케이스**:
  1. 마디 포커스 상태에서 키보드 `1` 누름 → 해당 마디 1박에 `I` (Major) 코드 할당.
  2. 키보드 `4` 누름 → `IV` (Major) 코드로 즉시 교체.
  3. 키보드 `Delete` 또는 `Backspace` 누름 → 마디의 코드가 삭제되고 빈 마디로 전환.
  4. 키보드 `Esc` 누름 → 선택된 마디/박자 및 4마디 블록 선택 포커스가 즉시 해제(`null`).
  5. **인풋 포커스 가드**: 프로젝트명 인풋 필드(`input[type="text"]`)나 모달 내 검색창에 포커스가 있을 때 숫자 `1~7`을 누르면 단축키 핸들러가 동작하지 않고 텍스트 필드에 숫자가 정상 입력됨.

#### 📝 [FE-SPEC-02] `FullSongFormView` 렌더링, DND 순서 변경 및 카드 접기
- **파일 경로**: `test/components/full-song-form-view.test.tsx`
- **구체적 테스트 케이스**:
  1. 3개 구간(`Intro 4마디`, `Verse 8마디`, `Chorus 8마디`) 렌더링 시 누적 마디 뱃지가 `#1~#4`, `#5~#12`, `#13~#20`으로 화면에 표시됨.
  2. 특정 구간의 `[▲ 최소화]` 버튼 클릭 시 해당 카드의 차트 그리드가 DOM에서 숨겨지고 컴팩트 뷰로 전환되며, 실제 코드 요약 뱃지(`진행: C - G - Am...`)가 나타남.
  3. 상단 `[모두 접기]` 클릭 시 3개 구간이 모두 최소화되고 버튼 레이블이 `[모두 펼치기]`로 전환됨.
  4. 전체 송폼 화면에서 임의의 마디(예: Chorus #15마디)를 클릭했을 때 상단 다이어토닉 팔레트의 타깃 인디케이터에 `[Chorus] #3마디`가 실시간 동기화됨.

#### 📝 [FE-SPEC-03] `InlineChordBuilder` 인터랙션 및 호환성 가드
- **파일 경로**: `test/components/inline-chord-builder.test.tsx`
- **구체적 테스트 케이스**:
  1. 마디 미선택 시 `"편집할 마디를 차트에서 선택하세요"` 안내 배너가 표시되고 모든 조작 버튼이 비활성화됨.
  2. 마디 선택 시 현재 코드 속성(예: `degree: "V", quality: "dominant", extension: "7"`)이 해당 버튼에 `active` 하이라이트로 자동 반영됨.
  3. Quality를 `minor`로 변경 시, 호환되지 않는 `maj7`, `sus4` 버튼은 즉시 `disabled` 처리되고 `m7`, `9` 버튼만 활성화됨.
  4. Inversion 버튼 `/3` 클릭 시 베이스 도수가 자동 계산되어 슬래시 코드로 실시간 적용됨.
  5. 세컨더리 도미넌트 퀵 프리셋 `V7/ii` 클릭 시 1회의 클릭으로 `VI dominant 7`이 마디에 주입되고 우측 기법 분석 카드에 즉시 반영됨.

#### 📝 [FE-SPEC-04] `RecommendationPanel` 디바운스 및 예외 상태 전환
- **파일 경로**: `test/components/recommendation-panel.test.tsx`
- **구체적 테스트 케이스**:
  1. 마디 코드를 50ms 간격으로 빠르게 3회 변경할 때, 가상 타이머(`vi.advanceTimersByTime(150)`)를 통해 추천 API 호출이 단 1회만 디바운스 실행됨을 검증.
  2. 선택된 4마디 블록의 4칸이 모두 채워지면 `all_filled` 예외 배너(`4마디가 모두 채워져 있습니다`)가 즉시 렌더링됨.
  3. 마디 내 2개 이상의 코드가 입력되면 `multi_chord_excluded` 예외 배너(`한 마디에 여러 코드가 입력된 블록입니다`)가 렌더링됨.
  4. 추천 카드에서 `[이 진행 적용하기]` 클릭 시 비어있는 마디에만 코드가 채워지고 기존 코드는 변경되지 않는 비파괴 병합 검증.

#### 📝 [FE-SPEC-05] `PlaybackToolbar` & `BarCard` 재생 제어, 실시간 재생헤드 및 단일 청음
- **파일 경로**: `test/components/playback-toolbar.test.tsx`
- **구체적 테스트 케이스**:
  1. **재생 상태 토글**: `[▶ 재생]` 클릭 시 `AudioScheduler.play()` 호출 및 버튼이 `[⏸ 일시정지]`(테마 하이라이트)로 전환, `[⏹ 정지]` 클릭 시 재생 위치 0 리셋 및 오디오 큐 초기화.
  2. **실시간 BPM 슬라이더**: 슬라이더(40~240) 조작 시 재생 중단 없이 `AudioScheduler.setBpm(bpm)` 및 `ProjectDraftContext.setTempo(bpm)`이 실시간 동기화 호출됨.
  3. **루프 및 메트로놈 토글**: `[🔁 반복]` 및 `[⏱️ 메트로놈]` 토글 시 상태 반전 및 로컬스토리지(`useAudioPreferences`) 자동 저장.
  4. **마디 카드 재생 헤드 동기화**: `BarCard`에 `isPlaying={true}` 및 `playingBeat={2}` 주입 시 `ring-2 ring-emerald-500` 테두리, 헤더 `[▶ 2박]` 펄스 배지, 하단 4-beat dot meter 2번째 도트 활성화.
  5. **단일 화음 즉시 청음(`🔊`)**: `BarCard` 헤더 및 4박 분할 뷰 박자 셀의 `🔊` 버튼 클릭 시 `playAuditionChord` 호출 확인.

#### 📝 [FE-SPEC-06] `MidiExportButton` SMF Type 1 다운로드 및 토스트 피드백
- **파일 경로**: `test/components/midi-export-button.test.tsx`
- **구체적 테스트 케이스**:
  1. `[💾 MIDI 내보내기 ▾]` 버튼 클릭 시 드롭다운 팝업 노출 (전체 곡 내보내기 옵션 + 섹션별 내보내기 목록).
  2. '전체 곡 내보내기' 클릭 시 `downloadProjectMidi(project)`가 호출되고 `${project.name}.mid` 다운로드 트리거 및 토스트 알림 표시.
  3. 특정 섹션(예: Chorus) 선택 시 `targetSectionId: "sec-chorus"` 옵션이 전달되어 해당 섹션 전용 MIDI 파일이 생성됨.

---

### 4.3 End-to-End (E2E) 6대 사용자 여정 상세 명세 (Playwright)

#### 🎭 [E2E-SPEC-01] 10분 팝 작곡 & 청음 & MIDI 내보내기 골든 패스 (Full Golden Path)
- **테스트 파일**: `e2e/01-golden-path-composition.spec.ts`
- **시나리오 단계**:
  1. `page.goto("http://localhost:3000")` 브라우저 접속.
  2. 헤더의 `[📁 프로젝트]` 클릭 → `[+ 새 프로젝트 만들기]` 클릭.
  3. 다중 송폼 빌더 탭 선택 후 Intro(4마디), Verse(8마디), Chorus(8마디) 구성 후 Tonic을 `G Major`로 선택하고 `[프로젝트 생성]` 클릭.
  4. 메인 워크스페이스 상단 팔레트에 `G 다이어토닉 7코드(G, Am, Bm, C, D, Em, F#dim)`가 렌더링되는지 확인.
  5. Intro 1마디 클릭 후 키보드 `1`, 2마디 `5`, 3마디 `6`, 4마디 `4` 차례로 입력 (`G - D - Em - C`).
  6. 우측 기법 분석 카드에 `정격 종지` 또는 `I - V - vi - IV 진행` 배지 및 신뢰도 게이지가 렌더링되는지 확인.
  7. Verse 1~4마디 클릭 후 우측 추천 패널에서 '대중성 우선' 1순위 진행의 `[적용]` 버튼 클릭 → 차트에 4마디 코드가 비파괴적으로 채워짐 확인.
  8. **오디오 청음 재생**: 상단 `PlaybackToolbar`의 `[▶ 재생]` 버튼 클릭 → 현재 연주 마디(`BarCard`)가 초록색 링(`ring-emerald-500`)으로 하이라이트되며 실시간 이동하고, `[⏱️ 메트로놈]` 클릭 시 비트 클릭음 연동 확인.
  9. **실시간 템포 조절**: 재생 중에 BPM 슬라이더를 120에서 136으로 이동 → 음악이 중단되거나 튀지 않고 부드럽게 가속 연주됨 확인.
  10. **DAW 연동 MIDI 내보내기**: `PlaybackToolbar` 우측 `[💾 MIDI 내보내기 ▾]` 클릭 → '전체 곡 내보내기' 클릭 → 브라우저 파일 다운로드(`*.mid`) 이벤트 감지 및 토스트 알림 확인.
  11. 상단 `[💾 프로젝트 저장]` 버튼 클릭 → Toast 알림 `"프로젝트가 저장되었습니다"` 노출 확인.
  12. 브라우저 새로고침(`page.reload()`) 실행 후, 저장했던 G Major 조성, 템포(136 BPM), Intro/Verse 코드가 100% 동일하게 복원되는지 검증.

#### 🎭 [E2E-SPEC-02] 듀얼 뷰 모드 전환 및 실시간 순서 변경
- **테스트 파일**: `e2e/02-songform-dual-view.spec.ts`
- **시나리오 단계**:
  1. Intro와 Verse에 각각 다른 코드를 입력.
  2. 좌측 송폼 상단의 `[📄 전체 송폼 보기]` 버튼 클릭.
  3. 전체 송폼 화면에 Intro(`#1~#4`)와 Verse(`#5~#12`)가 단일 화면에 나열됨을 확인.
  4. 좌측 SectionList에서 Verse 카드의 `▲` 버튼 클릭.
  5. 전체 송폼 화면에서 Verse가 맨 위(`#1~#8`)로 이동하고, Intro가 아래(`#9~#12`)로 순서와 누적 마디 번호가 실시간 동기화됨을 검증.

#### 🎭 [E2E-SPEC-03] 데이터 유실 방지 및 경고 대화상자 (`ConfirmDialog`)
- **테스트 파일**: `e2e/03-loss-prevention.spec.ts`
- **시나리오 단계**:
  1. Verse 8마디 중 8번째 마디에 `C` 코드 입력.
  2. 좌측 송폼 패널에서 Verse의 마디 수 축소 버튼(`-`)을 클릭(8마디 → 7마디).
  3. 화면에 `ConfirmDialog` 모달이 팝업되며 `"8마디에 입력된 코드가 유실됩니다. 계속하시겠습니까?"` 텍스트 표시 확인.
  4. 모달의 `[취소]` 버튼 클릭 → 마디 수는 8마디로 유지되고 8번째 마디 코드 보존 확인.
  5. 다시 `-` 버튼 클릭 후 이번에는 `[확인]` 클릭 → 마디 수가 7마디로 축소되고 8번째 마디 코드가 안전하게 삭제됨을 확인.

#### 🎭 [E2E-SPEC-04] 사용자 진행 보관함(Vault) 등록 및 4자리 와일드카드 검색
- **테스트 파일**: `e2e/04-user-progression-vault.spec.ts`
- **시나리오 단계**:
  1. 차트에 `I - V - vi - IV` 코드 입력.
  2. 상단 헤더의 `[⭐ 사용자 진행]` 클릭 → `[+ 새 진행 등록]` 탭 클릭.
  3. `[현재 작업 중인 4마디에서 복사]` 클릭 → 4개 스텝에 도수가 자동으로 채워짐 확인.
  4. 이름에 `"나만의 팝 캐논"` 입력 후 `[보관함에 저장]` 클릭.
  5. `[보관함 목록 & 검색]` 탭으로 이동 → 4자리 도수 슬롯에 `x - V - x - IV` 입력 후 `[패턴 검색]` 클릭.
  6. 방금 저장한 `"나만의 팝 캐논"` 진행이 검색 결과에 정확히 매칭되어 나타남을 검증.
  7. 빈 4마디 블록을 선택하고 보관함 카드에서 `[이 진행 4마디에 적용]` 클릭 시 해당 블록에 코드가 성공적으로 주입됨을 확인.

#### 🎭 [E2E-SPEC-05] 인라인 코드 빌더 조작 및 실시간 화성 피드백 루프
- **테스트 파일**: `e2e/05-inline-builder-analysis.spec.ts`
- **시나리오 단계**:
  1. Intro 2마디의 `II (Dm)` 코드 선택.
  2. 메인 차트 하단의 `InlineChordBuilder`에서 화성학 퀵 프리셋 `V7/V (D7)` 클릭.
  3. 2마디의 코드가 즉시 `II dominant 7 (D7)`으로 변경됨 확인.
  4. 모달 딤 없이 우측의 `TechniqueCard`가 즉시 반응하여 `세컨더리 도미넌트` 배지, 90% 이상의 신뢰도, 그리고 `"다음 화음(V)의 완전 5도 위..."` 분석 근거가 실시간 노출됨을 검증.

#### 🎭 [E2E-SPEC-06] 오디오 실시간 재생 제어 및 핫 리스케줄링 (Live Playback & Hot-Rescheduling)
- **테스트 파일**: `e2e/06-audio-playback.spec.ts`
- **시나리오 단계**:
  1. 차트에 4마디 코드 입력 후 상단 `PlaybackToolbar`에서 `[▶ 재생]` 클릭.
  2. 연주 도중 3번째 마디의 코드를 `vi`에서 `IV`로 변경.
  3. 오디오 재생이 멈추거나 처음으로 리셋되지 않고 현재 재생 위치를 유지하면서 변경된 화음(`IV`)으로 즉시 핫 리스케줄링되어 발음됨을 검증.
  4. `PlaybackToolbar`에서 재생 범위를 `"선택 섹션"`으로 변경 후 `[🔁 반복]` 활성화 시, 해당 섹션의 마지막 마디 연주 완료 후 즉시 해당 섹션의 첫 마디로 루프 이동함을 확인.
  5. 마디 헤더 및 박자 셀의 `🔊` 버튼을 클릭했을 때 전체 재생과 충돌 없이 개별 화음이 즉시 발음됨을 검증.

---

## 5. 공통 테스트 팩토리 및 테스트 헬퍼 설계 (Test Infrastructure Design)

테스트 코드 간 중복을 제거하고 유지보수성을 극대화하기 위해 공통 테스트 팩토리를 구성합니다:

### 5.1 프로젝트 팩토리 (`test/helpers/project-factory.ts`)
```typescript
import type { ProjectDraft, SectionDraft, BarDraft, BarChordDraft } from "@/app/types/client";
import type { Tonic } from "@/app/lib/shared/catalog/chord-catalog";

export function createTestChord(params?: Partial<BarChordDraft>): BarChordDraft {
  return {
    id: `chord_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    beat: 1,
    degree: "I",
    quality: "major",
    extension: null,
    bass_degree: null,
    ...params,
  };
}

export function createTestBar(position: number, chords: BarChordDraft[] = []): BarDraft {
  return {
    id: `bar_${position}_${Math.random().toString(36).slice(2, 7)}`,
    position,
    chords,
  };
}

export function createTestSection(name: string, barCount = 4, position = 0): SectionDraft {
  return {
    id: `sec_${name.toLowerCase()}_${Math.random().toString(36).slice(2, 7)}`,
    name,
    bar_count: barCount,
    position,
    bars: Array.from({ length: barCount }, (_, i) => createTestBar(i + 1)),
  };
}

export function createTestProject(name = "Test Song", tonic: Tonic = "C"): ProjectDraft {
  return {
    id: 1,
    name,
    tonic,
    mode: "major",
    sections: [
      createTestSection("Intro", 4, 0),
      createTestSection("Verse", 8, 1),
      createTestSection("Chorus", 8, 2),
    ],
  };
}
```

### 5.2 Next.js HTTP 요청 헬퍼 (`test/helpers/api-helpers.ts`)
```typescript
export function createJsonRequest(url: string, method: "GET" | "POST" | "PUT" | "DELETE", body?: unknown): Request {
  return new Request(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}
```

---

## 6. 실전 구현 코드 스켈레톤 (Ready-to-Implement Test Skeletons)

즉시 구현에 착수할 수 있도록 백엔드 경계값 테스트 스켈레톤을 제공합니다:

```typescript
// test/be-boundary-projects.test.ts
import assert from "node:assert/strict";
import test from "node:test";
import { openDatabase } from "../app/lib/server/db/database";
import { applyMigrations } from "../app/lib/server/db/migrations";
import { seedWave1 } from "../app/lib/server/db/seed";
import { GET as getProject, PUT as putProject, DELETE as deleteProject } from "../app/api/projects/[id]/route";

test("BE Boundary: Projects API 404 on non-existent project", async () => {
  const db = openDatabase(":memory:");
  try {
    seedWave1(db);

    // 1. GET non-existent
    const reqGet = new Request("http://localhost/api/projects/999999", { method: "GET" });
    const resGet = await getProject(reqGet, { params: Promise.resolve({ id: "999999" }) });
    assert.equal(resGet.status, 404);

    // 2. DELETE non-existent
    const reqDel = new Request("http://localhost/api/projects/999999", { method: "DELETE" });
    const resDel = await deleteProject(reqDel, { params: Promise.resolve({ id: "999999" }) });
    assert.equal(resDel.status, 404);

    // 3. PUT non-existent
    const reqPut = new Request("http://localhost/api/projects/999999", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Ghost", tonic: "C", mode: "major", sections: [] }),
    });
    const resPut = await putProject(reqPut, { params: Promise.resolve({ id: "999999" }) });
    assert.equal(resPut.status, 404);
  } finally {
    db.close();
  }
});
```

---

## 7. 4단계 점진적 실행 로드맵 및 품질 게이트 (Actionable Roadmap)

```text
┌─────────────────────────────────────────────────────────────────────────┐
│               4단계 점진적 실행 로드맵 (Quality Engineering Roadmap)        │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ [Phase 1] BE 경계값 및 장애 복구 테스트 (현재 인프라 node:test 활용)        │
│ - Projects API 404, 400 유효성 검사 및 CASCADE 삭제 무결성 테스트          │
│ - Recommendation API 페이지네이션 초과 & 다양성 전체 배제 방어 테스트       │
│ - 화성 분석 엔진 희소 블록(Sparse Block) 및 비-Major 표기 거부 테스트      │
│ - SQLite WAL 동시성 락 대기 및 트랜잭션 예외 시 롤백 무결성 테스트         │
│ 🎯 완료 기준: 4개 신규 테스트 파일 추가 및 npm test 105개+ 전체 통과       │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ [Phase 2] FE 컴포넌트 & 사용자 인터랙션 테스트 (@testing-library/react)  │
│ - @testing-library/react + happy-dom 인프라 설치 및 test/setup.ts 구성  │
│ - WorkspaceShell: 키보드 단축키(1~7, Del, Esc) 및 텍스트 인풋 충돌 방지    │
│ - FullSongFormView: 누적 마디 렌더링, DND 실시간 순서 변경, 카드 접기     │
│ - InlineChordBuilder: 화음 성질/텐션 호환성 가드, 전위 베이스 계산       │
│ - RecommendationPanel: 150ms 디바운스 타이머 및 무한 재렌더링 방지      │
│ - PlaybackToolbar & BarCard: 실시간 재생/정지, BPM 조절, 청음 헤드 동기화 │
│ - MidiExportButton: 드롭다운 메뉴 및 SMF Type 1 다운로드 트리거          │
│ 🎯 완료 기준: 6개 컴포넌트 스위트 추가 및 FE 이벤트 인터랙션 100% 검증     │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ [Phase 3] E2E 브라우저 자동화 테스트 구축 (@playwright/test)            │
│ - @playwright/test 설치 및 Next.js 로컬 서버 자동 기동 파이프라인 구성     │
│ - [E2E-01] 10분 팝 작곡&청음&MIDI 골든패스 (생성->코드->청음->MIDI->저장)  │
│ - [E2E-02] 듀얼 뷰 모드 전환 및 실시간 순서 변경                         │
│ - [E2E-03] 마디 축소 시 코드 유실 방지 가드 (ConfirmDialog)                │
│ - [E2E-04] 사용자 진행 보관함(Vault) 등록, 와일드카드 검색, 비파괴 적용    │
│ - [E2E-05] 인라인 코드 빌더 조작 및 실시간 화성 피드백 루프               │
│ - [E2E-06] 오디오 실시간 재생 제어 및 핫 리스케줄링 (Live Audio Reschedule)│
│ 🎯 완료 기준: Chromium 헤드리스 환경에서 6대 시나리오 100% 통과          │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ [Phase 4] 품질 게이트 및 CI 자동화 파이프라인                             │
│ - package.json에 npm run test:all (typecheck + unit + component + e2e)  │
│ - GitHub Actions CI 워크플로우 (.github/workflows/ci.yml) 완비          │
│ - 커밋 전 pre-push 훅 연동을 통한 제로 리그레션(Zero Regression) 강제     │
│ 🎯 완료 기준: 모든 PR에 대해 정적 검사 및 전 계층 테스트 자동 통과        │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 8. 최종 요약 및 작업 지침 (Summary & Guidelines)

1. **테스트 우선순위**:
   - 가장 빠르게 신뢰도를 높일 수 있는 **Phase 1(BE 경계값 테스트)**에 즉시 착수합니다. 추가 의존성 설치 없이 기존 `node:test`로 즉시 구현 가능합니다.
2. **하위 호환성 불변 원칙**:
   - 신규 테스트를 추가하거나 기존 로직을 보강할 때, 현재 통과 중인 **101개 테스트는 단 하나도 깨지지 않아야 합니다 (Zero Regression)**.
3. **실제 유저 경험 중심 검증**:
   - 컴포넌트 내부 상태를 직접 검사하기보다는, 실제 화면에 나타나는 텍스트(`진행: C - Am...`), 뱃지(`세컨더리 도미넌트`, `[▶ 2박]`), 대화상자 알림, 오디오 발음 피드백을 기준으로 테스트를 작성하여 리팩터링에 견고한 테스트를 유지합니다.
