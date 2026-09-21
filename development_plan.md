# Chord Progression Manager 개발 순서 · 테이블 · API

사업 제안서, 제품 기획서, 세부 기능 정의서를 기준으로 MVP 구현 순서를 정리한다.  
1단계는 Node.js + SQLite 로컬 웹앱이다. 인증·외부 서버는 없다.

---

## 1. 개발 원칙

- 편집 중인 송폼·코드·추천 적용 결과는 클라이언트 초안으로 유지한다.
- 프로젝트 데이터는 사용자가 명시적으로 저장할 때만 전체 PUT 트랜잭션으로 SQLite에 반영한다. 자동 저장은 하지 않는다.
- 내부 데이터는 대문자 로마 숫자 도수와 코드 속성을 저장하고, 화면에는 선택한 장조 조성의 실제 코드로 표시한다.
- 추천·기법 분석은 4마디·4코드 단위다.
- 사용자 진행은 기본 추천 DB와 분리한다.
- 기본 추천 진행과 사용자 진행의 송폼 태그는 각각 별도 관계 테이블로 관리한다.
- 코드 속성은 유한 카탈로그로 검증한다.
- 단조 독립 선택, PDF/MIDI 내보내기, 재생, 계정은 MVP에서 제외한다.

핵심 검증 기준: 빈 프로젝트에서 전형적 송폼의 첫 코드부터 마지막 코드까지 10분 안에 저장.

---

## 2. 기능 개발 순서

의존성이 낮은 기반부터 만들고, 사용자 시나리오 A → C → B 순으로 붙인다.

```text
환경/스키마 → 조성·코드 변환 → 프로젝트 → 송폼 → 코드 차트
→ 추천 DB/추천 API → 기법 분석 → 사용자 진행 → 화면 연결 → MVP 검증
```

### Phase 0. 실행 환경 (기반)

목표: 로컬에서 서버를 띄우고 SQLite에 연결한다.

- Node.js 로컬 서버 (Express 등)
- SQLite 연결, 마이그레이션 실행
- 프론트엔드 없이 실행 가능한 API·도메인 테스트 기반
- 헬스체크 `GET /api/health`

완료 조건: 서버가 실행되고 DB 파일과 마이그레이션이 생성되며, 헬스체크와 기본 테스트가 통과한다.

---

### Phase 1. 스키마 · 시드 데이터

목표: 기능 정의서의 11개 테이블을 만들고, `progression/`의 160개 4마디 진행을 추천 DB에 넣는다.

구현 순서:

1. `projects`, `sections`, `bars`, `bar_chords`
2. `system_recommendation_progressions`, `system_progression_steps`
3. `system_progression_form_tags`, `user_progression_form_tags`
4. `technique_rules`
5. `user_progressions`, `user_progression_steps`
6. `node scripts/seed_system_progressions.js` 실행 (JSON → SQLite)
7. 모달 인터체인지·세컨더리 도미넌트 등 기법 규칙 시드

