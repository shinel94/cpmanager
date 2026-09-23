"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { AudioScheduler, type PlayheadPosition, type PlaybackStatus } from "@/app/lib/client/audio/audio-scheduler";
import { AudioEngine } from "@/app/lib/client/audio/audio-engine";
import { useAudioPreferences } from "@/app/lib/client/audio/useAudioPreferences";
import { useProjectDraft } from "@/app/lib/client/project-draft-context";
import { MidiExportButton } from "./MidiExportButton";

export type PlaybackToolbarProps = {
  activeSectionId: string | null;
  onPlayheadTick?: (pos: PlayheadPosition | null) => void;
};

export function PlaybackToolbar({
  activeSectionId,
  onPlayheadTick,
}: PlaybackToolbarProps) {
  const { project, setTempo } = useProjectDraft();
  const { preferences, updatePreference, isLoaded } = useAudioPreferences();

  const [status, setStatus] = useState<PlaybackStatus>("stopped");
  const [playhead, setPlayhead] = useState<PlayheadPosition | null>(null);
  const [localBpm, setLocalBpm] = useState<number>(project.tempo || 120);

  const schedulerRef = useRef<AudioScheduler | null>(null);
  const engineRef = useRef<AudioEngine | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      schedulerRef.current = AudioScheduler.getInstance();
      engineRef.current = AudioEngine.getInstance();
    }
    return () => {
      if (schedulerRef.current) {
        schedulerRef.current.stop();
      }
    };
  }, []);

  // 프로젝트 BPM 동기화
  useEffect(() => {
    if (project.tempo && project.tempo !== localBpm) {
      setLocalBpm(project.tempo);
    }
  }, [project.tempo]);

  // 볼륨 preference 변경 시 엔진에 반영
  useEffect(() => {
    if (isLoaded && engineRef.current) {
      engineRef.current.setVolume(preferences.volume);
    }
  }, [preferences.volume, isLoaded]);

  // 메트로놈 preference 변경 시 스케줄러에 반영
  useEffect(() => {
    if (isLoaded && schedulerRef.current) {
      schedulerRef.current.setMetronome(preferences.metronome);
    }
  }, [preferences.metronome, isLoaded]);

  // 루프 preference 변경 시 스케줄러에 반영
  useEffect(() => {
    if (isLoaded && schedulerRef.current) {
      schedulerRef.current.setLoop(preferences.loop);
    }
  }, [preferences.loop, isLoaded]);

  // 재생 중 프로젝트 초안(코드 등)이 바뀔 때 핫 리스케줄링
  useEffect(() => {
    if (schedulerRef.current && status === "playing") {
      schedulerRef.current.reschedule(project);
    }
  }, [project, status]);

  // Playhead 변경 시 부모 컴포넌트 알림
  const handleTick = useCallback(
    (pos: PlayheadPosition) => {
      setPlayhead(pos);
      if (onPlayheadTick) {
        onPlayheadTick(pos);
      }
    },
    [onPlayheadTick]
  );

  const handleEnded = useCallback(() => {
    setStatus("stopped");
    setPlayhead(null);
    if (onPlayheadTick) {
      onPlayheadTick(null);
    }
  }, [onPlayheadTick]);

  // 재생 / 일시정지 토글
  const handlePlayToggle = async () => {
    if (!schedulerRef.current) return;

    if (status === "playing") {
      schedulerRef.current.pause();
      setStatus("paused");
    } else {
      const targetSectionId =
        preferences.playScope === "section" && activeSectionId
          ? activeSectionId
          : undefined;

      setStatus("playing");
      await schedulerRef.current.play(project, {
        targetSectionId,
        loop: preferences.loop,
        metronome: preferences.metronome,
        onTick: handleTick,
        onEnded: handleEnded,
      });
    }
  };

  // 정지
  const handleStop = () => {
    if (!schedulerRef.current) return;
    schedulerRef.current.stop();
    setStatus("stopped");
    setPlayhead(null);
    if (onPlayheadTick) {
      onPlayheadTick(null);
    }
  };

  // BPM 조절
  const handleBpmChange = (newBpm: number) => {
    const clamped = Math.max(40, Math.min(240, newBpm));
    setLocalBpm(clamped);
    setTempo(clamped);
    if (schedulerRef.current) {
      schedulerRef.current.setBpm(clamped);
    }
  };

  return (
    <div className="bg-slate-900 text-white px-4 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 select-none shadow-sm z-10">
      {/* 1. Main Controls: Play/Pause/Stop */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handlePlayToggle}
          className={`h-9 px-3.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs ${
            status === "playing"
              ? "bg-amber-500 hover:bg-amber-600 text-slate-950 ring-2 ring-amber-400/30"
              : "bg-indigo-600 hover:bg-indigo-500 text-white ring-2 ring-indigo-400/20"
          }`}
          title={status === "playing" ? "일시정지" : "코드 진행 재생"}
        >
          <span>{status === "playing" ? "⏸ 일시정지" : "▶ 재생"}</span>
        </button>

        <button
          type="button"
          onClick={handleStop}
          disabled={status === "stopped"}
          className={`h-9 px-3 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer border ${
            status === "stopped"
              ? "border-slate-800 text-slate-600 cursor-not-allowed opacity-50"
              : "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
          }`}
          title="재생 정지 및 처음으로 리셋"
        >
          <span>⏹ 정지</span>
        </button>

        {/* 2. Playhead Status Badge */}
        <div className="ml-2 hidden sm:flex items-center h-8 px-2.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-xs">
          {status === "playing" && playhead ? (
            <div className="flex items-center gap-1.5 text-indigo-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-slate-200">[{playhead.sectionName}]</span>
              <span>#{playhead.barPosition}마디</span>
              <span className="text-amber-300">[{playhead.beat}박]</span>
            </div>
          ) : status === "paused" ? (
            <span className="text-amber-400/80 font-mono text-[11px]">⏸ 일시정지됨</span>
          ) : (
            <span className="text-slate-500 font-mono text-[11px]">대기 중</span>
          )}
        </div>
      </div>

      {/* 3. Middle: BPM Control & Scope */}
      <div className="flex items-center gap-4">
        {/* BPM Slider & Input */}
        <div className="flex items-center gap-2 bg-slate-800/90 px-3 py-1 rounded-lg border border-slate-700/70">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            BPM
          </span>
          <input
            type="range"
            min={40}
            max={240}
            value={localBpm}
            onChange={(e) => handleBpmChange(Number(e.target.value))}
            className="w-20 sm:w-28 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            title="템포 조절"
          />
          <input
            type="number"
            min={40}
            max={240}
            value={localBpm}
            onChange={(e) => handleBpmChange(Number(e.target.value))}
            className="w-12 h-6 px-1 text-xs font-mono font-bold bg-slate-900 border border-slate-700 rounded text-center text-indigo-200 focus:outline-none focus:border-indigo-500"
            title="BPM 직접 입력"
          />
        </div>

        {/* Scope Selector: All vs Section */}
        <div className="hidden md:flex items-center rounded-lg bg-slate-800 p-0.5 border border-slate-700/60 text-xs">
          <button
            type="button"
            onClick={() => updatePreference("playScope", "all")}
            className={`px-2.5 py-1 rounded-md transition font-medium cursor-pointer ${
              preferences.playScope === "all"
                ? "bg-indigo-600 text-white font-semibold shadow-2xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="전체 송폼 순서대로 재생"
          >
            전체 곡
          </button>
          <button
            type="button"
            onClick={() => updatePreference("playScope", "section")}
            className={`px-2.5 py-1 rounded-md transition font-medium cursor-pointer ${
              preferences.playScope === "section"
                ? "bg-indigo-600 text-white font-semibold shadow-2xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="현재 선택된 송폼 섹션만 재생"
          >
            선택 섹션
          </button>
        </div>

        {/* Loop Toggle */}
        <button
          type="button"
          onClick={() => updatePreference("loop", !preferences.loop)}
          className={`h-8 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1 border transition cursor-pointer ${
            preferences.loop
              ? "bg-indigo-950/80 border-indigo-500 text-indigo-300 ring-1 ring-indigo-500/30"
              : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          }`}
          title="반복 재생 (Loop)"
        >
          <span>🔁</span>
          <span className="hidden sm:inline">반복</span>
        </button>

        {/* Metronome Toggle */}
        <button
          type="button"
          onClick={() => updatePreference("metronome", !preferences.metronome)}
          className={`h-8 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1 border transition cursor-pointer ${
            preferences.metronome
              ? "bg-indigo-950/80 border-indigo-500 text-indigo-300 ring-1 ring-indigo-500/30"
              : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          }`}
          title="메트로놈 클릭음 켜기/끄기"
        >
          <span>⏱️</span>
          <span className="hidden sm:inline">메트로놈</span>
        </button>
      </div>

      {/* 4. Right: MIDI Export & Volume Control */}
      <div className="flex items-center gap-3">
        <MidiExportButton project={project} activeSectionId={activeSectionId} />

        <div className="h-4 w-px bg-slate-700 hidden sm:block" />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => updatePreference("volume", preferences.volume === 0 ? 0.8 : 0)}
            className="text-slate-400 hover:text-white transition text-xs p-1"
            title={preferences.volume === 0 ? "음소거 해제" : "음소거"}
          >
            {preferences.volume === 0 ? "🔇" : preferences.volume < 0.4 ? "🔉" : "🔊"}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={preferences.volume}
            onChange={(e) => updatePreference("volume", Number(e.target.value))}
            className="w-16 sm:w-20 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            title={`볼륨: ${Math.round(preferences.volume * 100)}%`}
          />
          <span className="text-[10px] font-mono text-slate-400 w-7 text-right">
            {Math.round(preferences.volume * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}
