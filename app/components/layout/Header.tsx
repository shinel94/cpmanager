"use client";

import React, { useState, useEffect } from "react";

export type HeaderProps = {
  projectName: string;
  tonic: string;
  isDirty: boolean;
  isSaving?: boolean;
  onSave?: () => void;
  onNewProject?: () => void;
  onOpenProjectList?: () => void;
  onOpenUserProgressions?: () => void;
  onUpdateProjectName?: (name: string) => void;
};

export function Header({
  projectName,
  tonic,
  isDirty,
  isSaving = false,
  onSave,
  onNewProject,
  onOpenProjectList,
  onOpenUserProgressions,
  onUpdateProjectName,
}: HeaderProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(projectName);

  useEffect(() => {
    setEditedName(projectName);
  }, [projectName]);

  const handleFinishEdit = () => {
    setIsEditingName(false);
    const trimmed = editedName.trim();
    if (trimmed && trimmed !== projectName && onUpdateProjectName) {
      onUpdateProjectName(trimmed);
    } else {
      setEditedName(projectName);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleFinishEdit();
    } else if (e.key === "Escape") {
      setIsEditingName(false);
      setEditedName(projectName);
    }
  };

  return (
    <header className="h-14 border-b border-slate-200 bg-white px-4 flex items-center justify-between shrink-0 select-none">
      {/* Left: Brand & Project Name */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 pr-3 border-r border-slate-200">
          <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
            CP
          </span>
          <span className="font-semibold text-slate-800 text-sm tracking-tight hidden sm:inline">
            Chord Manager
          </span>
        </div>

        {/* Project Name Editor */}
        <div className="flex items-center gap-2">
          {isEditingName ? (
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={handleFinishEdit}
              onKeyDown={handleKeyDown}
              autoFocus
              className="px-2 py-1 text-sm font-semibold text-slate-900 border border-indigo-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-indigo-50/30 min-w-[140px] max-w-[260px]"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingName(true)}
              className="group flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-slate-100 transition text-left"
              title="클릭하여 곡 이름 수정"
            >
              <span className="text-sm font-semibold text-slate-900 truncate max-w-[220px]">
                {projectName || "제목 없는 곡"}
              </span>
              <span className="text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition">
                ✎
              </span>
            </button>
          )}

          {/* Key Indicator */}
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {tonic} Major
          </span>

          {/* Dirty Status Badge */}
          {isDirty ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-300">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              수정됨 (미저장)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              저장됨
            </span>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {onNewProject && (
          <button
            type="button"
            onClick={onNewProject}
            className="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="새 프로젝트 생성"
          >
            <span>+</span>
            <span>새 곡</span>
          </button>
        )}

        <button
          type="button"
          onClick={onOpenProjectList}
          className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition flex items-center gap-1.5"
        >
          <span>📁</span>
          <span>프로젝트 목록</span>
        </button>

        <button
          type="button"
          onClick={onOpenUserProgressions}
          className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition flex items-center gap-1.5"
        >
          <span>⭐</span>
          <span>사용자 진행</span>
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={!isDirty || isSaving}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 shadow-xs ${
            isDirty
              ? "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
              : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
          }`}
        >
          {isSaving ? (
            <>
              <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              <span>저장 중...</span>
            </>
          ) : (
            <>
              <span>💾</span>
              <span>전체 저장</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
