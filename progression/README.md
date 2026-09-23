# Chord Progression Manager — 4마디 추천 코드 진행 데이터 명세서

본 문서는 프로젝트 루트의 기획 및 개발 설계 문서([`product_plan.md`](../product_plan.md), [`functional_specification.md`](../functional_specification.md), [`development_plan.md`](../development_plan.md))의 데이터베이스 스키마 및 추천 엔진 사양을 준수하여 작성된 **4마디 단위 추천 코드 진행(System Recommendation Progressions)** 목록입니다.

---

## 1. 설계 원칙 및 데이터 규칙

1. **4마디 고정 (4-Bar Unit)**:
   - 기획 명세(`FR-REC-001`, `FR-REC-002`)에 따라 모든 진행은 겹치지 않는 4마디 블록(`position` 1~4)으로 구성됩니다.
2. **도수 기반 정규화 (Degree-based)**:
   - 원본 JSON은 사람이 읽는 기존 표기를 유지할 수 있지만, 적재 시 대문자 로마 도수와 별도 `quality`로 정규화합니다. 조성은 플랫 canonical 목록(C, Db, D, Eb, E, F, Gb, G, Ab, A, Bb, B)을 사용합니다.
3. **송폼 태그 연계 (Form Tags)**:
   - 프로젝트 기본 송폼 7종(`Intro`, `Verse`, `Pre-Chorus`, `Chorus`, `Interlude`, `Bridge`, `Outro`) 중 해당 진행이 가장 자연스럽고 빈번하게 사용되는 송폼 태그를 관계 테이블에 매핑합니다.
4. **추천 우선순위 (Priority)**:
   - 대중성, 음악적 완성도, 초심자의 연주/작곡 편의성, 범용성을 고려하여 1~10점 척도(10점이 최우선)로 산정했습니다.
5. **추천 정렬 4대 기준 매핑**:
   - `popularity_score` (대중성, 1~100): 히트곡 사용 빈도 및 친숙함
   - `connectivity_score` (연결성, 1~100): 앞뒤 섹션 및 전후 코드와의 자연스러운 화성 진행력
   - `diversity_group` (다양성 그룹): 다이어토닉 팝, 왕도 진행, 모달 인터체인지, 세컨더리 도미넌트, 하강 베이스, 5도권 등
   - `random` (무작위): 동일 조건군 내 셔플 추천

---

## 2. 데이터베이스 스키마 매핑

본 데이터는 SQLite의 `system_recommendation_progressions`, `system_progression_steps`, `system_progression_form_tags` 관계 테이블에 대응됩니다. 실제 적재는 `npm run db:seed`를 기준으로 합니다.

```text
system_recommendation_progressions (1) ──── (4) system_progression_steps
system_recommendation_progressions (1) ──── (N) system_progression_form_tags
```

- **진행 테이블**: `id`, `name`, `description`, `popularity_score`, `connectivity_score`, `diversity_group`, `priority`, `created_at`
- **송폼 태그 테이블**: `progression_id`, `form_tag`
- **스텝 테이블**: `progression_id`, `position` (1~4), `degree`, `quality`, `extension`, `bass_degree`

---

## 3. 전체 4마디 코드 진행 목록 (32선)

> *C Major 기준 코드는 도수 이해를 돕기 위한 예시이며, 실제 앱 구동 시 사용자가 선택한 장조에 맞추어 자동 계산됩니다.*

