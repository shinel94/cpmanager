"use client";

import React, { useState } from "react";
import { useProjectDraft } from "@/app/lib/client/project-draft-context";
import { useToast } from "@/app/components/common/Toast";
import { ConfirmDialog } from "@/app/components/common/ConfirmDialog";
import type { SectionDraft } from "@/app/types/client";

export type SectionListProps = {
  activeSectionId: string | null;
  viewMode?: "single" | "all";
  onToggleViewMode?: (mode: "single" | "all") => void;
  onSelectSection: (id: string) => void;
  onOpenAddModal: () => void;
};

export function SectionList({
  activeSectionId,
  viewMode = "single",
  onToggleViewMode,
  onSelectSection,
  onOpenAddModal,
}: SectionListProps) {
  const { project, updateSectionBars, removeSection, reorderSections } =
    useProjectDraft();
  const toast = useToast();

  const [sectionToDelete, setSectionToDelete] = useState<SectionDraft | null>(
    null,
  );
  const [pendingTrim, setPendingTrim] = useState<{
    section: SectionDraft;
    newCount: number;
    trimmedBarNumber: number;
  } | null>(null);

  // Drag and Drop state for section reordering
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDecrementBars = (sec: SectionDraft) => {
    if (sec.bar_count <= 1) return;
    const newCount = sec.bar_count - 1;

    // Check if the last bar to be trimmed contains chords
    const lastBar = sec.bars.find((b) => b.position === sec.bar_count);
    if (lastBar && lastBar.chords.length > 0) {
      setPendingTrim({
        section: sec,
        newCount,
        trimmedBarNumber: sec.bar_count,
      });
    } else {
      updateSectionBars(sec.id, newCount);
      toast.info(`'${sec.name}' 구간이 ${newCount}마디로 변경되었습니다.`);
    }
  };

  const handleIncrementBars = (sec: SectionDraft) => {
    if (sec.bar_count >= 64) {
      toast.warning("최대 64마디까지만 확장할 수 있습니다.");
      return;
    }
    const newCount = sec.bar_count + 1;
    updateSectionBars(sec.id, newCount);
  };

  return (
    <div className="space-y-3">
      {/* View Mode Toggle: Single Section vs Full Song Form */}
      <div className="flex rounded-lg bg-slate-100 p-0.5 border border-slate-200 text-xs">
        <button
          type="button"
          onClick={() => onToggleViewMode?.("single")}
          className={`flex-1 py-1.5 px-2 rounded-md font-semibold text-center transition cursor-pointer flex items-center justify-center gap-1.5 ${
            viewMode === "single"
              ? "bg-white text-indigo-700 shadow-2xs font-bold"
              : "text-slate-600 hover:text-slate-900"
          }`}
          data-testid="toggle-view-single"
        >
          <span>🔍</span>
          <span>구간별 보기</span>
        </button>
        <button
          type="button"
          onClick={() => onToggleViewMode?.("all")}
          className={`flex-1 py-1.5 px-2 rounded-md font-semibold text-center transition cursor-pointer flex items-center justify-center gap-1.5 ${
            viewMode === "all"
              ? "bg-white text-indigo-700 shadow-2xs font-bold ring-1 ring-indigo-300"
              : "text-slate-600 hover:text-slate-900"
          }`}
          data-testid="toggle-view-all"
        >
          <span>📄</span>
          <span>전체 송폼 보기</span>
        </button>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          송폼 구간 ({project.sections.length})
        </span>
        <button
          type="button"
          onClick={onOpenAddModal}
          className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>+</span>
          <span>구간 추가</span>
        </button>
      </div>

      {project.sections.length === 0 ? (
        <div className="p-4 text-center border-2 border-dashed border-slate-200 rounded-xl text-xs text-slate-400 space-y-2">
          <p>등록된 송폼 구간이 없습니다.</p>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition"
          >
            + 첫 구간 추가하기
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {project.sections.map((sec, idx) => {
            const isActive = sec.id === activeSectionId;
            const isFirst = idx === 0;
            const isLast = idx === project.sections.length - 1;
            const isDragging = draggedIndex === idx;
            const isDragOver = dragOverIndex === idx && draggedIndex !== idx;

            return (
              <div
                key={sec.id}
                draggable
                onDragStart={(e) => {
                  setDraggedIndex(idx);
                  e.dataTransfer.setData("text/plain", idx.toString());
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  if (dragOverIndex !== idx) {
                    setDragOverIndex(idx);
                  }
                }}
                onDragLeave={(e) => {
                  if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                  if (dragOverIndex === idx) {
                    setDragOverIndex(null);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (draggedIndex !== null && draggedIndex !== idx) {
                    reorderSections(draggedIndex, idx);
                    toast.info(`'${sec.name}' 구간 순서가 변경되었습니다.`);
                  }
                  setDraggedIndex(null);
                  setDragOverIndex(null);
                }}
                onDragEnd={() => {
                  setDraggedIndex(null);
                  setDragOverIndex(null);
                }}
                onClick={() => onSelectSection(sec.id)}
                className={`p-2.5 rounded-xl border transition cursor-pointer group select-none ${
                  isDragging
                    ? "opacity-40 scale-[0.98] border-dashed border-indigo-400 bg-indigo-50/40 shadow-inner"
                    : isDragOver
                    ? "border-t-2 border-t-indigo-600 ring-2 ring-indigo-400/50 bg-indigo-50/60 shadow-md"
                    : isActive
                    ? "border-indigo-500 bg-indigo-50/70 shadow-xs"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {/* Header: Name, Active Badge & Reorder/Delete */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="text-slate-400 hover:text-indigo-600 cursor-grab active:cursor-grabbing p-0.5 select-none text-xs font-mono"
                      title="드래그하여 순서 변경"
                    >
                      ⋮⋮
                    </span>
                    <span
                      className={`text-xs font-bold truncate ${
                        isActive ? "text-indigo-950" : "text-slate-800"
                      }`}
                    >
                      {sec.name}
                    </span>
                    {isActive && (
                      <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.2 rounded font-bold">
                        선택됨
                      </span>
                    )}
                  </div>

                  {/* Actions: Move Up, Move Down, Delete */}
                  <div
                    className="flex items-center gap-0.5"
                    onClick={(e) => e.stopPropagation()}
                    onDragStart={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      disabled={isFirst}
                      onClick={() => reorderSections(idx, idx - 1)}
                      className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-20 disabled:hover:text-slate-400 transition rounded"
                      title="위로 이동"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      disabled={isLast}
                      onClick={() => reorderSections(idx, idx + 1)}
                      className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-20 disabled:hover:text-slate-400 transition rounded"
                      title="아래로 이동"
                    >
                      ▼
                    </button>
                    <button
                      type="button"
                      onClick={() => setSectionToDelete(sec)}
                      className="p-1 text-slate-300 hover:text-rose-600 transition rounded ml-1"
                      title="구간 삭제"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Footer: Bar Count Stepper */}
                <div
                  className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs text-slate-500"
                  onClick={(e) => e.stopPropagation()}
                  onDragStart={(e) => e.stopPropagation()}
                >
                  <span className="text-[11px] font-medium text-slate-400">
                    마디 수
                  </span>

                  <div className="flex items-center gap-1.5 bg-slate-100/80 rounded-lg p-0.5 border border-slate-200">
                    <button
                      type="button"
                      disabled={sec.bar_count <= 1}
                      onClick={() => handleDecrementBars(sec)}
                      className="w-5 h-5 flex items-center justify-center rounded text-slate-600 hover:bg-white hover:text-indigo-600 disabled:opacity-30 disabled:hover:bg-transparent transition text-xs font-bold cursor-pointer"
                      title="1마디 줄이기"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-slate-800">
                      {sec.bar_count}
                    </span>
                    <button
                      type="button"
                      disabled={sec.bar_count >= 64}
                      onClick={() => handleIncrementBars(sec)}
                      className="w-5 h-5 flex items-center justify-center rounded text-slate-600 hover:bg-white hover:text-indigo-600 disabled:opacity-30 disabled:hover:bg-transparent transition text-xs font-bold cursor-pointer"
                      title="1마디 늘리기"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Warning Dialog when trimming bars with chords */}
      <ConfirmDialog
        isOpen={pendingTrim !== null}
        onClose={() => setPendingTrim(null)}
        onConfirm={() => {
          if (pendingTrim) {
            updateSectionBars(pendingTrim.section.id, pendingTrim.newCount);
            toast.info(
              `'${pendingTrim.section.name}' 구간이 ${pendingTrim.newCount}마디로 축소되었습니다.`,
            );
            setPendingTrim(null);
          }
        }}
        title="초과 마디 코드 삭제 경고"
        message={`'${pendingTrim?.section.name}' 구간의 마디 수를 ${pendingTrim?.newCount}마디로 줄이면, ${pendingTrim?.trimmedBarNumber}번 마디에 입력된 코드가 영구적으로 삭제됩니다. 계속하시겠습니까?`}
        confirmText="마디 줄이기 (코드 삭제)"
        variant="danger"
      />

      {/* Delete Section Confirm Dialog */}
      <ConfirmDialog
        isOpen={sectionToDelete !== null}
        onClose={() => setSectionToDelete(null)}
        onConfirm={() => {
          if (sectionToDelete) {
            removeSection(sectionToDelete.id);
            toast.info(`'${sectionToDelete.name}' 구간이 삭제되었습니다.`);
            setSectionToDelete(null);
          }
        }}
        title="송폼 구간 삭제 확인"
        message={`'${sectionToDelete?.name}' 구간을 삭제하시겠습니까? 해당 구간에 포함된 ${sectionToDelete?.bar_count}개 마디와 모든 코드가 함께 삭제됩니다.`}
        confirmText="구간 삭제"
        variant="danger"
      />
    </div>
  );
}
