"use client";

import React, { useState } from "react";
import type { SectionDraft } from "@/app/types/client";
import type { Tonic } from "@/app/lib/shared/catalog/chord-catalog";
import { realizeChord } from "@/app/lib/shared/domain/chord-realizer";
import { BarCard } from "./BarCard";
import { ConfirmDialog } from "@/app/components/common/ConfirmDialog";

import type { PlayheadPosition } from "@/app/lib/client/audio/audio-scheduler";

export type FullSongFormViewProps = {
  sections: SectionDraft[];
  tonic: Tonic;
  activeSectionId: string | null;
  selectedBarPosition: number | null;
  selectedBeat: number | null;
  selectedStartBar: number;
  activePlayhead?: PlayheadPosition | null;
  onSelectBar: (sectionId: string, barPosition: number) => void;
  onSelectBeat: (sectionId: string, barPosition: number, beat: number) => void;
  onSelectBlock: (sectionId: string, startBar: number, endBar: number) => void;
  onOpenEdit?: (sectionId: string, barPosition: number, beat: number) => void;
  onClearBar: (sectionId: string, barPosition: number) => void;
  onClearBeat: (sectionId: string, barPosition: number, beat: number) => void;
  onClearSection: (sectionId: string) => void;
  onFocusSingleSection: (sectionId: string) => void;
  onAuditionChord?: (chord: any) => void;
};