| ID | 진행 명칭 | 도수 진행 (1~4마디) | 자주 쓰이는 송폼 | 다양성 그룹 | 대중성 | 연결성 | Priority | C Major 예시 |
|:---:|:---|:---:|:---|:---|:---:|:---:|:---:|:---|
| **1** | **I - V - vi - IV**<br>(팝 4코드 진행) | `I` → `V` → `vi` → `IV` | `Chorus`, `Intro`, `Outro` | `diatonic_pop` | 98 | 95 | **10** | C - G - Am - F |
| **2** | **IV - V - iii - vi**<br>(왕도 진행 / 코마로) | `IV` → `V` → `iii` → `vi` | `Chorus`, `Bridge`, `Intro` | `royal_road` | 96 | 92 | **10** | F - G - Em - Am |
| **3** | **vi - IV - I - V**<br>(감성 마이너 시작 진행) | `vi` → `IV` → `I` → `V` | `Chorus`, `Verse`, `Intro` | `diatonic_pop` | 94 | 90 | **9** | Am - F - C - G |
| **4** | **ii - iii - IV - V**<br>(스텝와이즈 상행 빌드업) | `ii` → `iii` → `IV` → `V` | `Pre-Chorus` | `stepwise_ascent` | 95 | 93 | **10** | Dm - Em - F - G |
| **5** | **I - V - vi - iii**<br>(캐논 전반부 진행) | `I` → `V` → `vi` → `iii` | `Verse`, `Intro` | `canon_family` | 92 | 94 | **9** | C - G - Am - Em |
| **6** | **IV - I - V - vi**<br>(서브도미넌트 서정 후렴) | `IV` → `I` → `V` → `vi` | `Chorus`, `Bridge` | `subdominant_start` | 91 | 88 | **9** | F - C - G - Am |
| **7** | **IV - V - IV - V**<br>(프리코러스 교차 텐션) | `IV` → `V` → `IV` → `V` | `Pre-Chorus` | `tension_build` | 89 | 92 | **9** | F - G - F - G |
| **8** | **IV - V - III7 - vi**<br>(세컨더리 도미넌트 왕도) | `IV` → `V` → `III7` → `vi` | `Chorus`, `Bridge` | `secondary_dominant` | 92 | 89 | **9** | F - G - E7 - Am |
| **9** | **vi - V - IV - V**<br>(마이너 하강 프리코러스) | `vi` → `V` → `IV` → `V` | `Pre-Chorus`, `Verse` | `descending_line` | 90 | 91 | **9** | Am - G - F - G |
| **10** | **IV - V - I - vi**<br>(왕도 진행 1도 종지형) | `IV` → `V` → `I` → `vi` | `Chorus`, `Pre-Chorus` | `royal_road` | 93 | 90 | **9** | F - G - C - Am |
| **11** | **I - vi - IV - V**<br>(50s 둘룹 스탠다드 진행) | `I` → `vi` → `IV` → `V` | `Verse`, `Intro` | `standard_turnaround` | 88 | 90 | **8** | C - Am - F - G |
| **12** | **ii - V - I - vi**<br>(재즈/R&B 턴어라운드) | `ii` → `V` → `I` → `vi` | `Verse`, `Interlude` | `circle_of_fifths` | 86 | 95 | **8** | Dm - G - C - Am |
| **13** | **bVI - bVII - I - I**<br>(마리오 카덴스 / 에픽 팝) | `bVI` → `bVII` → `I` → `I` | `Bridge`, `Chorus`, `Outro` | `modal_interchange` | 85 | 82 | **8** | Ab - Bb - C - C |
| **14** | **IV - iv - I - I**<br>(서브도미넌트 마이너 종지) | `IV` → `iv` → `I` → `I` | `Bridge`, `Outro` | `modal_interchange` | 87 | 86 | **8** | F - Fm - C - C |
| **15** | **I - V/7 - vi - V**<br>(베이스 하강 순차 진행) | `I` → `V/7` → `vi` → `V` | `Verse`, `Intro` | `descending_bass` | 84 | 91 | **8** | C - G/B - Am - G |
| **16** | **IV - V - I - I**<br>(도미넌트 완결 카덴스) | `IV` → `V` → `I` → `I` | `Chorus`, `Outro` | `cadence_resolution` | 88 | 94 | **8** | F - G - C - C |
| **17** | **IV - iii - ii - V**<br>(하행 후 도미넌트 전환) | `IV` → `iii` → `ii` → `V` | `Pre-Chorus` | `descending_line` | 90 | 93 | **9** | F - Em - Dm - G |
| **18** | **I - IV - vi - V**<br>(경쾌한 모던 팝 진행) | `I` → `IV` → `vi` → `V` | `Chorus`, `Verse` | `diatonic_pop` | 89 | 90 | **8** | C - F - Am - G |
| **19** | **ii - V - iii - vi**<br>(네오소울 2-5-3-6) | `ii` → `V` → `iii` → `vi` | `Verse`, `Interlude`, `Chorus` | `circle_of_fifths` | 88 | 91 | **8** | Dm - G - Em - Am |
| **20** | **I - bVII - IV - I**<br>(믹솔리디안 록/어반 진행) | `I` → `bVII` → `IV` → `I` | `Bridge`, `Outro`, `Chorus` | `modal_interchange` | 86 | 87 | **8** | C - Bb - F - C |
| **21** | **IV - iv - iii - vi**<br>(서브도미넌트 마이너 클라이맥스) | `IV` → `iv` → `iii` → `vi` | `Bridge` | `modal_interchange` | 88 | 86 | **8** | F - Fm - Em - Am |
| **22** | **I - VI7 - ii - V**<br>(세컨더리 도미넌트 스탠다드) | `I` → `VI7` → `ii` → `V` | `Verse`, `Intro` | `secondary_dominant` | 82 | 92 | **7** | C - A7 - Dm - G |
| **23** | **I - IV - I - V**<br>(어쿠스틱 포크/팝 클래식) | `I` → `IV` → `I` → `V` | `Verse`, `Intro` | `diatonic_pop` | 83 | 88 | **7** | C - F - C - G |
| **24** | **I - ii - iii - IV**<br>(몽환적 상행 진행) | `I` → `ii` → `iii` → `IV` | `Verse`, `Pre-Chorus` | `stepwise_ascent` | 84 | 89 | **8** | C - Dm - Em - F |
| **25** | **vi - ii - V - I**<br>(마이너 스타트 5도권 순환) | `vi` → `ii` → `V` → `I` | `Verse`, `Bridge` | `circle_of_fifths` | 87 | 94 | **8** | Am - Dm - G - C |
| **26** | **II7 - V - I - vi**<br>(더블 도미넌트 브릿지 전환) | `II7` → `V` → `I` → `vi` | `Bridge`, `Interlude` | `secondary_dominant` | 80 | 90 | **7** | D7 - G - C - Am |
| **27** | **I - bVI - bVII - I**<br>(모달 록 앤서 후렴) | `I` → `bVI` → `bVII` → `I` | `Chorus`, `Bridge` | `modal_interchange` | 86 | 85 | **8** | C - Ab - Bb - C |
| **28** | **IV - iii - ii - I**<br>(다이어토닉 스텝 하행 종지) | `IV` → `iii` → `ii` → `I` | `Pre-Chorus`, `Outro` | `descending_line` | 85 | 88 | **8** | F - Em - Dm - C |
| **29** | **I - IV - I - IV**<br>(2코드 어쿠스틱 뱀프) | `I` → `IV` → `I` → `IV` | `Intro`, `Verse` | `vamp` | 81 | 85 | **7** | C - F - C - F |
| **30** | **vi - IV - vi - IV**<br>(어두운 감성 뱀프 루프) | `vi` → `IV` → `vi` → `IV` | `Intro`, `Interlude` | `vamp` | 79 | 84 | **7** | Am - F - Am - F |
| **31** | **IV - V - Vsus4 - V**<br>(도미넌트 서스펜스 프리코러스) | `IV` → `V` → `Vsus4` → `V` | `Pre-Chorus` | `tension_build` | 86 | 92 | **8** | F - G - Gsus4 - G |
| **32** | **ii - V - I - I**<br>(스탠다드 재즈 팝 2-5-1) | `ii` → `V` → `I` → `I` | `Verse`, `Outro`, `Chorus` | `circle_of_fifths` | 89 | 94 | **8** | Dm - G - C - C |

