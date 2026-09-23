"use client";

import React, { useMemo } from "react";
import type { BarChordDraft } from "@/app/types/client";
import {
  type Extension,
  type Quality,
  type Tonic,
  COMPATIBLE_EXTENSIONS,
  MAJOR_DIATONIC_QUALITIES,
} from "@/app/lib/shared/catalog/chord-catalog";
import { realizeChord } from "@/app/lib/shared/domain/chord-realizer";
import { playAuditionChord } from "@/app/lib/client/audio/audition";

export type InlineChordBuilderProps = {
  tonic: Tonic;
  sectionName?: string | null;
  sectionId?: string | null;
  barPosition?: number | null;
  beat?: number | null;
  currentChord?: BarChordDraft | null;
  onChangeChord: (chord: {
    degree: string;
    quality: Quality;
    extension: Extension;
    bass_degree: string | null;
  }) => void;
  onClearChord?: () => void;
  onOpenDetailedModal?: () => void;
};

const QUALITIES: Array<{ id: Quality; label: string; badge: string }> = [
  { id: "major", label: "Major", badge: "장화음" },
  { id: "minor", label: "Minor", badge: "단화음" },
  { id: "dominant", label: "Dominant 7", badge: "도미넌트" },
  { id: "diminished", label: "Diminished", badge: "디미니쉬" },
  { id: "half-diminished", label: "Half-Dim", badge: "m7b5" },
];

const EXTENSION_LIST: Array<{ id: Extension; label: string }> = [
  { id: null, label: "3화음 (none)" },
  { id: "7", label: "7" },
  { id: "maj7", label: "maj7" },
  { id: "9", label: "9" },
  { id: "sus4", label: "sus4" },
  { id: "m7b5", label: "m7b5" },
];

const QUICK_INVERSIONS = [
  { label: "Root (기본)", bass: null },
  { label: "/3 (1전위)", bass: "3rd" },
  { label: "/5 (2전위)", bass: "5th" },
  { label: "/7 (3전위)", bass: "7th" },
];

type QuickPreset = {
  name: string;
  tag: string;
  degree: string;
  quality: Quality;
  extension: Extension;
  bass_degree: string | null;
  badgeColor: string;
};

