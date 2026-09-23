"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import type { BarDraft, SectionDraft } from "@/app/types/client";
import type { Tonic } from "@/app/lib/shared/catalog/chord-catalog";
import { apiClient } from "@/app/lib/client/api";
import { useToast } from "@/app/components/common/Toast";
import {
  playAuditionChord,
  playProgressionPreview,
  stopProgressionPreview,
} from "@/app/lib/client/audio/audition";

export type SortCriterion = "popularity" | "connectivity" | "diversity" | "random";

export type RecommendationStepItem = {
  position: number;
  degree: string;
  quality: any;
  extension: any;
  bass_degree: string | null;
  displayName: string;
};

export type RecommendationResultItem = {
  id: number;
  name: string;
  description: string | null;
  formTags: string[];
  diversityGroup: string | null;
  steps: RecommendationStepItem[];
};

export type RecommendationApiResponse = {
  emptyReason: "multi_chord_excluded" | "all_filled" | "no_match" | null;
  items: RecommendationResultItem[];
  page: number;
  hasMore: boolean;
};

export type RecommendationPanelProps = {
  section: SectionDraft | null;
  tonic: Tonic;
  startBar: number;
  endBar: number;
  onApplyRecommendation: (
    startBar: number,
    steps: Array<{
      degree: string;
      quality: any;
      extension?: any;
      bass_degree?: string | null;
    }>,
  ) => void;
};

const SORT_TABS: Array<{ id: SortCriterion; label: string; desc: string }> = [
  { id: "popularity", label: "대중성", desc: "히트곡 기반 추천" },
  { id: "connectivity", label: "코드 연결성", desc: "자연스러운 화성 연결" },
  { id: "diversity", label: "다양성", desc: "다양한 그룹 순환" },
  { id: "random", label: "무작위", desc: "랜덤 탐색" },
];

