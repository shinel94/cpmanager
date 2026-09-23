"use client";

import React, { useState } from "react";
import type { ProjectDraft } from "@/app/types/client";
import { downloadProjectMidi } from "@/app/lib/client/midi/midi-exporter";
import { useToast } from "@/app/components/common/Toast";

export type MidiExportButtonProps = {
  project: ProjectDraft;
  activeSectionId?: string | null;
  className?: string;
};

export function MidiExportButton({
  project,
  activeSectionId,
  className = "",
}: MidiExportButtonProps) {
  const toast = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const totalChords = project.sections.reduce(
    (acc, sec) => acc + sec.bars.reduce((bAcc, b) => bAcc + b.chords.length, 0),
    0
  );

  const activeSection = project.sections.find((s) => s.id === activeSectionId);

  const handleExportFullSong = () => {
    try {
      downloadProjectMidi(project);
      toast.success(
        `'${project.name || "프로젝트"}' 전체 MIDI 파일이 다운로드되었습니다.`
      );
    } catch (err: any) {
      toast.error(err.message || "MIDI 내보내기 중 오류가 발생했습니다.");
    } finally {
      setIsMenuOpen(false);
    }
  };

  const handleExportSection = () => {
    if (!activeSectionId || !activeSection) {
      toast.warning("선택된 송폼 구간이 없습니다.");
      return;
    }
    try {
      downloadProjectMidi(project, { targetSectionId: activeSectionId });
      toast.success(
        `'${activeSection.name}' 구간 MIDI 파일이 다운로드되었습니다.`
      );
    } catch (err: any) {
      toast.error(err.message || "MIDI 내보내기 중 오류가 발생했습니다.");
    } finally {
      setIsMenuOpen(false);
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div className="inline-flex rounded-lg shadow-xs">
        {/* Main Export Button */}
        <button
          type="button"
          onClick={handleExportFullSong}
          className="h-8 px-2.5 rounded-l-lg text-xs font-semibold flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer border border-emerald-500 shadow-xs"
          title="전체 코드 진행을 표준 MIDI 파일(.mid)로 내보냅니다"
        >
          <span>💾</span>
          <span className="hidden sm:inline">MIDI 내보내기</span>
        </button>

        {/* Dropdown Toggle Chevron */}
        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="h-8 px-1.5 rounded-r-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-emerald-100 transition cursor-pointer border-y border-r border-emerald-500 flex items-center justify-center"
          title="내보내기 옵션 (전체 곡 또는 선택 섹션)"
        >
          <span className="text-[9px]">▼</span>
        </button>
      </div>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="absolute right-0 mt-1.5 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50 p-1.5 text-xs animate-fadeIn text-slate-200">
            <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              MIDI 파일 (.mid) 내보내기
            </div>

            <button
              type="button"
              onClick={handleExportFullSong}
              className="w-full text-left px-2.5 py-2 hover:bg-slate-800 rounded-lg transition flex flex-col gap-0.5 cursor-pointer group"
            >
              <span className="font-semibold text-white group-hover:text-emerald-400 flex items-center gap-1.5">
                <span>🎵</span>
                <span>전체 곡 내보내기</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                총 {project.sections.length}개 구간 ({totalChords}개 코드)
              </span>
            </button>

            {activeSection && (
              <button
                type="button"
                onClick={handleExportSection}
                className="w-full text-left px-2.5 py-2 hover:bg-slate-800 rounded-lg transition flex flex-col gap-0.5 cursor-pointer group"
              >
                <span className="font-semibold text-white group-hover:text-emerald-400 flex items-center gap-1.5">
                  <span>📑</span>
                  <span>현재 섹션만 내보내기</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  [{activeSection.name}] {activeSection.bar_count}마디
                </span>
              </button>
            )}

            <div className="mt-1 pt-1.5 border-t border-slate-800/80 px-2 text-[10px] text-slate-500 leading-tight">
              Ableton, Logic, Cubase, FL Studio 등의 DAW로 드래그 앤 드롭하세요.
            </div>
          </div>
        </>
      )}
    </div>
  );
}
