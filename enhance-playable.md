# 코드 진행 청음(Audio Playback) 기능 상세 명세서

본 문서는 사용자가 작업 중인 코드 차트의 화음 진행을 웹 브라우저에서 실시간으로 듣고 확인할 수 있도록 하는 **코드 진행 청음(Audio Playback) 기능**의 아키텍처, 기술 선정, 상세 기능 목록, 데이터 저장 정책, 상수 정의 및 UI/UX 설계를 규정합니다.

---

## 1. 개요 및 목표

### 1.1 배경 및 목적
* 기존 워크스페이스는 시각적인 코드 기호(C, G7, Am, F 등)와 화성학적 기법 배지만을 제공하여, 음악 비전공자나 입문자가 실제 코드 진행의 사운드와 분위기를 즉각적으로 파악하기 어려웠습니다.
* 사용자가 마디 단위, 섹션 단위, 또는 전체 곡 단위로 코드 진행을 소리로 재생해보고, 템포(BPM)를 조절하며 메트로놈과 함께 들을 수 있는 청음 환경을 구축합니다.
* 특정 코드 칩이나 마디를 클릭했을 때 1회성으로 소리를 들려주는 단일 청음(Audition on Demand) 기능도 함께 제공하여 직관적인 코드 선택을 돕습니다.

### 1.2 핵심 원칙
1. **즉각적이고 안정적인 재생 (Zero-latency & Offline-first)**:
   * 외부 사운드폰트 대용량 다운로드에 의존하지 않고, 브라우저 내장 Web Audio 합성을 1차 기본으로 탑재하여 네트워크 지연 없이 즉시 발음합니다.
2. **비파괴적 음악 이론 기반 보이싱 (Harmonic-math Voicing)**:
   * 기존 `harmonic-math.ts`와 `chord-catalog.ts`의 음악 이론 체계를 확장하여, 조성(Tonic)과 도수(Degree), 속성(Quality, Extension), 베이스(Bass Degree)에 맞춰 자연스러운 음역대의 코드 화음 및 베이스 라인을 자동 계산합니다.
3. **Draft 패턴 및 UI 동기화 (Visual Synchronizer)**:
   * 저장되지 않은 클라이언트 초안(Draft) 상태의 코드도 즉시 들을 수 있어야 합니다.
   * 재생 중인 현재 마디와 비트가 UI 상에서 실시간으로 시각적 하이라이트(재생 헤드)되어 청각과 시각이 일치해야 합니다.
4. **엄격한 데이터 저장소 분리**:
   * 곡의 고유 속성(BPM, 박자)은 데이터베이스에 영속화하고, 사용자 개인의 청음 환경(볼륨, 메트로놈 On/Off, 가상 악기 음색)은 브라우저 로컬 스토리지에 관리합니다.

---

## 2. 라이브러리 검토 및 선정

### 2.1 후보 기술 비교

| 평가 항목 | 후보 1: Tone.js (선정) | 후보 2: smplr / soundfont-player | 후보 3: Pure Web Audio API |
| :--- | :--- | :--- | :--- |
| **핵심 장점** | • 정밀 시간 스케줄러(`Tone.Transport`) 내장<br>• 마디/비트/BPM 기반 타임라인 제어 탁월<br>• PolySynth, Sampler, ADSR 엔벨로프, 이펙터 내장<br>• Web Audio 컨텍스트 자동 언락 지원 | • 실제 피아노/기타 고음질 샘플 음원 제공 | • 번들 크기 0<br>• 외부 의존성 없음 |
| **단점 및 제약** | • 번들 용량 약 150KB gzip<br>• Next.js SSR 환경에서 브라우저 API 격리 필요 | • 샘플 오디오 파일 로딩에 수백 ms~초 단위 대기 발생<br>• BPM/루프 스케줄러를 직접 구현해야 함 | • 정밀 타이머(Lookahead Scheduler), 보이스 풀, ADSR, 클릭음을 밑바닥부터 직접 구현해야 함 |
| **선정 여부** | **채택 (Primary Engine)** | **향후 2단계 확장 (Optional Sampler)** | **미채택 (구현 복잡도 과다)** |