export function RecommendationPanel({
  section,
  tonic,
  startBar,
  endBar,
  onApplyRecommendation,
}: RecommendationPanelProps) {
  const toast = useToast();
  const [activeSort, setActiveSort] = useState<SortCriterion>("popularity");
  const [page, setPage] = useState(1);
  const [excludedDiversityGroups, setExcludedDiversityGroups] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendationResultItem[]>([]);
  const [emptyReason, setEmptyReason] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  // Unmount 시 진행 미리듣기 정지
  useEffect(() => {
    return () => {
      stopProgressionPreview();
    };
  }, []);

  // Compute block bars and checks
  const targetBars = section
    ? section.bars.filter((b) => b.position >= startBar && b.position <= endBar)
    : [];
  const isTargetBlockLessThanFour = targetBars.length < 4;
  const hasMultiChord = targetBars.some((b) => b.chords.length > 1);
  const isAllFilled = targetBars.length === 4 && targetBars.every((b) => b.chords.length > 0);
  // Target chords fingerprint to reactively detect any chord additions, modifications, or removals
  const targetChordsFingerprint = targetBars
    .map((b) =>
      b.chords
        .map(
          (c) =>
            `${c.beat}:${c.degree}${c.quality}${c.extension ?? ""}/${c.bass_degree ?? ""}`,
        )
        .join(";"),
    )
    .join("|");

  // Fetch recommendations from /api/recommendations
  const fetchRecommendations = useCallback(
    async (
      targetPage = 1,
      targetSort = activeSort,
      excludedGroups = excludedDiversityGroups,
    ) => {
      if (!section || isTargetBlockLessThanFour) {
        setRecommendations([]);
        setEmptyReason(isTargetBlockLessThanFour ? "too_short" : null);
        return;
      }

      if (hasMultiChord) {
        setRecommendations([]);
        setEmptyReason("multi_chord_excluded");
        return;
      }

      if (isAllFilled) {
        setRecommendations([]);
        setEmptyReason("all_filled");
        return;
      }

      setIsLoading(true);
      try {
        // Normalize 4 bars relative to block (1, 2, 3, 4)
        const normalizedBars = [1, 2, 3, 4].map((relativePos) => {
          const actualBar = section.bars.find(
            (b) => b.position === startBar + relativePos - 1,
          );
          return {
            position: relativePos,
            chords: actualBar?.chords.map((c) => ({
              degree: c.degree,
              quality: c.quality,
              extension: c.extension ?? undefined,
              bass_degree: c.bass_degree ?? null,
            })) ?? [],
          };
        });

        const res = await apiClient.post<RecommendationApiResponse>(
          "/api/recommendations",
          {
            tonic,
            sectionName: section.name,
            blockStart: startBar,
            bars: normalizedBars,
            sort: targetSort,
            page: targetPage,
            pageSize: 3,
            excludeDiversityGroups: excludedGroups,
          },
        );

        setRecommendations(res.items || []);
        setEmptyReason(res.emptyReason);
        setHasMore(res.hasMore || false);
        setPage(res.page || 1);
      } catch (err: any) {
        console.error("추천 API 호출 오류:", err);
        setRecommendations([]);
        setEmptyReason("no_match");
      } finally {
        setIsLoading(false);
      }
    },
    [
      section,
      tonic,
      startBar,
      isTargetBlockLessThanFour,
      hasMultiChord,
      isAllFilled,
      activeSort,
      excludedDiversityGroups,
    ],
  );

  // Stable ref for fetch recommendations to avoid re-triggering useEffect
  const fetchRecommendationsRef = useRef(fetchRecommendations);
  fetchRecommendationsRef.current = fetchRecommendations;

  // Trigger fetch when block selection, sort, tonic, or chords within the block change
  useEffect(() => {
    setPage(1);
    setExcludedDiversityGroups((prev) => (prev.length === 0 ? prev : []));
    const timer = setTimeout(() => {
      fetchRecommendationsRef.current(1, activeSort, []);
    }, 150);

    return () => clearTimeout(timer);
  }, [
    section?.id,
    startBar,
    tonic,
    activeSort,
    targetBars.length,
    targetChordsFingerprint,
  ]);

  // Handle Sort Change (triggers useEffect with preserved/new sort)
  const handleSortChange = (newSort: SortCriterion) => {
    if (newSort === activeSort) return;
    setActiveSort(newSort);
  };

  // Handle Next Page (accumulates diversity group)
  const handleNextPage = () => {
    if (!hasMore || isLoading) return;
    const currentGroups = recommendations
      .map((r) => r.diversityGroup)
      .filter((g): g is string => typeof g === "string" && g !== "");
    const nextExcluded = Array.from(new Set([...excludedDiversityGroups, ...currentGroups]));
    setExcludedDiversityGroups(nextExcluded);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchRecommendations(nextPage, activeSort, nextExcluded);
  };

  // Handle Previous Page
  const handlePrevPage = () => {
    if (page <= 1 || isLoading) return;
    const prevPage = page - 1;
    setPage(prevPage);
    // When going back, reset exclusion to default
    fetchRecommendations(prevPage, activeSort, []);
  };

  return (
    <div className="space-y-3">
      {/* Header & Target Block Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            4마디 추천 진행
          </span>
          {section && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              대상: #{startBar} ~ #{endBar}마디
            </span>
          )}
        </div>
        <span className="text-[11px] text-slate-400">160선 카탈로그</span>
      </div>

      {/* Sort Filter Tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs">
        {SORT_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleSortChange(tab.id)}
            className={`py-1 rounded-md text-[11px] font-semibold transition cursor-pointer text-center ${
              activeSort === tab.id
                ? "bg-white text-indigo-700 font-bold shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
            title={tab.desc}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        /* Loading Skeleton */
        <div className="space-y-2.5 py-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-3 rounded-xl border border-slate-200 bg-white space-y-2 animate-pulse"
            >
              <div className="h-3.5 bg-slate-200 rounded w-3/5" />
              <div className="h-3 bg-slate-100 rounded w-4/5" />
              <div className="h-7 bg-slate-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : isTargetBlockLessThanFour || emptyReason === "too_short" ? (
        /* Too Short Guard */
        <div className="p-5 rounded-xl border border-amber-200 bg-amber-50/50 text-center space-y-1.5">
          <div className="text-lg">⚠️</div>
          <div className="text-xs font-bold text-amber-900">
            4마디 미만 (추천 제외)
          </div>
          <p className="text-[11px] text-amber-700 leading-relaxed max-w-xs mx-auto">
            현재 선택된 블록(#{startBar}~#{endBar})은 4마디 미만이어서 시스템 4마디 진행 추천을 적용할 수 없습니다.
          </p>
        </div>
      ) : emptyReason === "multi_chord_excluded" ? (
        /* Multi-chord Excluded State */
        <div className="p-5 rounded-xl border border-purple-200 bg-purple-50/50 text-center space-y-1.5">
          <div className="text-lg">🎼</div>
          <div className="text-xs font-bold text-purple-900">
            복수 코드 포함 블록 (추천 제외)
          </div>
          <p className="text-[11px] text-purple-700 leading-relaxed max-w-xs mx-auto">
            선택된 4마디 블록 내에 한 마디 2개 이상의 코드가 포함되어 있습니다. 단일 코드 마디로 구성하거나 일부 마디를 비워주세요.
          </p>
        </div>
      ) : emptyReason === "all_filled" ? (
        /* All Filled State */
        <div className="p-5 rounded-xl border border-blue-200 bg-blue-50/50 text-center space-y-1.5">
          <div className="text-lg">✅</div>
          <div className="text-xs font-bold text-blue-900">
            4마디 입력 완료
          </div>
          <p className="text-[11px] text-blue-700 leading-relaxed max-w-xs mx-auto">
            선택된 블록의 모든 마디에 코드가 입력되었습니다. 새로운 추천 진행을 받으려면 일부 마디를 비워주세요.
          </p>
        </div>
      ) : recommendations.length === 0 || emptyReason === "no_match" ? (
        /* No Match State */
        <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 text-center space-y-1.5">
          <div className="text-lg">🔍</div>
          <div className="text-xs font-bold text-slate-700">
            일치하는 추천 진행 없음
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs mx-auto">
            현재 부분 입력된 코드 조건과 일치하는 진행이 없습니다. 상단 정렬 탭을 변경하거나 마디를 비워보세요.
          </p>
        </div>
      ) : (
        /* Recommendation Cards List (3 cards) */
        <div className="space-y-2.5">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-3 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 shadow-xs transition space-y-2"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-bold text-slate-900 truncate">
                  {rec.name}
                </span>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {rec.formTags && rec.formTags.length > 0 && (
                    <span className="text-[9px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.2 rounded">
                      {rec.formTags[0]}
                    </span>
                  )}
                  {rec.diversityGroup && (
                    <span className="text-[9px] font-medium text-slate-500 bg-slate-100 px-1 py-0.2 rounded">
                      {rec.diversityGroup}
                    </span>
                  )}
                </div>
              </div>

              {/* Degrees & Realized Names */}
              <div className="bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                <div className="text-xs font-bold text-indigo-700 tracking-wide flex items-center gap-1 flex-wrap">
                  {rec.steps.map((s, idx) => (
                    <React.Fragment key={idx}>
                      {idx > 0 && <span className="text-slate-300 font-normal">-</span>}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          playAuditionChord(s, tonic);
                        }}
                        className="hover:text-indigo-950 hover:underline cursor-pointer"
                        title={`${s.displayName} 단일 코드 청음`}
                      >
                        {s.degree}
                      </button>
                    </React.Fragment>
                  ))}
                </div>
                <div className="text-xs text-slate-700 font-semibold mt-0.5 flex items-center gap-1 flex-wrap">
                  {rec.steps.map((s, idx) => (
                    <React.Fragment key={idx}>
                      {idx > 0 && <span className="text-slate-300 font-normal">-</span>}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          playAuditionChord(s, tonic);
                        }}
                        className="hover:text-indigo-600 hover:underline cursor-pointer"
                        title={`${s.displayName} 단일 코드 청음`}
                      >
                        {s.displayName}
                      </button>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Description */}
              {rec.description && (
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {rec.description}
                </p>
              )}

              {/* Actions: Progression Audition & Apply Button */}
              <div className="flex items-center gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    playProgressionPreview(
                      rec.steps.map((s) => ({
                        degree: s.degree,
                        quality: s.quality,
                        extension: s.extension,
                        bass_degree: s.bass_degree,
                      })),
                      tonic,
                    );
                  }}
                  className="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition cursor-pointer flex items-center gap-1 shrink-0 shadow-2xs"
                  title="이 추천 진행 4마디 순차 청음 (미리듣기)"
                >
                  <span>🔊</span>
                  <span>청음</span>
                </button>
                <button
                  type="button"
                  disabled={isTargetBlockLessThanFour || !section}
                  onClick={() => {
                    if (!section) {
                      toast.warning("먼저 송폼 구간을 선택하세요.");
                      return;
                    }
                    if (isTargetBlockLessThanFour) {
                      toast.warning("선택된 블록이 4마디 미만이어서 적용할 수 없습니다.");
                      return;
                    }
                    onApplyRecommendation(
                      startBar,
                      rec.steps.map((s) => ({
                        degree: s.degree,
                        quality: s.quality,
                        extension: s.extension,
                        bass_degree: s.bass_degree,
                      })),
                    );
                    toast.success(
                      `'${section.name}' #${startBar}~#${endBar} 마디에 '${rec.name}' 진행이 적용되었습니다.`,
                    );
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                    isTargetBlockLessThanFour
                      ? "cursor-not-allowed bg-slate-100 text-slate-400 border border-slate-200"
                      : "cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs"
                  }`}
                >
                  {isTargetBlockLessThanFour
                    ? `4마디 미만 적용 불가`
                    : `이 진행 적용하기`}
                </button>
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <button
              type="button"
              disabled={page <= 1 || isLoading}
              onClick={handlePrevPage}
              className="px-2.5 py-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium cursor-pointer"
            >
              ◀ 이전
            </button>
            <span className="text-[11px] font-semibold text-slate-500">
              페이지 {page}
            </span>
            <button
              type="button"
              disabled={!hasMore || isLoading}
              onClick={handleNextPage}
              className="px-2.5 py-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium cursor-pointer"
            >
              다음 ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
