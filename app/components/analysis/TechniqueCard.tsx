"use client";

import React, { useState } from "react";
import type { TechniqueFeedback } from "@/app/types/client";

export type TechniqueCardProps = {
  lastTechnique: TechniqueFeedback | null;
  onClear?: () => void;
};

export function TechniqueCard({ lastTechnique, onClear }: TechniqueCardProps) {
  const [showAlternatives, setShowAlternatives] = useState(false);

  if (lastTechnique) {
    const hasEvidence =
      Array.isArray(lastTechnique.evidence) && lastTechnique.evidence.length > 0;
    const hasAlternatives =
      Array.isArray(lastTechnique.alternatives) &&
      lastTechnique.alternatives.length > 0;
    const confidencePct =
      lastTechnique.confidence !== undefined
        ? Math.round(lastTechnique.confidence * 100)
        : null;

    const pattern = lastTechnique.progressionPattern;

    const getPatternIcon = (type?: string) => {
      switch (type) {
        case "cadence":
          return "🔔";
        case "progression":
          return "🔄";
        case "bassline":
          return "📉";
        default:
          return "🎵";
      }
    };

    return (
      <div className="p-4 rounded-xl border border-purple-300 bg-gradient-to-br from-purple-50 via-white to-indigo-50/40 shadow-xs transition animate-fade-in relative space-y-3">
        {/* Card Header */}
        <div className="flex items-start justify-between gap-2 border-b border-purple-100 pb-2.5">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded bg-purple-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-2xs">
                실시간 화성 분석
              </span>

              {/* Confidence Badge */}
              {confidencePct !== null && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                    confidencePct >= 80
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-purple-50 text-purple-700 border-purple-200"
                  }`}
                  title="화성 규칙 일치 신뢰도"
                >
                  {confidencePct}% 일치
                </span>
              )}

              {/* Target Bar/Beat Badge */}
              {lastTechnique.targetBarPosition && (
                <span className="font-mono text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                  #{lastTechnique.targetBarPosition}
                  {lastTechnique.targetBeat ? ` (${lastTechnique.targetBeat}박)` : ""}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 pt-0.5">
              <h4 className="text-sm font-bold text-purple-950">
                {lastTechnique.name}
              </h4>

              {/* Meta Tags: Target Degree / Source Mode / Inversion */}
              {lastTechnique.targetDegree && (
                <span className="px-1.5 py-0.2 bg-purple-100 text-purple-800 font-mono text-[11px] font-bold rounded border border-purple-200">
                  목표: {lastTechnique.targetDegree}
                </span>
              )}
              {lastTechnique.sourceMode && (
                <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-800 text-[11px] font-semibold rounded border border-indigo-200">
                  {lastTechnique.sourceMode} 차용
                </span>
              )}
              {lastTechnique.inversion && (
                <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 text-[11px] font-semibold rounded border border-blue-200">
                  {lastTechnique.inversion}
                </span>
              )}
            </div>
          </div>

          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="text-purple-400 hover:text-purple-700 text-xs px-1.5 py-0.5 rounded hover:bg-purple-100 transition cursor-pointer"
              title="분석 결과 닫기"
            >
              ✕
            </button>
          )}
        </div>

        {/* Technique Description */}
        <p className="text-xs text-purple-900/90 leading-relaxed">
          {lastTechnique.description}
        </p>

        {/* Evidence Bullet Points */}
        {hasEvidence && (
          <div className="bg-purple-50/70 border border-purple-200/80 rounded-lg p-2.5 space-y-1">
            <span className="text-[11px] font-bold text-purple-800 block">
              💡 화성학적 성립 근거
            </span>
            <ul className="text-xs text-purple-900 space-y-1 pl-3.5 list-disc marker:text-purple-500">
              {lastTechnique.evidence!.map((ev, idx) => (
                <li key={idx} className="leading-normal">
                  {ev}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 4-Bar Progression & Cadence Pattern Sub-section */}
        {pattern && (
          <div className="bg-white border border-indigo-200 rounded-lg p-2.5 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{getPatternIcon(pattern.type)}</span>
                <span className="font-bold text-indigo-950">{pattern.name}</span>
                {Array.isArray(pattern.bars) && pattern.bars.length > 0 && (
                  <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100 font-mono font-medium">
                    블록 #{pattern.bars.join(", #")} 마디
                  </span>
                )}
              </div>
              <span className="text-[10px] uppercase font-bold text-indigo-500">
                {pattern.type}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-normal pl-5">
              {pattern.description}
            </p>
          </div>
        )}

        {/* Alternatives Accordion */}
        {hasAlternatives && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAlternatives((prev) => !prev)}
              className="text-[11px] font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer transition select-none"
            >
              <span>{showAlternatives ? "▾" : "▸"}</span>
              <span>다른 가능한 화성 해석 ({lastTechnique.alternatives!.length})</span>
            </button>

            {showAlternatives && (
              <div className="mt-2 space-y-1.5 pl-2 border-l-2 border-purple-200 animate-fade-in">
                {lastTechnique.alternatives!.map((alt) => (
                  <div
                    key={alt.id}
                    className="p-2 rounded bg-purple-50/50 border border-purple-100 text-xs space-y-0.5"
                  >
                    <div className="flex items-center justify-between font-bold text-purple-900 text-[11px]">
                      <span>{alt.name}</span>
                      <span className="text-purple-500 font-mono text-[10px]">
                        {Math.round(alt.confidence * 100)}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-tight">
                      {alt.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Neutral Default State
  return (
    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 shadow-2xs">
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5">
        <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-extrabold uppercase tracking-wider">
          실시간 화성 분석
        </span>
        <span className="text-slate-500 font-normal">기본 다이어토닉 화성</span>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">
        세컨더리 도미넌트, 모달 인터체인지, 전위 화음, 4마디 종지(Cadence) 등 화성적 기법이 감지되면 분석 리포트가 실시간 표시됩니다.
      </p>
    </div>
  );
}