export function FullSongFormView({
  sections,
  tonic,
  activeSectionId,
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
  onFocusSingleSection,
  onAuditionChord,
}: FullSongFormViewProps) {
  const [viewMode, setViewMode] = useState<"compact" | "subdivided">("compact");
  const [sectionToClear, setSectionToClear] = useState<SectionDraft | null>(null);
  const [collapsedSectionIds, setCollapsedSectionIds] = useState<Set<string>>(new Set());

  // Toggle minimize/collapse for a specific section
  const toggleCollapse = (secId: string) => {
    setCollapsedSectionIds((prev) => {
      const next = new Set(prev);
      if (next.has(secId)) {
        next.delete(secId);
      } else {
        next.add(secId);
      }
      return next;
    });
  };

  const handleCollapseAll = () => {
    setCollapsedSectionIds(new Set(sections.map((s) => s.id)));
  };

  const handleExpandAll = () => {
    setCollapsedSectionIds(new Set());
  };

  // Compute cumulative bar numbers and total count
  let cumulativeOffset = 0;
  const sectionsWithMetrics = sections.map((sec) => {
    const startTotalBar = cumulativeOffset + 1;
    const endTotalBar = cumulativeOffset + sec.bar_count;
    const offsetForSection = cumulativeOffset;
    cumulativeOffset += sec.bar_count;
    return {
      ...sec,
      startTotalBar,
      endTotalBar,
      cumulativeOffset: offsetForSection,
    };
  });

  const totalBars = cumulativeOffset;

  const scrollToSection = (secId: string) => {
    const el = document.getElementById(`full-section-card-${secId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Overview Control Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xl">📄</span>
              <h2 className="text-lg font-bold text-slate-900">
                전체 송폼 보기 및 일괄 편집
              </h2>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                총 {sections.length}개 구간 · {totalBars}마디
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              곡 전체의 코드 진행 흐름을 한눈에 조망하고, 각 구간의 마디를 클릭하여 즉시 편집할 수 있습니다.
            </p>
          </div>

          {/* Controls: Collapse/Expand All & View Mode Toggle */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {/* Collapse / Expand All Buttons */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={handleCollapseAll}
                className="px-2.5 py-1.5 rounded-md font-medium text-slate-600 hover:text-slate-900 hover:bg-white transition cursor-pointer"
                title="모든 구간 카드를 최소화합니다"
                data-testid="collapse-all-btn"
              >
                모두 접기
              </button>
              <button
                type="button"
                onClick={handleExpandAll}
                className="px-2.5 py-1.5 rounded-md font-medium text-slate-600 hover:text-slate-900 hover:bg-white transition cursor-pointer"
                title="모든 구간 카드를 펼칩니다"
                data-testid="expand-all-btn"
              >
                모두 펼치기
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setViewMode("compact")}
                className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
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
                className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                  viewMode === "subdivided"
                    ? "bg-white text-indigo-700 font-bold shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                4박 분할 뷰
              </button>
            </div>
          </div>
        </div>

        {/* Quick Section Jump Badges */}
        {sections.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-xs font-bold text-slate-400 mr-1">
              구간 바로가기:
            </span>
            {sectionsWithMetrics.map((sec) => {
              const isSectionSelected = sec.id === activeSectionId;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => {
                    scrollToSection(sec.id);
                    onSelectBar(sec.id, 1);
                  }}
                  className={`px-2.5 py-1 text-xs rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
                    isSectionSelected
                      ? "bg-indigo-600 border-indigo-600 text-white font-bold shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span>{sec.name}</span>
                  <span
                    className={`font-mono text-[10px] ${
                      isSectionSelected ? "text-indigo-200" : "text-slate-400"
                    }`}
                  >
                    #{sec.startTotalBar}~#{sec.endTotalBar}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Sections Cards List */}
      <div className="space-y-6">
        {sectionsWithMetrics.map((sec, secIdx) => {
          const isCurrentActive = sec.id === activeSectionId;
          const isCollapsed = collapsedSectionIds.has(sec.id);

          // Realize chords preview for collapsed summary
          const allChordsInSec = sec.bars.flatMap((b) =>
            b.chords.map((c) => ({
              barPos: b.position,
              chordName: realizeChord(tonic, c),
            })),
          );

          // Group bars into 4-bar blocks
          const blocksCount = Math.ceil(sec.bars.length / 4);
          const blocks = Array.from({ length: blocksCount }, (_, blockIdx) => {
            const startIdx = blockIdx * 4;
            const blockBars = sec.bars.slice(startIdx, startIdx + 4);
            const startBarNumber = startIdx + 1;
            const endBarNumber = startIdx + blockBars.length;

            const isFullFourBars = blockBars.length === 4;
            const hasMultiChordBar = blockBars.some((b) => b.chords.length > 1);
            const isAllFilled =
              isFullFourBars && blockBars.every((b) => b.chords.length > 0);

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
            <div
              key={sec.id}
              id={`full-section-card-${sec.id}`}
              className={`bg-white p-5 rounded-2xl border transition shadow-xs ${
                isCollapsed ? "space-y-0" : "space-y-4"
              } ${
                isCurrentActive
                  ? "border-indigo-300 ring-1 ring-indigo-300/60"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              {/* Section Header */}
              <div
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                  isCollapsed ? "pb-0" : "pb-3 border-b border-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* Expand/Collapse Toggle Chevron Button */}
                  <button
                    type="button"
                    onClick={() => toggleCollapse(sec.id)}
                    className="w-6 h-6 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition cursor-pointer text-xs font-bold border border-slate-200"
                    title={isCollapsed ? "구간 펼치기" : "구간 최소화"}
                    data-testid={`toggle-collapse-${sec.id}`}
                  >
                    {isCollapsed ? "▶" : "▼"}
                  </button>

                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                    {secIdx + 1}
                  </span>
                  <h3
                    onClick={() => toggleCollapse(sec.id)}
                    className="text-base font-bold text-slate-900 cursor-pointer hover:text-indigo-600 transition"
                  >
                    {sec.name}
                  </h3>
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                    {sec.bar_count}마디
                  </span>
                  <span className="font-mono text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 font-medium">
                    전체 마디 #{sec.startTotalBar} ~ #{sec.endTotalBar}
                  </span>

                  {/* If collapsed, show chord progression preview */}
                  {isCollapsed && (
                    <div className="flex items-center gap-1.5 ml-1">
                      {allChordsInSec.length > 0 ? (
                        <div className="flex items-center gap-1 text-xs font-mono bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-md text-slate-700 max-w-sm truncate shadow-2xs">
                          <span className="text-slate-400 font-sans text-[11px]">진행:</span>
                          <span className="font-semibold">
                            {allChordsInSec
                              .slice(0, 6)
                              .map((c) => c.chordName)
                              .join(" - ")}
                            {allChordsInSec.length > 6
                              ? ` (+${allChordsInSec.length - 6})`
                              : ""}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic font-sans bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                          (비어있는 구간)
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Section Level Action Buttons */}
                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => toggleCollapse(sec.id)}
                    className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-lg transition cursor-pointer flex items-center gap-1"
                    title={isCollapsed ? "구간 펼치기" : "구간 최소화"}
                  >
                    <span>{isCollapsed ? "▼ 펼치기" : "▲ 최소화"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onFocusSingleSection(sec.id)}
                    className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition cursor-pointer flex items-center gap-1 shadow-2xs"
                    title="이 구간만 단독으로 편집 화면을 봅니다"
                  >
                    <span>🔍</span>
                    <span>이 구간만 보기</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSectionToClear(sec)}
                    className="px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition cursor-pointer"
                    title="이 구간의 모든 코드를 초기화합니다"
                  >
                    구간 비우기
                  </button>
                </div>
              </div>

              {/* 4-Bar Blocks (hidden when collapsed) */}
              {!isCollapsed && (
                <div className="space-y-4 pt-1">
                {blocks.map((block) => {
                  const isBlockSelected =
                    isCurrentActive && selectedStartBar === block.startBarNumber;

                  return (
                    <div
                      key={block.blockIdx}
                      onClick={() =>
                        onSelectBlock(sec.id, block.startBarNumber, block.endBarNumber)
                      }
                      className={`p-3.5 rounded-xl border transition cursor-pointer ${
                        isBlockSelected
                          ? "bg-indigo-50/50 border-indigo-400 ring-2 ring-indigo-400/40 shadow-xs"
                          : "bg-slate-50/70 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {/* Block Subheader */}
                      <div className="flex items-center justify-between text-xs mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold ${
                              isBlockSelected
                                ? "text-indigo-900"
                                : "text-slate-700"
                            }`}
                          >
                            블록 {block.blockIdx + 1}
                          </span>
                          <span className="text-slate-400 font-mono">
                            구간 #{block.startBarNumber} ~ #{block.endBarNumber} 마디
                          </span>
                          <span className="text-slate-400 font-mono text-[11px]">
                            (전체 #{sec.cumulativeOffset + block.startBarNumber} ~ #
                            {sec.cumulativeOffset + block.endBarNumber})
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

                      {/* Bars Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {block.bars.map((bar) => {
                          const isBarSelected =
                            isCurrentActive && selectedBarPosition === bar.position;
                          const isBarPlaying =
                            activePlayhead !== null &&
                            activePlayhead !== undefined &&
                            activePlayhead.sectionId === sec.id &&
                            activePlayhead.barPosition === bar.position;
                          const barPlayingBeat = isBarPlaying ? activePlayhead.beat : null;

                          return (
                            <BarCard
                              key={bar.position}
                              bar={bar}
                              sectionId={sec.id}
                              tonic={tonic}
                              cumulativeBarNumber={sec.cumulativeOffset + bar.position}
                              isSelected={isBarSelected}
                              selectedBeat={isBarSelected ? selectedBeat : null}
                              viewMode={viewMode}
                              isPlaying={isBarPlaying}
                              playingBeat={barPlayingBeat}
                              onSelectBar={(barPos) => {
                                onSelectBar(sec.id, barPos);
                                onSelectBlock(
                                  sec.id,
                                  block.startBarNumber,
                                  block.endBarNumber,
                                );
                              }}
                              onSelectBeat={(barPos, beat) => {
                                onSelectBeat(sec.id, barPos, beat);
                                onSelectBlock(
                                  sec.id,
                                  block.startBarNumber,
                                  block.endBarNumber,
                                );
                              }}
                              onOpenEdit={(barPos, beat) => {
                                onOpenEdit?.(sec.id, barPos, beat);
                              }}
                              onClearBar={(barPos) => {
                                onClearBar(sec.id, barPos);
                              }}
                              onClearBeat={(barPos, beat) => {
                                onClearBeat(sec.id, barPos, beat);
                              }}
                              onAuditionChord={onAuditionChord}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            </div>
          );
        })}
      </div>

      {/* Confirm Clear Modal for Section */}
      <ConfirmDialog
        isOpen={Boolean(sectionToClear)}
        title="구간 코드 전체 삭제"
        message={`'${sectionToClear?.name}' 구간의 모든 코드를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmText="모두 삭제"
        cancelText="취소"
        variant="danger"
        onConfirm={() => {
          if (sectionToClear) {
            onClearSection(sectionToClear.id);
            setSectionToClear(null);
          }
        }}
        onClose={() => setSectionToClear(null)}
      />
    </div>
  );
}
