"use client";

import React from "react";
import type { BarDraft } from "@/app/types/client";
import type { Tonic } from "@/app/lib/shared/catalog/chord-catalog";
import { realizeChord } from "@/app/lib/shared/domain/chord-realizer";

export type BarCardProps = {
  bar: BarDraft;
  sectionId: string;
  tonic: Tonic;
  isSelected: boolean;
  selectedBeat: number | null;
  viewMode: "compact" | "subdivided";
  onSelectBar: (barPosition: number) => void;
  onSelectBeat: (barPosition: number, beat: number) => void;
  onClearBar: (barPosition: number) => void;
  onClearBeat?: (barPosition: number, beat: number) => void;
};

export function BarCard({
  bar,
  tonic,
  isSelected,
  selectedBeat,
  viewMode,
  onSelectBar,
  onSelectBeat,
  onClearBar,
  onClearBeat,
}: BarCardProps) {
  const hasChords = bar.chords.length > 0;
  const isMultiChord = bar.chords.length > 1;
  const showSubdivision = viewMode === "subdivided" || isMultiChord;

  const mainChord = hasChords ? bar.chords[0] : null;
  const mainDisplayName = mainChord ? realizeChord(tonic, mainChord) : "";

  return (
    <div
      onClick={() => onSelectBar(bar.position)}
      className={`min-h-[118px] rounded-xl border-2 p-2.5 flex flex-col justify-between cursor-pointer transition select-none group relative ${
        isSelected
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
        <div className="flex items-center gap-1.5">
          <span
            className={`font-mono font-bold ${
              isSelected ? "text-indigo-700" : "text-slate-500"
            }`}
          >
            #{bar.position}
          </span>
          {isSelected && (
            <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded">
              {selectedBeat ? `${selectedBeat}박 선택됨` : "선택됨"}
            </span>
          )}
          {isMultiChord && (
            <span
              className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.2 rounded border border-purple-200"
              title="1마디에 여러 코드가 포함되어 추천에서 제외됩니다"
            >
              복수 {bar.chords.length}코드
            </span>
          )}
        </div>

        {/* Clear Bar Button */}
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

      {/* Main Content Area */}
      {showSubdivision ? (
        /* 4-Beat Subdivision Grid */
        <div className="grid grid-cols-4 gap-1 my-1">
          {[1, 2, 3, 4].map((beatNum) => {
            const beatChord = bar.chords.find((c) => c.beat === beatNum);
            const isBeatSelected = isSelected && selectedBeat === beatNum;
            const displayName = beatChord ? realizeChord(tonic, beatChord) : "";

            return (
              <div
                key={beatNum}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectBeat(bar.position, beatNum);
                }}
                className={`py-1.5 px-1 rounded-lg border text-center transition flex flex-col justify-between min-h-[50px] ${
                  isBeatSelected
                    ? "border-indigo-500 bg-indigo-100/80 shadow-2xs"
                    : beatChord
                      ? "border-slate-200 bg-slate-50 hover:bg-indigo-50/50"
                      : "border-slate-200/60 bg-white/60 hover:bg-slate-50"
                }`}
              >
                <span className="text-[9px] font-mono text-slate-400 block">
                  {beatNum}박
                </span>

                {beatChord ? (
                  <div className="my-auto">
                    <span className="text-xs font-bold text-slate-800 block truncate">
                      {displayName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-serif block truncate">
                      {beatChord.degree}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-300 my-auto block">-</span>
                )}

                {/* Optional beat clear button when beat is selected and has chord */}
                {isBeatSelected && beatChord && onClearBeat ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClearBeat(bar.position, beatNum);
                    }}
                    className="text-[9px] text-rose-500 hover:underline block mt-0.5"
                  >
                    삭제
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : hasChords && mainChord ? (
        /* 1-Bar 1-Chord Prominent View */
        <div className="text-center my-auto py-1">
          <div className="text-2xl font-black text-slate-800 tracking-tight">
            {mainDisplayName}
          </div>
          <div className="text-xs text-slate-400 font-serif mt-0.5 flex items-center justify-center gap-1">
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
        <span>4/4</span>
        <span>
          {hasChords ? `${bar.chords.length}개 코드` : "미입력"}
        </span>
      </div>
    </div>
  );
}