데이터 원본은 SQL이 아니라 `progression/progressions.json` ~ `progressions_5.json`이다. 시드 스크립트·작곡 활용은 [7장](#7-시스템-추천-데이터-적재와-작곡-활용)을 따른다.

완료 조건: 마이그레이션이 11개 테이블을 생성하고, 추천 테이블에 160행·스텝 640행·송폼 태그 관계가 있으며 기법 규칙 시드가 유효하다.

---

### Phase 2. 조성 · 코드 변환 엔진 (FR-CODE-001, 002, 005)

화면보다 먼저 순수 로직을 만든다. 이후 모든 화면이 이 엔진을 쓴다.

| 순서 | 기능 | FR |
|---|---|---|
| 1 | 12개 표준 장조 조성 목록 및 혼합 표기 | FR-CODE-001 |
| 2 | 대문자 로마 도수 + quality + extension + bass → 실제 코드명 | FR-CODE-005 |
| 3 | 장조 다이어토닉 7코드 생성 | FR-CODE-002 |
| 4 | 조성 변경 시 저장값은 유지, 표시만 재계산 | FR-CODE-005 |

정규화 예시: `I - V - VI - IV`와 `quality=[major, major, minor, major]`를 사용한다. C Major에서는 `C - G - Am - F`, G Major에서는 `G - D - Em - C`로 표시한다. C Major의 `G/B`는 `degree=V`, `bass_degree=VII`로 저장한다.

완료 조건: 12개 장조의 조성 목록·이명동음 표기·다이어토닉 변환과 코드 카탈로그 검증이 통과한다.

---

### Phase 3. 프로젝트 CRUD (시나리오 A 시작)

| 순서 | 기능 | FR |
|---|---|---|
| 1 | 새 프로젝트 생성 (이름, 장조 조성) | FR-PROJ-001 |
| 2 | 이름 변경 | FR-PROJ-002 |
| 3 | 목록 조회 · 이름 검색 | FR-PROJ-004 |
| 4 | 불러오기 | FR-PROJ-005 |
| 5 | 수동 저장 (메타 + 송폼 + 마디 + 코드) | FR-PROJ-003 |
| 6 | 삭제 (하위 송폼·마디·코드 CASCADE) | FR-PROJ-006 |

검증: 이름은 공백 불가, 조성은 지원 장조만 허용.

---

### Phase 4. 송폼 편집

| 순서 | 기능 | FR |
|---|---|---|
| 1 | 구간 추가 (기본명 또는 직접 입력) | FR-FORM-001 |
| 2 | 마디 수 설정 (1 이상 정수) | FR-FORM-003 |
| 3 | 순서 변경 | FR-FORM-002 |
| 4 | 구간 삭제 (하위 마디·코드 함께 삭제) | FR-FORM-004 |

기본 구간명: Intro, Verse, Pre-Chorus, Chorus, Interlude, Bridge, Outro

완료 조건: 구간 추가·순서 변경·마디 수 변경 후 저장/불러오기가 일치한다.

---

### Phase 5. 코드 차트 편집

추천보다 먼저 수동 입력이 되어야 한다.

| 순서 | 기능 | FR |
|---|---|---|
| 1 | 구간별 마디 그리드 (4/4, 기본 1마디 1코드) | FR-CODE-004 |
| 2 | 도수 선택 → 다이어토닉 코드 표시 | FR-CODE-002 |
| 3 | 코드 속성 선택 (장/단/dim, maj7/7/m7/9, MI, SD, 슬래시) | FR-CODE-003 |
| 4 | 1~4박 단위 복수 코드 입력 | FR-CODE-004 |
| 5 | 코드 변경·삭제 | FR-CODE-004 |
| 6 | 차트에 실제 코드명 표시 | FR-CODE-005 |

저장 필드: `degree`, `quality`, `extension`, `bass_degree`  
`degree`는 대문자 로마 숫자와 임시표만 사용하고, 화음 성격은 `quality`로 분리한다. 코드 속성은 유한 카탈로그로 검증한다. 복수 코드 마디는 이후 추천에서 포함된 4마디 블록 전체를 제외하고, 기법 분석에서는 기존 인접 코드 규칙을 적용한다.

---

### Phase 6. 4마디 추천

핵심 차별 기능. Phase 5가 끝난 뒤에 붙인다.

| 순서 | 기능 | FR |
|---|---|---|
| 1 | 구간을 겹치지 않는 4마디 블록으로 분할 | FR-REC-002 |
| 2 | 복수 코드 마디가 포함된 블록 전체를 추천 대상에서 제외 | FR-REC-001 |
| 3 | 이미 입력된 위치와 일치하는 진행만 검색 | FR-REC-003 |
| 4 | 정렬: 무작위 / 대중성 / 연결성 / 다양성 | FR-REC-004 |
| 5 | 결과 3개 + 페이지네이션, 도수·실제코드 동시 표시 | FR-REC-005 |
| 6 | 추천 적용 (기존 입력 위치는 유지) | FR-REC-003, 005 |

블록 규칙:

- 8마디 → 1~4, 5~8
- 7마디 → 1~4만, 5~7 제외
- 4마디 미만 → 추천 없음
- 4칸 모두 입력 → 추천하지 않음
- 조건 불일치 → `추천 없음`

사용자 진행은 이 결과에 넣지 않는다.

추천 후보는 `progression/`에서 적재한 160개만 사용한다. 현재 구간명이 송폼 태그 관계 테이블에 연결된 진행을 먼저 보여주고, 도수 조건·정렬 기준(`popularity` / `connectivity` / `diversity` / `random`)을 적용한다. 복수 코드 마디가 포함된 블록은 `multi_chord_excluded`로 제외한다. 상세는 7장.

---

### Phase 7. 기법 분석 (시나리오 C)

코드 변경 직후 호출한다.

| 순서 | 기능 | FR |
|---|---|---|
| 1 | 변경 코드가 속한 4마디 범위 결정 | FR-ANA-001 |
| 2 | 복수 코드 마디: 자체 분석 제외, 인접 비교 시 첫/마지막 코드만 사용 | FR-ANA-002 |
| 3 | 변경 전후를 규칙 DB와 비교 | FR-ANA-003 |
| 4 | 다수 일치 시 `priority` 최고 1개만 표시, 동점이면 규칙 ID 순 | FR-ANA-004 |

포함할 기법: 모달 인터체인지, 세컨더리 도미넌트, 텐션/변형, 슬래시 코드.  
일치 없으면 안내를 그리지 않는다. 블록 경계(4마디 끝 ↔ 다음 블록 시작)는 분석하지 않는다.

---

### Phase 8. 사용자 진행 (시나리오 B)

추천과 완전히 분리된 화면에서만 다룬다.

| 순서 | 기능 | FR |
|---|---|---|
| 1 | 이름 + 도수 4개 + 송폼 복수 + 메모 등록 | FR-USER-001 |
| 2 | 목록 · 상세 · 삭제 | FR-USER-004 |
| 3 | 이름 검색 | FR-USER-004 |
| 4 | 도수 패턴 검색 (`x` 와일드카드) | FR-USER-002 |
| 5 | 기본 추천 결과에서 제외 | FR-USER-003 |

검색 규칙: 토큰 정확히 4개, `x-x-x-x`는 실행하지 않음, 실제 코드명이 아니라 도수 비교.

---

### Phase 9. 화면 연결 · MVP 검증

화면은 기능이 준비된 뒤 붙여도 되고, Phase 3부터 함께 만들어도 된다. 권장 화면 순서:

1. 프로젝트 목록 (새 곡, 검색, 불러오기, 삭제)
2. 송폼 편집 + 조성 선택
3. 코드 차트
4. 4마디 추천 패널
5. 기법 분석 결과 영역
6. 사용자 진행 관리

MVP 완료 체크:

- [ ] 새 프로젝트 생성
- [ ] 송폼·마디 수 설정
- [ ] 장조 조성 선택
- [ ] 코드 차트 저장
- [ ] 4마디·4코드 추천
- [ ] 추천 도수의 실제 코드 확인
- [ ] 코드 변경 기법 확인
- [ ] 수동 저장·불러오기·삭제
- [ ] 사용자 진행 저장 및 `x` 검색
- [ ] Node.js 로컬에서 전체 흐름 실행
- [ ] 입문자 10분 완성 테스트

---

### 이후 (이번 문서 범위 밖)

P2: BPM, MIDI 재생, 추천 데이터 보강, 설치형 데스크톱, 단조 독립 조성.

---

## 3. 테이블 목록

기능 정의서 10장의 11개 테이블이 전부다. 인증 테이블은 없다.

### 3.1 ER 관계

```text
projects 1 ── N sections 1 ── N bars 1 ── N bar_chords

system_recommendation_progressions 1 ── N system_progression_steps   (항상 4행)
system_recommendation_progressions 1 ── N system_progression_form_tags
user_progressions                  1 ── N user_progression_steps     (항상 4행)
user_progressions                  1 ── N user_progression_form_tags

technique_rules  (독립, 시드)
```

프로젝트 저장 계열과 추천/기법 계열은 테이블을 분리한다.

### 3.2 프로젝트 저장

#### `projects`

곡 단위. 조성의 기준.

| 컬럼 | 타입 제안 | 제약 | 설명 |
|---|---|---|---|
| id | INTEGER | PK | 프로젝트 식별자 |
| name | TEXT | NOT NULL | 곡 이름, 공백 불가 |
| tonic | TEXT | NOT NULL | 으뜸음 (C, G, D …) |
| mode | TEXT | NOT NULL DEFAULT 'major' | MVP는 major만 |
| created_at | TEXT | NOT NULL | 생성 시각 |
| updated_at | TEXT | NOT NULL | 마지막 수동 저장 시각 |

#### `sections`

송폼 구간.

| 컬럼 | 타입 제안 | 제약 | 설명 |
|---|---|---|---|
| id | INTEGER | PK | 구간 식별자 |
| project_id | INTEGER | NOT NULL FK → projects.id ON DELETE CASCADE | 프로젝트 |
| position | INTEGER | NOT NULL | 송폼 순서 (0부터) |
| name | TEXT | NOT NULL | 구간명 |
| bar_count | INTEGER | NOT NULL CHECK >= 1 | 마디 수 |

#### `bars`

구간 안의 마디. 코드가 없어도 행이 있다.

| 컬럼 | 타입 제안 | 제약 | 설명 |
|---|---|---|---|
| id | INTEGER | PK | 마디 식별자 |
| section_id | INTEGER | NOT NULL FK → sections.id ON DELETE CASCADE | 구간 |
| position | INTEGER | NOT NULL | 구간 안 순서 (1부터) |

#### `bar_chords`

박 단위 코드. 1마디 1코드면 `beat=1` 한 행, 1~4박 입력이면 최대 4행.

| 컬럼 | 타입 제안 | 제약 | 설명 |
|---|---|---|---|
| id | INTEGER | PK | 코드 입력 식별자 |
| bar_id | INTEGER | NOT NULL FK → bars.id ON DELETE CASCADE | 마디 |
| beat | INTEGER | NOT NULL CHECK 1~4 | 박 |
| degree | TEXT | NOT NULL | 대문자 기능 도수 (I, II, V, bVI …) |
| quality | TEXT | NOT NULL | major, minor, diminished, dominant 등 |
| extension | TEXT | NULL | maj7, 7, m7, 9 등 |
| bass_degree | TEXT | NULL | 대문자 슬래시 베이스 도수 (예: VII) |

권장 UNIQUE: `(bar_id, beat)`

### 3.3 시스템 추천 (사용자 진행과 분리)

#### `system_recommendation_progressions`

| 컬럼 | 타입 제안 | 제약 | 설명 |
|---|---|---|---|
| id | INTEGER | PK | 추천 진행 식별자 |
| name | TEXT | NOT NULL | 진행 이름 |
| description | TEXT | NULL | 설명 |
| popularity_score | INTEGER | NOT NULL DEFAULT 0 | 대중성 |
| connectivity_score | INTEGER | NOT NULL DEFAULT 0 | 연결성 |
| diversity_group | TEXT | NULL | 다양성 그룹 |
| priority | INTEGER | NOT NULL DEFAULT 0 | 추천 우선순위 |
| created_at | TEXT | NOT NULL | 시스템 관리 시각 |

#### `system_progression_form_tags`

기본 추천 진행과 송폼의 다대다 관계. 진행별로 같은 태그를 중복 저장하지 않는다.

| 컬럼 | 타입 제안 | 제약 | 설명 |
|---|---|---|---|
| progression_id | INTEGER | NOT NULL FK → system_recommendation_progressions.id ON DELETE CASCADE | 추천 진행 |
| form_tag | TEXT | NOT NULL | Intro, Verse, Pre-Chorus 등 |

권장 PRIMARY KEY: `(progression_id, form_tag)`

#### `system_progression_steps`

진행당 정확히 4행 (`position` 1~4).

| 컬럼 | 타입 제안 | 제약 | 설명 |
|---|---|---|---|
| id | INTEGER | PK | 단계 식별자 |
| progression_id | INTEGER | NOT NULL FK → system_recommendation_progressions.id ON DELETE CASCADE | 추천 진행 |
| position | INTEGER | NOT NULL CHECK 1~4 | 위치 |
| degree | TEXT | NOT NULL | 도수 |
| quality | TEXT | NOT NULL | 화음 유형 |
| extension | TEXT | NULL | 확장 |
| bass_degree | TEXT | NULL | 베이스 도수 |

권장 UNIQUE: `(progression_id, position)`

### 3.4 사용자 진행

일반 추천 쿼리에 조인하지 않는다.

#### `user_progressions`

| 컬럼 | 타입 제안 | 제약 | 설명 |
|---|---|---|---|
| id | INTEGER | PK | 사용자 진행 식별자 |
| name | TEXT | NOT NULL | 진행 이름 |
| description | TEXT | NULL | 메모 |
| created_at | TEXT | NOT NULL | 시스템 시각 |

#### `user_progression_form_tags`

사용자 진행과 송폼의 다대다 관계.

| 컬럼 | 타입 제안 | 제약 | 설명 |
|---|---|---|---|
| progression_id | INTEGER | NOT NULL FK → user_progressions.id ON DELETE CASCADE | 사용자 진행 |
| form_tag | TEXT | NOT NULL | 사용자가 선택한 송폼 |

권장 PRIMARY KEY: `(progression_id, form_tag)`

#### `user_progression_steps`

진행당 정확히 4행.

| 컬럼 | 타입 제안 | 제약 | 설명 |
|---|---|---|---|
| id | INTEGER | PK | 단계 식별자 |
| progression_id | INTEGER | NOT NULL FK → user_progressions.id ON DELETE CASCADE | 사용자 진행 |
| position | INTEGER | NOT NULL CHECK 1~4 | 위치 |
| degree | TEXT | NOT NULL | 도수 |
| quality | TEXT | NULL | 화음 유형 |
| extension | TEXT | NULL | 확장 |
| bass_degree | TEXT | NULL | 베이스 도수 |

권장 UNIQUE: `(progression_id, position)`

### 3.5 기법 규칙

#### `technique_rules`

| 컬럼 | 타입 제안 | 제약 | 설명 |
|---|---|---|---|
| id | INTEGER | PK | 규칙 식별자 |
| name | TEXT | NOT NULL | 기법명 |
| rule_type | TEXT | NOT NULL | modal_interchange, secondary_dominant 등 |
| condition | TEXT | NOT NULL | typed JSON 판별 조건 |
| description | TEXT | NOT NULL | 사용자 표시 설명 |
| priority | INTEGER | NOT NULL | 중복 시 우선순위 (높을수록 우선) |
| enabled | INTEGER | NOT NULL DEFAULT 1 | 0/1 |

`condition`은 `rule_type`에 따라 검증하는 구조화 JSON으로 저장한다. 예:

```json
{
  "rule_type": "modal_interchange",
  "condition": {
    "before": { "degree": "IV", "quality": "major" },
    "after": { "degree": "IV", "quality": "minor" },
    "same_root_degree": true,
    "within_block": true
  }
}
```

세컨더리 도미넌트는 목표 도수와 변경 코드의 dominant quality·7 extension·해결 관계를 조건으로 표현한다. 엔진은 `rule_type`별 JSON 스키마를 검증한 뒤 priority 순으로 평가한다.

### 3.6 테이블이 필요 없는 것

별도 테이블을 두지 않고 코드 상수·시드로 다룬다.

| 데이터 | 처리 |
|---|---|
| 장조 조성 목록 | 상수 또는 `GET /api/meta/keys` |
| 기본 구간명 7개 | 상수 |
| 다이어토닉 코드 | 변환 엔진이 조성마다 계산 |
| 코드 변형 목록 | 상수 카탈로그 |
| 세션/유저 | 없음 |

---

## 4. API 목록

로컬 REST. 인증 헤더 없음. JSON.

공통 에러 형식 예:

```json
{ "ok": false, "error": { "code": "VALIDATION_ERROR", "message": "프로젝트 이름은 필수입니다." } }
```

### 4.1 개발 순서별 API

Phase 0 → 8 순으로 구현하면 된다.

### 4.2 Meta / 변환 — Phase 2

| ID | Method | Path | 설명 | 관련 FR |
|---|---|---|---|---|
| API-META-001 | GET | `/api/health` | 서버·DB 상태 | - |
| API-META-002 | GET | `/api/meta/keys` | 장조 조성 목록 | FR-CODE-001 |
| API-META-003 | GET | `/api/meta/section-names` | 기본 구간명 7개 | FR-FORM-001 |
| API-META-004 | GET | `/api/meta/chord-catalog` | 지원 quality/extension/변형 | FR-CODE-003 |
| API-META-005 | GET | `/api/meta/diatonic?tonic=C` | 해당 장조 다이어토닉 7코드 | FR-CODE-002 |
| API-META-006 | POST | `/api/meta/realize` | 도수·속성 → 실제 코드명 | FR-CODE-005 |

`POST /api/meta/realize` 요청 예:

```json
{
  "tonic": "C",
  "mode": "major",
  "chords": [
    { "degree": "V", "quality": "dominant", "extension": "7", "bass_degree": null }
  ]
}
```

응답 예: `{ "ok": true, "names": ["G7"] }`

조성이 바뀌면 클라이언트가 차트 전체를 이 API로 다시 계산하거나, 프로젝트 조회 응답에 표시용 코드명을 같이 내려준다.

---

### 4.3 프로젝트 — Phase 3

| ID | Method | Path | 설명 | 관련 FR |
|---|---|---|---|---|
| API-PROJ-001 | GET | `/api/projects` | 목록. `?q=` 이름 검색 | FR-PROJ-004 |
| API-PROJ-002 | POST | `/api/projects` | 생성 (name, tonic) | FR-PROJ-001 |
| API-PROJ-003 | GET | `/api/projects/:id` | 상세 (송폼·마디·코드 포함) | FR-PROJ-005 |
| API-PROJ-005 | PUT | `/api/projects/:id` | 수동 전체 저장 | FR-PROJ-003 |
| API-PROJ-006 | DELETE | `/api/projects/:id` | 삭제 (확인은 UI) | FR-PROJ-006 |

`POST /api/projects` 요청:

```json
{ "name": "데모 곡", "tonic": "C", "mode": "major" }
```

`PUT /api/projects/:id` 저장 대상:

- 프로젝트 메타 (name, tonic, mode)
- sections (position, name, bar_count)
- bars (position)
- bar_chords (beat, degree, quality, extension, bass_degree)

`updated_at`은 이 PUT에서만 갱신한다. POST는 명시적인 새 프로젝트 생성 행위로 빈 프로젝트 행을 생성하며, 이후 편집값은 클라이언트 초안으로 유지한다.

전체 저장은 `projects` 메타데이터, sections, bars, bar_chords를 하나의 SQLite 트랜잭션으로 처리한다. 어느 단계에서든 검증 또는 저장 오류가 발생하면 전체 변경을 롤백한다.

검증:

- name 필수, 공백 불가
- tonic은 지원 장조만
- 구간명 필수, bar_count ≥ 1
- beat 1~4
- 코드 속성은 카탈로그 값만

---

### 4.4 송폼 — Phase 4

송폼 추가·수정·순서 변경·삭제는 클라이언트 초안에서 처리한다. MVP에는 개별 송폼 mutation API를 두지 않는다. 사용자가 저장할 때 `PUT /api/projects/:id`가 전체 송폼을 검증하고 저장한다.

저장 시 마디 수가 줄면 초과 `bars`/`bar_chords`를 삭제하고, 늘면 빈 `bars`를 추가한다. 이 작업은 전체 저장 트랜잭션 안에서 처리한다.

---

### 4.5 코드 차트 — Phase 5

| ID | Method | Path | 설명 | 관련 FR |
|---|---|---|---|---|
| API-CHART-001 | GET | `/api/projects/:id/chart` | 구간·마디·코드 + 표시 코드명 | FR-CODE-004, 005 |

코드 차트 편집은 클라이언트 초안에서 수행한다. 차트 조회 응답의 각 코드에는 `displayName` (예: `"G7"`)을 포함할 수 있다. 코드 변경 결과는 최종 `PUT /api/projects/:id` 요청에 포함한다.

---

### 4.6 추천 — Phase 6

| ID | Method | Path | 설명 | 관련 FR |
|---|---|---|---|---|
| API-REC-001 | GET | `/api/projects/:id/sections/:sectionId/blocks` | 추천 가능한 4마디 블록 목록 | FR-REC-001, 002 |
| API-REC-002 | POST | `/api/recommendations` | 조건에 맞는 추천 검색 | FR-REC-003~005 |

`POST /api/recommendations` 요청:

```json
{
  "projectId": 1,
  "sectionId": 2,
  "blockStart": 1,
  "sort": "popularity",
  "page": 1,
  "pageSize": 3
}
```

`sort`: `random` | `popularity` | `connectivity` | `diversity`

서버 처리:

1. 블록 4마디의 코드 개수 확인
2. 복수 코드 마디가 하나라도 있으면 `multi_chord_excluded` 반환
3. 4칸 모두 입력이면 빈 결과
4. `system_*`만 조회 (user 진행 제외). 원본은 `progression/*.json` 160선
5. 입력된 위치의 대문자 degree와 코드 속성 조건을 비교
6. 현재 구간명이 관계 테이블에 연결된 진행을 우선. 부족하면 도수 조건만으로 보완
7. sort 적용 후 pageSize만큼 반환
8. 각 결과에 도수 진행 + 현재 조성 실제 코드 + `diversity_group` 포함

정렬:

- `popularity` → `popularity_score DESC, priority DESC, id`
- `connectivity` → `connectivity_score DESC, priority DESC, id`
- `diversity` → 서로 다른 `diversity_group`을 돌아가며 선택
- `random` → 조건 통과 집합을 셔플

응답 예:

```json
{
  "ok": true,
  "emptyReason": null,
  "items": [
    {
      "id": 1,
      "name": "I - V - VI - IV (팝 4코드 진행)",
      "diversityGroup": "diatonic_pop",
      "formTags": ["Chorus", "Intro", "Outro"],
      "description": "전 세계 수많은 메가 히트 팝의 후렴 진행",
      "steps": [
        { "position": 1, "degree": "I", "quality": "major", "displayName": "C" },
        { "position": 2, "degree": "V", "quality": "major", "displayName": "G" },
        { "position": 3, "degree": "VI", "quality": "minor", "displayName": "Am" },
        { "position": 4, "degree": "IV", "quality": "major", "displayName": "F" }
      ]
    }
  ],
  "page": 1,
  "hasMore": true
}
```

`emptyReason`: `null` | `too_short` | `all_filled` | `no_match` | `multi_chord_excluded`

추천 적용은 클라이언트가 응답의 4개 스텝을 현재 초안에 병합한다. 이미 있는 칸은 덮어쓰지 않고 빈 칸만 채운다. DB 저장은 최종 `PUT /api/projects/:id`에서만 수행한다.

---

### 4.7 기법 분석 — Phase 7

| ID | Method | Path | 설명 | 관련 FR |
|---|---|---|---|---|
| API-ANA-001 | POST | `/api/analysis` | 코드 변경에 대한 기법 1개 반환 | FR-ANA-001~004 |

요청:

```json
{
  "projectId": 1,
  "sectionId": 2,
  "barId": 15,
  "beat": 1,
  "before": { "degree": "I", "quality": "major", "extension": null, "bass_degree": null },
  "after":  { "degree": "bVI", "quality": "major", "extension": null, "bass_degree": null }
}
```

서버 처리:

1. 해당 마디의 4마디 블록 범위 계산
2. 복수 코드 마디면 자체 분석 스킵, 인접 비교 시 첫/마지막 코드만
3. 블록 경계 넘김 금지
4. `technique_rules` 중 `enabled=1`을 priority DESC, id ASC로 검사
5. 최상위 1개만 반환, 없으면 `{ "technique": null }`

응답 예:

```json
{
  "ok": true,
  "technique": {
    "id": 3,
    "name": "모달 인터체인지",
    "description": "같은 으뜸음의 평행조에서 코드를 빌려 온 진행입니다."
  }
}
```

규칙 CRUD API는 MVP에 두지 않는다. 시드로만 관리한다.

---

### 4.8 사용자 진행 — Phase 8

| ID | Method | Path | 설명 | 관련 FR |
|---|---|---|---|---|
| API-USER-001 | GET | `/api/user-progressions` | 목록. `?q=` 이름 검색 | FR-USER-004 |
| API-USER-002 | POST | `/api/user-progressions` | 등록 (도수 정확히 4개) | FR-USER-001 |
| API-USER-003 | GET | `/api/user-progressions/:id` | 상세 | FR-USER-004 |
| API-USER-004 | DELETE | `/api/user-progressions/:id` | 삭제 | FR-USER-004 |
| API-USER-005 | POST | `/api/user-progressions/search` | 도수 패턴 검색 | FR-USER-002 |

`POST /api/user-progressions` 요청:

```json
{
  "name": "내가 자주 쓰는 진행",
  "formTags": ["Verse", "Chorus"],
  "description": "후렴 앞",
  "steps": [
    { "position": 1, "degree": "I", "quality": "major" },
    { "position": 2, "degree": "II", "quality": "minor" },
    { "position": 3, "degree": "I", "quality": "major" },
    { "position": 4, "degree": "I", "quality": "major" }
  ]
}
```

`created_at`은 서버가 넣는다. 이 데이터는 `/api/recommendations`에 절대 섞지 않는다.

`POST /api/user-progressions/search` 요청:

```json
{ "tokens": ["x", "II", "I", "x"] }
```

- `tokens.length !== 4` → 400
- `["x","x","x","x"]` → 400 (`SEARCH_ALL_WILDCARD`)
- 고정 토큰만 위치 비교, 4위치 모두 통과한 행만 반환

---

## 5. 화면 ↔ API 매핑

| 화면 | 주요 API |
|---|---|
| 프로젝트 목록 | API-PROJ-001, 002, 006 |
| 곡 불러오기 | API-PROJ-003 |
| 송폼 편집 | 클라이언트 초안 후 API-PROJ-005 |
| 조성 선택 | API-META-002, API-META-005, API-META-006 |
| 코드 차트 | API-CHART-001, API-META-004 |
| 4마디 추천 | API-REC-001~002 |
| 기법 분석 | API-ANA-001 |
| 사용자 진행 | API-USER-001~005 |
| 수동 저장 | API-PROJ-005 |

---

## 6. 구현 체크리스트 (권장 스프린트)

| 스프린트 | Phase | 산출물 |
|---|---|---|
| S0 | 0~1 | 서버, SQLite 11테이블, `seed_system_progressions.js`로 160선 적재 |
| S1 | 2~3 | 변환 엔진, 프로젝트 CRUD |
| S2 | 4~5 | 송폼, 코드 차트, 실제 코드 표시 |
| S3 | 6 | 송폼·도수 조건 추천 + 차트 적용 |
| S4 | 7~8 | 기법 분석, 사용자 진행 검색 |
| S5 | 9 | 화면 다듬기, 10분 완성 테스트 |

한 줄 요약: **변환 엔진 → 프로젝트/송폼/차트 저장 → progression 시드 추천 → 기법 → 사용자 검색** 순으로 만든다.

---

## 7. 시스템 추천 데이터 적재와 작곡 활용

`progression/`의 4마디 진행 160선을 SQLite에 넣고, 송폼·조성·부분 입력에 맞춰 추천한다.

### 7.1 원본 파일

JSON이 정본이다. `seed_progressions*.sql`은 참고용 덤프다.

| 배치 | 파일 | ID | 작곡에서 쓰는 역할 |
|---|---|---|---|
| 1 | `progression/progressions.json` | 1–32 | 팝 4코드, 왕도, 캐논, 둘룹 등 입문자 기본 팔레트 |
| 2 | `progression/progressions_2.json` | 33–64 | 시티팝 2-5, 안달루시아, 세컨더리 도미넌트, K-Pop 후렴 |
| 3 | `progression/progressions_3.json` | 65–96 | 캐논 베이스 하강, 라인 클리셰, 모달 애니송, 발라드 빌드업 |
| 4 | `progression/progressions_4.json` | 97–128 | 텐션 턴, iv 종지, 페달, 간주·후주 |
| 5 | `progression/progressions_5.json` | 129–160 | J-Rock / 애니송 / 보컬로이드 (마루사, 코무로, 패싱 디미니시) |

한 행은 항상 스텝 4개(`position` 1–4)다. 코드는 조성이 아니라 도수·quality·extension·bass_degree로 저장한다.

송폼 태그 중복 허용 건수(160선 기준): Verse 72, Chorus 66, Bridge 46, Pre-Chorus 41, Intro 36, Outro 24, Interlude 19.

### 7.2 적재 스크립트

경로: `scripts/seed_system_progressions.js`

```bash
node scripts/seed_system_progressions.js --dry-run
node scripts/seed_system_progressions.js
node scripts/seed_system_progressions.js --db data/cpmanager.sqlite
```

기본 DB는 `data/cpmanager.sqlite`다. Node 22+ `node:sqlite`를 쓴다. 외부 npm 패키지는 없다.

동작:

1. JSON 5개를 읽고 id·name·form_tags·점수·priority·steps(4개)를 검증한다.
2. 모든 `degree`를 대문자 로마 숫자와 임시표 형식으로 정규화하고, quality·extension·bass_degree를 카탈로그로 검증한다.
3. 구간명은 Intro / Verse / Pre-Chorus / Chorus / Interlude / Bridge / Outro만 허용한다.
4. 테이블이 없으면 `system_recommendation_progressions`, `system_progression_steps`, `system_progression_form_tags`를 만든다.
5. 트랜잭션으로 UPSERT한다. 같은 id는 진행 메타데이터를 갱신하고 스텝·태그를 삭제한 뒤 4행과 관계를 다시 넣는다.
6. `form_tags[]`는 `system_progression_form_tags`에 행 단위로 저장한다.

적재 후 확인:

```sql
SELECT COUNT(*) FROM system_recommendation_progressions; -- 160
SELECT COUNT(*) FROM system_progression_steps;           -- 640
SELECT p.id, p.name, p.diversity_group, p.popularity_score, p.priority
FROM system_recommendation_progressions p
JOIN system_progression_form_tags t ON t.progression_id = p.id
WHERE t.form_tag = 'Chorus'
ORDER BY popularity_score DESC, priority DESC
LIMIT 5;
```

앱 기동 시 추천 테이블이 비어 있으면 이 스크립트를 한 번 실행한다. 사용자 곡·사용자 진행은 건드리지 않는다.

JSON 필드 → 테이블:

| JSON | 테이블.컬럼 |
|---|---|
| `id`, `name`, `description` | `system_recommendation_progressions` |
| `form_tags[]` | `system_progression_form_tags` 여러 행 |
| `popularity_score` | 대중성 정렬 |
| `connectivity_score` | 연결성 정렬 |
| `diversity_group` | 다양성 그룹 로테이션 |
| `priority` | 동점 시 우선순위 (10이 최우선) |
| `steps[]` | `system_progression_steps` 4행 |

### 7.3 작곡 기능에서 이 데이터를 쓰는 방법

시나리오 A(새 곡)의 핵심이다. 사용자는 이론을 몰라도 송폼만 고르면 4마디씩 채워 한 곡을 만든다.

#### (1) 송폼에 맞는 팔레트

구간을 고르면 `system_progression_form_tags`에 그 이름이 연결된 진행을 먼저 추천한다.

| 구간 | 데이터에서 우선하는 성격 | 예시 |
|---|---|---|
| Intro | 테마·뱀프 | I–V–VI–IV, I–IV–I–IV |
| Verse | 반복 가능한 안정 진행 | 캐논 전반, 50s 둘룹, 2–5–1 |
| Pre-Chorus | 상행·텐션 빌드 | II–III–IV–V, IV–V–IV–V |
| Chorus | 캐치한 후렴 | 팝 4코드, 왕도, VI–IV–I–V |
| Bridge | 색 바꾸기 (MI, SD) | IV–iv–I, bVI–bVII–I, III7 |
| Interlude | 그루브·턴어라운드 | II–V–III–VI |
| Outro | 종지·페이드 | IV–V–I–I, IV–iv–I–I |

1차 필터: 구간명과 태그 관계가 일치하고 이미 입력한 대문자 도수·코드 속성과 일치.  
후보가 `pageSize`보다 적으면 구간 태그는 무시하고 도수 조건만 쓴다. 없는 진행을 만들어 내지 않는다.

#### (2) 부분 입력 유지

예: Chorus 1~4마디에 첫 칸만 `I`를 넣은 경우.

- 1번 스텝이 `I`인 진행만 남긴다 (팝 4코드, 캐논, 50s 둘룹 등).
- 왕도(`IV` 시작)는 빠진다.
- 적용 시 1번 칸은 그대로 두고 2~4만 채운다.

4칸이 모두 차면 추천하지 않는다. 빈 블록이면 송폼 우선 목록 전체를 정렬해 보여 준다.

#### (3) 조성 변환

DB에는 대문자 도수와 `quality`가 함께 있다. 화면에는 현재 `tonic`으로 바꾼 코드명을 붙인다.

- C Major + ID 1 → `C – G – Am – F`
- G Major + ID 1 → `G – D – Em – C`
- C Major + ID 8 (`III7`) → `F – G – E7 – Am`
- C Major + ID 15 (`V`, `bass_degree: "VII"`) → `C – G/B – Am – G`

저장은 항상 도수다. 조를 바꿔도 프로젝트 코드 행은 다시 쓰지 않는다.

#### (4) 추천 기준 4종

| UI 기준 | 데이터 필드 | 작곡 효과 |
|---|---|---|
| 대중성 우선 | `popularity_score`, `priority` | 입문자에게 익숙한 후렴·절부터 |
| 코드 연결성 우선 | `connectivity_score` | 앞뒤 화성 흐름이 자연스러운 블록 |
| 다양성 우선 | `diversity_group` | 같은 왕도만 반복하지 않음 |
| 무작위 | 조건 통과 집합 셔플 | 익숙한 진행에서 벗어나기 |

다양성: 직전 페이지에 쓴 그룹(`diatonic_pop`, `royal_road`, `modal_interchange`, `secondary_dominant`, `marunouchi_jrock` 등)을 피하고 다른 그룹에서 고른다.

#### (5) 곡 전체를 4마디 블록으로 조립

8마디 Chorus는 1~4와 5~8을 따로 추천한다. 예:

1. Verse 8마디 → 캐논(ID 5) + 둘룹(ID 11)
2. Pre-Chorus 4마디 → 상행 빌드(ID 4)
3. Chorus 8마디 → 팝 4코드(ID 1) 두 번, 또는 왕도(ID 2)로 대비
4. Bridge 4마디 → `IV–iv–I–I`(ID 14) 또는 마루사(ID 129)

입문자는 추천 적용만 반복해 전형적 송폼을 10분 안에 채울 수 있다.

#### (6) 기법 분석과 맞물림

시드에 이미 변형 진행이 있다. 사용자가 차트에서 코드를 바꾸면 `technique_rules`가 이름을 붙인다.

| 원형 | 변형 | 안내할 기법 |
|---|---|---|
| ID 2 `IV–V–III–VI` | ID 8 `IV–V–III–VI` + dominant 7 | 세컨더리 도미넌트 |
| ID 16 `IV–V–I–I` | ID 14 `IV–IV–I–I` + minor quality | 모달 인터체인지 (iv) |
| ID 1 `I–V–VI–IV` | ID 15 `I–V/VII–VI–V` | 슬래시·하강 베이스 |
| 다이어토닉 III | `III7`, `VI7`, `II7` | 세컨더리 도미넌트 |
| 다이어토닉 V | `V` + minor quality, `bVI`, `bVII` | 모달 인터체인지 |

추천은 후보를 주고, 기법은 수정 의미를 설명한다. 추천 API는 `system_*`만, 사용자 진행 API는 `user_*`만 본다.

#### (7) 화면 표시

추천 카드 한 장:

- 도수: `I – V – VI – IV` (quality로 장·단 구분)
- 실제 코드: `C – G – Am – F` (현재 조성)
- 이름·한 줄 설명 (`description`)
- 송폼 태그, 다양성 그룹
- [적용] → 현재 4마디 빈 칸에 `system_progression_steps`를 `bar_chords`로 복사

`추천 없음`은 데이터가 부족해서가 아니라 블록이 너무 짧거나, 4칸이 찼거나, 입력 도수와 160선이 안 맞을 때다.

### 7.4 Phase 6 구현 순서 (데이터 기준)

1. 시드 스크립트로 160선 적재
2. 구간명 + 4마디 블록 + 부분 도수 조건 조회
3. 네 가지 정렬
4. `realize`로 실제 코드명 첨부
5. 적용 결과는 클라이언트 초안에 병합하고, 최종 저장 시 빈 마디에만 degree/quality/extension/bass_degree를 기록
6. 송폼이 다른 구간(Verse vs Chorus vs Bridge)에서 추천 집합이 달라지는지 확인

이 데이터가 있어야 10분 완성 지표를 검증할 수 있다.