---

## 4. 송폼(Song Form)별 추천 맵

사용자가 특정 송폼 구간의 4마디 블록을 선택했을 때 우선적으로 매칭·추천되는 진행 분류입니다.

### ① Chorus (후렴 / 코러스)
곡의 감정과 에너지가 최고조에 달하는 구간입니다. 한 번 들으면 귀에 남는 대중적인 멜로디 훅을 살릴 수 있는 진행 위주로 배치되었습니다.
- **최우선 추천 (Priority 10)**:
  - `I - V - vi - IV` (ID: 1) — 불패의 팝 4코드
  - `IV - V - iii - vi` (ID: 2) — J-Pop/K-Pop 최고 히트 왕도 진행
- **감성/변형 추천 (Priority 9)**:
  - `vi - IV - I - V` (ID: 3) — 서정적 마이너 출발 팝 진행
  - `IV - V - III7 - vi` (ID: 8) — 극적 세컨더리 도미넌트 왕도 변형
  - `IV - V - I - vi` (ID: 10) — 1도로 시원하게 해소되는 왕도 변형
  - `IV - I - V - vi` (ID: 6) — 서브도미넌트로 부드럽게 감싸는 진행
- **다양성 추천 (Priority 8)**:
  - `I - IV - vi - V` (ID: 18), `IV - V - I - I` (ID: 16), `bVI - bVII - I - I` (ID: 13)

