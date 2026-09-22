# 🎵 Chord Progression Manager (CPManager)

> **Next.js 15 & React 19 기반의 로컬 작곡 보조 및 코드 진행 설계 웹 애플리케이션**  
> 송폼(Song Form) 구성, 도수(Roman Numeral Degree) 기반 코드 차트 작성, 스마트 4마디 진행 추천 및 실시간 화성 기법 분석을 제공합니다.

---

## 📌 목차
1. [프로젝트 소개](#-프로젝트-소개)
2. [주요 기능](#-주요-기능)
3. [기술 스택 & 시스템 아키텍처](#-기술-스택--시스템-아키텍처)
4. [디렉터리 구조](#-디렉터리-구조)
5. [시작하기 (Quickstart)](#-시작하기-quickstart)
6. [테스트 및 검증](#-테스트-및-검증)
7. [기획 및 작업 문서](#-기획-및-작업-문서)

---

## 📖 프로젝트 소개

**Chord Progression Manager(CPManager)**는 작곡 입문자 및 취미 작곡가가 직관적으로 한 곡의 코드 진행을 완성할 수 있도록 돕는 로컬 퍼스트 작곡 도구입니다.

- **도수 중심 추상화**: 내부 데이터는 조성에 독립적인 도수(I, ii, V 등)와 코드 속성(품질, 텐션, 분수 베이스)으로 보존하며, 화면에는 사용자가 선택한 12개 표준 장조의 실제 연주 코드로 실시간 변환하여 렌더링합니다.
- **안전한 클라이언트 초안 아키텍처**: 모든 편집(구간 추가, 마디 조절, 코드 입력, 추천 적용)은 인메모리 반응형 초안(Draft Context)에서 비파괴적으로 이루어지며, 사용자가 명시적으로 저장할 때만 SQLite 데이터베이스에 원자적(Atomic)으로 커밋됩니다.
- **규칙 기반 화성학 엔진**: 세컨더리 도미넌트, 모달 인터체인지, 대리 코드(트라이톤 서브), 패싱 디미니쉬드 등의 음악 이론적 의미를 규칙 기반으로 실시간 감지하여 피드백을 제공합니다.

---

## ✨ 주요 기능

### 1. 🎹 조성(Tonic) & 다이어토닉 팔레트
- **12개 표준 장조 지원**: C, Db, D, Eb, E, F, Gb, G, Ab, A, Bb, B 표준 플랫(Flat) 표기 기준 지원
- **실시간 다이어토닉 7코드 팔레트**: 현재 선택된 장조의 7개 다이어토닉 코드와 실제 코드명을 상단에 상시 노출
- **키보드 단축키 지원**: 숫자키 `1`~`7`을 눌러 선택된 마디/비트에 다이어토닉 코드를 즉시 할당, `Delete`/`Backspace`로 안전 삭제, `Esc`로 선택 해제

### 2. 🎼 송폼(Song Form) 편집기
- **7대 표준 송폼 프리셋**: `Intro`, `Verse`, `Pre-Chorus`, `Chorus`, `Interlude`, `Bridge`, `Outro` 및 사용자 정의 구간명 지원
- **순서 재배치 (드래그 앤 드롭 & 접근성 버튼)**: 송폼 카드 좌측의 드래그 핸들(`⋮⋮`) 또는 카드를 직접 마우스로 끌어다 놓는 직관적인 HTML5 드래그 앤 드롭(`Drag & Drop`)과 `▲`(위로 이동) / `▼`(아래로 이동) 단일 클릭 버튼을 모두 지원하여 자유롭고 빠른 송폼 순서 변경 지원
- **마디 수 스텝퍼 & 코드 유실 방지 가드**: `-` / `+` 버튼으로 구간별 마디 수(1~64)를 자유롭게 조정하되, 마디 축소 시 입력된 코드가 잘려나갈 경우 `ConfirmDialog`를 통해 유실을 사전 차단

### 3. 📊 4/4 박자 기반 코드 차트 그리드
- **4마디 블록 자동 분할 & 상태 배지**:
  - 겹치지 않는 4마디 단위 분할 레이아웃 (`#1~#4`, `#5~#8` 등)
  - 블록별 상태 자동 판별 배지: `4마디 추천 대상`, `4마디 미만 (추천 제외)`, `복수 코드 포함 (추천 제외)`, `4마디 입력 완료`
- **뷰 모드 전환**:
  - **1마디 1코드 뷰**: 큼직하고 시인성 높은 대형 코드명 중심 렌더링
  - **1마디 4박 분할 뷰**: 1~4박 비트 눈금 슬롯 및 비트별 독립 코드 렌더링
  - **지능형 자동 분할**: 한 마디에 2개 이상의 코드가 입력되면 자동으로 4박 분할 뷰로 확장되고 보라색 `복수 N코드` 배지 표시
- **2단계 코드 할당 인터랙션**: 마디(또는 특정 박자)를 먼저 클릭하여 포커스를 지정한 후, 상단 팔레트나 단축키로 안전하게 코드를 할당

### 4. 💡 스마트 4마디 추천 진행 (Dynamic 4-Bar Recommendation)
- **동적 블록 타겟팅**: 사용자가 차트 그리드에서 클릭한 블록(예: 2번째 블록 클릭 시 5~8마디)을 실시간 타겟팅하여 적용 (`이 진행 5~8마디에 적용하기`)
- **비파괴적 병합 (Non-destructive Merge)**: 타겟 블록 내에서 비어 있는 마디만 추천 코드로 채우며, 사용자가 미리 작업해 둔 코드는 안전하게 보존
- **4마디 미만 가드**: 선택된 블록의 마디 수가 4개 미만인 경우(예: 6마디 구간의 2번째 블록은 5~6마디 2개뿐) 추천 적용 버튼이 자동으로 비활성화(`disabled`)되어 데이터 무결성을 보호

### 5. 🔍 실시간 화성 기법 분석 (Realtime Technique Analyzer)
- 현재 작업 중인 4마디 진행 맥락을 분석하여 사용된 화성학적 테크닉(Secondary Dominant, Modal Interchange, Tritone Substitution 등)을 실시간 카드 형태로 안내

### 6. ⭐ 사용자 진행 보관함 (나만의 코드 진행 Vault)
- **시스템 추천과의 엄격한 격리**: 기본 시스템 추천 160선과 완전히 분리되어 영구 보존되는 개인 작곡 진행 보관함
- **4자리 도수 와일드카드 패턴 검색**: `x - II - V - x` 등 임의의 위치에 와일드카드(`x`)를 지정하여 원하는 코드 진행을 즉시 탐색 (전체 `x` 방어 가드 내장)
- **스마트 등록 및 4마디 원클릭 복사**: 도수, 화음 품질, 확장, 슬래시 베이스를 지정하여 등록하거나 현재 작업 중인 4마디의 코드를 클릭 한 번으로 복사하여 보관함에 즉시 저장
- **실시간 조성 변환 및 비파괴 적용**: 보관된 진행을 현재 프로젝트의 장조 조성 코드로 실시간 변환하여 미리보고, 작업 중인 마디 블록에 비파괴적으로 적용

### 7. 💾 프로젝트 라이프사이클 관리
- **프로젝트 모달**: 신규 프로젝트 생성, 프로젝트 목록 조회, 불러오기, 삭제(연쇄 삭제 및 확인 대화상자)
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
- **Database**: SQLite 3 (WAL 모드 & `busy_timeout: 5000` 설정으로 다중 읽기/쓰기 동시성 보장)
- **ORM / Driver**: Node.js `node:sqlite` / SQLite3 Native

### 클라이언트 상태 흐름
```
[User Action] (Click Bar / Section / Palette / Shortcut)
       │
       ▼
[ProjectDraftContext] ───► [draft-reducer] (Pure Immutable State Transition)
       │
       ▼
[Reactive Workspace UI] (Header, SectionList, ChordChartGrid, RecommendationPanel)
       │
       ▼ (Explicit Save Action)
[serializeProjectDraft] ───► [PUT /api/projects/:id] ───► [SQLite DB (Atomic Transaction)]
                                       │
                                       ▼
                             [rehydrate ProjectDraft]
```

---

## 📁 디렉터리 구조

```
cpmanager/
├── app/
│   ├── api/                           # Next.js Route Handlers (RESTful API)
│   │   ├── analysis/                  # 실시간 기법 분석 엔드포인트
│   │   ├── meta/                      # 키, 송폼, 다이어토닉, 코드 카탈로그 메타 API
│   │   ├── projects/                  # 프로젝트 CRUD & 차트 렌더링 API
│   │   ├── recommendations/           # 초안 기반 4마디 추천 API
│   │   └── user-progressions/         # 사용자 도수 진행 등록 & 와일드카드(x) 검색 API
│   ├── components/                    # React UI 컴포넌트 (모듈식 설계)
│   │   ├── chordchart/                # ChordChartGrid, BarCard (4마디 블록, 1코드/4박 뷰)
│   │   ├── common/                    # Modal, ConfirmDialog, Toast
│   │   ├── layout/                    # Header, WorkspaceLayout (3패널 레이아웃)
│   │   ├── project/                   # ProjectListModal, CreateProjectModal
│   │   ├── songform/                  # SectionList (순서/마디조절), AddSectionModal
│   │   └── workspace/                 # WorkspaceShell (메인 오케스트레이터)
│   ├── lib/
│   │   ├── client/                    # Draft Context, Draft Reducer, Serializer, API Client
│   │   ├── server/                    # DB 초기화(WAL), 마이그레이션, 시더, 레포지토리
│   │   └── shared/                    # 코드 카탈로그, 도수-실제코드 변환기, 검증 스키마
│   ├── types/                         # 공통 TypeScript 인터페이스 (Draft, DB, API)
│   ├── globals.css                    # Tailwind CSS v4 스타일시트
│   ├── layout.tsx                     # 루트 레이아웃 (ToastProvider 등)
│   └── page.tsx                       # 메인 엔트리 페이지
├── data/                              # 로컬 SQLite 데이터베이스 파일 (`cpmanager.sqlite`)
├── progression/                       # 기본 추천 도수 진행 카탈로그 데이터
├── scripts/                           # DB 마이그레이션 및 시딩 CLI 스크립트
├── test/                              # node:test 기반 통합/단위 테스트 스위트 (36개 테스트)
├── wave_log/                          # 기능 Wave별 상세 개발 로그 및 이슈 분석서
├── development_plan.md                # 6단계 점진적 개발 계획서
├── functional_specification.md        # 세부 기능 명세서
├── product_plan.md                    # 제품 기획서
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
시스템 기본 코드 진행 및 화성학 분석 기법 데이터를 SQLite DB에 마이그레이션하고 시딩합니다.
```bash
npm run db:migrate
npm run db:seed
```

### 3. 개발 서버 실행
```bash
npm run dev
```
브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하여 작곡 워크스페이스를 이용할 수 있습니다.

### 4. 프로덕션 빌드 및 실행
```bash
npm run build
npm start
```

---

## 🧪 테스트 및 검증

프로젝트의 안정성과 데이터 무결성을 보장하기 위해 `node:test` 기반의 테스트 스위트가 구축되어 있습니다.

```bash
# TypeScript 타입 검사
npm run typecheck

# 단위 및 통합 테스트 실행 (36개 테스트 100% 통과)
npm test
```

### 주요 테스트 범위
- **클라이언트 초안 리듀서**: 송폼 순서 재배치, 마디 확장/축소, 1마디 4박 분할 복수 코드 주입 및 단일 박 삭제
- **4마디 블록 & 추천 엔진**: 2번째 블록(5~8마디) 타겟팅 비파괴 병합, 4마디 미만 블록 가드, 복수 코드 마디 분기
- **프로젝트 라이프사이클**: 생성, 목록 조회, re-hydration, 키 변경에 따른 실제 코드 변환, 저장, 연쇄 삭제
- **백엔드 Route Handlers & DB**: WAL 모드 기반 트랜잭션 원자성, 메타 카탈로그, 추천 API, 기법 분석 API, 사용자 도수 검색

---

## 📚 기획 및 작업 문서

- [제품 기획서 (`product_plan.md`)](file:///Users/gimhyeyeon/Desktop/project/cpmanager/product_plan.md): 제품 비전, 사용자 시나리오 및 기능 범위 정의
- [세부 기능 명세서 (`functional_specification.md`)](file:///Users/gimhyeyeon/Desktop/project/cpmanager/functional_specification.md): 도메인 규칙, 데이터베이스 스키마 및 REST API 명세
- [개발 계획서 (`development_plan.md`)](file:///Users/gimhyeyeon/Desktop/project/cpmanager/development_plan.md): Wave 0~5 단계별 구축 계획 및 품질 게이트
- [작업 로그 디렉터리 (`wave_log/`)](file:///Users/gimhyeyeon/Desktop/project/cpmanager/wave_log):
  - [`fe-wave0.log`](file:///Users/gimhyeyeon/Desktop/project/cpmanager/wave_log/fe-wave0.log): 프론트엔드 환경 구성
  - [`fe-wave1.log`](file:///Users/gimhyeyeon/Desktop/project/cpmanager/wave_log/fe-wave1.log): 3패널 레이아웃 & 초안 컨텍스트
  - [`fe-wave2.log`](file:///Users/gimhyeyeon/Desktop/project/cpmanager/wave_log/fe-wave2.log): 프로젝트 라이프사이클 UI
  - [`fe-wave3.log`](file:///Users/gimhyeyeon/Desktop/project/cpmanager/wave_log/fe-wave3.log): 송폼 편집기 & 4/4 코드 차트 그리드
  - [`wave5.log`](file:///Users/gimhyeyeon/Desktop/project/cpmanager/wave_log/wave5.log): 백엔드 추천, 기법 분석, 사용자 진행 API

---

## 📄 라이선스
This project is private and developed for personal composition assistance.
