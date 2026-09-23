# 🎵 Chord Progression Manager (CPManager)

> **Next.js 15 & React 19 기반의 로컬 작곡 보조 및 코드 진행 설계 웹 애플리케이션**  
> 송폼(Song Form) 구성, 도수(Roman Numeral Degree) 기반 코드 차트 작성, 인라인 화성 에디터, 스마트 4마디 진행 추천 및 고차원 화성 분석 엔진을 제공합니다.

---

## 📌 목차
1. [프로젝트 소개](#-프로젝트-소개)
2. [주요 기능](#-주요-기능)
3. [기술 스택 & 시스템 아키텍처](#-기술-스택--시스템-아키텍처)
4. [디렉터리 구조](#-디렉터리-구조)
5. [시작하기 (Quickstart)](#-시작하기-quickstart)
6. [테스트 및 검증](#-테스트-및-검증)
7. [기획 및 작업 문서 체계](#-기획-및-작업-문서-체계)

---

## 📖 프로젝트 소개

**Chord Progression Manager(CPManager)**는 작곡 입문자 및 취미 작곡가가 직관적으로 한 곡의 완성도 높은 코드 진행을 설계할 수 있도록 돕는 로컬 퍼스트(Local-first) 작곡 보조 웹 애플리케이션입니다.

- **도수 중심 추상화 (Degree-based Abstraction)**: 모든 진행 데이터는 조성에 독립적인 로마자 도수(`I`, `ii`, `IV`, `V` 등)와 화음 속성(품질, 텐션, 슬래시 베이스)으로 보존되며, 화면에는 사용자가 선택한 12개 표준 장조의 실제 연주 코드로 실시간 변환하여 렌더링합니다.
- **안전한 인메모리 반응형 초안 아키텍처**: 모든 편집(구간 추가, 순서 변경, 마디 조절, 코드 할당, 추천 적용)은 클라이언트 인메모리 초안(`ProjectDraftContext`)에서 순수 함수형 리듀서(`draft-reducer`)를 통해 비파괴적으로 이루어지며, 명시적 저장 시에만 SQLite 데이터베이스에 원자적(Atomic)으로 커밋됩니다.
- **고차원 화성 분석 엔진 (Dual-mode Harmonic Engine)**: 단일 코드 변형(세컨더리 도미넌트, 모달 인터체인지, 전위, 텐션)뿐 아니라 4마디 블록의 거시적 흐름(정격/반/변격/기만 종지, ii-V-I, 5도권 순환, 하강 베이스 라인)을 플러그형 매처와 음악 수학 모듈을 통해 실시간 분석하고 신뢰도 및 근거를 제공합니다.

---

## ✨ 주요 기능

### 1. 🎹 조성(Tonic) & 다이어토닉 퀵 팔레트
- **12개 표준 장조 지원**: C, Db, D, Eb, E, F, Gb, G, Ab, A, Bb, B 표준 플랫(Flat) 표기계 완벽 지원
- **실시간 다이어토닉 7코드 팔레트**: 선택된 장조의 7개 다이어토닉 코드와 실제 코드명을 상단에 상시 노출하여 원클릭 코드 입력 지원
- **키보드 단축키 지원**: 숫자키 `1`~`7`을 눌러 선택된 마디/비트에 다이어토닉 코드를 즉시 할당, `Delete`/`Backspace`로 안전 삭제, `Esc`로 선택 해제

### 2. 🎼 듀얼 뷰 송폼 워크스페이스 (Full Song Form & Single View)
- **세그먼트 뷰 토글**: 개별 마디 상세 작업용 `[🔍 구간별 보기]` ↔ 곡 전체 흐름을 일체형으로 조망하는 `[📄 전체 송폼 보기]` 모드 전환
- **전체 곡 누적 마디 번호 (Cumulative Bar Indexing)**: 구간 내 번호(예: `#1~#8`) 외에 곡 시작부터의 누적 마디 번호(예: Intro `#1~#4`, Verse `#5~#12`, Chorus `#13~#20`)를 마디 카드와 헤더에 실시간 계산·표기
- **실시간 드래그 앤 드롭(DND) 동기화**: 좌측 송폼 패널에서 구간을 드래그하거나 `▲`/`▼` 이동 시 전체 송폼 화면의 카드 순서와 누적 마디 번호가 100% 실시간 불변 상태로 재배치
- **송폼 카드 접기/최소화 & 코드 요약 프리뷰**: 구간별 최소화 지원 및 축소 상태에서도 `[진행: C - Am - F - G7]` 실제 코드 요약 뱃지 제공
- **다중 송폼 구간 일괄 생성 (Bulk Section Builder)**: 2줄 카드 형태의 모달 레이아웃에서 `+` 버튼으로 원하는 모든 송폼 구조를 한 번에 일괄 추가

### 3. 🎛️ 인라인 코드 빌더 & 정밀 화성 에디터 (Inline Chord Builder)
- **논블로킹(Non-blocking) 인라인 인스펙터**: 화면을 가리는 모달 없이 메인 차트 하단에서 즉각 조작 가능한 화성 편집기
- **화음 성질 (Quality)**: Major, Minor, Dominant 7, Diminished, Half-Diminished(m7b5)
- **텐션 및 확장 (Extension)**: 3화음(none), 7, maj7, 9, sus4, m7b5 (화음 성질별 비호환 텐션 자동 비활성화 가드 적용)
- **베이스 전위 (Inversion / Slash Bass)**: Root(기본), /3(1전위), /5(2전위), /7(3전위) 원클릭 지정
- **화성학 퀵 프리셋**:
  - 세컨더리 도미넌트 (`V7/ii`, `V7/V`, `V7/vi`, `V7/IV`)
  - 모달 인터체인지 (`IVm`, `bVI`, `bVII`)
  - 대표 슬래시 코드 (`V/VII`, `I/III`)

### 4. 📊 4/4 박자 기반 코드 차트 그리드 & 비트 분할
- **4마디 블록 자동 분할 & 상태 뱃지**:
  - 겹치지 않는 4마디 블록 레이아웃 (`#1~#4`, `#5~#8` 등)
  - 블록별 상태 자동 판별 뱃지: `4마디 추천 대상`, `4마디 미만 (추천 제외)`, `복수 코드 포함 (추천 제외)`, `4마디 입력 완료`
- **지능형 뷰 모드 전환**:
  - **1마디 1코드 뷰**: 큼직하고 시인성 높은 대형 코드명 중심 렌더링
  - **1마디 4박 분할 뷰**: 1~4박 비트 눈금 슬롯 및 비트별 독립 코드 렌더링
  - **자동 확장**: 마디에 2개 이상의 코드가 입력되면 자동으로 4박 분할 뷰로 확장되고 보라색 `복수 N코드` 뱃지 표시

### 5. 💡 지능형 4마디 추천 진행 (Smart 4-Bar Recommendation)
- **코드 상태 지문(Fingerprint) 기반 실시간 자동 갱신**: 블록 내 코드 입력·수정·삭제 시 지문 문자열을 감지하여 150ms 디바운스로 추천 목록 자동 갱신
- **정렬 탭 상태 보존 (Preserve Active Sort)**: 자동 갱신 시에도 사용자가 선택한 정렬 탭(`대중성 우선`, `코드 연결성 우선`, `다양성 우선`, `무작위`) 유지
- **동적 블록 타겟팅 & 비파괴적 병합 (Non-destructive Merge)**: 타겟 블록 내에서 비어 있는 마디만 추천 코드로 채우며, 기존 작업 코드는 안전하게 보존
- **예외 상태 자동 전환**: 4마디가 모두 채워지면 `all_filled`, 1마디 복수 코드 발생 시 `multi_chord_excluded` 화면으로 자동 전환

### 6. 🔍 고차원 화성 분석 엔진 (Enhanced Harmonic Analysis Engine)
- **이원화 분석 아키텍처 (Dual-mode Architecture)**:
  - **국소 변형 분석 (Mutation)**: 단일 코드 편집 시 세컨더리 도미넌트, 모달 인터체인지, 슬래시 전위 화음 감지
  - **블록 진행 분석 (Progression)**: 4마디 전체 흐름을 추적하여 종지, 기능 진행, 베이스 라인 모션 감지
- **풍부한 피드백 메트릭스**:
  - **신뢰도 게이지 (Confidence)**: 0.0 ~ 1.0 (0~100%) 판정 신뢰도 시각화
  - **구조적 근거 (Evidence)**: 화성학적 판정 사유 불릿 리스트 제공
  - **세부 메타데이터**: 목표 도수(`targetDegree`), 차용 모드(`sourceMode`), 전위 정보(`inversion`)
- **4마디 종지 & 거시 진행 리포트 (`progressionPattern`)**:
  - 정격 종지(`V - I`), 반종지(`.. - V`), 변격 종지(`IV - I`), 기만 종지(`V - VI`)
  - `ii - V - I` 진행, `IV - V - I` 진행, 5도권 순환 진행(Circle of Fifths), 2마디 반복 루프
  - 하강 베이스 라인(Descending Bass Line), 상승 베이스, 페달 포인트(Pedal Point)
- **고급 재화성학 매처 13종 완비**:
  - 세컨더리 도미넌트(`7/9`), 세컨더리 리딩톤 디미니시드(`vii°7/X`), 모달 인터체인지(`iv, bVI, bVII, bIII`), 트라이톤 대리(SubV), 백도어 도미넌트(`bVII7 -> I`), 크로매틱 미디언트, 패싱/공통음 디미니시드
- **복수 대안 해석 (Alternatives)**: 다의적 화성 진행에 대한 2순위 대안 해석 목록 아코디언 제공

### 7. ⭐ 사용자 진행 보관함 (나만의 코드 진행 Vault)
- **시스템 추천과의 물리적 격리**: 시스템 추천 160선과 완전히 분리되어 영구 보존되는 개인 작곡 진행 데이터베이스
- **4슬롯 와일드카드(`x`) 패턴 검색**: `x - II - V - x` 등 임의의 슬롯에 와일드카드(`x`)를 지정하여 원하는 코드 진행을 즉시 탐색 (전체 `x` 방어 가드 내장)
- **스마트 등록 및 4마디 원클릭 복사**: 도수, 품질, 텐션, 베이스를 직접 지정하여 등록하거나, 현재 작업 중인 4마디 코드를 클릭 한 번으로 복사하여 보관함에 저장
- **실시간 조성 변환 및 비파괴 적용**: 보관된 진행을 현재 프로젝트의 장조 코드로 실시간 변환하여 미리보고, 작업 중인 마디 블록에 안전하게 적용

### 8. 💾 프로젝트 라이프사이클 관리
- **프로젝트 모달**: 신규 프로젝트 생성(커스텀 송폼 빌더 연동), 프로젝트 목록 조회, 불러오기, 삭제(연쇄 삭제 및 확인 대화상자)
- **미저장 변경사항 보호**: `isDirty` 상태 추적, 브라우저 탭 닫기/새로고침 시 `beforeunload` 경고, 새 프로젝트 생성 시 변경사항 유실 확인 대화상자 제공

---

## 🛠 기술 스택 & 시스템 아키텍처

### Frontend
- **Framework**: Next.js 15.5.0 (App Router)
- **Library**: React 19.1.0
- **Language**: TypeScript 5.8.0 (Strict mode)
- **Styling**: Tailwind CSS v4.3.3 (`@tailwindcss/postcss`)

### Backend & Storage
- **Runtime**: Node.js v20+
- **API**: Next.js Route Handlers (`app/api/*`)
- **Database**: SQLite 3 (WAL 모드 & `busy_timeout: 5000` 설정으로 다중 동시성 보장)
- **Driver**: Node.js 내장 `node:sqlite` / SQLite3 Native

### 클라이언트-서버 데이터 흐름
```text
[User Action] (Click Bar / Section / Palette / Inline Builder / Shortcut)
       │
       ▼
[ProjectDraftContext] ───► [draft-reducer] (Pure Immutable State Transition)
       │
       ├───────────────────────────────────────────────────────┐
       ▼                                                       ▼
[Reactive Workspace UI]                               [Realtime Analysis Hook]
(Header, SectionList, FullSongFormView,                (Debounced 150ms Fingerprint)
 ChordChartGrid, InlineChordBuilder,                           │
 RecommendationPanel, TechniqueCard)                           ▼
       │                                              [POST /api/analysis]
       ▼ (Explicit Save Action)                                │
[serializeProjectDraft]                                        ▼
       │                                              [Harmonic Analysis Engine]
       ▼                                              (Mutation + Progression Analyzers)
[PUT /api/projects/:id] ──► [SQLite DB (Atomic)]               │
       │                                                       ▼
       ▼                                              [Rich Feedback Response]
[rehydrate ProjectDraft]                              (confidence, evidence, patterns)
```

---

## 📁 디렉터리 구조

```text
cpmanager/
├── app/
│   ├── api/                           # Next.js Route Handlers (RESTful API)
│   │   ├── analysis/                  # 실시간 고차원 화성 기법 & 종지 분석 엔드포인트
│   │   ├── meta/                      # 키, 송폼, 다이어토닉, 코드 카탈로그 메타 API
│   │   ├── projects/                  # 프로젝트 CRUD & 차트 렌더링 API
│   │   ├── recommendations/           # 초안 기반 4마디 추천 API
│   │   └── user-progressions/         # 사용자 도수 진행 등록 & 와일드카드(x) 검색 API
│   ├── components/                    # React UI 컴포넌트
│   │   ├── analysis/                  # HarmonicAnalysisPanel, TechniqueCard (신뢰도/증거)
│   │   ├── chordchart/                # ChordChartGrid, BarCard, FullSongFormView, InlineChordBuilder
│   │   ├── common/                    # Modal, ConfirmDialog, Toast
│   │   ├── layout/                    # Header, WorkspaceLayout (3패널 레이아웃)
│   │   ├── progression/               # UserProgressionPanel, UserProgressionModal
│   │   ├── project/                   # ProjectListModal, CreateProjectModal
│   │   ├── recommendation/            # RecommendationPanel (4대 정렬, 자동 갱신)
│   │   ├── songform/                  # SectionList (순서 DND/마디조절), AddSectionModal (일괄 생성)
│   │   └── workspace/                 # WorkspaceShell (메인 오케스트레이터)
│   ├── lib/
│   │   ├── client/                    # Draft Context, Draft Reducer, Serializer, API Client
│   │   ├── server/                    # DB 초기화(WAL), 마이그레이션, 시더, 레포지토리
│   │   │   ├── domain/                # technique-matcher, progression-matcher, harmonic-math
│   │   │   └── services/              # recommendation-service, technique-analyzer, progression-analyzer
│   │   └── shared/                    # 코드 카탈로그, 도수-실제코드 변환기, harmonic-math
│   ├── types/                         # 공통 TypeScript 인터페이스 (Draft, DB, API, Feedback)
│   ├── globals.css                    # Tailwind CSS v4 스타일시트
│   ├── layout.tsx                     # 루트 레이아웃 (ToastProvider 등)
│   └── page.tsx                       # 메인 엔트리 페이지
├── data/                              # 로컬 SQLite 데이터베이스 파일 (`cpmanager.sqlite`)
├── progression/                       # 기본 추천 도수 진행 카탈로그 데이터 (160선)
├── scripts/                           # DB 마이그레이션 및 시딩 CLI 스크립트
├── suggestion/                        # 아키텍처 분석 및 개선 제안서
│   └── typesafe-ai.md                 # TypeSafe AI 기반 리팩토링 제안서
├── test/                              # node:test 기반 통합/단위 테스트 스위트 (80개 테스트)
├── wave_log/                          # 단계별 개발 로그 및 기술 참조 아카이브 (총 23개 로그)
├── development_plan.md                # 6단계 점진적 개발 계획서
├── functional_specification.md        # 세부 기능 명세서
├── product_plan.md                    # 제품 기획서
├── fe-enhancements.md                 # 프론트엔드 고도화 명세서
├── be-enhancements.md                 # 백엔드 화성 분석 고도화 명세서
├── test-enhancements.md               # 테스트 고도화 및 품질 검증 계획서
├── test-enhancements-todo.md          # 테스트 고도화 작업 체크리스트
├── fe-todo.md                         # 프론트엔드 작업 체크리스트
├── todo.md                            # 백엔드/통합 작업 체크리스트
├── package.json
└── tsconfig.json
```

---

## 🚀 시작하기 (Quickstart)

### 요구 사양
- **Node.js**: v20.0.0 이상
- **npm**: v9.0.0 이상

### 1. 저장소 클론 및 패키지 설치
```bash
git clone https://github.com/shinel94/cpmanager.git
cd cpmanager
npm install
```

### 2. 데이터베이스 초기화 및 시드 데이터 주입
시스템 기본 코드 진행 160선 및 13종 화성 기법 분석 규칙 데이터를 SQLite DB에 마이그레이션하고 시딩합니다.
```bash
npm run db:migrate
npm run db:seed
```

### 3. 신규 코드 진행 증분 업데이트 (선택 사항)
기존 DB와 사용자 프로젝트 데이터를 보존한 채 신규 진행(Part 6: J-Rock, K-Pop, 보컬로이드, 팝 펑크/브릿팝 등 총 32선)을 증분 반영합니다.
```bash
npm run db:update progression/seed_progressions_6.sql
```

### 4. 개발 서버 실행
```bash
npm run dev
```
브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하여 작곡 워크스페이스를 이용할 수 있습니다.

### 5. 프로덕션 빌드 및 실행
```bash
npm run build
npm start
```

---

## 🧪 테스트 및 검증

프로젝트의 안정성, 하위 호환성, 그리고 음악 이론적 무결성을 보장하기 위해 `node:test` 기반의 테스트 스위트가 구축되어 있습니다.

```bash
# TypeScript 정적 타입 검사 (0 errors)
npm run typecheck

# 단위 및 통합 테스트 실행 (80개 테스트 100% 통과)
npm test
```

### 주요 테스트 스위트 범위
- **클라이언트 리듀서 (`draft-reducer`)**: 송폼 순서 DND 재배치, 마디 확장/축소, 다중 송폼 일괄 추가(`ADD_SECTIONS_BULK`), 1마디 4박 분할 복수 코드 주입 및 단일 박 삭제, 인라인 코드 변형
- **전체 송폼 뷰 (`FullSongFormView`)**: 누적 마디 메트릭스 산출, 구간 간 코드 편집 격리성, 송폼 카드 최소화 및 코드 요약 프리뷰
- **4마디 추천 엔진 (`RecommendationPanel`)**: 코드 상태 지문(Fingerprint) 기반 실시간 자동 갱신, 정렬 탭 보존, 2번째 블록(5~8마디) 타겟팅 비파괴 병합, 4마디 미만 가드, 예외 상태 자동 전환
- **공통 화성 수학 (`harmonic-math`)**: 도수-반음 변환, 반음 간격 연산, 다이어토닉 검증, 베이스 라인 모션(하강/상승/페달) 판별
- **플러그형 화성 매처 13종 (`TechniqueMatcher`)**: 세컨더리 도미넌트(7/9) 목표 도수 산출, 모달 인터체인지 차용 모드 판별, 슬래시 전위 화음, 트라이톤 대리, 백도어 도미넌트, 구조적 증거(Evidence) 반환
- **4마디 거시 진행 분석기 (`ProgressionAnalyzer`)**: 정격/반/변격/기만 종지 판별, ii-V-I 및 5도권 순환 진행, 하강 베이스 라인 클리셰, API 하위 호환성 보장
- **사용자 진행 보관함 & Route Handlers**: 와일드카드(`x`) 도수 검색, 시스템 데이터와의 엄격한 DB 격리, WAL 모드 트랜잭션 원자성

---

## 📚 기획 및 작업 문서 체계

### 1. 기획 및 기술 명세서
- [제품 기획서 (`product_plan.md`)](product_plan.md): 제품 비전, 사용자 시나리오 및 기능 범위 정의
- [세부 기능 명세서 (`functional_specification.md`)](functional_specification.md): 도메인 규칙, 데이터베이스 스키마 및 REST API 명세
- [개발 계획서 (`development_plan.md`)](development_plan.md): 기본 Wave 0~6 단계별 구축 계획 및 품질 게이트
- [프론트엔드 고도화 계획서 (`fe-enhancements.md`)](fe-enhancements.md): 추천 자동 갱신, 전체 송폼 뷰, 인라인 빌더, 벌크 송폼 설계서
- [백엔드 화성 분석 고도화 계획서 (`be-enhancements.md`)](be-enhancements.md): 이원화 분석 엔진, 플러그형 매처, 거시 진행/종지 분석 스펙 및 9단계 작업 로드맵
- [테스트 고도화 및 품질 검증 계획서 (`test-enhancements.md`)](test-enhancements.md): BE/FE/E2E 전 계층 결핍 분석, 상세 테스트 스펙 및 4단계 로드맵
- [테스트 고도화 작업 체크리스트 (`test-enhancements-todo.md`)](test-enhancements-todo.md): 단계별 테스트 개발 체크리스트 및 품질 게이트
- [TypeSafe AI 분석 제안서 (`suggestion/typesafe-ai.md`)](suggestion/typesafe-ai.md): TypeSafe AI primitive 기반 리팩토링 및 신뢰도 게이팅 제안서

### 2. 단계별 작업 로그 디렉터리 (`wave_log/`)
모든 기능 구현 및 리팩터링 내역, 아키텍처 결정 사항(ADR), 트러블슈팅 내역이 상세하게 기록되어 있습니다:

#### 🔹 기본 구축 (Wave 0 ~ 6)
- **백엔드**: [`wave0.log`](wave_log/wave0.log) (초기화) | [`wave1.log`](wave_log/wave1.log) (DB/시드) | [`wave2.log`](wave_log/wave2.log) (프로젝트 API) | [`wave3.log`](wave_log/wave3.log) (송폼/블록) | [`wave4.log`](wave_log/wave4.log) (텐션/슬래시) | [`wave5.log`](wave_log/wave5.log) (추천/기법분석 API) | [`wave6.log`](wave_log/wave6.log) (사용자 진행 보관함)
- **프론트엔드**: [`fe-wave0.log`](wave_log/fe-wave0.log) (환경 구축) | [`fe-wave1.log`](wave_log/fe-wave1.log) (3패널 레이아웃) | [`fe-wave2.log`](wave_log/fe-wave2.log) (프로젝트 라이프사이클 UI) | [`fe-wave3.log`](wave_log/fe-wave3.log) (송폼/4마디 차트 그리드) | [`fe-wave4.log`](wave_log/fe-wave4.log) (텐션/슬래시 편집 모달) | [`fe-wave5.log`](wave_log/fe-wave5.log) (추천 패널 & 실시간 분석 연동) | [`fe-wave6.log`](wave_log/fe-wave6.log) (사용자 진행 보관함 UI)

#### 🔹 프론트엔드 고도화 (FE Enhance 0 ~ 4)
- [`fe-wave-enhance0.log`](wave_log/fe-wave-enhance0.log): 4마디 추천 실시간 자동 새로고침(지문 반응성), 정렬 탭 보존, 무한 렌더링 루프 트러블슈팅
- [`fe-wave-enhance1.log`](wave_log/fe-wave-enhance1.log): 전체 송폼 보기 화면 (`FullSongFormView`), 곡 전체 누적 마디 메트릭스, 송폼 카드 최소화 & 진행 요약 프리뷰
- [`fe-wave-enhance2.log`](wave_log/fe-wave-enhance2.log): 고차원 화성 분석 피드백 연동, 신뢰도/근거/메타데이터 UI, 4마디 종지 및 대안 해석 아코디언
- [`fe-wave-enhance3.log`](wave_log/fe-wave-enhance3.log): 인라인 코드 빌더 (`InlineChordBuilder`), 논블로킹 텐션/전위 에디터 및 실시간 화성 분석 즉각 피드백
- [`fe-wave-enhance4.log`](wave_log/fe-wave-enhance4.log): 다중 송폼 구간 일괄 생성 (`AddSectionModal` 벌크 빌더) 및 새 프로젝트 커스텀 송폼 빌더

#### 🔹 백엔드 화성 분석 고도화 (BE Enhance 0 ~ 5)
- [`be-wave-enhance0.log`](wave_log/be-wave-enhance0.log): 화성 분석 기법 개선 준비도 리뷰, 5대 핵심 블로커 식별 및 이원화 아키텍처 수립
- [`be-wave-enhance1.log`](wave_log/be-wave-enhance1.log): 공통 화성 수학 모듈 (`harmonic-math.ts`), 도수-반음 거리 연산 및 베이스 모션 분류기
- [`be-wave-enhance2.log`](wave_log/be-wave-enhance2.log): 플러그형 매처 아키텍처 (`TechniqueMatcher`), 매처 레지스트리 및 구조적 증거(Evidence) 반환
- [`be-wave-enhance3.log`](wave_log/be-wave-enhance3.log): 세컨더리 도미넌트(7/9) 정밀화, 세컨더리 리딩톤 디미니시드, 모달 인터체인지 차용 모드 세분화
- [`be-wave-enhance4.log`](wave_log/be-wave-enhance4.log): 4마디 블록 종지(정격/반/변격/기만) 및 진행 패턴(`ii-V-I`, 5도권 순환) 분석기 (`ProgressionAnalyzer`)
- [`be-wave-enhance5.log`](wave_log/be-wave-enhance5.log): 베이스 라인 모션(하강/상승/페달) 및 고급 재화성학(트라이톤 대리, 백도어, 크로매틱 미디언트 등 13종 매처) 완성

---

## 📄 라이선스
This project is private and developed for personal composition assistance.