const QUICK_PRESETS: QuickPreset[] = [
  // Secondary Dominant
  { name: "V7/ii (VI7)", tag: "세컨더리", degree: "VI", quality: "dominant", extension: "7", bass_degree: null, badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { name: "V7/V (II7)", tag: "세컨더리", degree: "II", quality: "dominant", extension: "7", bass_degree: null, badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { name: "V7/vi (III7)", tag: "세컨더리", degree: "III", quality: "dominant", extension: "7", bass_degree: null, badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { name: "V7/IV (I7)", tag: "세컨더리", degree: "I", quality: "dominant", extension: "7", bass_degree: null, badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  // Modal Interchange
  { name: "IVm (iv)", tag: "모달차용", degree: "IV", quality: "minor", extension: null, bass_degree: null, badgeColor: "bg-purple-50 text-purple-700 border-purple-200" },
  { name: "bVI", tag: "모달차용", degree: "bVI", quality: "major", extension: null, bass_degree: null, badgeColor: "bg-purple-50 text-purple-700 border-purple-200" },
  { name: "bVII", tag: "모달차용", degree: "bVII", quality: "major", extension: null, bass_degree: null, badgeColor: "bg-purple-50 text-purple-700 border-purple-200" },
  // Slash
  { name: "V/VII", tag: "슬래시", degree: "V", quality: "major", extension: null, bass_degree: "VII", badgeColor: "bg-amber-50 text-amber-700 border-amber-200" },
  { name: "I/III", tag: "슬래시", degree: "I", quality: "major", extension: null, bass_degree: "III", badgeColor: "bg-amber-50 text-amber-700 border-amber-200" },
  // Tension
  { name: "Imaj7", tag: "텐션", degree: "I", quality: "major", extension: "maj7", bass_degree: null, badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { name: "IVmaj7", tag: "텐션", degree: "IV", quality: "major", extension: "maj7", bass_degree: null, badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { name: "Vsus4", tag: "텐션", degree: "V", quality: "major", extension: "sus4", bass_degree: null, badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200" },
];

export function InlineChordBuilder({
  tonic,
  sectionName,
  barPosition,
  beat = 1,
  currentChord,
  onChangeChord,
  onClearChord,
  onOpenDetailedModal,
}: InlineChordBuilderProps) {
  const activeDegree = currentChord?.degree || "I";
  const activeQuality = currentChord?.quality || "major";
  const activeExtension = currentChord?.extension || null;
  const activeBass = currentChord?.bass_degree || null;

  // Realized chord representation for preview
  const realizedName = useMemo(() => {
    if (!currentChord) return "코드 없음";
    return realizeChord(tonic, {
      degree: activeDegree,
      quality: activeQuality,
      extension: activeExtension,
      bass_degree: activeBass,
    });
  }, [tonic, activeDegree, activeQuality, activeExtension, activeBass, currentChord]);

  // Compatible extensions for current quality
  const compatibleExtensions = useMemo(() => {
    return COMPATIBLE_EXTENSIONS[activeQuality] || [null];
  }, [activeQuality]);

  const handleUpdate = (overrides: {
    degree?: string;
    quality?: Quality;
    extension?: Extension;
    bass_degree?: string | null;
  }) => {
    const nextDegree = overrides.degree !== undefined ? overrides.degree : activeDegree;
    const nextQuality = overrides.quality !== undefined ? overrides.quality : activeQuality;
    let nextExt = overrides.extension !== undefined ? overrides.extension : activeExtension;
    const nextBass = overrides.bass_degree !== undefined ? overrides.bass_degree : activeBass;

    // Validate extension compatibility with quality
    const allowed = COMPATIBLE_EXTENSIONS[nextQuality] || [null];
    if (nextExt && !allowed.includes(nextExt)) {
      nextExt = null;
    }

    onChangeChord({
      degree: nextDegree,
      quality: nextQuality,
      extension: nextExt,
      bass_degree: nextBass,
    });
  };

  if (!barPosition) {
    return (
      <div className="mt-3 p-3.5 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center">
        <p className="text-xs text-slate-500">
          💡 <span className="font-semibold text-slate-700">마디나 박자를 선택</span>하면 화음 성질, 텐션, 베이스 전위를 실시간으로 변경하고 즉시 화성 분석 결과를 확인할 수 있습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 p-3.5 bg-gradient-to-b from-slate-50/90 to-white border border-slate-200 rounded-xl shadow-2xs space-y-3.5 animate-fadeIn">
      {/* Header bar: target location & live preview */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">
            {sectionName ? `[${sectionName}]` : ""} #{barPosition}마디{beat && beat > 1 ? ` ${beat}박` : ""}
          </span>
          <span className="text-xs text-slate-400">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500">실시간 적용:</span>
            <span className="px-2 py-0.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded">
              {realizedName}
            </span>
            <button
              type="button"
              onClick={() => {
                playAuditionChord(
                  {
                    degree: activeDegree,
                    quality: activeQuality,
                    extension: activeExtension,
                    bass_degree: activeBass,
                  },
                  tonic,
                );
              }}
              className="px-1.5 py-0.5 text-xs font-bold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 rounded border border-indigo-300 transition cursor-pointer flex items-center gap-0.5"
              title="현재 설정된 코드 소리 듣기 (Audition)"
            >
              <span>🔊</span>
              <span>청음</span>
            </button>
            <span className="text-[11px] font-mono text-slate-400">
              ({activeDegree}
              {activeQuality !== "major" ? ` ${activeQuality}` : ""}
              {activeExtension ? ` ${activeExtension}` : ""}
              {activeBass ? `/${activeBass}` : ""})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {currentChord && (
            <button
              type="button"
              onClick={() => handleUpdate({ quality: "major", extension: null, bass_degree: null })}
              className="px-2 py-1 text-[11px] font-medium text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded transition cursor-pointer"
              title="기본 3화음으로 리셋"
            >
              3화음 리셋
            </button>
          )}
          {currentChord && onClearChord && (
            <button
              type="button"
              onClick={onClearChord}
              className="px-2 py-1 text-[11px] font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition cursor-pointer"
              title="현재 마디 코드 삭제"
            >
              코드 삭제
            </button>
          )}
          {onOpenDetailedModal && (
            <button
              type="button"
              onClick={onOpenDetailedModal}
              className="px-2 py-1 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded transition cursor-pointer flex items-center gap-1"
              title="상세 모달 팝업으로 열기"
            >
              <span>🔍</span>
              <span>모달 팝업</span>
            </button>
          )}
        </div>
      </div>

      {/* Row 1: Chord Quality */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          1. 화음 성질 (Quality)
        </span>
        <div className="flex flex-wrap gap-1.5">
          {QUALITIES.map((q) => {
            const isSelected = activeQuality === q.id;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => handleUpdate({ quality: q.id })}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs font-bold"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-indigo-50 hover:border-indigo-300"
                }`}
              >
                <span>{q.label}</span>
                <span
                  className={`text-[10px] px-1 py-0.2 rounded ${
                    isSelected ? "bg-indigo-700 text-indigo-100" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {q.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 2: Extension / Tension */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          2. 텐션 및 확장 (Extension)
        </span>
        <div className="flex flex-wrap gap-1.5">
          {EXTENSION_LIST.map((ext) => {
            const isAllowed = compatibleExtensions.includes(ext.id);
            const isSelected = activeExtension === ext.id;

            return (
              <button
                key={String(ext.id)}
                type="button"
                disabled={!isAllowed}
                onClick={() => isAllowed && handleUpdate({ extension: ext.id })}
                className={`px-2.5 py-1 text-xs rounded-lg border transition cursor-pointer ${
                  isSelected
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs font-bold"
                    : !isAllowed
                    ? "bg-slate-100 text-slate-300 border-slate-100 cursor-not-allowed"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-emerald-50 hover:border-emerald-300"
                }`}
              >
                {ext.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 3: Bass Inversion */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          3. 베이스 전위 (Inversion / Slash Bass)
        </span>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_INVERSIONS.map((inv) => {
            // Check if activeBass matches
            const isSelected =
              inv.bass === null
                ? activeBass === null
                : activeBass === inv.bass ||
                  (inv.bass === "3rd" && (activeBass === "III" || activeBass === "bIII")) ||
                  (inv.bass === "5th" && activeBass === "V") ||
                  (inv.bass === "7th" && (activeBass === "VII" || activeBass === "bVII"));

            return (
              <button
                key={inv.label}
                type="button"
                onClick={() => {
                  let targetBass: string | null = null;
                  if (inv.bass === "3rd") {
                    targetBass = activeQuality === "minor" ? "bIII" : "III";
                  } else if (inv.bass === "5th") {
                    targetBass = "V";
                  } else if (inv.bass === "7th") {
                    targetBass = activeQuality === "dominant" ? "bVII" : "VII";
                  }
                  handleUpdate({ bass_degree: targetBass });
                }}
                className={`px-2.5 py-1 text-xs rounded-lg border transition cursor-pointer ${
                  isSelected
                    ? "bg-amber-600 text-white border-amber-600 shadow-2xs font-bold"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-amber-50 hover:border-amber-300"
                }`}
              >
                {inv.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 4: Harmonic Quick Presets */}
      <div className="space-y-1.5 pt-1 border-t border-slate-200/60">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          4. 화성학 퀵 프리셋 (클릭 즉시 적용 & 분석)
        </span>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_PRESETS.map((preset) => {
            const isMatching =
              activeDegree === preset.degree &&
              activeQuality === preset.quality &&
              activeExtension === preset.extension &&
              activeBass === preset.bass_degree;

            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => {
                  onChangeChord({
                    degree: preset.degree,
                    quality: preset.quality,
                    extension: preset.extension,
                    bass_degree: preset.bass_degree,
                  });
                }}
                className={`px-2 py-1 text-xs rounded-lg border transition cursor-pointer flex items-center gap-1 ${
                  isMatching
                    ? "ring-2 ring-indigo-500 bg-indigo-50 text-indigo-900 border-indigo-300 font-bold"
                    : `${preset.badgeColor} hover:brightness-95`
                }`}
              >
                <span className="text-[10px] opacity-75 font-semibold">[{preset.tag}]</span>
                <span>{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
