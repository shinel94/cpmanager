"use client";

import React, { useState } from "react";
import type { SectionDraft } from "@/app/types/client";
import type { Tonic } from "@/app/lib/shared/catalog/chord-catalog";
import { BarCard } from "./BarCard";
import { ConfirmDialog } from "@/app/components/common/ConfirmDialog";

import type { PlayheadPosition } from "@/app/lib/client/audio/audio-scheduler";

export type ChordChartGridProps = {
  section: SectionDraft;
  tonic: Tonic;
  selectedBarPosition: number | null;
  selectedBeat: number | null;
  selectedStartBar: number;
  activePlayhead?: PlayheadPosition | null;
  onSelectBar: (barPosition: number) => void;
  onSelectBeat: (barPosition: number, beat: number) => void;
  onSelectBlock: (startBar: number, endBar: number) => void;
  onOpenEdit?: (barPosition: number, beat: number) => void;
  onClearBar: (barPosition: number) => void;
  onClearBeat: (barPosition: number, beat: number) => void;
  onClearSection: () => void;
  onAuditionChord?: (chord: any) => void;
};

export function ChordChartGrid({
  section,
  tonic,
  selectedBarPosition,
  selectedBeat,
  selectedStartBar,
  activePlayhead,
  onSelectBar,
  onSelectBeat,
  onSelectBlock,
  onOpenEdit,
  onClearBar,
  onClearBeat,
  onClearSection,
  onAuditionChord,
}: ChordChartGridProps) {
  const [viewMode, setViewMode] = useState<"compact" | "subdivided">("compact");
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);

  // Group bars into 4-bar blocks
  const blocksCount = Math.ceil(section.bars.length / 4);
  const blocks = Array.from({ length: blocksCount }, (_, blockIdx) => {
    const startIdx = blockIdx * 4;
    const blockBars = section.bars.slice(startIdx, startIdx + 4);
    const startBarNumber = startIdx + 1;
    const endBarNumber = startIdx + blockBars.length;

    const isFullFourBars = blockBars.length === 4;
    const hasMultiChordBar = blockBars.some((b) => b.chords.length > 1);
    const isAllFilled = isFullFourBars && blockBars.every((b) => b.chords.length > 0);

    let statusText = "4마디 추천 대상";
    let statusStyle = "text-emerald-700 bg-emerald-50 border-emerald-200";

    if (!isFullFourBars) {
      statusText = "4마디 미만 (추천 제외)";
      statusStyle = "text-amber-700 bg-amber-50 border-amber-200";
    } else if (hasMultiChordBar) {
      statusText = "복수 코드 포함 (추천 제외)";
      statusStyle = "text-purple-700 bg-purple-50 border-purple-200";
    } else if (isAllFilled) {
      statusText = "4마디 입력 완료";
      statusStyle = "text-blue-700 bg-blue-50 border-blue-200";
    }

    return {
      blockIdx,
      startBarNumber,
      endBarNumber,
      bars: blockBars,
      statusText,
      statusStyle,
    };
  });

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5">
      {/* Section Header & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              {section.name}
            </h3>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              총 {section.bar_count}마디 (1 ~ {section.bar_count})
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            마디를 클릭하여 선택한 후, 상단 다이어토닉 7코드 또는 단축키(1~7)로 코드를 할당하세요.
          </p>
        </div>

        {/* View Mode & Clear Actions */}
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("compact")}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                viewMode === "compact"
                  ? "bg-white text-indigo-700 font-bold shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              1마디 1코드 뷰
            </button>
            <button
              type="button"
              onClick={() => setViewMode("subdivided")}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                viewMode === "subdivided"
                  ? "bg-white text-indigo-700 font-bold shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              4박 분할 뷰
            </button>
          </div>

          {/* Clear Section Button */}
          <button
            type="button"
            onClick={() => setIsConfirmClearOpen(true)}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition cursor-pointer"
            title="현재 구간의 모든 코드를 삭제합니다"
          >
            구간 비우기
          </button>
        </div>
      </div>

      {/* 4-Bar Blocks Container */}
      <div className="space-y-4">
        {blocks.map((block) => {
          const isBlockSelected = selectedStartBar === block.startBarNumber;

          return (
            <div
              key={block.blockIdx}
              onClick={() =>
                onSelectBlock(block.startBarNumber, block.endBarNumber)
              }
              className={`p-3.5 rounded-xl border transition cursor-pointer ${
                isBlockSelected
                  ? "bg-indigo-50/50 border-indigo-400 ring-2 ring-indigo-400/40 shadow-xs"
                  : "bg-slate-50/70 border-slate-200 hover:border-slate-300"
              }`}
            >
              {/* Block Sub-header */}
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-bold ${
                      isBlockSelected ? "text-indigo-900" : "text-slate-700"
                    }`}
                  >
                    블록 {block.blockIdx + 1}
                  </span>
                  <span className="text-slate-400 font-mono">
                    #{block.startBarNumber} ~ #{block.endBarNumber} 마디
                  </span>
                  {isBlockSelected && (
                    <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded">
                      추천 대상 블록
                    </span>
                  )}
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${block.statusStyle}`}
                >
                  {block.statusText}
                </span>
              </div>

              {/* Bars Grid (4 per row on desktop) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {block.bars.map((bar) => {
                  const isBarPlaying =
                    activePlayhead !== null &&
                    activePlayhead !== undefined &&
                    activePlayhead.sectionId === section.id &&
                    activePlayhead.barPosition === bar.position;
                  const barPlayingBeat = isBarPlaying ? activePlayhead.beat : null;

                  return (
                    <BarCard
                      key={bar.position}
                      bar={bar}
                      sectionId={section.id}
                      tonic={tonic}
                      isSelected={selectedBarPosition === bar.position}
                      selectedBeat={
                        selectedBarPosition === bar.position ? selectedBeat : null
                      }
                      viewMode={viewMode}
                      isPlaying={isBarPlaying}
                      playingBeat={barPlayingBeat}
                      onSelectBar={(barPos) => {
                        onSelectBar(barPos);
                        onSelectBlock(block.startBarNumber, block.endBarNumber);
                      }}
                      onSelectBeat={(barPos, beat) => {
                        onSelectBeat(barPos, beat);
                        onSelectBlock(block.startBarNumber, block.endBarNumber);
                      }}
                      onOpenEdit={onOpenEdit}
                      onClearBar={onClearBar}
                      onClearBeat={onClearBeat}
                      onAuditionChord={onAuditionChord}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Clear Section Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmClearOpen}
        onClose={() => setIsConfirmClearOpen(false)}
        onConfirm={() => {
          onClearSection();
          setIsConfirmClearOpen(false);
        }}
        title="구간 코드 전체 비우기"
        message={`'${section.name}' 구간에 입력된 모든 마디의 코드를 삭제하시겠습니까?`}
        confirmText="전체 비우기"
        variant="danger"
      />
    </div>
  );
}
