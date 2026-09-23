import { AudioEngine } from "./audio-engine";
import {
  buildProjectPlaybackTimeline,
  type PlaybackChordEvent,
} from "./timeline-calculator";
import type { ProjectDraft } from "@/app/types/client";

export type PlaybackStatus = "playing" | "paused" | "stopped";

export type PlayheadPosition = {
  sectionId: string;
  sectionName: string;
  barPosition: number;
  beat: number;
};

export type SchedulerOptions = {
  targetSectionId?: string;
  loop?: boolean;
  metronome?: boolean;
  onTick?: (pos: PlayheadPosition) => void;
  onEnded?: () => void;
};

/**
 * 박자 수(beats)를 Tone.js Transport Time 문자열("bars:quarters:sixteenths")로 변환합니다.
 * ⚠️ 주의: Tone.js에 "${beats} * 4n" 문자열을 전달하면 정규식 매칭 실패로 인해
 * parseFloat() 폴백이 발동하여 초(seconds) 단위로 처리되는 치명적인 버그를 방지합니다.
 */
export function beatsToTransportDuration(durationBeats: number): string {
  const durBars = Math.floor(durationBeats / 4);
  const remBeats = durationBeats % 4;
  const durQuarters = Math.floor(remBeats);
  const durSixteenths = (remBeats - durQuarters) * 4;
  return `${durBars}:${durQuarters}:${durSixteenths}`;
}

export class AudioScheduler {
  private static instance: AudioScheduler | null = null;
  private engine: AudioEngine;
  private status: PlaybackStatus = "stopped";
  private options: SchedulerOptions = {};
  private scheduledPartId: number | null = null;
  private metronomeRepeatId: number | null = null;
  private currentProject: ProjectDraft | null = null;

  private constructor() {
    this.engine = AudioEngine.getInstance();
  }

  public static getInstance(): AudioScheduler {
    if (!AudioScheduler.instance) {
      AudioScheduler.instance = new AudioScheduler();
    }
    return AudioScheduler.instance;
  }

  public getStatus(): PlaybackStatus {
    return this.status;
  }

  /**
   * 프로젝트 타임라인을 Tone.Transport에 스케줄링하고 재생을 시작합니다.
   */
  public async play(project: ProjectDraft, options: SchedulerOptions = {}): Promise<void> {
    if (typeof window === "undefined") return;

    await this.engine.unlockAudioContext();
    const Tone = this.engine.getTone();
    if (!Tone) return;

    this.currentProject = project;
    this.options = { ...this.options, ...options };

    // 템포 설정 (BPM)
    const bpm = Math.max(40, Math.min(240, project.tempo || 120));
    Tone.Transport.bpm.value = bpm;

    // 일시정지 상태에서 재개하는 경우
    if (this.status === "paused") {
      Tone.Transport.start();
      this.status = "playing";
      return;
    }

    // 처음 재생 시 기존 스케줄 초기화 후 새 타임라인 등록
    this.clearSchedule();
    this.scheduleTimeline(project);

    Tone.Transport.position = 0;
    Tone.Transport.start();
    this.status = "playing";
  }

  /**
   * 재생 일시정지
   */
  public pause(): void {
    if (typeof window === "undefined") return;
    const Tone = this.engine.getTone();
    if (!Tone) return;

    Tone.Transport.pause();
    this.engine.silenceAll();
    this.status = "paused";
  }

  /**
   * 재생 완전 정지 및 재생 위치 리셋
   */
  public stop(): void {
    if (typeof window === "undefined") return;
    const Tone = this.engine.getTone();
    if (!Tone) return;

    Tone.Transport.stop();
    Tone.Transport.position = 0;
    this.clearSchedule();
    this.engine.silenceAll();
    this.status = "stopped";
  }

  /**
   * 실시간 BPM 변경 (재생 중 끊김 없음)
   */
  public setBpm(bpm: number): void {
    if (typeof window === "undefined") return;
    const Tone = this.engine.getTone();
    if (!Tone) return;

    const clamped = Math.max(40, Math.min(240, Math.round(bpm)));
    Tone.Transport.bpm.value = clamped;
  }

  /**
   * 메트로놈 On/Off 토글
   */
  public setMetronome(enabled: boolean): void {
    this.options.metronome = enabled;
  }

  /**
   * 루프 모드 설정
   */
  public setLoop(loop: boolean): void {
    if (typeof window === "undefined") return;
    const Tone = this.engine.getTone();
    if (!Tone) return;

    this.options.loop = loop;
    Tone.Transport.loop = loop;
  }

