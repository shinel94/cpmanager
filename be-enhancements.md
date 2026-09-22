# Backend Technique Analysis Enhancements (화성 진행 분석 기법 개선 스펙 및 로드맵)

## 1. 문서 개요 및 목적

- **대상 구현 파일**:
  - 엔진: `app/lib/server/services/technique-analyzer.ts`
  - 규칙 정의: `app/lib/server/rules/technique-rules.ts`
  - 시드 및 검증: `app/lib/server/db/seed.ts`, `app/lib/server/db/migrations.ts`
  - 공통 화성학 유틸: `app/lib/server/domain/` (음정 및 화성 기능 연산 모듈)
- **대상 API 엔드포인트**: `POST /api/analysis`
- **목적**:
  - 현재 4개 규칙에 의존하는 단편적 코드 변경 분석기를 체계적이고 확장이 용이한 화성 분석 엔진으로 고도화
  - 단일 코드 변경(Mutation) 분석뿐 아니라 4마디 블록 전체의 화성적 흐름(종지, 기능 진행, 베이스 라인)을 포괄하는 지능형 분석 기능 제공
  - 프론트엔드(`WorkspaceShell.tsx`) 및 기존 테스트와의 100% 하위 호환성을 유지하면서 점진적 UI 확장을 지원

---

## 2. 현황 분석 및 작업 착수 준비도 평가 (Readiness Assessment)

### 2.1 현재 구현 구조 및 한계

현재 `app/lib/server/services/technique-analyzer.ts`는 클라이언트의 코드 입력 직후 호출되는 인라인 분석 엔진으로 동작합니다:

- **입력**: `tonic`, `sectionName`, `blockStart`, `target`({ barPosition, beat }), `before`, `after`, `bars`
- **동작**: DB의 `technique_rules` 테이블을 읽고, `technique-analyzer.ts` 내의 `ruleMatches()` 함수에서 하드코딩된 조건으로 일치 여부를 검사
- **출력**: 일치하는 최고 우선순위 규칙 1개 (`{ id, name, description }`) 또는 `null`

### 2.2 작업 착수 전 5대 핵심 결함 및 블로커 (Blockers &amp; Ambiguities)

기존 `be-enhancements.md` 초안 및 현재 코드베이스를 심층 검토한 결과, **즉시 기능 확장에 착수하기에는 아래 5가지 아키텍처적 결함과 모호함이 존재하여 보완이 선행되어야 함**을 확인했습니다:

1. **분석 모드의 이원화 필요 (단일 코드 변형 vs 블록 진행 패턴)**:
   - 기존 제안에는 "세컨더리 도미넌트" 같은 단일 코드 변형과 "ii-V-I", "정격 종지", "5도권 진행" 같은 다중 마디 진행 패턴이 단일 함수(`analyzeTechnique`)에 무분별하게 혼재되어 있었습니다.
   - 단일 코드 변경 시점의 분석과 4마디 블록의 구조적 종지 분석은 트리거 시점과 판별 대상이 다르므로, 이를 엔진 내부에서 명확히 분리·조합하는 구조가 필수적입니다.
2. **복수 코드 마디의 `beat` 필드 누락에 따른 하위 호환성 파괴 위험**:
   - `be-enhancements.md` 초안에서는 "beat 정보가 없는 입력을 검증 오류로 처리"하도록 기술했으나, 실제 프론트엔드(`WorkspaceShell.tsx:103-114`)는 `bars`의 chords에 `beat`를 전달하지 않고 있습니다.
   - 이를 강제하면 기존 프론트엔드 및 기작성된 통합 테스트(`test/wave5.test.ts`, `test/fe-wave5-recommendation.test.ts`)가 즉시 런타임 에러를 일으키므로, beat 누락 시 1-indexed 자동 보정 및 1박 기본값 할당 등의 하위 호환 폴백(Fallback) 전략이 반드시 필요합니다.
3. **DB 시드 검증기의 하드코딩 블로커 (`seed.ts`)**:
   - `app/lib/server/db/seed.ts:177`의 `validateTechniqueRules()`가 `allowedTypes`를 4개(`modal_interchange`, `secondary_dominant`, `slash_chord`, `chord_variation`)로 하드코딩 제한하고 있습니다.
   - 신규 기법(`cadence`, `harmonic_function`, `circle_of_fifths`, `bass_line` 등)을 추가할 때 `seed.ts`를 함께 수정하지 않으면 마이그레이션 및 시딩 과정에서 치명적 에러가 발생합니다.