### 2.2 선정 사유
* 화음 진행 재생의 핵심은 **정확한 타이밍(BPM 스케줄링)**과 **루프 재생**, **마디/비트 동기화 이벤트**입니다.
* `Tone.js`는 웹 오디오 표준 스케줄러(`Tone.Transport`)를 통해 지터(Jitter) 없는 정확한 메트로놈 및 마디 재생을 제공합니다.
* 클라이언트 컴포넌트(`"use client"`) 내부에서 dynamic import 또는 모듈 초기화 가드를 적용하여 Next.js App Router와 완벽히 호환되도록 구성합니다.

---

## 3. 세부 기능 목록 (Feature Specifications)

### 3.1 오디오 엔진 및 스케줄러 (Audio Core)
1. **AudioContext Unlock**:
   * 브라우저의 오디오 자동재생 제한 정책에 대응하여, 사용자의 첫 클릭 인터랙션 시 `Tone.start()`를 호출해 AudioContext를 즉시 활성화.
2. **BPM & Transport 스케줄링**:
   * `Tone.Transport.bpm.value`를 통해 40~240 BPM 사이를 실시간 반영.
   * 4/4 박자 기준 마디당 4비트 타임라인 등록.
3. **재생 모드 (Playback Modes)**:
   * **전체 곡 재생 (Play All)**: Intro부터 Outro까지 순서대로 재생.
   * **현재 섹션 루프 (Loop Section)**: 현재 선택된 송폼 섹션만 무한 반복 재생.
   * **전체 곡 루프 (Loop All)**: 전체 프로젝트를 무한 반복 재생.
   * **일시정지 및 정지 (Pause & Stop)**: 재생 위치 일시 유지 또는 첫 마디로 리셋.
4. **단일 청음 (Audition on Demand)**:
   * 코드 팔레트 추천 카드나 마디 카드의 특정 비트 클릭 시 `0.8초`간 단일 화음을 즉시 발음.
5. **메트로놈 (Metronome / Click Track)**:
   * 마디의 1번째 비트(다운비트): `1200Hz` 고음 클릭.
   * 마디의 2, 3, 4번째 비트(서브비트): `800Hz` 저음 클릭.
   * 메트로놈 On/Off 토글 지원.
6. **실시간 재생 헤드 이벤트 (Playhead Callback)**:
   * 매 비트마다 `onTick(sectionId, barPosition, beat)` 콜백을 발생시켜 React UI 상태에 현재 재생 위치를 전파.

### 3.2 음악 이론 기반 보이싱 변환기 (Chord Voicer)
1. **기본 피치 클래스 계산**:
   * `harmonic-math.ts`의 `pitchForDegree(tonic, degree)`를 사용하여 근음 피치 클래스(0~11) 추출.
2. **화음 구성음 인터벌 전개**:
   * 코드의 `quality`와 `extension`에 따라 구성 반음 인터벌을 전개.
   * 예: `major` -> `[0, 4, 7]`, `dominant 7` -> `[0, 4, 7, 10]`, `maj7` -> `[0, 4, 7, 11]`, `minor 9` -> `[0, 3, 7, 10, 14]`.
3. **음역대 및 옥타브 분리 (Voicing Separation)**:
   * **베이스 음 (Bass)**: C2~B2 음역대에 배치 (슬래시 코드의 `bass_degree` 우선, 없으면 코드 근음 사용).
   * **화음 (Chord Body)**: C3~C5 음역대에 클로즈드 보이싱으로 3도, 5도, 7도, 텐션 음 배치.
4. **공백 비트 처리**:
   * 비어있는 마디나 비트는 이전 코드를 서스테인 유지하거나 무음으로 처리.

### 3.3 UI 컴포넌트 구성
1. **재생 툴바 (`PlaybackToolbar`)**:
   * 화면 상단 헤더 아래 또는 하단 고정 바 형태로 배치.
   * 재생/일시정지/정지 버튼 (`▶`, `⏸`, `⏹`).
   * 템포(BPM) 조절 슬라이더 및 입력 필드.
   * 재생 범위 선택기 (전체 곡 / 현재 섹션).
   * 루프 토글 버튼 (`🔁`).
   * 메트로놈 토글 버튼 (`⏱️`).
   * 볼륨 슬라이더 (`🔊`).
