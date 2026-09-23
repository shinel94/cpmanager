# 코드 진행 청음(Audio Playback) 개발 TODO

본 문서는 `enhance-playable.md` 명세에 정의된 코드 진행 청음(Audio Playback) 기능을 실제 구현하기 위한 단계별(Phase별) 실행 계획 및 검증 기준을 정의합니다.

---

## 1. 개발 원칙 및 품질 기준

1. **무결성 및 무중단 (Zero Regression)**:
   * 기존 79개 테스트(`npm test`), 타입 검사(`npm run typecheck`), 프로덕션 빌드(`npm run build`)가 항상 100% 통과해야 합니다.
2. **SSR 안전성 (SSR Safety)**:
   * Web Audio API 및 `Tone.js` 코드는 브라우저 전용(`"use client"`) 모듈로 격리하며, 서버 렌더링 시점에 절대 실행되지 않아야 합니다.
3. **Draft 패턴 일관성**:
   * BPM(tempo) 변경은 클라이언트 초안(`ProjectDraftContext`)에 즉시 반영되며, 명시적인 '저장' 버튼 클릭 시에만 `PUT /api/projects/:id`를 통해 DB에 영속화됩니다.
4. **검증 및 로그 기록**:
   * 각 Phase 완료 시 단위 테스트를 작성하고 `wave_log/fe-wave-enhance5.log`에 작업 내역을 상세히 기록합니다.

---

## 2. 단계별 개발 계획 (Phases)

### Phase 1. 음악 이론 기반 코드 보이싱 모듈 (`chord-voicer.ts`)
목표: `ChordStep`과 조성(`tonic`)을 입력받아 실제 재생 가능한 MIDI 노트 및 음이름 배열(`['C2', 'E4', 'G4', 'B4']`)로 변환하는 순수 도메인 로직 및 단위 테스트 구축.

- [x] **1.1 보이싱 상수 및 타입 정의** (`app/lib/shared/domain/chord-voicer.ts`):
  - [x] 코드 품질별 반음 인터벌 매핑 (`QUALITY_INTERVALS`: major, minor, diminished, dominant, half-diminished)
  - [x] 익스텐션/텐션 반음 인터벌 매핑 (`EXTENSION_INTERVALS`: 7, maj7, m7, m7b5, 9, sus4)
  - [x] 베이스 옥타브(2) 및 코드 화음 옥타브(3/4) 기준치 정의