4. **음악 이론적 판별 조건(수식 및 경계조건)의 구체성 결여**:
   - "세컨더리 리딩톤 디미니시드", "모달 인터체인지 세분화", "하강 베이스", "기만 종지" 등의 화성학적 성립 공식(예: 허용되는 타깃 다이어토닉 코드 목록, 반음 차이 계산 공식, 디미니시드 텐션 조건)이 명시되지 않아 작업자가 임의로 구현할 위험이 있었습니다.
5. **API 응답 스키마 변경 시 클라이언트 파괴 방지**:
   - 응답에 `confidence`, `evidence`, `progressionPattern`, `alternatives` 등을 추가하더라도, 기존 프론트엔드가 참조하는 `res.technique.id`, `res.technique.name`, `res.technique.description` 구조가 100% 온전하게 유지되어야 합니다.

---

## 3. 아키텍처 재설계안 (Unified Analysis Engine Architecture)

### 3.1 분석 모드 이원화 (Dual-mode Architecture)

분석 엔진은 단일 요청 내에서 다음 두 가지 관점을 독립적으로 평가한 후 결합합니다:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                      POST /api/analysis Request                         │
│  { tonic, sectionName, blockStart, target, before, after, bars }        │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
                    ┌─────────────────────────────────┐
                    │ Request Normalizer & Validator  │
                    │ - beat 누락 시 1-indexed fallback│
                    │ - ChordStep 및 Tonic 엄격 정규화  │
                    └────────────────┬────────────────┘
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼                                                   ▼
┌─────────────────────────────────────┐     ┌─────────────────────────────────────┐
│ 1. Mutation Analyzer (국소 변형 분석) │     │ 2. Progression Analyzer (블록 맥락) │
│ - Target 코드의 before -> after 변형  │     │ - 4마디 블록 전체 화성 흐름 추적   │
│ - 세컨더리 도미넌트 / 리딩톤 디미니시드 │     │ - 정격/반/변격/기만 종지 판별       │
│ - 모달 인터체인지 (차용 모드 매칭)    │     │ - ii - V - I / IV - V - I 진행      │
│ - 슬래시 코드 / 전위 화음           │     │ - 하강/상승 베이스 라인 클리셰       │
│ - 텐션 및 서스펜디드 변형           │     │ - 5도권 순환 진행                   │
└──────────────────┬──────────────────┘     └──────────────────┬──────────────────┘
                   │                                           │
                   └─────────────────────┬─────────────────────┘
                                         ▼
                    ┌─────────────────────────────────┐
                    │   Composite Result Generator    │
                    │ - Primary technique (최고우선순위)│
                    │ - Progression Pattern 결합      │
                    │ - Evidence & Confidence 산출    │
                    │ - Alternatives (보조 해석 목록)  │
                    └────────────────┬────────────────┘
                                     │
                                     ▼
                    ┌─────────────────────────────────┐
                    │  Zero-Regression JSON Response  │
                    └─────────────────────────────────┘
```

### 3.2 도메인 음악 계산 모듈 신설 (`app/lib/server/domain/harmonic-math.ts`)

화성학적 분석의 재사용성과 정확도를 위해 공통 수학/음정 연산 유틸리티를 구축합니다:

- **도수 간 반음 거리(Semitone Distance)**:
`getSemitoneInterval(fromDegree: string, toDegree: string): number`
  - 두 도수 간의 상승/하강 반음 차이를 0\~11로 정규화
  - 완전 5도 하강(또는 완전 4도 상승) = 반음 7 (또는 5)
- **다이어토닉 스케일 디그리 검증**:
`isDiatonicDegree(degree: string): boolean`
  - I, II, III, IV, V, VI, VII (임의의 임시표 b, #이 붙지 않은 순수 다이어토닉)
- **베이스 음정 연속성 계산**:
`calculateBassLineMotion(bassDegrees: (string | null)[]): "stepwise_down" | "stepwise_up" | "pedal" | "none"`

### 3.3 복수 코드 및 beat 정규화 규칙 (하위 호환 폴백)

```typescript
export type NormalizedBarChord = ChordStep & { beat: number };
export type NormalizedBar = { position: number; chords: NormalizedBarChord[] };