2. **시각적 재생 피드백 (`Playhead Highlighting`)**:
   * 현재 재생 중인 `BarCard`에 활성 테두리(`ring-2 ring-indigo-500 bg-indigo-50/30`) 및 비트 표시 점(Dot) 애니메이션 표시.
3. **단일 코드 청음 버튼 (`AuditionButton`)**:
   * 마디 상세 정보 및 코드 팔레트의 각 코드 항목에 `🔊 청음` 미니 버튼 제공.

---

## 4. 데이터 저장 정책 (DB Schema vs LocalStorage)

### 4.1 데이터베이스(DB) 영속화 대상 (Project Level)
곡의 음악적 본질을 결정하는 속성은 SQLite DB `projects` 테이블에 저장합니다.

* **테이블 변경**: `projects`
  * `tempo` (BPM): `INTEGER NOT NULL DEFAULT 120 CHECK (tempo BETWEEN 40 AND 240)`
  * `time_signature`: `TEXT NOT NULL DEFAULT '4/4'`
* **API 영향**:
  * `POST /api/projects`: `tempo`, `time_signature` 초기값 생성.
  * `GET /api/projects/:id`: 프로젝트 조회 응답에 `tempo`, `time_signature` 포함.
  * `PUT /api/projects/:id`: 클라이언트 초안(Draft)의 `tempo` 변경 사항 일괄 저장.

### 4.2 브라우저 로컬 스토리지(LocalStorage) 관리 대상 (User Preferences)
개인별 청음 환경 및 UI 세션 설정은 DB에 저장하지 않고 브라우저 로컬 스토리지에 관리합니다.

* `cpmanager_playback_volume`: 숫자 (`0.0 ~ 1.0`, 기본값 `0.8`)
* `cpmanager_metronome_enabled`: 불리언 (`true | false`, 기본값 `false`)
* `cpmanager_playback_scope`: 문자열 (`all | current_section`, 기본값 `all`)
* `cpmanager_loop_enabled`: 불리언 (`true | false`, 기본값 `false`)
* `cpmanager_instrument_preset`: 문자열 (`warm_piano | rhodes_ep | synth_pad`, 기본값 `warm_piano`)

---

## 5. 상수(Constants) 정의 명세

### 5.1 코드 인터벌 및 보이싱 맵 (`chord-voicing-catalog.ts`)
```typescript
import type { Extension, Quality } from "@/app/lib/shared/catalog/chord-catalog";

// 기본 3화음 인터벌 (반음 단위)
export const QUALITY_INTERVALS: Record<Quality, readonly number[]> = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
  dominant: [0, 4, 7, 10],
  "half-diminished": [0, 3, 6, 10],
};

// 익스텐션/텐션 인터벌 매핑
export const EXTENSION_INTERVALS: Record<NonNullable<Extension>, readonly number[]> = {
  "7": [10],           // 단7도
  "maj7": [11],        // 장7도
  "m7": [10],          // 단7도
  "m7b5": [10],        // 단7도
  "9": [10, 14],       // 7도 + 장9도
  "sus4": [5, 7],      // 3음 대체: 4도, 5도
};

// 옥타브 범위 설정
export const AUDIO_VOICING_RANGES = {
  BASS_OCTAVE: 2,           // 베이스 음역대: C2 ~ B2
  CHORD_MIN_OCTAVE: 3,      // 코드 화음 최소 옥타브
  CHORD_ROOT_OCTAVE: 4,     // 코드 화음 기본 중심 옥타브 (C4 기준)
};

// 음이름 표준 배열 (피치 0 = C)
export const MIDI_NOTE_NAMES = [
  "C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"
] as const;
```

