"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Modal } from "@/app/components/common/Modal";
import { ConfirmDialog } from "@/app/components/common/ConfirmDialog";
import { useToast } from "@/app/components/common/Toast";
import { apiClient } from "@/app/lib/client/api";
import {
  SECTION_NAMES,
  QUALITIES,
  COMPATIBLE_EXTENSIONS,
  type Tonic,
  type Quality,
  type Extension,
} from "@/app/lib/shared/catalog/chord-catalog";
import { realizeChord } from "@/app/lib/shared/domain/chord-realizer";
import type { SectionDraft, UserProgressionItem, UserProgressionStep } from "@/app/types/client";

const COMMON_DEGREES = [
  "I",
  "bII",
  "II",
  "bIII",
  "III",
  "IV",
  "#IV",
  "V",
  "bVI",
  "VI",
  "bVII",
  "VII",
] as const;

export type UserProgressionsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  tonic: Tonic;
  activeSection?: SectionDraft | null;
  targetBlock?: { startBar: number; endBar: number } | null;
  onApplyProgression?: (steps: UserProgressionStep[]) => void;
};

type FormStep = {
  degree: string;
  quality: Quality;
  extension: Extension;
  bass_degree: string | null;
};

const DEFAULT_STEPS: FormStep[] = [
  { degree: "I", quality: "major", extension: null, bass_degree: null },
  { degree: "V", quality: "major", extension: null, bass_degree: null },
  { degree: "VI", quality: "minor", extension: null, bass_degree: null },
  { degree: "IV", quality: "major", extension: null, bass_degree: null },
];