### ② Pre-Chorus (프리코러스 / 빌드업)
Verse의 차분한 분위기에서 Chorus의 폭발적인 에너지로 전환하기 위해 점진적으로 긴장감을 고조시키는 구간입니다.
- **최우선 추천 (Priority 10)**:
  - `ii - iii - IV - V` (ID: 4) — 완벽한 스텝와이즈 상행 빌드업
- **긴장 고조 추천 (Priority 9)**:
  - `IV - V - IV - V` (ID: 7) — 반복 교차로 서스펜스 형성
  - `vi - V - IV - V` (ID: 9) — 마이너 하강 후 5도 오픈
  - `IV - iii - ii - V` (ID: 17) — 차분한 하강 후 5도 점프
- **서스펜스/변형 (Priority 8)**:
  - `IV - V - Vsus4 - V` (ID: 31), `IV - iii - ii - I` (ID: 28), `I - ii - iii - IV` (ID: 24)

### ③ Verse (도입부 / 절)
곡의 이야기와 가사를 전달하며 안정적으로 반복 순환할 수 있는 진행이 적합합니다.
- **핵심 추천 (Priority 9)**:
  - `I - V - vi - iii` (ID: 5) — 캐논 전반부의 서정적 안정감
  - `vi - IV - I - V` (ID: 3) — 몽환적이고 감성적인 스토리텔링
- **스탠다드/서정 추천 (Priority 8)**:
  - `I - vi - IV - V` (ID: 11) — 50s 둘룹 스탠다드
  - `ii - V - I - vi` (ID: 12) — 세련된 재즈/R&B 턴어라운드
  - `I - V/7 - vi - V` (ID: 15) — 베이스 순차 하강 슬래시 코드
  - `ii - V - iii - vi` (ID: 19) — 네오소울 감성
  - `ii - V - I - I` (ID: 32) — 깔끔한 2-5-1 해결
- **어쿠스틱/미니멀 (Priority 7)**:
  - `I - IV - I - V` (ID: 23), `I - VI7 - ii - V` (ID: 22), `I - IV - I - IV` (ID: 29)

### ④ Bridge (브릿지 / 전환부)
후렴의 반복에서 오는 지루함을 깨고 곡 전체의 색채를 완전히 환기시키는 전환 구간입니다. 모달 인터체인지와 세컨더리 도미넌트 기법이 가장 빛을 발합니다.
- **핵심 추천 (Priority 8~9)**:
  - `IV - V - iii - vi` (ID: 2) — 코러스와 대비되는 강력한 감정선
  - `IV - V - III7 - vi` (ID: 8) — 비장한 세컨더리 도미넌트
  - `IV - iv - I - I` (ID: 14) — 서브도미넌트 마이너(iv)의 애절함
  - `IV - iv - iii - vi` (ID: 21) — 극적인 슬픔과 눈물의 클라이맥스
  - `bVI - bVII - I - I` (ID: 13) — 벅차오르는 모달 인터체인지 카덴스
  - `I - bVII - IV - I` (ID: 20) — 시원한 믹솔리디안 사운드
- **분위기 반전 (Priority 7)**:
  - `II7 - V - I - vi` (ID: 26) — 더블 도미넌트를 활용한 화려한 재즈 팝 전환

### ⑤ Intro / Interlude / Outro (도입 / 간주 / 후주)
- **Intro (도입)**: 테마 멜로디를 선보이거나 보컬 진입 전 분위기를 잡음
  - `I - V - vi - IV` (ID: 1), `IV - V - iii - vi` (ID: 2), `I - V - vi - iii` (ID: 5), `I - IV - I - IV` (ID: 29)