### 5.2 재생 한계치 및 오디오 기본값
```typescript
export const PLAYBACK_CONFIG = {
  DEFAULT_BPM: 120,
  MIN_BPM: 40,
  MAX_BPM: 240,
  DEFAULT_VOLUME: 0.8,
  AUDITION_DURATION_SECONDS: 0.8,
  BEATS_PER_BAR: 4,
};

// 메트로놈 주파수 설정
export const METRONOME_FREQUENCIES = {
  DOWNBEAT_FREQ: 1200,      // 1번째 박: 높은 클릭
  SUBBEAT_FREQ: 800,        // 2, 3, 4번째 박: 낮은 클릭
  CLICK_DURATION: 0.04,     // 초 단위
};

// 신디사이저 악기 프리셋 파라미터 (ADSR)
export const SYNTH_PRESETS = {
  warm_piano: {
    oscillator: { type: "triangle" as const },
    envelope: { attack: 0.005, decay: 1.2, sustain: 0.2, release: 0.8 },
  },
  rhodes_ep: {
    oscillator: { type: "sine" as const },
    envelope: { attack: 0.01, decay: 1.5, sustain: 0.35, release: 1.0 },
  },
  synth_pad: {
    oscillator: { type: "sawtooth" as const },
    envelope: { attack: 0.1, decay: 0.8, sustain: 0.7, release: 1.5 },
  },
};
```

---

## 6. 아키텍처 및 데이터 흐름

```mermaid
flowchart TD
    subgraph UI ["클라이언트 컴포넌트 (UI)"]
        Toolbar["PlaybackToolbar (BPM, Play, Stop, Loop, Metronome)"]
        Chart["SongForm / BarCard (Playhead 하이라이트 동기화)"]
        Audition["AuditionButton (코드 칩/마디 단일 청음)"]
        ExportBtn["MidiExportButton (DAW용 .mid 파일 다운로드)"]
    end

    subgraph State ["상태 관리 계층"]
        DraftCtx["ProjectDraftContext (프로젝트 데이터 + tempo)"]
        AudioCtx["AudioPlaybackContext (재생 상태, 위치, 볼륨)"]
        LocalPref["LocalStorage (볼륨, 메트로놈 on/off)"]
    end

    subgraph Engine ["오디오 엔진 및 변환 계층"]
        Voicer["chord-voicer.ts (ChordStep -> MIDI Note 번호/음이름)"]
        Scheduler["AudioScheduler (Tone.Transport 타임라인 큐잉)"]
        Synth["Tone.PolySynth (화음 연주) + ClickSynth (메트로놈)"]
        MidiExp["midi-exporter.ts (midi-writer-js 기반 SMF 인코딩)"]
    end

    subgraph DB ["백엔드 영속화"]
        SQLite["projects 테이블 (tempo, time_signature)"]
    end

    Toolbar -->|BPM 변경 / Play| AudioCtx
    DraftCtx -->|프로젝트 코드 데이터| AudioCtx
    DraftCtx -->|프로젝트 코드 데이터| MidiExp
    AudioCtx --> Voicer
    MidiExp --> Voicer
    Voicer -->|Note 배열| Scheduler
    Voicer -->|MIDI Note 번호| MidiExp
    Scheduler --> Synth
    Scheduler -.->|onTick 콜백 (section, bar, beat)| Chart
    Audition -->|단일 코드 trigger| Synth
    ExportBtn -->|클릭| MidiExp
    MidiExp -->|Blob 다운로드| ExportBtn
    DraftCtx <-->|저장 시 tempo 반영| SQLite
```

---

## 7. DAW 연동을 위한 MIDI 파일 내보내기 (MIDI Export)