- [x] **1.2 코드 보이싱 계산 함수 구현** (`app/lib/shared/domain/chord-voicer.ts`):
  - [x] `chordToVoicedNotes(tonic: Tonic, step: ChordStep, options?: VoicingOptions): VoicedChord`
  - [x] 베이스 음 계산: 슬래시 코드(`bass_degree`)가 존재하면 해당 음을 우선 베이스로 설정, 없으면 코드 근음 사용
  - [x] 화음 음역대 분산: 루트 피치 >= 6 (F#~B)는 옥타브 3, 미만(C~F)은 옥타브 4로 배치하여 C3~C5 음역대 밸런스 유지
- [x] **1.3 단위 테스트 작성 및 검증** (`test/chord-voicer.test.ts`):
  - [x] 다이어토닉 3화음(C, Dm, Em, F, G, Am, Bdim) 음표 산출 검증
  - [x] 7th 및 텐션 코드(Cmaj7, G7, Dm7, Bm7b5, C9, Gsus4) 음표 산출 검증
  - [x] 전위/슬래시 코드(C/E, G/B, F/A 등)의 베이스 음 분리 검증

`[Gate 1]` `npm test`를 통해 `test/chord-voicer.test.ts`를 포함한 모든 테스트가 오류 없이 통과해야 함. (통과: 87개 테스트 전체 성공)


---

### Phase 2. DB 스키마 및 프로젝트 BPM(tempo) 데이터 연동
목표: `projects` 테이블에 `tempo` 및 `time_signature` 컬럼을 추가하고, 백엔드 API와 클라이언트 Draft 상태 스토어에 연동.

- [x] **2.1 SQLite DB 마이그레이션 업데이트** (`app/lib/server/db/migrations.ts`):
  - [x] 기존 DB 테이블 보존을 위한 `PRAGMA table_info(projects)` 컬럼 검사 로직 추가
  - [x] `projects` 테이블에 `tempo` 및 `time_signature`가 없을 경우 안전하게 `ALTER TABLE projects ADD COLUMN tempo INTEGER NOT NULL DEFAULT 120 CHECK (tempo BETWEEN 40 AND 240);` 실행
  - [x] `ALTER TABLE projects ADD COLUMN time_signature TEXT NOT NULL DEFAULT '4/4';` 실행
  - [x] 마이그레이션 실행 스크립트 검증 (`npm run db:migrate`)
- [x] **2.2 백엔드 리포지토리 및 API 수정**:
  - [x] `app/lib/server/repositories/project-repository.ts`: 프로젝트 생성(`create`), 단건 조회(`findById`), 전체 수정(`update`) 시 `tempo`, `time_signature` 필드 입출력 매핑
  - [x] `app/lib/server/validation/project-payload.ts`: tempo(40~240) 및 time_signature 유효성 검사 추가
  - [x] API 라우트 검증 (`GET /api/projects/:id`, `POST /api/projects`, `PUT /api/projects/:id`)
- [x] **2.3 클라이언트 Draft 스토어 연동**:
  - [x] `app/types/client.ts`: `ProjectDraft` 및 `SerializedProjectPayload`에 `tempo`, `time_signature` 추가
  - [x] `app/lib/client/draft-reducer.ts`: `SET_TEMPO` 액션 (clamping 40~240) 추가
  - [x] `app/lib/client/project-serializer.ts`: 초안 저장(`serializeProjectDraft`) 및 불러오기(`hydrateProjectDraft`) 시 `tempo`, `time_signature` 반영
  - [x] `app/lib/client/project-draft-context.tsx`: `setTempo(tempo: number)` 헬퍼 함수 제공

`[Gate 2]` API 및 DB를 통한 tempo 저장/조회 동작이 정상 작동하고 기존 프로젝트 CRUD 테스트가 모두 통과해야 함. (통과: 90개 테스트 전체 성공)


---

### Phase 3. Tone.js 기반 클라이언트 오디오 엔진 구축
목표: 브라우저 환경에서 안정적으로 동작하는 웹 오디오 스케줄러, 신디사이저, 메트로놈 코어 서비스 구현.

- [x] **3.1 패키지 설치 및 SSR 안전 환경 구성**:
  - [x] `tone` 라이브러리 설치 (`tone@15.1.22`)
  - [x] 클라이언트 모듈 로딩 가드 (`typeof window === "undefined"` 및 `import("tone")` 동적 임포트) 구성하여 Next.js 빌드 시 `window is not defined` 에러 원천 차단
- [x] **3.2 오디오 플레이어 싱글톤/서비스 구현** (`app/lib/client/audio/audio-engine.ts`):
  - [x] `AudioContext` 활성화 메서드 (`unlockAudioContext()`)
  - [x] `Tone.PolySynth`를 사용한 부드러운 EP/피아노 신스 보이스 풀 생성 (보이스 고갈 방지: `maxPolyphony: 16`, triangle 오실레이터, attack 0.01s, release 0.4s)
  - [x] **베이스 전용 `bassSynth` 분리 및 저음 잔향 억제 (Wave 8)**: `maxPolyphony: 4`, triangle 오실레이터, attack 0.015s, decay 0.5s, sustain 0.15, **release 0.15s**로 타이트한 저음 컷오프 실현하여 화음보다 베이스가 길게 울리는 현상 완전 차단
  - [x] **Tone.js Transport Time duration 표기법 정규화 (`beatsToTransportDuration`) (Wave 8)**: `${evt.durationBeats} * 4n` 수식 문자열이 Tone.js 정규식 파싱 실패로 `parseFloat` 폴백(초 단위 처리, 4박이 4초=8박/2마디로 과다 재생)을 유발하던 치명적 버그를 해결. `bars:quarters:sixteenths` 포맷으로 변환하여 신스 화음 및 베이스음이 템포(BPM)에 맞춰 칼같이 연주 및 릴리즈되도록 구현.
  - [x] `Tone.Synth`를 사용한 메트로놈 구현 (다운비트 1200Hz 고음 클릭, 서브비트 800Hz 저음 클릭)
  - [x] 볼륨 마스터 게인(`Tone.Destination.volume.rampTo`) 제어 메서드
  - [x] 활성 사운드 즉시 소거 메서드 (`silenceAll()`)
- [x] **3.3 타임라인 스케줄러 및 비트 지속 시간 계산** (`app/lib/client/audio/timeline-calculator.ts`, `audio-scheduler.ts`):
  - [x] 마디 내 비트 간격(Beat 1~4)에 따른 음표 지속 시간(Duration) 산출 (온음표 4박, 2분음표 2박, 4분음표 1박, 쉼표 보존)
  - [x] 전체 마디 시퀀스를 순회하며 `Tone.Transport`에 마디/비트 단위 발음 이벤트 등록 (화음은 `polySynth`, 베이스는 `bassSynth`로 독립 채널 스케줄링)
  - [x] 재생 중 코드 변경 시 재생 위치를 유지하면서 스케줄을 재동기화하는 핫 리스케줄링(`reschedule`) 지원
  - [x] 메트로놈 비트 스케줄링 (`scheduleRepeat("4n")` 1, 2, 3, 4 비트 클릭)
  - [x] 재생 헤드 콜백: 매 비트마다 `onTick({ sectionId, sectionName, barPosition, beat })` 트리거
  - [x] 재생 제어 API: `play()`, `pause()`, `stop()`, `setBpm()`, `setLoop()`, `setMetronome()`
- [x] **3.4 단일 청음(Audition) 프리뷰 함수**:
  - [x] `playAuditionChord(notes: string[], durationSeconds?: number)`: 단일 화음 1회 재생 (옥타브 2 이하 베이스와 옥타브 3 이상 화음 자동 분기 발음)

`[Gate 3]` 클라이언트 오디오 엔진 인스턴스가 에러 없이 초기화되고, 단일 음 및 코드 발음이 정상 작동해야 함. (통과: 93개 테스트 전체 성공)


---

### Phase 4. 재생 컨트롤러 UI (`PlaybackToolbar`) 구현
목표: 사용자가 곡 전체의 재생, 정지, BPM 조절, 메트로놈 On/Off, 볼륨 조절을 직관적으로 제어할 수 있는 툴바 UI 컴포넌트 개발.

- [x] **4.1 재생 컨트롤러 툴바 컴포넌트** (`app/components/audio/PlaybackToolbar.tsx`):
  - [x] Play/Pause/Stop 버튼 (재생 상태에 따라 아이콘 및 스타일 토글)
  - [x] BPM 조절 컨트롤러: 슬라이더(40~240) + 숫자 직접 입력 인풋 (조작 시 실시간 라이브 템포 반영)
  - [x] 루프 모드 토글 버튼: 전체 곡 루프(`Loop All`) / 현재 섹션 루프(`Loop Section`) / 끔(`Off`)
  - [x] 메트로놈 토글 버튼 (`⏱️`)
  - [x] 볼륨 슬라이더 (`🔊 0~100%`) 및 뮤트 토글
  - [x] 현재 재생 위치 상태 텍스트 배지 (예: `▶ [Verse] #2마디 [3박]`)
- [x] **4.2 워크스페이스 레이아웃 통합**:
  - [x] `app/components/workspace/WorkspaceShell.tsx`: 헤더 바로 아래 sticky 배치하여 3단 워크스페이스 전역에서 항시 노출
  - [x] 반응형 가로 스크롤 및 모바일 화면 대응 여백 확보
- [x] **4.3 로컬 스토리지 연동 (`useAudioPreferences.ts`)**:
  - [x] 사용자의 볼륨, 메트로놈, 루프, 재생 범위(전체 vs 섹션) 설정값 로컬 스토리지 자동 저장 및 복원

`[Gate 4]` 툴바의 모든 버튼과 슬라이더가 부드럽게 동작하고, Draft의 `tempo` 변경 시 더티(Dirty) 상태가 정상 감지되어야 함. (통과: 93개 테스트 및 프로덕션 빌드 성공)


---

### Phase 5. 마디/코드 시각화 동기화 및 단일 청음(Audition) 인터랙션 연동
목표: 재생 중인 마디/비트의 시각적 하이라이트 표시 및 코드 팔레트/마디 카드 단일 청음 기능 연동.

- [x] **5.1 마디 카드 재생 헤드(Playhead) 시각화** (`app/components/chordchart/BarCard.tsx`):
  - [x] 현재 연주 중인 마디에 테두리 애니메이션(`ring-2 ring-emerald-500 bg-emerald-50/40 shadow-lg`) 및 재생 뱃지(`▶ N박`) 표시
  - [x] 현재 연주 중인 비트 위치(1, 2, 3, 4) 인디케이터 도트 활성화 (하단 4-beat dot meter 및 4박 분할 뷰 비트 셀 하이라이트)
- [x] **5.2 마디 카드 내 단일 청음 버튼 추가**:
  - [x] 마디 카드 헤더 및 4박 분할 뷰 각 박자별 화음 즉시 듣기(`🔊`) 버튼 제공
- [x] **5.3 코드 팔레트 추천 카드 청음 연동** (`app/components/palette/`, `RecommendationPanel.tsx`, `InlineChordBuilder.tsx`):
  - [x] 다이어토닉 7코드 팔레트 카드 클릭 시 할당 및 청음 동시 발음, 각 카드별 전용 `🔊` 청음 버튼 제공
  - [x] 숫자 키(1~7) 단축키 입력 시 청음 동시 발음
  - [x] 추천 코드 진행 카드에 4마디 순차 청음(`🔊 청음`) 버튼 제공 및 개별 스텝 코드 클릭 청음 연동
  - [x] 인라인 코드 빌더에 실시간 생성 코드 `🔊 청음` 버튼 연동

`[Gate 5]` 재생 시 마디 하이라이트가 청각 템포와 1:1로 일치하여 이동하고, 클릭 청음이 지연 없이 발음되어야 함. (완료 - 96개 테스트 100% 통과)

---

### Phase 6. DAW 연동을 위한 MIDI 파일 내보내기 (MIDI Export)
목표: `chord-voicer.ts`의 음표 변환 결과를 활용하여 프로젝트 전체 코드 진행을 표준 MIDI 파일(.mid)로 다운로드하는 기능 구현.

- [x] **6.1 패키지 설치**:
  - [x] `midi-writer-js` 설치 (`npm install midi-writer-js` 및 `app/types/midi-writer-js.d.ts` 타입 정의)
- [x] **6.2 MIDI 변환 및 다운로드 모듈 구현** (`app/lib/client/midi/midi-exporter.ts`):
  - [x] 프로젝트 섹션/마디/비트 구조를 순회하여 트랙 이벤트 생성
  - [x] **빈 마디 절대 틱 스케줄링**: `startTick`을 512틱/마디 기반으로 절대 계산하여 빈 마디 시에도 타임라인 붕괴 방지
  - [x] **DAW 섹션 마커 삽입**: 각 송폼 섹션의 첫 마디 틱에 `addMarker(section.name)`를 추가하여 DAW 상단에 섹션명 표시
  - [x] Track 1: 화음 트랙 (Chord Chords, C3~C5 음역대, 채널 1, 벨로시티 75)
  - [x] Track 2: 베이스 트랙 (Bass Notes, C1~C2 음역대, 채널 2, 벨로시티 85)
  - [x] 템포(BPM, `setTempo`) 및 4/4 박자(`setTimeSignature(4, 4, 24, 8)`) 메타데이터 삽입
  - [x] 브라우저 파일 다운로드 헬퍼 (`downloadProjectMidi`, `Blob` 객체 및 `URL.createObjectURL`)
  - [x] 전체 곡 또는 단일 섹션 선택 내보내기 지원 (`targetSectionId`)
- [x] **6.3 UI 연동 (`MidiExportButton.tsx`, `PlaybackToolbar.tsx`)**:
  - [x] 재생 툴바 볼륨 컨트롤 우측에 `[MIDI 내보내기 ▾]` 드롭다운 버튼 배치
  - [x] 클릭 시 '전체 곡 내보내기' 및 각 섹션별 단일 내보내기 선택 메뉴 제공
  - [x] 다운로드 성공 시 토스트 알림 연동
- [x] **6.4 단위 테스트 작성** (`test/midi-exporter.test.ts`):
  - [x] 생성된 MIDI 바이너리 헤더(`MThd`, Type 1, 2 Tracks `MTrk`) 및 데이터 유효성 검증
  - [x] 다중 코드 마디, 박자 길이 변환(`beatsToMidiDuration`) 검증
  - [x] 빈 마디가 포함된 프로젝트의 절대 그리드 타임라인 보존 검증
  - [x] 단일 섹션 타겟 내보내기 검증

`[Gate 6]` MIDI 파일이 오류 없이 정상 생성 및 다운로드되고, 표준 DAW(Ableton, Logic 등)에서 SMF Type 1 트랙(Chords, Bass) 및 마커가 정상 분리 인식되어야 함. (완료 - 101개 테스트 100% 통과)

---

### Phase 7. 종합 테스트, 회귀 검증 및 문서화
목표: 단위/통합 테스트 검증, 타입 검사, 빌드 검증 및 로그 기록 완료.

- [x] **7.1 테스트 슈트 확장**:
  - [x] `test/chord-voicer.test.ts`: 보이싱 변환 정확성 테스트 (87개 통과)
  - [x] `test/project-tempo.test.ts`: 프로젝트 tempo DB 영속화 테스트 (90개 통과)
  - [x] `test/timeline-calculator.test.ts`: 타임라인 계산 및 SSR 가드 테스트 (93개 통과)
  - [x] `test/audition-playhead.test.ts`: 청음 및 재생헤드 시각화 테스트 (96개 통과)
  - [x] `test/midi-exporter.test.ts`: MIDI 변환 및 SMF Type 1 바이너리 테스트 (101개 통과)
  - [x] `npm test` 전체 실행 및 100% 통과 확인 (101/101 Passed)
- [x] **7.2 프로덕션 빌드 및 린트 검증**:
  - [x] `npm run typecheck` 실행 (0 errors)
  - [x] `npm run build` 실행 (Next.js 15.5.25 SSR/Client 번들링 성공 확인)
- [x] **7.3 개발 로그 작성**:
  - [x] `wave_log/playable_wave7.log` 생성 및 구현 내역, 기술적 결정 사항, 테스트 결과 최종 기록 완료
  - [x] `enhance-playable.md` 및 `enhance-playable-todo.md` 전 Phase 진행 상태 최종 동기화 완료

`[Gate 7]` 전체 테스트 100% 통과, TypeScript 에러 0건, Next.js 프로덕션 빌드가 에러 없이 성공해야 함. (완료 - 101개 테스트 통과, build 성공)

---

## 3. 작업 진행 상태 요약표

| Phase | 세부 내용 | 상태 | 비고 |
| :--- | :--- | :---: | :--- |
| **Phase 1** | 코드 보이싱 도메인 로직 & 테스트 | 완료 | `chord-voicer.ts`, 단위 테스트 (87개 통과) |
| **Phase 2** | DB 스키마(tempo) 마이그레이션 & API 연동 | 완료 | `projects.tempo`, Draft 연동 (90개 통과) |
| **Phase 3** | Tone.js 클라이언트 오디오 엔진 구축 | 완료 | `audio-engine.ts`, `audio-scheduler.ts` (93개 통과) |
| **Phase 4** | 재생 컨트롤러 UI (`PlaybackToolbar`) 구현 | 완료 | Play, Stop, BPM, Loop, Metronome |
| **Phase 5** | 재생 헤드 동기화 & 단일 청음 연동 | 완료 | `BarCard` 하이라이트, 🔊 청음 버튼 (96개 통과) |
| **Phase 6** | DAW 연동 MIDI 파일 내보내기 | 완료 | `midi-exporter.ts`, `MidiExportButton` (101개 통과) |
| **Phase 7** | 종합 검증, 빌드 및 로그 기록 | 완료 | 101개 테스트 통과, `playable_wave7.log` 작성 |
| **Phase 8** | 베이스 음 길이 및 엔벨로프 최적화 | 완료 | `bassSynth` 분리, release 0.15s, `playable_wave8.log` |

---

## 4. 부록: 참고 사항 및 추후 보완 과제

1. **보이싱 고도화 (추후 보완 과제)**:
   - Smooth Voicing / Octave Clamping: 코드 간 음역대 급격한 점프 방지를 위한 C3~C5 옥타브 래핑은 1차 구현 완료 후 사운드 퀄리티 튜닝 단계에서 진행.
   - `sus4` 3도 생략/완전4도 치환 및 복합 텐션 코드 룰 정교화.
2. **UI 및 단축키 최적화 (참고 사항)**:
   - 고빈도 비트 틱 이벤트 발생 시 워크스페이스 전역 리렌더링 방지 및 재생 인디케이터 최적화.
   - 텍스트 입력 중 스페이스바 재생 토글 방지 가드.
   - 곡 전체 재생 도중 단일 청음 클릭 시 사운드 중첩/뮤트 정책 조율.


