# Chord Progression Manager 개발 순서 · 테이블 · API

사업 제안서, 제품 기획서, 세부 기능 정의서를 기준으로 MVP 구현 순서를 정리한다.  
1단계는 Node.js + SQLite 로컬 웹앱이다. 인증·외부 서버는 없다.

---

## 1. 개발 원칙

- 저장은 사용자가 명시적으로 실행한다. 자동 저장은 하지 않는다.
- 내부 데이터는 도수·코드 속성을 저장하고, 화면에는 선택한 장조 조성의 실제 코드로 표시한다.
- 추천·기법 분석은 4마디·4코드 단위다.
- 사용자 진행은 기본 추천 DB와 분리한다.
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
- 정적 프론트 또는 단순 웹 화면 뼈대
- 헬스체크 `GET /api/health`

완료 조건: 브라우저에서 로컬 앱이 열리고 DB 파일이 생성된다.

---

### Phase 1. 스키마 · 시드 데이터

목표: 기능 정의서의 9개 테이블을 만들고 추천·기법 초기 데이터를 넣는다.

구현 순서:

1. `projects`, `sections`, `bars`, `bar_chords`
2. `system_recommendation_progressions`, `system_progression_steps`
3. `technique_rules`
4. `user_progressions`, `user_progression_steps`
5. 장조 다이어토닉·전형적 진행 시드
6. 모달 인터체인지·세컨더리 도미넌트 등 기법 규칙 시드

완료 조건: 빈 프로젝트 저장이 가능하고, 추천·기법 테이블에 초기 데이터가 있다.

---

### Phase 2. 조성 · 코드 변환 엔진 (FR-CODE-001, 002, 005)

화면보다 먼저 순수 로직을 만든다. 이후 모든 화면이 이 엔진을 쓴다.

| 순서 | 기능 | FR |
|---|---|---|
| 1 | 장조 조성 목록 (C~B Major) | FR-CODE-001 |
| 2 | 도수 + quality + extension + bass → 실제 코드명 | FR-CODE-005 |
| 3 | 장조 다이어토닉 7코드 생성 | FR-CODE-002 |
| 4 | 조성 변경 시 저장값은 유지, 표시만 재계산 | FR-CODE-005 |

완료 조건: 같은 `I - V - vi - IV`가 C Major에서는 `C - G - Am - F`, G Major에서는 `G - D - Em - C`로 나온다.

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
복수 코드 마디는 이후 추천·기법 분석에서 해당 마디 자체를 제외한다.

---

### Phase 6. 4마디 추천

핵심 차별 기능. Phase 5가 끝난 뒤에 붙인다.

| 순서 | 기능 | FR |
|---|---|---|
| 1 | 구간을 겹치지 않는 4마디 블록으로 분할 | FR-REC-002 |
| 2 | 1코드 마디만 추천 대상으로 표시 | FR-REC-001 |
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

기능 정의서 10장의 9개 테이블이 전부다. 인증 테이블은 없다.

### 3.1 ER 관계