### 7.1 타당성 및 구현 난이도 분석
* **결론: 구현 난이도가 매우 낮고(Low effort), 기능적 가치(High value)가 매우 큼**.
* **이유**:
  1. **알고리즘 100% 재사용**: 청음 기능을 위해 이미 구현된 `chord-voicer.ts`에서 각 마디/비트의 음표(`chordNotes`, `bassNote`)를 이미 정확히 계산하므로, 별도의 음악 이론 연산이 추가로 필요하지 않습니다.
  2. **가벼운 라이브러리 규격**: MIDI 파일은 음원 스트림(wav/mp3)이 아닌 델타 타임(Delta-time)과 Note On/Off 메시지로 구성된 표준 바이너리 규격(SMF Type 1 멀티트랙)입니다. `midi-writer-js` (공식 문서: [MidiWriterJS Docs](https://grimmdude.com/MidiWriterJS/docs/), [GitHub](https://github.com/grimmdude/MidiWriterJS)) 라이브러리를 사용하면 순수 브라우저 환경에서 즉시 바이트 배열(`Uint8Array`)을 생성하여 다운로드할 수 있습니다.
  3. **DAW 즉시 연동**: 생성된 `.mid` 파일을 Ableton Live, Logic Pro, Cubase, FL Studio, Studio One 등의 피아노 롤(Piano Roll)이나 타임라인에 드래그 앤 드롭하면, 사용자가 작업한 코드 진행이 가상 악기(VSTi) 트랙(Chords + Bass) 및 섹션 마커로 즉시 분리 로드됩니다.

### 7.2 MidiWriterJS 공식 문서 분석 및 API 매핑

1. **`MidiWriter.Track` 인스턴스 메서드**:
   - `setTempo(bpm)`: 템포 메타 이벤트 삽입 (Chords 트랙 상단에 지정)
   - `setTimeSignature(numerator, denominator)`: 박자표 설정 (`setTimeSignature(4, 4)`)
   - `addTrackName(text)`: 트랙 식별 이름 (`"${project.name} - Chords"`, `"${project.name} - Bass"`)
   - `addMarker(text)`: 송폼 섹션 마커 (DAW 최상단 편곡 눈금자에 "Intro", "Verse", "Chorus" 등의 섹션명 표시)
   - `addEvent(event)`: `NoteEvent` 또는 기타 메타 이벤트 추가

2. **`MidiWriter.NoteEvent({ options })` 매개변수**:
   - `pitch`: 음이름 문자열 배열 (예: `['C4', 'E4', 'G4']`) 또는 MIDI 노트 번호
   - `duration`: 지속 시간 코드
     * 4박 (온음표): `'1'` (512 ticks)
     * 3박 (점2분음표): `'d2'` (384 ticks)
     * 2박 (2분음표): `'2'` (256 ticks)
     * 1박 (4분음표): `'4'` (128 ticks)
     * 0.5박 (8분음표): `'8'` (64 ticks)
   - `startTick` / `tick`: 절대 타임라인 틱 위치. `(globalBarIndex * 512) + (beat - 1) * 128`로 산출하여 쉼표/빈 마디 발생 시에도 오차 없이 완벽한 절대 그리드 정렬 보장.
   - `velocity`: 타건 세기 (Chords: 75, Bass: 85)
   - `channel`: MIDI 채널 지정 (Chords: 1, Bass: 2)

3. **`MidiWriter.Writer([chordTrack, bassTrack])` 인스턴스**:
   - `buildFile()`: 표준 SMF Type 1 바이너리 `Uint8Array` 반환 (헤더 청크 `MThd` + 트랙 청크 `MTrk` 2개)
   - 브라우저 다운로드 헬퍼: `new Blob([bytes], { type: "audio/midi" })` 생성 후 `<a download="...">` 트리거

### 7.3 MIDI 트랙 구성 및 빈 마디 타임라인 보존 스펙
* **Format**: Standard MIDI File (SMF) Type 1 (멀티 트랙)
* **Tempo & Time Signature**: 프로젝트의 `tempo` (BPM) 및 4/4 박자 메타데이터 삽입
* **Track 1: Chords (화음 트랙)**
  * 채널: Channel 1
  * 내용: 각 마디의 비트별 코드 화음 (C3~C5 음역대)
  * 섹션 마커: 각 섹션의 시작 마디에 `addMarker(section.name)` 삽입
* **Track 2: Bass (베이스 트랙)**
  * 채널: Channel 2
  * 내용: 슬래시 코드 베이스 또는 코드 근음 (C1~C2 저음역대)
  * 용도: DAW에서 베이스 가상악기 트랙에 즉시 별도로 매핑 가능하도록 분리
* **빈 마디 및 전체 송폼 길이 보존**:
  * 코드가 비어 있는 마디는 절대 `startTick` 스케줄링을 통해 이후 마디의 타임라인이 앞당겨지는 현상(Time collapse)을 원천 차단
  * 프로젝트의 마지막 마디가 빈 마디이더라도 전체 송폼 길이(`totalBars * 512 ticks`)가 DAW에서 온전히 인식되도록 끝 지점 마커(`addMarker("End")`) 배치

### 7.4 클라이언트 내보내기 모듈 명세 (`app/lib/client/midi/midi-exporter.ts`)
```typescript
import MidiWriter from "midi-writer-js";
import { chordToVoicedNotes } from "@/app/lib/shared/domain/chord-voicer";
import { calculateBarChordDurations } from "@/app/lib/client/audio/timeline-calculator";
import type { ProjectDraft } from "@/app/types/client";

export function generateProjectMidi(project: ProjectDraft): Uint8Array {
  const chordTrack = new MidiWriter.Track();
  const bassTrack = new MidiWriter.Track();

  const bpm = project.tempo || 120;
  chordTrack.setTempo(bpm);
  chordTrack.setTimeSignature(4, 4);

  chordTrack.addTrackName(`${project.name || "Project"} - Chords`);
  bassTrack.addTrackName(`${project.name || "Project"} - Bass`);

  // 섹션 -> 마디 -> 비트 순회 및 startTick 계산
  // ... NoteEvent({ pitch, duration, startTick, channel, velocity }) 추가
  
  const writer = new MidiWriter.Writer([chordTrack, bassTrack]);
  return writer.buildFile();
}

export function downloadProjectMidi(project: ProjectDraft, filename?: string): void {
  const bytes = generateProjectMidi(project);
  const blob = new Blob([bytes], { type: "audio/midi" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || `${project.name || "chord-progression"}.mid`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
```

---

## 8. 기술적 제약사항 및 구현 가이드

1. **SQLite 마이그레이션 호환성 (`ALTER TABLE`)**:
   * 기존 DB(`data/cpmanager.db`)에 이미 `projects` 테이블이 존재하므로, 단순 `CREATE TABLE IF NOT EXISTS` 대신 `PRAGMA table_info(projects)`를 검사하여 `tempo`, `time_signature` 컬럼이 없을 때만 안전하게 `ALTER TABLE projects ADD COLUMN ...`을 실행하도록 구현합니다.
2. **실시간 템포 조절 시 재생 무중단 (Live BPM Update)**:
   * 청음 재생 중에 BPM 슬라이더를 조작해도 오디오가 처음으로 리셋되거나 끊기지 않도록 `Tone.Transport.bpm.value`를 실시간 반영합니다.
3. **Next.js SSR 안전성**:
   * `Tone.js`는 `window` 및 `AudioContext` 전역 객체에 의존하므로 서버 렌더링 시점에 절대 호출되지 않아야 합니다.
   * `typeof window !== "undefined"` 체크 또는 `useEffect` 내 동적 로딩을 통해 안전하게 클라이언트 전용으로 초기화합니다.
4. **마디 내 비트 지속 시간(Duration) 계산**:
   * `bar_chords`의 `beat` 목록(1~4)을 검사하여 다음 코드 비트까지의 간격을 계산합니다 (예: 1박만 있으면 온음표 4박, 1·3박이면 2분음표 2박, 1·2·3·4박이면 4분음표 1박 지속).
5. **핫 리스케줄링 (Hot-Rescheduling) 및 보이스 고갈 방지**:
   * 재생 중 코드나 마디가 수정되어도 재생 위치를 유지하며 스케줄을 재동기화합니다.
   * 빠른 템포의 연속 타건 시 음이 찢어지거나 브라우저가 느려지지 않도록 `Tone.PolySynth`의 최대 동시 발음 수(`maxPolyphony: 16`) 및 적절한 `release` 타임을 적용합니다.
6. **MIDI 빈 마디 쉼표(Rest) 필수 처리 및 DAW 마커 지원**:
   * 코드가 비어 있는 마디는 온쉼표(`new MidiWriter.NoteEvent({ rest: true, duration: '1' })`)를 반드시 삽입하여 타임라인 붕괴를 원천 방지합니다.
   * 각 섹션의 시작 마디에 송폼 이름(Intro, Verse, Chorus 등)을 **Marker Meta Event**로 추가하여 DAW에서 섹션을 즉시 시각적으로 구분할 수 있도록 합니다.
7. **베이스(Bass) 음과 화음(Chords)의 엔벨로프 분리 및 저음 잔향 억제 (Wave 8)**:
   * 단일 `PolySynth`에 화음과 베이스를 함께 묶어 발음할 경우, 저음역대(C1~C2, 32Hz~65Hz)의 강한 음향 에너지와 0.8초의 릴리즈가 결합되어 베이스 음이 상위 화음보다 2배 이상 길게 울려 퍼지는 음향 왜곡(Bleeding)이 발생합니다.
   * `AudioEngine` 내에 `polySynth`(화음 전용: `decay: 0.8s, sustain: 0.25, release: 0.4s`)와 `bassSynth`(베이스 전용: `decay: 0.5s, sustain: 0.15, release: 0.15s`)로 사운드 채널을 완전 분리 구축합니다.
   * `AudioScheduler` 및 `playAuditionChord`에서 옥타브를 기준으로 자동 라우팅하여 베이스 음표가 비트/마디 경계에서 0.15초의 타이트하고 단단한 릴리즈로 즉시 컷오프되도록 보장합니다.
   * 재생 정지(`stop`), 일시정지(`pause`) 시 `silenceAll()`을 호출하여 모든 신스의 잔여 음을 즉시 차단합니다.
8. **Tone.js duration 표기법 구문 오류 방지 및 Transport Time 포맷 준수 (Wave 8)**:
   * Tone.js `triggerAttackRelease(notes, duration, time)`에 `"${durationBeats} * 4n"`과 같은 사칙연산 수식 문자열을 전달하면, Tone.js의 `TimeBase` 정규식 파서 매칭이 실패하여 `parseFloat("${durationBeats} * 4n")`으로 폴백됩니다.
   * 이로 인해 4비트 코드가 템포(BPM)와 무관하게 고정 **4.0초(초 단위)**로 해석되어, 120 BPM 기준 2초여야 할 코드가 8박(2마디) 동안 비정상적으로 울리며, 신스 코드와 베이스가 다음 마디까지 침범하게 됩니다.
   * `beatsToTransportDuration(beats)` 모듈을 통해 Tone.js 공식 Transport Time 표기법인 `bars:quarters:sixteenths` (예: 4비트 -> `"1:0:0"`, 2비트 -> `"0:2:0"`, 1비트 -> `"0:1:0"`) 포맷으로 엄격하게 변환하여, 모든 템포에서 정확한 비트 길이만큼만 연주되도록 보장합니다.

---

## 9. 참고 사항 및 추후 보완 과제

1. **보이싱 고도화 (추후 보완 과제)**:
   * *Smooth Voicing / Octave Clamping*: 코드가 바뀔 때 음역대가 너무 높이 치솟지 않도록 C3~C5 음역대로 래핑하는 보이싱 고도화 작업은 1차 구현 완료 후 사운드 퀄리티 튜닝 단계에서 보완 과제로 진행합니다.
   * *`sus4` 3도 대체 규칙*: 1차 기본 인터벌 구현 후, 특수 텐션/서스펜디드 코드의 디테일한 보이싱 룰을 순차적으로 정교화합니다.
2. **UI 및 단축키 최적화 (참고 사항)**:
   * *렌더링 최적화*: 재생 비트 틱(`onTick`) 발생 시 전체 워크스페이스가 아닌 재생 인디케이터만 가볍게 반응하도록 참조를 분리합니다.
   * *단축키 가드*: 추후 스페이스바 재생 토글 추가 시 텍스트 입력 중 스페이스바 오작동을 방지하는 이벤트 가드를 고려합니다.
   * *단일 청음 채널 분리*: 전체 재생 중 단일 청음 클릭 시 사운드 중첩 정책을 추후 UI 폴리싱 단계에서 다듬습니다.


