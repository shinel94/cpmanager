"use client";

import React from "react";
import type { BarDraft } from "@/app/types/client";
import type { Tonic } from "@/app/lib/shared/catalog/chord-catalog";
import { realizeChord } from "@/app/lib/shared/domain/chord-realizer";
import { playAuditionChord } from "@/app/lib/client/audio/audition";

export type BarCardProps = {
  bar: BarDraft;
  sectionId: string;
  tonic: Tonic;
  isSelected: boolean;
  selectedBeat: number | null;
  viewMode: "compact" | "subdivided";
  cumulativeBarNumber?: number;
  isPlaying?: boolean;
  playingBeat?: number | null;
  onSelectBar: (barPosition: number) => void;
  onSelectBeat: (barPosition: number, beat: number) => void;
  onOpenEdit?: (barPosition: number, beat: number) => void;
  onClearBar: (barPosition: number) => void;
  onClearBeat?: (barPosition: number, beat: number) => void;
  onAuditionChord?: (chord: any) => void;
};

export function BarCard({
  bar,
  tonic,
  isSelected,
  selectedBeat,
  viewMode,
  cumulativeBarNumber,
  isPlaying = false,
  playingBeat = null,
  onSelectBar,
  onSelectBeat,
  onOpenEdit,
  onClearBar,
  onClearBeat,
  onAuditionChord,
}: BarCardProps) {
  const hasChords = bar.chords.length > 0;
  const isMultiChord = bar.chords.length > 1;
  const showSubdivision = viewMode === "subdivided" || isMultiChord;

  const mainChord = hasChords ? bar.chords[0] : null;
  const mainDisplayName = mainChord ? realizeChord(tonic, mainChord) : "";

  const handleAudition = (chordToPlay: any) => {
    if (!chordToPlay) return;
    if (onAuditionChord) {
      onAuditionChord(chordToPlay);
    } else {
      playAuditionChord(chordToPlay, tonic);
    }
  };

  return (
    <div
      onClick={() => onSelectBar(bar.position)}
      onDoubleClick={() => onOpenEdit?.(bar.position, selectedBeat || 1)}
      className={`min-h-[118px] rounded-xl border-2 p-2.5 flex flex-col justify-between cursor-pointer transition select-none group relative ${
        isPlaying
          ? "ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/40 shadow-lg"
          : isSelected
            ? "ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50/50 shadow-md"
            : hasChords
              ? isMultiChord
                ? "border-purple-300 bg-white hover:border-purple-400 shadow-xs"
                : "border-indigo-200 bg-white hover:border-indigo-300 shadow-xs"
              : "border-dashed border-slate-300 bg-slate-50/50 hover:border-indigo-300 hover:bg-white"
      }`}
    >
      {/* Top Header of Bar */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={`font-mono font-bold shrink-0 ${
              isPlaying
                ? "text-emerald-700"
                : isSelected
                  ? "text-indigo-700"
                  : "text-slate-500"
            }`}
          >
            #{bar.position}
          </span>
          {isPlaying && (
            <span className="flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs animate-pulse whitespace-nowrap shrink-0">
              <span>▶</span>
              <span>{playingBeat ? `${playingBeat}박` : "재생"}</span>
            </span>
          )}
          {!isSelected && !isPlaying && cumulativeBarNumber !== undefined && (
            <span
              className="font-mono text-[10px] text-slate-400 font-medium whitespace-nowrap"
              title={`전체 마디 #${cumulativeBarNumber}`}
            >
              (총 #{cumulativeBarNumber})
            </span>
          )}
          {isSelected && (
            <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded whitespace-nowrap shrink-0">
              {selectedBeat ? `${selectedBeat}박 선택` : "선택됨"}
            </span>
          )}
          {isSelected && onOpenEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenEdit(bar.position, selectedBeat || 1);
              }}
              className="text-[10px] font-bold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 px-1.5 py-0.5 rounded transition cursor-pointer flex items-center gap-0.5 whitespace-nowrap shrink-0"
              title="코드 상세 속성 편집 (텐션/슬래시)"
            >
              <span>✏️</span>
              <span>속성</span>
            </button>
          )}
          {isMultiChord && (
            <span
              className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.2 rounded border border-purple-200 whitespace-nowrap shrink-0"
              title="1마디에 여러 코드가 포함되어 추천에서 제외됩니다"
            >
              복수 {bar.chords.length}코드
            </span>
          )}
        </div>

        {/* Bar Actions: Audition & Clear */}
        <div className="flex items-center gap-1">
          {/* hasChords && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleAudition(mainChord);
              }}
              className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 p-1 rounded transition text-xs font-bold"
              title="마디 코드 즉시 듣기 (Audition)"
            >
              🔊
            </button>
          ) */}
          {hasChords ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClearBar(bar.position);
              }}
              className="text-slate-300 hover:text-rose-600 hover:bg-rose-50 p-1 rounded transition text-xs font-bold"
              title="마디 코드 전체 삭제"
            >
              ✕
            </button>
          ) : (
            <span className="opacity-0 group-hover:opacity-100 text-[11px] text-indigo-500 font-medium transition">
              선택
            </span>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {showSubdivision ? (
        /* 4-Beat Subdivision Grid */
        <div className="grid grid-cols-4 gap-1 my-1">
          {[1, 2, 3, 4].map((beatNum) => {
            const beatChord = bar.chords.find((c) => c.beat === beatNum);
            const isBeatSelected = isSelected && selectedBeat === beatNum;
            const isBeatPlaying = isPlaying && playingBeat === beatNum;
            const displayName = beatChord ? realizeChord(tonic, beatChord) : "";

            return (
              <div
                key={beatNum}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectBeat(bar.position, beatNum);
                }}
                className={`py-1.5 px-1 rounded-lg border text-center transition flex flex-col justify-between min-h-[50px] relative ${
                  isBeatPlaying
                    ? "ring-2 ring-emerald-500 border-emerald-500 bg-emerald-100 font-bold scale-[1.02] shadow-xs z-1"
                    : isBeatSelected
                      ? "border-indigo-500 bg-indigo-100/80 shadow-2xs"
                      : beatChord
                        ? "border-slate-200 bg-slate-50 hover:bg-indigo-50/50"
                        : "border-slate-200/60 bg-white/60 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between px-0.5">
                  <span
                    className={`text-[9px] font-mono block ${
                      isBeatPlaying
                        ? "text-emerald-800 font-bold"
                        : isBeatSelected
                          ? "text-indigo-700 font-semibold"
                          : "text-slate-400"
                    }`}
                  >
                    {beatNum}박
                  </span>
                  {beatChord && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAudition(beatChord);
                      }}
                      className="text-[9px] text-slate-400 hover:text-indigo-600 transition"
                      title={`${beatNum}박 코드 청음`}
                    >
                      🔊
                    </button>
                  )}
                </div>

                {beatChord ? (
                  <div className="my-auto">
                    <span
                      className={`text-xs font-bold block truncate ${
                        isBeatPlaying ? "text-emerald-950" : "text-slate-800"
                      }`}
                    >
                      {displayName}
                    </span>
                    <span
                      className={`text-[10px] font-serif block truncate ${
                        isBeatPlaying ? "text-emerald-700" : "text-slate-400"
                      }`}
                    >
                      {beatChord.degree}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-300 my-auto block">-</span>
                )}

                {/* Beat actions when beat is selected */}
                {isBeatSelected && (
                  <div className="flex items-center justify-center gap-1 mt-0.5">
                    {onOpenEdit && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenEdit(bar.position, beatNum);
                        }}
                        className="text-[9px] font-semibold text-indigo-600 hover:underline"
                        title="박자 코드 편집"
                      >
                        편집
                      </button>
                    )}
                    {beatChord && onClearBeat && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onClearBeat(bar.position, beatNum);
                        }}
                        className="text-[9px] text-rose-500 hover:underline"
                        title="박자 코드 삭제"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : hasChords && mainChord ? (
        /* 1-Bar 1-Chord Prominent View */
        <div className="text-center my-auto py-1">
          <div
            className={`text-2xl font-black tracking-tight ${
              isPlaying ? "text-emerald-950" : "text-slate-800"
            }`}
          >
            {mainDisplayName}
          </div>
          <div className="text-xs text-slate-400 font-serif mt-0.5 flex items-center justify-center gap-1 flex-wrap">
            <span>{mainChord.degree}</span>
            {mainChord.quality !== "major" && (
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1 rounded">
                {mainChord.quality}
              </span>
            )}
            {mainChord.extension && (
              <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1 rounded font-bold">
                {mainChord.extension}
              </span>
            )}
            {mainChord.bass_degree && (
              <span className="text-[10px] bg-amber-50 text-amber-700 px-1 rounded font-bold border border-amber-200">
                /{mainChord.bass_degree}
              </span>
            )}
          </div>
        </div>
      ) : (
        /* Empty Bar State */
        <div className="text-center my-auto py-2 text-xs text-slate-400 font-medium">
          {isSelected ? (
            <span className="text-indigo-600 font-semibold">
              상단 코드를 선택하세요
            </span>
          ) : (
            <span>빈 마디</span>
          )}
        </div>
      )}

      {/* Footer Meter & Status */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono border-t border-slate-100/80 pt-1">
        <div className="flex items-center gap-1.5">
          <span>4/4</span>
          {/* isPlaying && (
            <div
              className="flex items-center gap-1 ml-1"
              title={`현재 ${playingBeat || 1}번째 박자 연주 중`}
            >
              {[1, 2, 3, 4].map((b) => (
                <span
                  key={b}
                  className={`w-2 h-2 rounded-full transition-all duration-75 ${
                    playingBeat === b
                      ? "bg-emerald-500 scale-125 ring-2 ring-emerald-300"
                      : "bg-slate-300"
                  }`}
                />
              ))}
            </div>
          ) */ }
        </div>
        <span>
          {hasChords ? `${bar.chords.length}개 코드` : "미입력"}
        </span>
      </div>
    </div>
  );
}