export function UserProgressionsModal({
  isOpen,
  onClose,
  tonic,
  activeSection,
  targetBlock,
  onApplyProgression,
}: UserProgressionsModalProps) {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<"list" | "create">("list");
  const [progressions, setProgressions] = useState<UserProgressionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [nameQuery, setNameQuery] = useState("");

  // 4-token Wildcard Pattern Search State
  const [tokens, setTokens] = useState<[string, string, string, string]>(["", "", "", ""]);
  const [isPatternSearchActive, setIsPatternSearchActive] = useState(false);

  // Delete confirmation
  const [itemToDelete, setItemToDelete] = useState<UserProgressionItem | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formTags, setFormTags] = useState<string[]>([]);
  const [formSteps, setFormSteps] = useState<FormStep[]>(DEFAULT_STEPS);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load progressions from server
  const loadProgressions = useCallback(async (query = "") => {
    setIsLoading(true);
    try {
      const endpoint = query.trim()
        ? `/api/user-progressions?q=${encodeURIComponent(query.trim())}`
        : `/api/user-progressions`;
      const res = await apiClient.get<{ items: UserProgressionItem[] }>(endpoint);
      setProgressions(res.items || []);
      setIsPatternSearchActive(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "사용자 진행을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isOpen) {
      loadProgressions(nameQuery);
    }
  }, [isOpen, loadProgressions, nameQuery]);

  // Check if wildcard search is all wildcards (x-x-x-x or all empty)
  const isAllWildcards = tokens.every((t) => {
    const trimmed = t.trim().toLowerCase();
    return !trimmed || trimmed === "x";
  });

  const handlePatternSearch = async () => {
    if (isAllWildcards) {
      toast.warning("최소 1개 이상의 도수를 지정해야 합니다. (4개 모두 x일 수 없음)");
      return;
    }

    const normalizedTokens = tokens.map((t) => {
      const trimmed = t.trim();
      return trimmed === "" ? "x" : trimmed;
    });

    setIsLoading(true);
    try {
      const res = await apiClient.post<{ items: UserProgressionItem[] }>(
        "/api/user-progressions/search",
        { tokens: normalizedTokens }
      );
      setProgressions(res.items || []);
      setIsPatternSearchActive(true);
      toast.info(`패턴 '${normalizedTokens.join(" - ")}' 검색 결과: ${res.items?.length || 0}건`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "패턴 검색에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPatternSearch = () => {
    setTokens(["", "", "", ""]);
    setIsPatternSearchActive(false);
    loadProgressions(nameQuery);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await apiClient.delete(`/api/user-progressions/${itemToDelete.id}`);
      toast.success(`'${itemToDelete.name}' 진행이 삭제되었습니다.`);
      setItemToDelete(null);
      if (isPatternSearchActive) {
        handlePatternSearch();
      } else {
        loadProgressions(nameQuery);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "진행 삭제에 실패했습니다.");
    }
  };

  // Quick pull current 4-bar chords from active section
  const handleCopyCurrentBlock = () => {
    if (!activeSection || !targetBlock) {
      toast.info("가져올 수 있는 활성 구간 또는 4마디 블록이 없습니다.");
      return;
    }

    const startBar = targetBlock.startBar;
    const blockBars = activeSection.bars.filter(
      (b) => b.position >= startBar && b.position < startBar + 4
    );

    if (blockBars.length < 4) {
      toast.warning("현재 선택된 블록이 4마디 미만입니다.");
      return;
    }

    const newSteps: FormStep[] = blockBars.map((bar, idx) => {
      const firstChord = bar.chords[0];
      if (firstChord) {
        return {
          degree: firstChord.degree,
          quality: firstChord.quality,
          extension: firstChord.extension,
          bass_degree: firstChord.bass_degree,
        };
      }
      return DEFAULT_STEPS[idx];
    });

    setFormSteps(newSteps);
    if (!formTags.includes(activeSection.name) && SECTION_NAMES.includes(activeSection.name as any)) {
      setFormTags((prev) => [...prev, activeSection.name]);
    }
    toast.success(`${activeSection.name} #${startBar}~#${startBar + 3}마디 코드를 복사했습니다.`);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = formName.trim();
    if (!trimmedName) {
      toast.warning("진행 이름을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: trimmedName,
        description: formDescription.trim() || undefined,
        formTags,
        steps: formSteps.map((s, idx) => ({
          position: idx + 1,
          degree: s.degree,
          quality: s.quality,
          extension: s.extension || null,
          bass_degree: s.bass_degree || null,
        })),
      };

      await apiClient.post("/api/user-progressions", payload);
      toast.success(`'${trimmedName}' 진행이 보관함에 등록되었습니다.`);

      // Reset form
      setFormName("");
      setFormDescription("");
      setFormTags([]);
      setFormSteps(DEFAULT_STEPS);
      setActiveTab("list");
      loadProgressions();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "진행 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFormTag = (tag: string) => {
    setFormTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const updateStepField = <K extends keyof FormStep>(
    index: number,
    field: K,
    value: FormStep[K]
  ) => {
    setFormSteps((prev) => {
      const next = [...prev];
      const updated = { ...next[index], [field]: value };
      if (field === "quality") {
        const quality = value as Quality;
        const compatible = COMPATIBLE_EXTENSIONS[quality] || [null];
        if (!compatible.includes(updated.extension)) {
          updated.extension = null;
        }
      }
      next[index] = updated;
      return next;
    });
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="사용자 진행 보관함 (나만의 코드 진행)"
        size="lg"
      >
        <div className="space-y-4">
          {/* Subtitle & Isolation Notice */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <p className="text-xs text-slate-500">
              시스템 기본 추천(160선)과 엄격히 격리되어 보관되는 나만의 4마디 진행 저장소입니다.
            </p>

            {/* Navigation Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("list")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                  activeTab === "list"
                    ? "bg-white text-indigo-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                보관함 목록 & 검색
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("create")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                  activeTab === "create"
                    ? "bg-white text-indigo-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                + 새 진행 등록
              </button>
            </div>
          </div>

          {activeTab === "list" ? (
            <div className="space-y-4">
              {/* Search Section: Name & 4-token Pattern */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                {/* Text Query */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={nameQuery}
                    onChange={(e) => setNameQuery(e.target.value)}
                    placeholder="진행 이름으로 검색..."
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  {nameQuery && (
                    <button
                      type="button"
                      onClick={() => setNameQuery("")}
                      className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-700 bg-white border border-slate-300 rounded-lg"
                    >
                      초기화
                    </button>
                  )}
                </div>

                {/* 4-token Wildcard Pattern Search Box */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      4자리 도수 패턴 검색 (와일드카드 `x` 지원)
                    </span>
                    {isPatternSearchActive && (
                      <button
                        type="button"
                        onClick={handleResetPatternSearch}
                        className="text-[11px] text-indigo-600 hover:underline font-semibold"
                      >
                        패턴 검색 해제
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="grid grid-cols-4 gap-1.5 flex-1">
                      {([0, 1, 2, 3] as const).map((idx) => (
                        <div key={idx} className="relative">
                          <input
                            type="text"
                            value={tokens[idx]}
                            onChange={(e) => {
                              const val = e.target.value;
                              setTokens((prev) => {
                                const next: [string, string, string, string] = [...prev];
                                next[idx] = val;
                                return next;
                              });
                            }}
                            placeholder="x"
                            className="w-full text-center uppercase font-mono font-bold text-xs py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                          <span className="absolute -top-1.5 left-2 px-1 text-[9px] bg-white text-slate-400 font-medium rounded border border-slate-200">
                            #{idx + 1}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      disabled={isAllWildcards || isLoading}
                      onClick={handlePatternSearch}
                      className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition shrink-0 cursor-pointer shadow-xs"
                      title={isAllWildcards ? "최소 1개 이상의 도수를 지정해야 합니다" : "패턴 검색"}
                    >
                      검색
                    </button>
                  </div>

                  {isAllWildcards && (
                    <p className="text-[11px] text-amber-600 mt-1.5 font-medium">
                      ⓘ `x`는 임의의 코드입니다. 검색하려면 최소 1개 칸에 도수를 입력하세요 (예: `x - II - I - x`).
                    </p>
                  )}
                </div>
              </div>

              {/* Progressions List */}
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {isLoading ? (
                  <div className="py-8 text-center text-xs text-slate-400 space-y-2">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p>사용자 진행을 불러오는 중...</p>
                  </div>
                ) : progressions.length === 0 ? (
                  <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-xl space-y-2 text-xs text-slate-400">
                    <p>
                      {isPatternSearchActive
                        ? "일치하는 사용자 진행이 없습니다."
                        : nameQuery
                        ? `'${nameQuery}' 검색 결과가 없습니다.`
                        : "등록된 사용자 진행이 없습니다."}
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab("create")}
                      className="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition cursor-pointer"
                    >
                      + 첫 진행 등록하기
                    </button>
                  </div>
                ) : (
                  progressions.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition shadow-2xs space-y-2"
                    >
                      {/* Header: Name, Tags, Date, Delete */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-bold text-xs text-slate-900 truncate">
                            {item.name}
                          </span>
                          {item.formTags && item.formTags.length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                              {item.formTags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-slate-400">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                          <button
                            type="button"
                            onClick={() => setItemToDelete(item)}
                            className="text-xs text-slate-300 hover:text-rose-600 transition p-1 cursor-pointer"
                            title="진행 삭제"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      {/* Description */}
                      {item.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      {/* 4 Chords Preview */}
                      <div className="grid grid-cols-4 gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-200/80 text-center">
                        {item.steps?.map((step) => {
                          const chordName = realizeChord(tonic, {
                            degree: step.degree,
                            quality: step.quality,
                            extension: step.extension || null,
                            bass_degree: step.bass_degree || null,
                          });

                          return (
                            <div key={step.position} className="space-y-0.5">
                              <span className="block text-[10px] font-mono text-slate-400">
                                {step.degree}
                                {step.quality === "minor" ? "m" : ""}
                                {step.extension || ""}
                                {step.bass_degree ? `/${step.bass_degree}` : ""}
                              </span>
                              <span className="block font-bold text-xs text-slate-800">
                                {chordName}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Action Button: Apply to Current 4-bar Block */}
                      {onApplyProgression && targetBlock && activeSection && (
                        <div className="pt-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              onApplyProgression(item.steps);
                              toast.success(
                                `'${item.name}' 진행이 ${activeSection.name} #${targetBlock.startBar}~#${targetBlock.endBar}마디에 적용되었습니다.`
                              );
                              onClose();
                            }}
                            className="px-3 py-1.5 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition cursor-pointer flex items-center gap-1"
                          >
                            <span>📥</span>
                            <span>
                              {activeSection.name} #{targetBlock.startBar}~#{targetBlock.endBar}마디에 적용
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* Tab 2: Create User Progression */
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  진행 이름 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="예: 캐논 변형 발라드 진행"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Form Tags Multi-select */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  추천 송폼 태그 (다중 선택)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {SECTION_NAMES.map((tag) => {
                    const isSelected = formTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleFormTag(tag)}
                        className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition cursor-pointer ${
                          isSelected
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4 Steps Editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    4마디 도수 설정 ({tonic} Major 기준 미리보기)
                  </label>
                  {activeSection && targetBlock && (
                    <button
                      type="button"
                      onClick={handleCopyCurrentBlock}
                      className="text-xs text-indigo-600 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>📋</span>
                      <span>현재 {activeSection.name} 4마디에서 복사</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {formSteps.map((step, idx) => {
                    const previewChordName = realizeChord(tonic, {
                      degree: step.degree,
                      quality: step.quality,
                      extension: step.extension,
                      bass_degree: step.bass_degree,
                    });

                    const compatibleExts = COMPATIBLE_EXTENSIONS[step.quality] || [null];

                    return (
                      <div
                        key={idx}
                        className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-left"
                      >
                        <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                          <span className="text-[10px] font-bold text-slate-500">
                            #{idx + 1} 마디
                          </span>
                          <span className="text-xs font-black text-indigo-700">
                            {previewChordName}
                          </span>
                        </div>

                        {/* Degree */}
                        <div>
                          <span className="block text-[10px] text-slate-400 mb-0.5">
                            도수 (Degree)
                          </span>
                          <select
                            value={step.degree}
                            onChange={(e) => updateStepField(idx, "degree", e.target.value)}
                            className="w-full text-xs font-mono font-bold bg-white border border-slate-300 rounded p-1"
                          >
                            {COMMON_DEGREES.map((deg) => (
                              <option key={deg} value={deg}>
                                {deg}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quality */}
                        <div>
                          <span className="block text-[10px] text-slate-400 mb-0.5">
                            화음 (Quality)
                          </span>
                          <select
                            value={step.quality}
                            onChange={(e) => updateStepField(idx, "quality", e.target.value as Quality)}
                            className="w-full text-xs bg-white border border-slate-300 rounded p-1"
                          >
                            {QUALITIES.map((q) => (
                              <option key={q} value={q}>
                                {q}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Extension */}
                        <div>
                          <span className="block text-[10px] text-slate-400 mb-0.5">
                            확장 (Extension)
                          </span>
                          <select
                            value={step.extension || ""}
                            onChange={(e) =>
                              updateStepField(
                                idx,
                                "extension",
                                (e.target.value === "" ? null : e.target.value) as Extension
                              )
                            }
                            className="w-full text-xs bg-white border border-slate-300 rounded p-1"
                          >
                            <option value="">(기본 3화음)</option>
                            {compatibleExts
                              .filter((ext): ext is NonNullable<Extension> => ext !== null)
                              .map((ext) => (
                                <option key={ext} value={ext}>
                                  {ext}
                                </option>
                              ))}
                          </select>
                        </div>

                        {/* Bass Degree (Slash Chord) */}
                        <div>
                          <span className="block text-[10px] text-slate-400 mb-0.5">
                            베이스 도수
                          </span>
                          <select
                            value={step.bass_degree || ""}
                            onChange={(e) =>
                              updateStepField(
                                idx,
                                "bass_degree",
                                e.target.value === "" ? null : e.target.value
                              )
                            }
                            className="w-full text-xs bg-white border border-slate-300 rounded p-1"
                          >
                            <option value="">(기본 루트)</option>
                            {COMMON_DEGREES.map((deg) => (
                              <option key={deg} value={deg}>
                                /{deg}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Description / Memo */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  설명 및 메모 (선택 사항)
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="진행의 느낌, 사용하기 좋은 상황 등 메모를 남겨두세요."
                  rows={2}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab("list")}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formName.trim()}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition cursor-pointer shadow-xs"
                >
                  {isSubmitting ? "등록 중..." : "보관함에 등록"}
                </button>
              </div>
            </form>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={itemToDelete !== null}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDelete}
        title="사용자 진행 삭제"
        message={`'${itemToDelete?.name}' 진행을 보관함에서 완전히 삭제하시겠습니까?`}
        confirmText="삭제"
        variant="danger"
      />
    </>
  );
}