export function normalizeAnalysisBars(rawBars: unknown[]): NormalizedBar[] {
  // rawBars가 없거나 4마디가 아니면 ValidationError
  // 각 bar의 chords 배열 순회:
  // chord.beat가 1~4 정수이면 그대로 채택
  // chord.beat가 없으면 (index + 1)로 순차 배정 (단 1마디에 1개면 beat: 1)
}
```

### 3.4 플러그형 매처 인터페이스 (`TechniqueMatcher`)

하드코딩 분기 대신 규칙 타입별 매처를 등록·실행하는 객체 지향적 구조로 전환합니다:

```typescript
export type MatchContext = {
  tonic: Tonic;
  sectionName: string;
  target: { barPosition: number; beat: number };
  before: ChordStep;
  after: ChordStep;
  previous: ChordStep | null;
  next: ChordStep | null;
  bars: NormalizedBar[];
};

export type MatchResult = {
  matched: boolean;
  confidence: number;
  evidence: string[];
  metadata?: Record<string, unknown>;
};

export interface TechniqueMatcher {
  readonly ruleType: string;
  match(context: MatchContext, condition: Record<string, unknown>): MatchResult;
}
```

---

## 4. 화성학 분석 기법별 정밀 판별 명세 (Harmonic Rules Specification)

### 4.1 세컨더리 도미넌트 (Secondary Dominant)

- **음악적 정의**: 다이어토닉 화음(I 제외)을 일시적인 으뜸음으로 취급하여, 그 화음의 완전 5도 위에서 도미넌트 7th(또는 9th) 성질을 갖는 화음.
- **판별 조건**:
  1. `after.quality === "dominant"`
  2. `after.extension`이 `"7"` 또는 `"9"`
  3. `next !== null` (다음 화음이 존재함)
  4. `(rootPitch(after.degree) - rootPitch(next.degree) + 12) % 12 === 7` (완전 5도 하강 진행)
  5. **목표 화음 제한**: `next.degree`가 감화음(VII)이 아니어야 함 (`next.degree !== "VII"`)
  6. **목표 도수 산출**: `targetDegree = next.degree` (예: `V7/ii`, `V7/V`, `V7/vi`)
- **Evidence 문구**:
  - `"다음 화음({nextDegree})의 완전 5도 위에서 장3도·단7도 트라이톤을 형성하는 도미넌트 화음입니다."`

### 4.2 세컨더리 리딩톤 디미니시드 (Secondary Leading-Tone Diminished)

- **음악적 정의**: 목적 화음의 반음 아래(단2도 아래)에 위치하여 이끔음(Leading tone) 역할을 수행하는 감7화음(또는 반감7화음).
- **판별 조건**:
  1. `after.quality === "diminished"` 또는 `after.quality === "half-diminished"`
  2. `next !== null`
  3. `(rootPitch(next.degree) - rootPitch(after.degree) + 12) % 12 === 1` (목적 화음의 반음 아래)
  4. `next.degree`가 다이어토닉 화음이어야 함
- **규칙 이름/표기**: `vii°/V`, `vii°/ii` 등
- **Evidence 문구**:
  - `"다음 화음({nextDegree})으로 반음 상행 해결되는 이끔음 감화음입니다."`

### 4.3 모달 인터체인지 (Modal Interchange / Borrowed Chord)

- **음악적 정의**: 평행 단조(Parallel Minor)나 기타 선법(Dorian, Mixolydian)에서 차용한 화음.
- **세부 분류 및 정밀 조건 (Major Key 기준)**:
  - **Type A (동일 루트 품질 변경)**: `before.degree === after.degree && before.quality === "major" && after.quality === "minor"`
    - 예: `IV (F) -> iv (Fm)` (대표적인 서브도미넌트 마이너 차용)
  - **Type B (bVI 차용 - Submediant)**:
    - `after.degree === "bVI"` &amp;&amp; `after.quality === "major"` (에올리안 차용, 예: Ab in C Major)
  - **Type C (bVII 차용 - Subtonic)**:
    - `after.degree === "bVII"` &amp;&amp; `after.quality === "major"` (믹솔리디안/에올리안 차용, 예: Bb in C Major)
  - **Type D (bIII 차용 - Mediant)**:
    - `after.degree === "bIII"` &amp;&amp; `after.quality === "major"` (에올리안 차용, 예: Eb in C Major)
  - **Type E (ii° / iiø7 차용)**:
    - `after.degree === "II"` &amp;&amp; (`after.quality === "diminished"` || `after.quality === "half-diminished"`)
- **Evidence 문구**:
  - `"{sourceMode} 선법의 {degree} 화음을 차용하여 특유의 감성적인 색채감을 부여합니다."`

### 4.4 슬래시 코드 및 베이스 라인 (Slash Chords &amp; Inversions)

- **전위(Inversion) 판별**:
  - `after.bass_degree !== null`
  - 베이스 도수가 해당 코드의 3음, 5음, 7음에 해당하는 경우:
    - 3음 전위 (1st Inversion): 예 `I/III` (C/E), `V/VII` (G/B)
    - 5음 전위 (2nd Inversion): 예 `I/V` (C/G)
- **패싱 베이스(Passing Bass) 판별**:
  - 이전 마디/비트 베이스와 다음 마디/비트 베이스 사이를 온음/반음으로 매끄럽게 연결하는 경우
- **페달 포인트(Pedal Point) 판별**:
  - 상위 화음이 변함에도 베이스가 으뜸음(`I`) 또는 딸림음(`V`)으로 일정하게 지속되는 경우

### 4.5 화성 기능 및 종지 패턴 (Cadences &amp; Progression Patterns)

4마디 블록의 마지막 2개 코드(또는 4마디 전체)를 평가하여 대표 진행 패턴을 판별:

- **정격 종지 (Authentic Cadence / Perfect Cadence)**:
  - 조건: `Dominant(V) -> Tonic(I)` 진행으로 프레이즈가 완결될 때
- **반종지 (Half Cadence)**:
  - 조건: 프레이즈나 블록의 종지 화음이 `Dominant(V)`로 머물러 긴장감을 유지할 때
- **변격 종지 (Plagal Cadence / 아멘 종지)**:
  - 조건: `Subdominant(IV) -> Tonic(I)` 진행으로 마무리될 때
- **기만 종지 (Deceptive Cadence)**:
  - 조건: `Dominant(V)` 다음 `I` 대신 `VI(vi)` 화음으로 진행하여 기대를 우회할 때
- **ii - V - I 진행 (Two-Five-One)**:
  - 조건: 3연속 코드가 `II(minor) -> V(major/dominant) -> I(major)` 관계를 형성할 때
- **5도권 진행 (Circle of Fifths Progression)**:
  - 조건: 3개 이상의 코드가 연속하여 완전 5도 하강(반음 7 하강) 패턴을 유지할 때 (예: `iii -> vi -> ii -> V`)

---

## 5. DB 스키마 및 시드 호환 전략

### 5.1 `seed.ts` `allowedTypes` 확장

신규 기법 추가 시 시드 검증 실패를 방지하도록 화이트리스트를 확장합니다:

```typescript
const allowedTypes = new Set([
  "modal_interchange",
  "secondary_dominant",
  "secondary_leading_tone",
  "slash_chord",
  "chord_variation",
  "cadence",
  "harmonic_progression",
  "bass_motion",
  "tritone_substitution",
]);
```

### 5.2 `technique_rules` 테이블 및 `condition` JSON 스키마 규격화

SQLite 스키마 DDL 마이그레이션 없이도 `condition` JSON 필드 내에 모든 고급 조건을 완벽히 수용하도록 설계합니다:

```json
{
  "category": "mutation | progression | cadence",
  "scope": "target | block",
  "required_qualities": ["dominant"],
  "required_extensions": ["7", "9"],
  "interval_semitones": 7,
  "target_type": "diatonic_non_tonic",
  "explanation_template": "다음 화음({target})의 5도 위 세컨더리 도미넌트입니다."
}
```

---

## 6. API 계약 및 하위 호환성 보장

### 6.1 `POST /api/analysis` 요청 규격 (관대한 입력 수용)

- `bars` 내 `chords`에 `beat` 필드가 누락되어도 서버 정규화 단계에서 안전하게 1-indexed로 보정하여 처리.
- `before`가 누락된 경우 `after`의 다이어토닉 기본형을 자동 생성하여 단독 코드 분석도 수용.

### 6.2 `POST /api/analysis` 응답 규격 (Zero Regression Response)

```typescript
export type AnalysisResponse = {
  ok: true;
  // [필수 호환] 기존 프론트엔드(WorkspaceShell.tsx)가 직접 읽는 필드 100% 보존
  technique: {
    id: number;
    name: string;
    description: string;
    // [확장 필드] 점진적 고도화용 옵셔널 필드
    confidence?: number;
    evidence?: string[];
    targetDegree?: string;
    sourceMode?: string;
  } | null;
  // [신규 확장] 4마디 블록 단위 화성 진행/종지 패턴
  progressionPattern?: {
    type: "cadence" | "progression" | "bassline";
    name: string;
    description: string;
    bars: number[];
  } | null;
  // [신규 확장] 동시 성립하는 보조 해석 목록
  alternatives?: Array<{
    id: number;
    name: string;
    description: string;
    confidence: number;
  }>;
};
```

---

## 7. 단계별 구현 로드맵 및 인수 조건 (Wave-based Milestones)

### 📌 Enhancement Wave A: 기반 정비 및 엔진 추상화 (Pure Refactoring &amp; High Precision)

- [x] **A-1**: `app/lib/server/domain/harmonic-math.ts` 생성 (도수 간 반음 계산, 다이어토닉 검증)
- [x] **A-2**: `technique-analyzer.ts` 입력 정규화기(`normalizeAnalysisInput`) 작성 (beat 누락 fallback 지원)
- [x] **A-3**: `TechniqueMatcher` 플러그형 아키텍처 도입 및 기존 4종 규칙 매처 리팩터링
- [x] **A-4**: 세컨더리 도미넌트 판별 고도화 (목표 도수 `V7/ii` 등 계산, VII 감화음 타깃 배제)
- [x] **A-5**: 모달 인터체인지 정밀화 (bVI, bVII, bIII, iv 등 차용 모드별 상세 판별)
- [x] **A-6**: 슬래시 코드 전위(Inversion) 및 단순 베이스 지정 분리 판별
- [x] **A-7**: `seed.ts` `allowedTypes` 확장 및 신규 규칙 데이터 무장
- [x] **인수 조건**: 기준 테스트 67개 전체 통과 + 신규 고도화 matcher·progression 테스트 통과

### 📌 Enhancement Wave B: 실용 화성 기능 및 종지/베이스 분석 (Cadences &amp; Basslines)

- [x] **B-1**: 4마디 블록 종지 판별기 구현 (정격 종지 V-I, 반종지 ..-V, 변격 종지 IV-I, 기만 종지 V-VI)
- [x] **B-2**: 대표 진행 패턴 판별기 구현 (ii-V-I, IV-V-I, 5도권 순환 진행)
- [x] **B-3**: 베이스 라인 모션 판별기 구현 (하강 베이스 라인 클리셰, 페달 포인트)
- [x] **B-4**: `Composite Result Generator` 결합 (기존 `technique` + `progressionPattern` 동시 반환)
- [x] **인수 조건**: 단일 코드 수정 시 기법 분석과 함께 종지 패턴이 부가 정보로 정상 출력됨

### 📌 Enhancement Wave C: 대리화음 및 고급 분석 (Advanced Reharmonization)

- [x] **C-1**: 트라이톤 대리(Tritone Substitution, SubV) 판별
- [x] **C-2**: 백도어 도미넌트(Backdoor Dominant, bVII7 -&gt; I) 판별
- [x] **C-3**: 세컨더리 리딩톤 디미니시드(vii°7/X) 판별
- [x] **C-4**: 크로매틱 미디언트(Chromatic Mediant) 판별
- [x] **인수 조건**: 재즈/팝 고급 화성 변형 4마디 패턴 정상 식별

---

## 8. 테스트 전략 및 회귀 방지 매트릭스 (Test Matrix)


| 테스트 카테고리                     | 검증 대상                                                        | 기대 결과                                           |
| ---------------------------- | ------------------------------------------------------------ | ----------------------------------------------- |
| **하위 호환성 (Zero Regression)** | `test/wave5.test.ts`, `test/fe-wave5-recommendation.test.ts` | 기존 테스트 일체 수정 없이 100% 통과                         |
| **Beat Fallback**            | `bars` 내 chord에 `beat`가 없는 입력                                | 에러 없이 순차 beat 배정 후 정확히 분석                       |
| **Secondary Dominant**       | `VI dominant 7 -> II minor`                                  | `name: "세컨더리 도미넌트"`, targetDegree: "II"         |
| **Secondary Exception**      | `V dominant 7 -> VII diminished`                             | 세컨더리 도미넌트로 오탐되지 않음                              |
| **Modal Interchange bVI**    | `C Major`에서 `bVI Major` 입력                                   | `name: "모달 인터체인지"`, sourceMode: "Aeolian"       |
| **Modal Interchange iv**     | `C Major`에서 `IV Major -> IV Minor`                           | `name: "모달 인터체인지"`, 서브도미넌트 마이너 설명               |
| **Cadence (V - I)**          | 4마디 블록 마지막이 `V -> I`                                         | `progressionPattern: { name: "정격 종지" }`         |
| **Two-Five-One**             | `II minor -> V dominant -> I major`                          | `progressionPattern: { name: "ii - V - I 진행" }` |
| **Descending Bass**          | `I -> I/VII -> I/VI -> I/V`                                  | `progressionPattern: { name: "하강 베이스 라인" }`     |
| **Slash Inversion**          | `I` 화음의 베이스가 `III`                                           | `1st Inversion(제1전위)` 근거 반환                     |


---

## 9. 권장 작업 순서

기존 API와 FE 호환성을 유지하기 위해 새로운 화성 기법을 바로 추가하지 않고, 분석 입력 계약과 엔진 구조부터 안정화한다.

### Enhancement Step 0. 기준선 고정

- [x] 현재 `POST /api/analysis` 요청·응답 fixture 저장
- [x] 기존 `technique.id`, `technique.name`, `technique.description` 호환성 테스트 고정
- [x] 현재 전체 테스트 수와 기준 통과 상태 기록
- [x] 기존 rule type과 시드 규칙 목록 확정
- [x] FE가 사용하는 분석 결과 필드 목록 확인

완료 조건:

- [x] 기존 분석 결과를 재현하는 회귀 테스트가 있다.
- [x] 확장 작업 전 기준 테스트가 모두 통과한다.

### Enhancement Step 1. 분석 입력 정규화

목표: `beat` 누락과 복수 코드 마디를 안전하게 처리하는 공통 입력 정규화기를 만든다.

대상 모듈:

- `app/lib/server/domain/analysis-context.ts`
- `app/lib/server/domain/analysis-normalizer.ts`
- `app/lib/server/services/technique-analyzer.ts`

작업:

- [x] `NormalizedBarChord = ChordStep & { beat: number }` 정의
- [x] `NormalizedBar` 정의
- [x] `bars`가 정확히 4마디인지 검증
- [x] 실제 `beat`가 있으면 1\~4 범위 검증
- [x] `beat`가 없으면 배열 순서 기반 1-indexed fallback 적용
- [x] 중복 beat 검증
- [x] target bar·target beat 검증
- [x] 복수 코드 마디의 첫·중간·마지막 박 판별
- [x] 이전·다음 코드 컨텍스트 계산
- [x] 블록 경계를 넘는 코드 사용 차단

완료 조건:

- [x] beat가 있는 기존 입력과 없는 FE 입력 모두 처리된다.
- [x] 중간 박 변경은 분석 대상에서 제외된다.
- [x] 첫 박·마지막 박 변경은 올바른 인접 관계만 사용한다.

### Enhancement Step 2. 공통 화성 수학 모듈

목표: 기법별 matcher가 동일한 음정·도수 계산을 사용하도록 공통화한다.

대상 모듈: `app/lib/server/domain/harmonic-math.ts`

- [x] 도수 → 반음 값 변환
- [x] 두 도수 사이의 상승·하강 반음 거리 계산
- [x] 완전 5도 관계 판별
- [x] 반음 상행 해결 관계 판별
- [x] 다이어토닉 도수 판별
- [x] 베이스 도수 배열의 하강·상승·페달 판별
- [x] 조성 기반 pitch 계산을 `chord-realizer.ts`와 공유

### Enhancement Step 3. 플러그형 matcher 구조

목표: `ruleMatches()`의 기법별 하드코딩 분기를 matcher 단위로 분리한다.

권장 구조:

```text
technique-analyzer.ts
├── analysis-normalizer.ts
├── mutation-analyzer.ts
├── progression-analyzer.ts
├── matchers/
│   ├── modal-interchange-matcher.ts
│   ├── secondary-dominant-matcher.ts
│   ├── slash-chord-matcher.ts
│   └── chord-variation-matcher.ts
└── result-composer.ts
```

- [x] `TechniqueMatcher` 인터페이스 정의
- [x] `MatchContext` 정의
- [x] `MatchResult` 정의
- [x] 기존 4개 기법 matcher 이전
- [x] DB `rule_type`과 matcher 연결 registry 작성
- [x] priority·confidence 정렬 로직 작성
- [x] 기존 응답 필드 유지

### Enhancement Step 4. 기존 기법 정밀화

- [x] 세컨더리 도미넌트 목표 도수 계산 및 `V7/ii` metadata 반환
- [x] dominant `7`·`9` 지원
- [x] `VII diminished` 목표 오탐 방지
- [x] 세컨더리 리딩톤 디미니시드
- [x] 모달 인터체인지 `iv`, `bVI`, `bVII`, `bIII` 세분화
- [x] 차용 모드 metadata 반환
- [x] 단순 베이스 지정과 1·2·3전위 구분
- [x] 하강·상승 베이스와 슬래시 코드 연계

### Enhancement Step 5. 4마디 진행 분석

목표: 단일 코드 변경 분석과 별도로 4마디 전체 패턴을 분석한다.

- [x] `ProgressionAnalyzer` 추가
- [x] 4마디 전체 코드 기능 배열 계산
- [x] 정격 종지 `V → I`
- [x] 반종지 `... → V`
- [x] 변격 종지 `IV → I`
- [x] 기만 종지 `V → VI`
- [x] `ii → V → I`
- [x] `IV → V → I`
- [x] 5도권 순환
- [x] 반복·루프 진행

### Enhancement Step 6. 베이스 라인 및 고급 재화성

- [x] 하강·상승 베이스 라인
- [x] 반음계 베이스
- [x] 페달 포인트
- [x] 트라이톤 대리
- [x] 백도어 도미넌트
- [x] 패싱·공통음 디미니시드
- [x] 크로매틱 미디언트

### Enhancement Step 7. 하위 호환 응답 확장

기존 FE가 사용하는 필드는 유지하고 확장 필드만 추가한다.

- [x] `confidence`
- [x] `evidence`
- [x] `targetDegree`
- [x] `sourceMode`
- [x] `progressionPattern`
- [x] `alternatives`
- [x] 분석 범위와 target 위치를 담은 `context`

### Enhancement Step 8. 회귀·통합 테스트

- [x] 기존 Wave 5 분석 테스트 전부 통과
- [x] beat 누락 fallback 테스트
- [x] 복수 코드 마디 첫·중간·마지막 박 테스트
- [x] 세컨더리 도미넌트 목표 도수 테스트
- [x] 세컨더리 리딩톤 디미니시드 테스트
- [x] 모달 인터체인지 `iv`, `bVI`, `bVII`, `bIII` 테스트
- [x] 종지·기능 진행 테스트
- [x] 베이스 라인 테스트
- [x] 규칙 priority 충돌 테스트
- [x] 기존 응답 필드 하위 호환 테스트
- [x] FE API fixture 통합 테스트

## 10. 실행 순서 요약

```text
기준선 고정
→ 입력 정규화
→ harmonic-math
→ matcher 분리
→ 기존 기법 정밀화
→ 4마디 진행 분석
→ 베이스·고급 재화성
→ 응답 확장
→ 회귀·통합 검증
```

첫 구현 단위는 **Enhancement Step 1: 분석 입력 정규화**로 한다. 이 단계가 완료되기 전에는 새로운 기법 matcher를 추가하지 않는다.

## 11. 고급 보이싱 및 음성 진행 분석 (추후 진행 사항)

현재 시스템은 코드의 도수·화음 유형·텐션·베이스 도수만 관리한다. 따라서 실제 음성 진행을 분석하려면 코드 기호와 별도로 각 성부의 음정·옥타브·보이싱 정보가 필요하다.

### 11.1 분석 목표

- 코드 기호가 아닌 실제 음표 배치 간의 이동 분석
- 공통음 유지와 최소 이동 여부 분석
- 베이스·테너·알토·소프라노의 성부별 진행 분석
- 병진행·병행 5도·병행 8도 탐지
- 음역·간격·성부 교차 문제 탐지
- 해결되어야 하는 가이드톤의 진행 분석
- 코드 변경의 이론적 기법과 실제 보이싱 품질을 함께 설명

### 11.2 필요한 데이터 모델

현재 `ChordStep`만으로는 음성 진행을 계산할 수 없으므로 다음 선택적 보이싱 모델을 추가한다.

```ts
type VoicedNote = {
  midi: number;
  pitchClass: number;
  octave: number;
  role?: "root" | "third" | "fifth" | "seventh" | "tension" | "bass";
};