- **Interlude (간주)**: 악기 솔로나 다음 절로의 연결
  - `ii - V - I - vi` (ID: 12), `ii - V - iii - vi` (ID: 19), `vi - IV - vi - IV` (ID: 30)
- **Outro (후주)**: 곡의 확실한 종지감 부여 또는 페이드아웃 루프
  - `IV - V - I - I` (ID: 16) — 완전 종지 카덴스
  - `IV - iv - I - I` (ID: 14) — 여운을 남기는 서브도미넌트 마이너 종지
  - `bVI - bVII - I - I` (ID: 13) — 웅장한 엔딩
  - `I - V - vi - IV` (ID: 1) — 여운을 주는 페이드아웃 루프

---

## 5. 제공 파일 안내

`progression` 폴더 내에 32개 단위 배치로 분할 생성된 고품질 진행 데이터셋(총 160선)이 준비되어 있습니다.

### 배치별 데이터 파일

| 배치 | JSON 파일 | SQL 시드 파일 | 진행 ID 범위 | 특징 및 집중 장르 / 송폼 |
|:---:|---|---|:---:|---|
| **Part 1** | [`progressions.json`](file:///Users/gimhyeyeon/Desktop/project/cpmanager/progression/progressions.json) | [`seed_progressions.sql`](file:///Users/gimhyeyeon/Desktop/project/cpmanager/progression/seed_progressions.sql) | 1 ~ 32 | 전 세계 메가 히트 팝, 왕도 진행, 캐논, 둘룹 등 핵심 표준 진행 |
| **Part 2** | [`progressions_2.json`](file:///Users/gimhyeyeon/Desktop/project/cpmanager/progression/progressions_2.json) | [`seed_progressions_2.sql`](file:///Users/gimhyeyeon/Desktop/project/cpmanager/progression/seed_progressions_2.sql) | 33 ~ 64 | 시티팝 2-5-1-4, 안달루시아 하강, 세컨더리 도미넌트 왕도 변형, K-Pop 후렴 |
| **Part 3** | [`progressions_3.json`](file:///Users/gimhyeyeon/Desktop/project/cpmanager/progression/progressions_3.json) | [`seed_progressions_3.sql`](file:///Users/gimhyeyeon/Desktop/project/cpmanager/progression/seed_progressions_3.sql) | 65 ~ 96 | 캐논 베이스 하강 완성형, 라인 클리셰, 모달 애니송, 팝 발라드 빌드업 |
| **Part 4** | [`progressions_4.json`](file:///Users/gimhyeyeon/Desktop/project/cpmanager/progression/progressions_4.json) | [`seed_progressions_4.sql`](file:///Users/gimhyeyeon/Desktop/project/cpmanager/progression/seed_progressions_4.sql) | 97 ~ 128 | 시티팝 텐션 턴, 서브도미넌트 마이너 종지, 페달 포인트 긴장, 인터루드/아웃트로 |
| **Part 5** | [`progressions_5.json`](file:///Users/gimhyeyeon/Desktop/project/cpmanager/progression/progressions_5.json) | [`seed_progressions_5.sql`](file:///Users/gimhyeyeon/Desktop/project/cpmanager/progression/seed_progressions_5.sql) | 129 ~ 160 | **J-Rock / 애니송 / 보컬로이드 특화** (마루사 진행, 코무로 진행, 패싱 디미니시, 5도 마이너 Vm 차용, 초고속 질주 모달) |
| **Part 6** | [`progressions_6.json`](file:///Users/gimhyeyeon/Desktop/project/cpmanager/progression/progressions_6.json) | [`seed_progressions_6.sql`](file:///Users/gimhyeyeon/Desktop/project/cpmanager/progression/seed_progressions_6.sql) | 161 ~ 192 | **J-Rock/밴드, K-Pop 아이돌, 보컬로이드/우타이테, 팝 펑크/브릿팝 (총 32선)** |
| **Part 7** | [`progressions_7.json`](file:///Users/gimhyeyeon/Desktop/project/cpmanager/progression/progressions_7.json) | [`seed_progressions_7.sql`](file:///Users/gimhyeyeon/Desktop/project/cpmanager/progression/seed_progressions_7.sql) | 193 ~ 304 | **도미넌트(5도) 시작 추천 진행 컬렉션 (7개 송폼 구간별 16선씩 총 112선 완비)** |

### 배치 7 (Part 7) 세부 구성 요약 (193 ~ 304)

도미넌트(5도, `V`)로 강력하게 출발하여 긴장감 형성, 역진행, 또는 색다른 추진력을 부여하는 4마디 진행을 7대 표준 송폼 구간별로 각 16선씩 균형 있게 배치했습니다:

1. **Intro (193 ~ 208)**: 5도 임팩트 출발 블루스/록 앤섬 인트로, 1도 미해소 록 인트로 루프, 믹솔리디안 bVII 리프 등 (16선)
2. **Verse (209 ~ 224)**: 5-6-4-1 팝 벌스 순환, 5-4-1-6 서정 벌스, 2-5-1 재즈 팝 턴어라운드 벌스, 어쿠스틱 포크 벌스 등 (16선)
3. **Pre-Chorus (225 ~ 240)**: 5-6-4-5 샌드위치 긴장 빌드업, 순차 하강 후 2도 오픈, 모달 상행(bVI-bVII) 돌파형 빌드업 등 (16선)
4. **Chorus (241 ~ 256)**: 5-4-1-1 호쾌한 록 앤섬 후렴, 5-4-6-1 J-Rock 질주 코러스, 5-1-4-5 클래식 팝 후렴, 서브도미넌트 마이너(iv) 감성 후렴 등 (16선)
5. **Interlude (257 ~ 272)**: 기타/신스 솔로를 위한 5도 출발 순환 진행, 믹솔리디안 블루지 솔로 간주, 2-5-1 네오소울 턴어라운드 등 (16선)
6. **Bridge (273 ~ 288)**: 5도 출발 드라마틱 긴장 고조, bVI-bVII 모달 인터체인지 반전 브릿지, III7 세컨더리 도미넌트 비장미 브릿지 등 (16선)
7. **Outro (289 ~ 304)**: 5-4-1-1 클래식 록 완전 종지, 페이드아웃 최적화 4코드 아웃트로, 짙은 여운의 iv 모달 엔딩, 서사적 피날레 등 (16선)

### 배치 6 (Part 6) 세부 구성 요약 (161 ~ 192)

1. **J-Rock / J-Band 감성 록 (ID 161 ~ 168)**:
   - **백넘버 (back number)**: `IV - V - vi - I` (1도 리턴 앤섬 코마로), `IV - V - III7 - vi` (눈물샘 자극 세컨더리 도미넌트 후렴), `I - V/7 - vi - IV` (순차 베이스 하강 캐논 록)
   - **험브레더스 (Hump Back)**: `vi - IV - I - V` (청춘 질주 파워코드 펑크 록), `IV - I - V - vi` (서브도미넌트 멜로딕 록), `IV - V - vi - V` (프리코러스 5도 킥 오픈)
   - **하쿠 (Haku)**: `IV - V - iii - IV` (6도 미해소 4도 회귀 몽환 루프), `ii - IV - I - V` (어쿠스틱/인디록 서정 벌스)
2. **K-Pop 아이돌 전형 진행 (ID 169 ~ 176)**:
   - **청량/걸그룹 황금 공식**: `IV - V - iii - vi` (트와이스, 여자친구, 아이즈원 식 벅차오름)
   - **틴크러시 / 걸크러시**: `vi - IV - I - V` (블랙핑크, 르세라핌, 아이브 식 마이너 댄스 팝)
   - **이지리스닝 / Y2K**: `IV - I - V - vi` (뉴진스, 세븐틴 식 감성 팝 R&B)
   - **그루비 프리코러스 & 모달 브릿지**: `ii - V - I - IV` (샤이니/레드벨벳 5도 하강), `bVI - bVII - I - I` (에스파/스키즈 에픽 모달 브릿지), `IV - iv - I - I` (아이유/태연 감성 보컬 종지), `vi - V - IV - III7` (오모테 랩/긴장 파트), `I - III7 - vi - IV` (레트로 스윙 팝)
3. **일본 우타이테 / 보컬로이드(Vocaloid) 특화 진행 (ID 177 ~ 184)**:
   - **마루사 진행 (Just the Two of Us)**: `IV - III7 - vi - I` (요아소비, DECO*27 등 보컬로이드/우타이테 최고 빈출 펑키 질주 루프)
   - **오모테 진행**: `vi - V - IV - III7` (Neru, wowaka 등 초고속 BPM 질주곡 시그니처 비장미)
   - **고속 록 질주 & 서프라이즈 모달**: `IV - V - vi - vi` (6도 파워 루프), `IV - V - I - bVII` (믹솔리디안 전조 턴), `bVI - bVII - vi - I` (크로매틱 질주), `IV - iv - iii - VI7` (애니 OST형 벅찬 발라드), `vi - IV - V - I` (메이저 해방 카덴스), `bVI - bVII - V - vi` (사비 종결 마이너 카덴스)
4. **팝 펑크 & 브릿팝 대중 밴드 (ID 185 ~ 192)**:
   - **그린데이 (Green Day / Pop Punk)**: `I - V - vi - IV` (Basket Case 식 팝 펑크의 왕), `I - V - IV - IV` (스트레이트 펑크 록 앤서), `vi - IV - I - V` (21 Guns 식 파워 발라드), `IV - I - V - I` (완전 종지 앤서)
   - **오아시스 (Oasis / Britpop)**: `I - bVII - IV - I` (Wonderwall, Live Forever 식 믹솔리디안 브릿팝 앤섬), `I - V - vi - iii` (Don't Look Back in Anger 캐논 앤섬), `IV - V - I - vi` (Stand By Me 식 팝 록 앤서), `ii - IV - I - V` (Champagne Supernova 식 몽환적 어쿠스틱 그루브)

---

## 6. 추가 추천 장르 및 화성 분야 (Recommended Future Categories)

추후 진행 데이터를 추가 확장할 때 곡의 완성도와 다양성을 비약적으로 높일 수 있는 3대 추천 화성 분야입니다:

1. **네오소울 & 시티팝 (Neo-Soul & City Pop)**:
   - 풍부한 텐션(maj7, 9, 11, m7, sus4)과 세컨더리 도미넌트를 적극 활용하는 세련되고 도회적인 그루브
   - 추천 진행: `IVmaj7 - III7 - vim7 - I7`, `iim7 - V7 - iiim7 - vim7`, `IVmaj7 - V7 - iiim7 - bVImaj7` (서브도미넌트 마이너 대리)
2. **로파이 힙합 & 칠합 (Lo-Fi Hip-Hop / Chillhop / Bedroom Pop)**:
   - 2-5-1 재즈 턴어라운드를 기반으로 드롭-2 보이싱과 텐션을 반복 루프화하여 편안하고 감성적인 분위기 형성
   - 추천 진행: `iim9 - V13 - Imaj9 - vi7`, `IVmaj7 - iv6 - Imaj7 - VI7(b9)`, `iim7 - V7(b9) - Imaj7 - #IVø7`
3. **시네마틱 & 에픽 게임/애니 OST (Cinematic & Epic OST)**:
   - 블록버스터 영화나 서사시 게임 사운드트랙에서 웅장한 감정의 파도를 만드는 모달 체인지와 비장한 마이너 스케일 진행
   - 추천 진행: `vi - bVI - bVII - I`, `i - bVI - bIII - bVII`, `iv - v - vi - I`

---

## 7. 증분 데이터베이스 업데이트 가이드 (`npm run db:update`)

기존 프로젝트와 사용자 데이터를 보존한 채 신규 진행 데이터를 데이터베이스에 적용하려면 다음 명령어를 실행합니다:

```bash
# Part 6 진행 데이터 (ID 161 ~ 192) 데이터베이스에 증분 반영
npm run db:update progression/seed_progressions_6.sql

# 또는 임의의 SQL 파일 실행
npm run db:update <path_to_sql_file>

# 또는 직접 SQL 쿼리 실행
npm run db:update -- "INSERT INTO ..."
```

### 송폼별 전체 통계 (160개 진행 기준)
- **Verse (절)**: 72개
- **Chorus (후렴)**: 66개
- **Bridge (브릿지)**: 46개
- **Pre-Chorus (프리코러스)**: 41개
- **Intro (도입)**: 36개
- **Outro (후주)**: 24개
- **Interlude (간주)**: 19개

*중복 배치를 허용하여 사용자가 특정 송폼을 선택했을 때 다양하고 풍성한 진행이 고르게 추천되도록 구성되어 있습니다.*

