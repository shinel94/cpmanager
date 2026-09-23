/**
 * Tone.js 기반 클라이언트 오디오 엔진 코어
 * Next.js SSR 안전성 보장을 위해 브라우저 환경에서만 동적으로 인스턴스화됩니다.
 */

export type AudioEngineConfig = {
  volume?: number; // 0.0 ~ 1.0 (기본값 0.8)
};

export class AudioEngine {
  private static instance: AudioEngine | null = null;
  private ToneModule: typeof import("tone") | null = null;
  private polySynth: any = null;
  private bassSynth: any = null;
  private metronomeSynth: any = null;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  /**
   * 브라우저 환경에서 Tone.js 모듈 및 신디사이저를 초기화합니다.
   */
  public async init(): Promise<boolean> {
    if (typeof window === "undefined") {
      return false; // Server-side guard
    }

    if (this.isInitialized && this.polySynth && this.bassSynth && this.ToneModule) {
      return true;
    }

    try {
      this.ToneModule = await import("tone");
      const Tone = this.ToneModule;

      // 1. 화음 연주용 PolySynth (부드러운 E-Piano / Warm Synth 음색)
      // 화음 릴리즈를 0.4s로 조정하여 코드 간 뭉침을 해소하고 자연스러운 감쇠를 구현합니다.
      this.polySynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
          type: "triangle",
        },
        envelope: {
          attack: 0.01,
          decay: 0.8,
          sustain: 0.25,
          release: 0.4,
        },
        volume: -6, // 기본 출력 게인 조정
      }).toDestination();

      this.polySynth.maxPolyphony = 16;

      // 2. 베이스 전용 Synth (타이트한 릴리즈 및 펀치감 있는 저음)
      // 릴리즈를 0.15s로 단축하여 저음 잔향이 화음보다 길게 끌려 웅웅거리는 현상을 원천 방지합니다.
      this.bassSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
          type: "triangle",
        },
        envelope: {
          attack: 0.015,
          decay: 0.5,
          sustain: 0.15,
          release: 0.15,
        },
        volume: -8, // 저음 밸런스 조정
      }).toDestination();

      this.bassSynth.maxPolyphony = 4;

      // 3. 메트로놈 클릭음용 Synth
      this.metronomeSynth = new Tone.Synth({
        oscillator: {
          type: "sine",
        },
        envelope: {
          attack: 0.001,
          decay: 0.04,
          sustain: 0,
          release: 0.04,
        },
        volume: -10,
      }).toDestination();

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error("Failed to initialize Tone.js AudioEngine:", error);
      return false;
    }
  }

  /**
   * 브라우저 AudioContext 자동재생 제한을 해제(unlock)합니다.
   */
  public async unlockAudioContext(): Promise<void> {
    if (typeof window === "undefined") return;
    await this.init();
    if (this.ToneModule) {
      await this.ToneModule.start();
    }
  }

  /**
   * 볼륨 설정 (0.0 ~ 1.0)
   */
  public setVolume(volume: number): void {
    if (!this.ToneModule || typeof window === "undefined") return;
    const clamped = Math.max(0, Math.min(1, volume));
    if (clamped === 0) {
      this.ToneModule.getDestination().mute = true;
    } else {
      this.ToneModule.getDestination().mute = false;
      // 0~1 선형 게인을 데시벨로 변환 (-40dB ~ 0dB)
      const db = clamped === 1 ? 0 : this.ToneModule.gainToDb(clamped);
      this.ToneModule.getDestination().volume.rampTo(db, 0.05);
    }
  }

  /**
   * 단일 코드 즉시 청음 (Audition)
   * 저음역(옥타브 2 이하) 베이스 노트와 중고음역(옥타브 3 이상) 화음 노트를 자동 분리하여
   * 베이스 전용 타이트 엔벨로프(release 0.15s)와 화음 엔벨로프로 각각 발음함으로써
   * 베이스 음이 길게 남는 문제를 해결합니다.
   */
  public async playAuditionChord(notes: string[], durationSeconds = 0.8): Promise<void> {
    if (typeof window === "undefined" || notes.length === 0) return;
    await this.unlockAudioContext();

    const bassNotes: string[] = [];
    const chordNotes: string[] = [];

    for (const note of notes) {
      const match = note.match(/(\d+)$/);
      const octave = match ? parseInt(match[1], 10) : 4;
      if (octave <= 2) {
        bassNotes.push(note);
      } else {
        chordNotes.push(note);
      }
    }

    try {
      if (this.polySynth && chordNotes.length > 0) {
        this.polySynth.triggerAttackRelease(chordNotes, durationSeconds);
      }
      if (this.bassSynth && bassNotes.length > 0) {
        this.bassSynth.triggerAttackRelease(bassNotes, durationSeconds);
      } else if (this.polySynth && chordNotes.length === 0 && bassNotes.length > 0) {
        // bassSynth 미초기화 대비 폴백
        this.polySynth.triggerAttackRelease(bassNotes, durationSeconds);
      }
    } catch (err) {
      console.warn("Audio trigger error:", err);
    }
  }

  /**
   * 모든 활성 사운드 즉시 중단 (Release All)
   */
  public silenceAll(): void {
    if (this.polySynth) {
      try {
        this.polySynth.releaseAll();
      } catch {}
    }
    if (this.bassSynth) {
      try {
        this.bassSynth.releaseAll();
      } catch {}
    }
  }

  /**
   * 메트로놈 클릭 사운드 발음
   * downbeat: 1200Hz 고음 클릭 (1번째 박)
   * subbeat: 800Hz 저음 클릭 (2, 3, 4번째 박)
   */
  public playMetronomeClick(isDownbeat: boolean, time?: any): void {
    if (!this.metronomeSynth || typeof window === "undefined") return;
    const freq = isDownbeat ? 1200 : 800;
    try {
      if (time !== undefined) {
        this.metronomeSynth.triggerAttackRelease(freq, "32n", time);
      } else {
        this.metronomeSynth.triggerAttackRelease(freq, "32n");
      }
    } catch (err) {
      console.warn("Metronome click error:", err);
    }
  }

  /**
   * 타임라인 스케줄링 시 사용할 화음용 PolySynth 인스턴스 반환
   */
  public getPolySynth() {
    return this.polySynth;
  }

  /**
   * 타임라인 스케줄링 시 사용할 베이스용 PolySynth 인스턴스 반환
   */
  public getBassSynth() {
    return this.bassSynth;
  }

  /**
   * 로드된 Tone 모듈 반환
   */
  public getTone() {
    return this.ToneModule;
  }

  /**
   * 리소스 정리
   */
  public dispose(): void {
    if (this.polySynth) {
      this.polySynth.dispose();
      this.polySynth = null;
    }
    if (this.bassSynth) {
      this.bassSynth.dispose();
      this.bassSynth = null;
    }
    if (this.metronomeSynth) {
      this.metronomeSynth.dispose();
      this.metronomeSynth = null;
    }
    this.isInitialized = false;
  }
}