  /**
   * 재생 중 코드나 마디가 변경되었을 때 현재 재생 위치를 유지하면서 스케줄을 재동기화 (핫 리스케줄링)
   */
  public reschedule(project: ProjectDraft): void {
    if (typeof window === "undefined") return;
    this.currentProject = project;
    if (this.status === "playing" || this.status === "paused") {
      const Tone = this.engine.getTone();
      if (!Tone) return;

      const currentPos = Tone.Transport.seconds;
      this.clearSchedule();
      this.scheduleTimeline(project);
      Tone.Transport.seconds = currentPos;
    }
  }

  /**
   * 내부 스케줄링 로직
   */
  private scheduleTimeline(project: ProjectDraft): void {
    const Tone = this.engine.getTone();
    const chordSynth = this.engine.getPolySynth();
    const bassSynth = this.engine.getBassSynth();
    if (!Tone || !chordSynth) return;

    const events = buildProjectPlaybackTimeline(project, {
      targetSectionId: this.options.targetSectionId,
    });

    if (events.length === 0) return;

    const totalBeats = Math.max(
      ...events.map((e) => e.timeBeats + e.durationBeats),
      4
    );

    // 전체 곡 길이 (마디:4분음표:16분음표) 계산
    const bars = Math.ceil(totalBeats / 4);
    Tone.Transport.loopStart = 0;
    Tone.Transport.loopEnd = `${bars}:0:0`;
    Tone.Transport.loop = !!this.options.loop;

    // 1. 코드 및 재생 헤드 콜백 스케줄링
    for (const evt of events) {
      // timeBeats를 Tone.Transport 시간 포맷 ("바:비트:식스틴스")으로 변환
      const barNum = Math.floor(evt.timeBeats / 4);
      const beatNum = evt.timeBeats % 4;
      const transportTime = `${barNum}:${beatNum}:0`;

      // ⚠️ Tone.js duration 표기법 수정:
      // "${evt.durationBeats} * 4n" 문자열은 Tone.js 정규식 매칭에 실패하여 parseFloat()로 폴백되어
      // BPM과 무관하게 초(seconds) 단위로 해석되는 치명적인 버그가 있었습니다.
      // (예: 4비트 코드가 4초 동안 지속되어 120 BPM 기준 2마디/8박 동안 비정상 연주됨)
      // Transport 시간 포맷("bars:quarters:sixteenths")으로 변환하여 템포 동기화 보장
      const durationTime = beatsToTransportDuration(evt.durationBeats);

      Tone.Transport.schedule((time: number) => {
        // UI 재생 헤드 위치 콜백
        if (this.options.onTick) {
          this.options.onTick({
            sectionId: evt.sectionId,
            sectionName: evt.sectionName,
            barPosition: evt.barPosition,
            beat: evt.beat,
          });
        }

        // 실제 화음 및 베이스 분리 발음 (쉼표가 아닌 경우)
        if (!evt.isRest && evt.voiced) {
          // 화음 음표 (polySynth: release 0.4s)
          if (chordSynth && evt.voiced.chordNotes.length > 0) {
            chordSynth.triggerAttackRelease(
              evt.voiced.chordNotes,
              durationTime,
              time
            );
          }
          // 베이스 음표 (bassSynth: release 0.15s - 저음 잔향이 화음보다 길게 울리는 현상 방지)
          if (bassSynth && evt.voiced.bassNote) {
            bassSynth.triggerAttackRelease(
              evt.voiced.bassNote,
              durationTime,
              time
            );
          } else if (!bassSynth && chordSynth && evt.voiced.allNotes.length > 0) {
            // bassSynth 부재 시 하위 호환 폴백
            chordSynth.triggerAttackRelease(
              evt.voiced.allNotes,
              durationTime,
              time
            );
          }
        }
      }, transportTime);
    }

    // 2. 메트로놈 비트 스케줄링 (매 1박(4n)마다 클릭)
    this.metronomeRepeatId = Tone.Transport.scheduleRepeat(
      (time: number) => {
        if (!this.options.metronome) return;
        const currentBeatIndex = Math.floor(Tone.Transport.ticks / Tone.Transport.PPQ) % 4;
        const isDownbeat = currentBeatIndex === 0;
        this.engine.playMetronomeClick(isDownbeat, time);
      },
      "4n"
    );

    // 3. 곡 종료 스케줄링 (루프가 아닐 때 정지 콜백)
    Tone.Transport.schedule((time: number) => {
      if (!this.options.loop) {
        this.stop();
        if (this.options.onEnded) {
          this.options.onEnded();
        }
      }
    }, `${bars}:0:0`);
  }

  /**
   * Transport에 등록된 모든 이벤트 클리어
   */
  private clearSchedule(): void {
    const Tone = this.engine.getTone();
    if (!Tone) return;

    Tone.Transport.cancel();
    this.engine.silenceAll();
    this.metronomeRepeatId = null;
    this.scheduledPartId = null;
  }
}