```text
projects 1 ── N sections 1 ── N bars 1 ── N bar_chords

system_recommendation_progressions 1 ── N system_progression_steps   (항상 4행)
user_progressions                  1 ── N user_progression_steps     (항상 4행)

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
| degree | TEXT | NOT NULL | 기능 도수 (I, ii, V, bVI …) |
| quality | TEXT | NOT NULL | major, minor, diminished, dominant 등 |
| extension | TEXT | NULL | maj7, 7, m7, 9 등 |
| bass_degree | TEXT | NULL | 슬래시 베이스 도수 |

권장 UNIQUE: `(bar_id, beat)`

### 3.3 시스템 추천 (사용자 진행과 분리)

#### `system_recommendation_progressions`

| 컬럼 | 타입 제안 | 제약 | 설명 |
|---|---|---|---|
| id | INTEGER | PK | 추천 진행 식별자 |
| name | TEXT | NOT NULL | 진행 이름 |
| form_tags | TEXT | NULL | 자주 쓰인 송폼 (JSON 또는 콤마) |
| description | TEXT | NULL | 설명 |
| popularity_score | INTEGER | NOT NULL DEFAULT 0 | 대중성 |
| connectivity_score | INTEGER | NOT NULL DEFAULT 0 | 연결성 |
| diversity_group | TEXT | NULL | 다양성 그룹 |
| priority | INTEGER | NOT NULL DEFAULT 0 | 추천 우선순위 |
| created_at | TEXT | NOT NULL | 시스템 관리 시각 |

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
| form_tags | TEXT | NULL | 송폼 복수 선택 |
| description | TEXT | NULL | 메모 |
| created_at | TEXT | NOT NULL | 시스템 시각 |

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
| condition | TEXT | NOT NULL | 판별 조건 (JSON 권장) |
| description | TEXT | NOT NULL | 사용자 표시 설명 |
| priority | INTEGER | NOT NULL | 중복 시 우선순위 (높을수록 우선) |
| enabled | INTEGER | NOT NULL DEFAULT 1 | 0/1 |

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
| API-PROJ-004 | PATCH | `/api/projects/:id` | 이름·조성 변경 | FR-PROJ-002, FR-CODE-001 |
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

`updated_at`은 이 PUT에서만 갱신한다.

검증:

- name 필수, 공백 불가
- tonic은 지원 장조만
- 구간명 필수, bar_count ≥ 1
- beat 1~4
- 코드 속성은 카탈로그 값만

---

### 4.4 송폼 — Phase 4

전체 저장(PUT 프로젝트)만 써도 되지만, 편집 중 즉시 반영이 필요하면 아래를 둔다.  
MVP는 메모리에서 편집 후 `PUT /api/projects/:id` 한 번에 저장해도 충분하다.

| ID | Method | Path | 설명 | 관련 FR |
|---|---|---|---|---|
| API-FORM-001 | POST | `/api/projects/:id/sections` | 구간 추가 | FR-FORM-001 |
| API-FORM-002 | PATCH | `/api/sections/:sectionId` | 이름·마디 수 변경 | FR-FORM-003 |
| API-FORM-003 | PUT | `/api/projects/:id/sections/reorder` | 순서 변경 | FR-FORM-002 |
| API-FORM-004 | DELETE | `/api/sections/:sectionId` | 구간 삭제 | FR-FORM-004 |

`PUT .../reorder` 요청: `{ "sectionIds": [3, 1, 2] }`

마디 수가 줄면 초과 `bars`/`bar_chords`를 삭제한다. 늘면 빈 `bars`를 추가한다.

---

### 4.5 코드 차트 — Phase 5

| ID | Method | Path | 설명 | 관련 FR |
|---|---|---|---|---|
| API-CHART-001 | GET | `/api/projects/:id/chart` | 구간·마디·코드 + 표시 코드명 | FR-CODE-004, 005 |
| API-CHART-002 | PUT | `/api/bars/:barId/chords` | 해당 마디 1~4박 코드 덮어쓰기 | FR-CODE-004 |
| API-CHART-003 | DELETE | `/api/bars/:barId/chords/:beat` | 특정 박 코드 삭제 | FR-CODE-004 |

`PUT /api/bars/:barId/chords` 요청:

```json
{
  "chords": [
    { "beat": 1, "degree": "I", "quality": "major", "extension": null, "bass_degree": null }
  ]
}
```

빈 배열이면 마디의 코드를 모두 지운다.  
차트 조회 응답의 각 코드에 `displayName` (예: `"G7"`)을 포함한다.

---

### 4.6 추천 — Phase 6

| ID | Method | Path | 설명 | 관련 FR |
|---|---|---|---|---|
| API-REC-001 | GET | `/api/projects/:id/sections/:sectionId/blocks` | 추천 가능한 4마디 블록 목록 | FR-REC-001, 002 |
| API-REC-002 | POST | `/api/recommendations` | 조건에 맞는 추천 검색 | FR-REC-003~005 |
| API-REC-003 | POST | `/api/recommendations/apply` | 선택한 진행을 블록에 적용 | FR-REC-005 |

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
2. 복수 코드 마디·이미 찬 위치 확인
3. 4칸 모두 입력이면 빈 결과
4. `system_*`만 조회 (user 진행 제외)
5. 입력된 위치의 degree/quality 등과 일치하는 행만
6. sort 적용, pageSize만큼 반환
7. 각 결과에 도수 진행 + 현재 조성 실제 코드 포함

응답 예:

```json
{
  "ok": true,
  "emptyReason": null,
  "items": [
    {
      "id": 10,
      "name": "I-V-vi-IV",
      "steps": [
        { "position": 1, "degree": "I", "quality": "major", "displayName": "C" },
        { "position": 2, "degree": "V", "quality": "major", "displayName": "G" },
        { "position": 3, "degree": "vi", "quality": "minor", "displayName": "Am" },
        { "position": 4, "degree": "IV", "quality": "major", "displayName": "F" }
      ]
    }
  ],
  "page": 1,
  "hasMore": true
}
```

`emptyReason`: `null` | `too_short` | `all_filled` | `no_match` | `multi_chord_excluded`

`POST /api/recommendations/apply` 요청:

```json
{
  "projectId": 1,
  "sectionId": 2,
  "blockStart": 1,
  "progressionId": 10
}
```

이미 있는 칸은 덮어쓰지 않는다. 빈 칸만 채운다.

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
    { "position": 2, "degree": "ii", "quality": "minor" },
    { "position": 3, "degree": "I", "quality": "major" },
    { "position": 4, "degree": "I", "quality": "major" }
  ]
}
```

`created_at`은 서버가 넣는다. 이 데이터는 `/api/recommendations`에 절대 섞지 않는다.

`POST /api/user-progressions/search` 요청:

```json
{ "tokens": ["x", "ii", "I", "x"] }
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
| 송폼 편집 | API-FORM-001~004 또는 로컬 편집 후 API-PROJ-005 |
| 조성 선택 | API-META-002, API-PROJ-004, API-META-005, API-META-006 |
| 코드 차트 | API-CHART-001~003, API-META-004 |
| 4마디 추천 | API-REC-001~003 |
| 기법 분석 | API-ANA-001 |
| 사용자 진행 | API-USER-001~005 |
| 수동 저장 | API-PROJ-005 |

---

## 6. 구현 체크리스트 (권장 스프린트)

| 스프린트 | Phase | 산출물 |
|---|---|---|
| S0 | 0~1 | 서버, SQLite 9테이블, 시드 |
| S1 | 2~3 | 변환 엔진, 프로젝트 CRUD |
| S2 | 4~5 | 송폼, 코드 차트, 실제 코드 표시 |
| S3 | 6 | 4마디 추천 + 적용 |
| S4 | 7~8 | 기법 분석, 사용자 진행 검색 |
| S5 | 9 | 화면 다듬기, 10분 완성 테스트 |

한 줄 요약: **변환 엔진 → 프로젝트/송폼/차트 저장 → 추천 → 기법 → 사용자 검색** 순으로 만든다.
