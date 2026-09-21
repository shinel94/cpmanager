"use client";

import React, { useState } from "react";

export type WorkspaceLayoutProps = {
  leftPanel: React.ReactNode;
  centerPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  leftTitle?: string;
  rightTitle?: string;
};

export function WorkspaceLayout({
  leftPanel,
  centerPanel,
  rightPanel,
  leftTitle = "송폼 & 조성",
  rightTitle = "추천 & 기법 분석",
}: WorkspaceLayoutProps) {
  const [showLeft, setShowLeft] = useState(true);
  const [showRight, setShowRight] = useState(true);

  return (
    <div className="flex-1 flex overflow-hidden bg-slate-100 relative">
      {/* Left Panel: Song Form & Key Navigation */}
      <aside
        className={`bg-white border-r border-slate-200 flex flex-col shrink-0 transition-all duration-200 ${
          showLeft ? "w-64 lg:w-72" : "w-0 overflow-hidden border-r-0"
        }`}
      >
        <div className="h-10 px-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            {leftTitle}
          </span>
          <button
            type="button"
            onClick={() => setShowLeft(false)}
            className="text-slate-400 hover:text-slate-600 text-xs px-1 py-0.5 rounded"
            title="패널 접기"
          >
            ◀
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">{leftPanel}</div>
      </aside>

      {/* Toggle Button for Left Panel when collapsed */}
      {!showLeft && (
        <button
          type="button"
          onClick={() => setShowLeft(true)}
          className="absolute top-3 left-3 z-20 bg-white border border-slate-300 shadow-md rounded-md p-1 text-xs text-slate-600 hover:bg-slate-50 transition"
          title="송폼 패널 열기"
        >
          ▶ {leftTitle}
        </button>
      )}

      {/* Center Main Panel: Code Chart Workspace */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0 bg-slate-50/50">
        <div className="flex-1 overflow-y-auto p-4 md:p-6">{centerPanel}</div>
      </main>

      {/* Toggle Button for Right Panel when collapsed */}
      {!showRight && (
        <button
          type="button"
          onClick={() => setShowRight(true)}
          className="absolute top-3 right-3 z-20 bg-white border border-slate-300 shadow-md rounded-md p-1 text-xs text-slate-600 hover:bg-slate-50 transition"
          title="추천/분석 패널 열기"
        >
          ◀ {rightTitle}
        </button>
      )}

      {/* Right Panel: 4-Bar Recommendation & Technique Analysis */}
      <aside
        className={`bg-white border-l border-slate-200 flex flex-col shrink-0 transition-all duration-200 ${
          showRight ? "w-80 lg:w-96" : "w-0 overflow-hidden border-l-0"
        }`}
      >
        <div className="h-10 px-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            {rightTitle}
          </span>
          <button
            type="button"
            onClick={() => setShowRight(false)}
            className="text-slate-400 hover:text-slate-600 text-xs px-1 py-0.5 rounded"
            title="패널 접기"
          >
            ▶
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3.5">{rightPanel}</div>
      </aside>
    </div>
  );
}