type ChordVoicing = {
  notes: VoicedNote[];
  bassMidi?: number;
  inversion?: string;
};

type VoiceLeadingContext = {
  before: ChordVoicing;
  after: ChordVoicing;
  voices?: {
    bass?: number;
    tenor?: number;
    alto?: number;
    soprano?: number;
  };
};
```

### 11.3 분석 기법

#### 성부 이동

- [ ] 각 음표의 이동 거리 계산
- [ ] 각 성부의 상행·하행·유지 구분
- [ ] 반음·온음 단위의 순차 진행 판별
- [ ] 최소 음성 이동(voice leading cost) 계산
- [ ] 반진행·사선진행·유사진행 구분
- [ ] 공통음 유지 판별

#### 금지 또는 주의 진행

- [ ] 병행 5도 탐지
- [ ] 병행 8도 탐지
- [ ] 직접 5도·직접 8도 탐지
- [ ] 성부 교차 감지
- [ ] 성부 겹침 감지
- [ ] 지나치게 넓은 성부 간격 감지
- [ ] 베이스와 상성부의 과도한 도약 감지

#### 화성 역할과 해결

- [ ] 3음 생략·중복 판별
- [ ] 7음의 하행 해결 판별
- [ ] 도미넌트 가이드톤의 반음 해결 판별
- [ ] 불완전한 도미넌트 해결 감지
- [ ] 텐션의 적정 음역 판별
- [ ] 슬래시 코드에서 베이스와 상성부 충돌 감지

### 11.4 권장 분석 API

기존 `/api/analysis`의 코드 기법 분석과 보이싱 분석을 분리한다.

```text
POST /api/analysis/voicing
```

요청 예:

```json
{
  "tonic": "C",
  "before": {
    "chord": { "degree": "V", "quality": "dominant", "extension": "7" },
    "voicing": { "notes": [ { "midi": 55 }, { "midi": 59 }, { "midi": 62 }, { "midi": 65 } ] }
  },
  "after": {
    "chord": { "degree": "I", "quality": "major", "extension": null },
    "voicing": { "notes": [ { "midi": 48 }, { "midi": 55 }, { "midi": 60 }, { "midi": 64 } ] }
  }
}
```

응답 예:

```json
{
  "ok": true,
  "issues": [
    {
      "type": "parallel_fifth",
      "severity": "warning",
      "voices": ["tenor", "alto"],
      "message": "테너와 알토에서 병행 5도가 발생합니다."
    }
  ],
  "movement": {
    "commonToneCount": 2,
    "totalSemitoneCost": 5,
    "bassMotion": "downward"
  },
  "confidence": 0.91
}
```

기존 `/api/analysis`는 코드 기법과 4마디 진행 패턴을 담당하고, `/api/analysis/voicing`은 실제 음표 배치의 품질을 담당한다.

### 11.5 구현 단계

#### Voicing Wave A. 데이터 계약

- [ ] `VoicedNote`, `ChordVoicing`, `VoiceLeadingContext` 타입 정의
- [ ] MIDI 음정과 pitch class 변환 유틸리티 작성
- [ ] 코드 기호에서 기본 close voicing 생성
- [ ] 보이싱이 없는 요청의 처리 정책 결정
- [ ] 기존 코드 저장 데이터와 보이싱 데이터의 분리 저장 방식 결정

#### Voicing Wave B. 순수 음성 진행 엔진

- [ ] 음정별 이동 거리 계산
- [ ] 공통음·반진행·사선진행 판별
- [ ] 성부별 음역·간격 검증
- [ ] 병행 5도·8도 판별
- [ ] 가이드톤 해결 분석
- [ ] 보이싱 분석 단위 테스트 작성

#### Voicing Wave C. API·제품 연동

- [ ] `POST /api/analysis/voicing` 구현
- [ ] 보이싱 오류·경고 응답 형식 확정
- [ ] 기존 코드 분석 결과와 보이싱 결과 결합 여부 결정
- [ ] MIDI 재생 모듈과 보이싱 데이터 연계
- [ ] FE 분석 패널에 경고·근거 표시

### 11.6 선행 결정 사항

- 실제 보이싱을 MVP 저장 데이터에 포함할지 결정
- 사용자가 음표를 직접 입력할지, 코드에서 자동 보이싱을 생성할지 결정
- 성부 수를 4성부로 고정할지 자유 음표 수를 허용할지 결정
- 병행 5도·8도를 오류로 볼지 경고로만 표시할지 결정
- 보이싱 분석을 코드 재생·MIDI 기능과 함께 개발할지 결정
- 이론적 정답보다 사용자가 선택한 장르·스타일을 우선할지 결정

현재 MVP에서는 보이싱 데이터가 없으므로 이 섹션은 후속 고도화 범위로 유지한다.