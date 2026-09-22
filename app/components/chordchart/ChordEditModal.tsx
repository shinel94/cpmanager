"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Modal } from "@/app/components/common/Modal";
import type { BarChordDraft } from "@/app/types/client";
import {
  type Extension,
  type Quality,
  type Tonic,
  COMPATIBLE_EXTENSIONS,
  MAJOR_DIATONIC_QUALITIES,
} from "@/app/lib/shared/catalog/chord-catalog";
import { realizeChord } from "@/app/lib/shared/domain/chord-realizer";

export type ChordEditModalProps = {
  isOpen: boolean;
  onClose: () => void;
  sectionName: string;
  barPosition: number;
  beat: number;
  tonic: Tonic;
  initialChord?: BarChordDraft | null;
  onSave: (chord: {
    degree: string;
    quality: Quality;
    extension: Extension;
    bass_degree: string | null;
  }) => void;
  onDelete?: () => void;
};

const DIATONIC_DEGREES = ["I", "II", "III", "IV", "V", "VI", "VII"] as const;
const CHROMATIC_DEGREES = ["bII", "bIII", "bV", "bVI", "bVII", "#IV"] as const;

const QUALITY_LABELS: Record<Quality, { label: string; desc: string }> = {
  major: { label: "Major", desc: "장화음 (3화음, maj7, 9, sus4)" },
  minor: { label: "Minor", desc: "단화음 (3화음, m7, m9)" },
  dominant: { label: "Dominant 7", desc: "도미넌트 (7, 9)" },
  diminished: { label: "Diminished", desc: "디미니쉬 (dim)" },
  "half-diminished": { label: "Half-Dim", desc: "하프 디미니쉬 (m7b5)" },
};

const EXTENSION_LABELS: Record<string, string> = {
  null: "3화음 (None)",
  maj7: "maj7",
  "7": "7",
  "9": "9",
  sus4: "sus4",
  m7b5: "m7b5",
};

type QuickPreset = {
  name: string;
  tag: string;
  degree: string;
  quality: Quality;
  extension: Extension;
  bass_degree: string | null;
};

const QUICK_PRESETS: QuickPreset[] = [
  // Modal Interchange
  { name: "iv", tag: "모달 인터체인지", degree: "IV", quality: "minor", extension: null, bass_degree: null },
  { name: "bVI", tag: "모달 인터체인지", degree: "bVI", quality: "major", extension: null, bass_degree: null },
  { name: "bVII", tag: "모달 인터체인지", degree: "bVII", quality: "major", extension: null, bass_degree: null },
  { name: "bIII", tag: "모달 인터체인지", degree: "bIII", quality: "major", extension: null, bass_degree: null },
  // Secondary Dominant
  { name: "V7/ii (VI7)", tag: "세컨더리 도미넌트", degree: "VI", quality: "dominant", extension: "7", bass_degree: null },
  { name: "V7/V (II7)", tag: "세컨더리 도미넌트", degree: "II", quality: "dominant", extension: "7", bass_degree: null },
  { name: "V7/vi (III7)", tag: "세컨더리 도미넌트", degree: "III", quality: "dominant", extension: "7", bass_degree: null },
  { name: "V7/IV (I7)", tag: "세컨더리 도미넌트", degree: "I", quality: "dominant", extension: "7", bass_degree: null },
  // Slash Inversions
  { name: "V/VII (G/B 등)", tag: "슬래시 코드", degree: "V", quality: "major", extension: null, bass_degree: "VII" },
  { name: "I/III (C/E 등)", tag: "슬래시 코드", degree: "I", quality: "major", extension: null, bass_degree: "III" },
  { name: "IV/I (F/C 등)", tag: "슬래시 코드", degree: "IV", quality: "major", extension: null, bass_degree: "I" },
  { name: "V/I (G/C 등)", tag: "슬래시 코드", degree: "V", quality: "major", extension: null, bass_degree: "I" },
  // Tension
  { name: "Imaj7", tag: "텐션", degree: "I", quality: "major", extension: "maj7", bass_degree: null },
  { name: "IVmaj7", tag: "텐션", degree: "IV", quality: "major", extension: "maj7", bass_degree: null },
  { name: "Vsus4", tag: "텐션", degree: "V", quality: "major", extension: "sus4", bass_degree: null },
  { name: "vim7", tag: "텐션", degree: "VI", quality: "minor", extension: "7", bass_degree: null },
];

