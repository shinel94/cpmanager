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
];

export function AddSectionModal({
  isOpen,
  onClose,
  onAdded,
}: AddSectionModalProps) {
  const { addSection } = useProjectDraft();
  const toast = useToast();

  const [sectionName, setSectionName] = useState("Verse");
  const [barCount, setBarCount] = useState(8);
  const [errorMessage, setErrorMessage] = useState("");

  const handleClose = () => {
    setSectionName("Verse");
    setBarCount(8);
    setErrorMessage("");
    onClose();
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="새 송폼 구간 추가"
      size="sm"
      footer={
        <>
          <button
            type="button"
            onClick={handleClose}
            className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => handleSubmit()}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition"
          >
            구간 추가하기
          </button>
        </>
      }
    >
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
          {errorMessage && (
            <p className="mt-1 text-xs text-red-600">{errorMessage}</p>
          )}
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
    </Modal>
  );
}
