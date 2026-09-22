"use client";

import React, { useState } from "react";
import { Modal } from "@/app/components/common/Modal";
import { useProjectDraft } from "@/app/lib/client/project-draft-context";
import { useToast } from "@/app/components/common/Toast";

export type AddSectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdded?: (sectionName: string) => void;
};

const PRESET_SECTION_NAMES = [
  "Intro",
  "Verse",
  "Pre-Chorus",
  "Chorus",
  "Interlude",
  "Bridge",
  "Outro",
  "Solo",
  "Post-Chorus",
];

export type BulkSectionItem = {
  id: string;
  name: string;
  barCount: number;
};

export function AddSectionModal({
  isOpen,
  onClose,
  onAdded,
}: AddSectionModalProps) {
  const { addSection, addSections } = useProjectDraft();
  const toast = useToast();

  const [mode, setMode] = useState<"single" | "bulk">("single");

  // Single mode state
  const [sectionName, setSectionName] = useState("Verse");
  const [barCount, setBarCount] = useState(8);
  const [errorMessage, setErrorMessage] = useState("");

  // Bulk mode state
  const [bulkSections, setBulkSections] = useState<BulkSectionItem[]>([
    { id: "b-1", name: "Verse", barCount: 8 },
    { id: "b-2", name: "Chorus", barCount: 8 },
  ]);

  const handleClose = () => {
    setMode("single");
    setSectionName("Verse");
    setBarCount(8);
    setBulkSections([
      { id: "b-1", name: "Verse", barCount: 8 },
      { id: "b-2", name: "Chorus", barCount: 8 },
    ]);
    setErrorMessage("");
    onClose();
  };

  // Smart suggestion for next section in bulk list
  const getNextSuggestedName = (currentList: BulkSectionItem[]) => {
    if (currentList.length === 0) return "Intro";
    const last = currentList[currentList.length - 1].name;
    if (last === "Intro") return "Verse";
    if (last === "Verse") return "Pre-Chorus";
    if (last === "Pre-Chorus") return "Chorus";
    if (last === "Chorus") return "Bridge";
    if (last === "Bridge") return "Chorus";
    if (last === "Solo") return "Chorus";
    return "Outro";
  };

  const handleAddBulkRow = () => {
    const nextName = getNextSuggestedName(bulkSections);
    const defaultBars = nextName === "Bridge" || nextName === "Pre-Chorus" ? 4 : 8;
    setBulkSections((prev) => [
      ...prev,
      { id: `b-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, name: nextName, barCount: defaultBars },
    ]);
  };

  const handleRemoveBulkRow = (id: string) => {
    if (bulkSections.length <= 1) {
      toast.warning("최소 1개 이상의 구간이 필요합니다.");
      return;
    }
    setBulkSections((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateBulkRow = (id: string, updates: Partial<BulkSectionItem>) => {
    setBulkSections((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    );
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (mode === "single") {
      const trimmed = sectionName.trim();
      if (!trimmed) {
        setErrorMessage("구간 이름을 입력해 주세요.");
        return;
      }
      const clampedBars = Math.max(1, Math.min(64, barCount));

      addSection(trimmed, clampedBars);
      toast.success(`'${trimmed}' 구간(${clampedBars}마디)이 추가되었습니다.`);
      onAdded?.(trimmed);
      handleClose();
    } else {
      // Bulk mode submit
      if (bulkSections.length === 0) {
        setErrorMessage("최소 1개 이상의 구간을 추가해 주세요.");
        return;
      }

      const invalidRow = bulkSections.find((s) => !s.name.trim());
      if (invalidRow) {
        setErrorMessage("모든 구간의 이름을 입력해 주세요.");
        return;
      }

      const sectionsToAdd = bulkSections.map((s) => ({
        name: s.name.trim(),
        barCount: Math.max(1, Math.min(64, s.barCount)),
      }));

      addSections(sectionsToAdd);
      const totalBars = sectionsToAdd.reduce((acc, cur) => acc + cur.barCount, 0);
      toast.success(
        `${sectionsToAdd.length}개 구간(총 ${totalBars}마디)이 일괄 추가되었습니다.`,
      );
      onAdded?.(sectionsToAdd[0].name);
      handleClose();
    }
  };

  const bulkTotalBars = bulkSections.reduce(
    (acc, cur) => acc + (Number(cur.barCount) || 1),
    0,
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="새 송폼 구간 추가"
      size={mode === "bulk" ? "md" : "sm"}
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-slate-500">
            {mode === "bulk" && (
              <span>
                총 <strong className="text-indigo-600 font-bold">{bulkSections.length}개</strong> 구간 / 합계 <strong className="text-indigo-600 font-bold">{bulkTotalBars}마디</strong>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            >
              취소
            </button>
            <button
              type="button"
              onClick={() => handleSubmit()}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              {mode === "single" ? (
                "구간 추가하기"
              ) : (
                <>
                  <span>🚀</span>
                  <span>{bulkSections.length}개 구간 일괄 추가하기</span>
                </>
              )}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Mode Toggle Tabs */}
        <div className="flex items-center p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => setMode("single")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${
              mode === "single"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            단일 구간 추가
          </button>
          <button
            type="button"
            onClick={() => setMode("bulk")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition cursor-pointer flex items-center justify-center gap-1 ${
              mode === "bulk"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>⚡ 다중 구간 일괄 생성 (Bulk)</span>
          </button>
        </div>

        {errorMessage && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-600 font-medium">
            {errorMessage}
          </div>
        )}

        {mode === "single" ? (
          /* Single Mode */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Preset Name Chips */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                표준 송폼 프리셋
              </label>
              <div className="flex gap-1.5 flex-wrap">
                {PRESET_SECTION_NAMES.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setSectionName(preset);
                      if (errorMessage) setErrorMessage("");
                    }}
                    className={`px-2.5 py-1 text-xs rounded-lg border transition cursor-pointer ${
                      sectionName === preset
                        ? "bg-indigo-600 border-indigo-600 text-white font-bold shadow-2xs"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Section Name Input */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                구간 이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={sectionName}
                onChange={(e) => {
                  setSectionName(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                placeholder="예: Verse, Solo, Post-Chorus"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              />
            </div>

            {/* Bar Count */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                마디 수 (1 ~ 64)
              </label>
              <div className="flex items-center gap-2">
                {[4, 8, 16].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setBarCount(cnt)}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition cursor-pointer ${
                      barCount === cnt
                        ? "bg-indigo-50 border-indigo-300 text-indigo-700 font-bold"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {cnt}마디
                  </button>
                ))}
                <input
                  type="number"
                  min={1}
                  max={64}
                  value={barCount}
                  onChange={(e) =>
                    setBarCount(Math.max(1, Math.min(64, Number(e.target.value) || 1)))
                  }
                  className="w-20 px-2 py-1.5 text-xs font-bold border border-slate-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
          </form>
        ) : (
          /* Bulk Mode */
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>+ 버튼을 눌러 구간을 계속 추가할 수 있습니다.</span>
              <button
                type="button"
                onClick={handleAddBulkRow}
                className="px-2.5 py-1 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition cursor-pointer flex items-center gap-1"
              >
                <span>+</span>
                <span>구간 추가</span>
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1">
              {bulkSections.map((item, index) => (
                <div
                  key={item.id}
                  className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-2 hover:border-slate-300 transition"
                >
                  {/* Line 1: Section name dropdown & delete */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="px-1.5 py-0.5 text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded">
                        #{index + 1}
                      </span>
                      <select
                        value={PRESET_SECTION_NAMES.includes(item.name) ? item.name : "custom"}
                        onChange={(e) => {
                          if (e.target.value !== "custom") {
                            handleUpdateBulkRow(item.id, { name: e.target.value });
                          } else {
                            handleUpdateBulkRow(item.id, { name: "" });
                          }
                        }}
                        className="px-2.5 py-1 text-xs font-semibold border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        {PRESET_SECTION_NAMES.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                        <option value="custom">직접 입력...</option>
                      </select>

                      {/* Show custom text input only when custom is chosen */}
                      {!PRESET_SECTION_NAMES.includes(item.name) && (
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleUpdateBulkRow(item.id, { name: e.target.value })}
                          placeholder="구간 이름 직접 입력"
                          autoFocus
                          className="flex-1 px-2.5 py-1 text-xs border border-indigo-300 rounded-lg bg-indigo-50/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveBulkRow(item.id)}
                      disabled={bulkSections.length <= 1}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:bg-transparent cursor-pointer"
                      title="이 구간 행 삭제"
                    >
                      🗑️
                    </button>
                  </div>

                  {/* Line 2: Bar count chips and input */}
                  <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-100">
                    <span className="text-slate-500 font-medium">마디 길이 설정:</span>
                    <div className="flex items-center gap-1.5">
                      {[4, 8, 16].map((bars) => (
                        <button
                          key={bars}
                          type="button"
                          onClick={() => handleUpdateBulkRow(item.id, { barCount: bars })}
                          className={`px-2.5 py-1 text-xs rounded-lg border transition cursor-pointer ${
                            item.barCount === bars
                              ? "bg-indigo-600 text-white border-indigo-600 font-bold shadow-2xs"
                              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {bars}마디
                        </button>
                      ))}
                      <div className="flex items-center gap-1 ml-1 pl-1.5 border-l border-slate-200">
                        <input
                          type="number"
                          min={1}
                          max={64}
                          value={item.barCount}
                          onChange={(e) =>
                            handleUpdateBulkRow(item.id, {
                              barCount: Math.max(1, Math.min(64, Number(e.target.value) || 1)),
                            })
                          }
                          className="w-14 px-1.5 py-1 text-xs font-bold text-center border border-slate-300 rounded-lg bg-white"
                        />
                        <span className="text-slate-400">마디</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleAddBulkRow}
                className="w-full py-2 text-xs font-semibold text-indigo-600 bg-indigo-50/70 hover:bg-indigo-100/70 border border-dashed border-indigo-300 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>+</span>
                <span>구간 행 추가하기</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