export function ChordEditModal({
  isOpen,
  onClose,
  sectionName,
  barPosition,
  beat,
  tonic,
  initialChord,
  onSave,
  onDelete,
}: ChordEditModalProps) {
  const [degree, setDegree] = useState<string>("I");
  const [quality, setQuality] = useState<Quality>("major");
  const [extension, setExtension] = useState<Extension>(null);
  const [bassDegree, setBassDegree] = useState<string | null>(null);

  // Sync state when modal opens or initialChord changes
  useEffect(() => {
    if (isOpen) {
      if (initialChord) {
        setDegree(initialChord.degree);
        setQuality(initialChord.quality);
        setExtension(initialChord.extension ?? null);
        setBassDegree(initialChord.bass_degree ?? null);
      } else {
        // Default to I major
        setDegree("I");
        setQuality("major");
        setExtension(null);
        setBassDegree(null);
      }
    }
  }, [isOpen, initialChord]);

  // Ensure extension is compatible with the selected quality
  const handleQualityChange = (nextQuality: Quality) => {
    setQuality(nextQuality);
    const compatible = COMPATIBLE_EXTENSIONS[nextQuality];
    if (!compatible.includes(extension)) {
      if (nextQuality === "dominant") {
        setExtension("7");
      } else if (nextQuality === "half-diminished") {
        setExtension("m7b5");
      } else {
        setExtension(null);
      }
    }
  };

  // Change degree and optionally auto-suggest diatonic quality if major/minor
  const handleDegreeChange = (nextDegree: string) => {
    setDegree(nextDegree);
    // If it's standard diatonic, suggest its default diatonic quality if not explicitly dominant
    const defaultQuality = (MAJOR_DIATONIC_QUALITIES as Record<string, Quality>)[nextDegree];
    if (defaultQuality && quality !== "dominant") {
      handleQualityChange(defaultQuality);
    }
  };

  // Apply a quick preset
  const handleApplyPreset = (preset: QuickPreset) => {
    setDegree(preset.degree);
    setQuality(preset.quality);
    setExtension(preset.extension);
    setBassDegree(preset.bass_degree);
  };

  // Real-time realized chord display
  const previewChordName = useMemo(() => {
    try {
      return realizeChord(tonic, {
        degree,
        quality,
        extension,
        bass_degree: bassDegree,
      });
    } catch {
      return "---";
    }
  }, [tonic, degree, quality, extension, bassDegree]);

  const handleSave = () => {
    onSave({
      degree,
      quality,
      extension,
      bass_degree: bassDegree,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="코드 상세 속성 편집"
      size="lg"
      footer={
        <div className="w-full flex items-center justify-between">
          <div>
            {initialChord && onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete();
                  onClose();
                }}
                className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 rounded-lg transition border border-rose-200 cursor-pointer"
              >
                🗑️ 코드 삭제 (비우기)
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 rounded-lg transition border border-slate-200 cursor-pointer"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-xs cursor-pointer"
            >
              코드 적용하기
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Top Realtime Preview Card */}
        <div className="bg-gradient-to-r from-indigo-50/70 via-white to-purple-50/70 p-4 rounded-xl border border-indigo-100 shadow-2xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded">
                {sectionName} #{barPosition}마디 ({beat}박)
              </span>
              <span className="text-xs text-slate-400">조성: {tonic} Major</span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {previewChordName}
              </span>
              <span className="text-sm font-serif font-bold text-indigo-700">
                {degree}
                {quality !== "major" ? ` ${quality}` : ""}
                {extension ? ` ${extension}` : ""}
                {bassDegree ? `/${bassDegree}` : ""}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              실시간 코드 프리뷰
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {tonic} {degree} → {previewChordName}
            </span>
          </div>
        </div>

        {/* Quick Variations Preset Chips */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
            ⚡ 자주 쓰는 코드 변형 퀵 프리셋
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
            {QUICK_PRESETS.map((preset, idx) => {
              const isMatch =
                degree === preset.degree &&
                quality === preset.quality &&
                extension === preset.extension &&
                bassDegree === preset.bass_degree;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className={`px-2.5 py-1 text-xs rounded-md border font-semibold transition cursor-pointer flex items-center gap-1 ${
                    isMatch
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-2xs"
                      : "bg-slate-50 hover:bg-indigo-50 border-slate-200 text-slate-700 hover:text-indigo-700"
                  }`}
                >
                  <span>{preset.name}</span>
                  <span
                    className={`text-[9px] px-1 rounded ${
                      isMatch
                        ? "bg-indigo-700 text-white"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {preset.tag}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Degree Selection */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
            1. 도수 (Degree)
          </label>
          <div className="space-y-2">
            {/* Diatonic Degrees */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-slate-400 w-12">다이어토닉</span>
              <div className="grid grid-cols-7 gap-1 flex-1">
                {DIATONIC_DEGREES.map((deg) => (
                  <button
                    key={deg}
                    type="button"
                    onClick={() => handleDegreeChange(deg)}
                    className={`py-1.5 text-xs font-bold rounded-md border transition cursor-pointer ${
                      degree === deg
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-2xs"
                        : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    {deg}
                  </button>
                ))}
              </div>
            </div>
            {/* Chromatic Degrees */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-slate-400 w-12">임시표/차용</span>
              <div className="grid grid-cols-6 gap-1 flex-1">
                {CHROMATIC_DEGREES.map((deg) => (
                  <button
                    key={deg}
                    type="button"
                    onClick={() => handleDegreeChange(deg)}
                    className={`py-1.5 text-xs font-semibold rounded-md border transition cursor-pointer ${
                      degree === deg
                        ? "bg-purple-600 border-purple-600 text-white shadow-2xs"
                        : "bg-slate-50/80 border-slate-200 text-slate-700 hover:bg-purple-50"
                    }`}
                  >
                    {deg}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quality Selection */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
            2. 화음 유형 (Quality)
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {(Object.keys(QUALITY_LABELS) as Quality[]).map((q) => {
              const isSelected = quality === q;
              return (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleQualityChange(q)}
                  className={`p-2 rounded-lg border text-center transition cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-2xs"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="text-xs font-bold">{QUALITY_LABELS[q].label}</div>
                  <div
                    className={`text-[9px] mt-0.5 truncate ${
                      isSelected ? "text-indigo-100" : "text-slate-400"
                    }`}
                  >
                    {q}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Extension Selection (Filtered by Quality) */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
            3. 텐션 / 확장 (Extension)
          </label>
          <div className="flex flex-wrap gap-2">
            {COMPATIBLE_EXTENSIONS[quality].map((ext) => {
              const isSelected = extension === ext;
              const extKey = String(ext);
              return (
                <button
                  key={extKey}
                  type="button"
                  onClick={() => setExtension(ext)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-2xs"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {EXTENSION_LABELS[extKey] || extKey}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bass Degree (Slash Chord) */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
            4. 베이스 도수 (Slash Chord / 분수 코드)
          </label>
          <div className="grid grid-cols-8 gap-1">
            <button
              type="button"
              onClick={() => setBassDegree(null)}
              className={`py-1.5 text-xs font-semibold rounded-md border transition cursor-pointer ${
                bassDegree === null
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-2xs"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              루트 (기본)
            </button>
            {DIATONIC_DEGREES.map((deg) => (
              <button
                key={deg}
                type="button"
                onClick={() => setBassDegree(deg)}
                className={`py-1.5 text-xs font-bold rounded-md border transition cursor-pointer ${
                  bassDegree === deg
                    ? "bg-amber-600 border-amber-600 text-white shadow-2xs"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-amber-50"
                }`}
              >
                /{deg}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
