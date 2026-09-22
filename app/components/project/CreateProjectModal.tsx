"use client";

import React, { useState } from "react";
import { Modal } from "@/app/components/common/Modal";
import { TONICS, type Tonic } from "@/app/lib/shared/catalog/chord-catalog";
import { apiClient } from "@/app/lib/client/api";
import { useToast } from "@/app/components/common/Toast";
import { useProjectDraft } from "@/app/lib/client/project-draft-context";
import { serializeProjectDraft } from "@/app/lib/client/project-serializer";
import type { ProjectDraft } from "@/app/types/client";

export type CreateProjectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (projectId: number) => void;
};

type TemplateType = "pop" | "single_verse" | "empty" | "custom";

type CustomSectionRow = {
  id: string;
  name: string;
  barCount: number;
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
];

export function CreateProjectModal({
  isOpen,
  onClose,
  onCreated,
}: CreateProjectModalProps) {
  const { isDirty, loadProject } = useProjectDraft();
  const toast = useToast();

  const [name, setName] = useState("");
  const [tonic, setTonic] = useState<Tonic>("C");
  const [template, setTemplate] = useState<TemplateType>("pop");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [customSections, setCustomSections] = useState<CustomSectionRow[]>([
    { id: "cs-1", name: "Intro", barCount: 4 },
    { id: "cs-2", name: "Verse", barCount: 8 },
    { id: "cs-3", name: "Chorus", barCount: 8 },
    { id: "cs-4", name: "Outro", barCount: 4 },
  ]);

  const handleReset = () => {
    setName("");
    setTonic("C");
    setTemplate("pop");
    setCustomSections([
      { id: "cs-1", name: "Intro", barCount: 4 },
      { id: "cs-2", name: "Verse", barCount: 8 },
      { id: "cs-3", name: "Chorus", barCount: 8 },
      { id: "cs-4", name: "Outro", barCount: 4 },
    ]);
    setErrorMessage("");
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleAddCustomRow = () => {
    let nextName = "Verse";
    if (customSections.length > 0) {
      const last = customSections[customSections.length - 1].name;
      if (last === "Intro") nextName = "Verse";
      else if (last === "Verse") nextName = "Pre-Chorus";
      else if (last === "Pre-Chorus") nextName = "Chorus";
      else if (last === "Chorus") nextName = "Bridge";
      else if (last === "Bridge") nextName = "Chorus";
      else nextName = "Outro";
    }
    const defaultBars = nextName === "Bridge" || nextName === "Pre-Chorus" ? 4 : 8;
    setCustomSections((prev) => [
      ...prev,
      { id: `cs-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, name: nextName, barCount: defaultBars },
    ]);
  };

  const handleRemoveCustomRow = (id: string) => {
    if (customSections.length <= 1) {
      toast.warning("최소 1개 이상의 송폼 구간이 필요합니다.");
      return;
    }
    setCustomSections((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateCustomRow = (id: string, updates: Partial<CustomSectionRow>) => {
    setCustomSections((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage("곡 이름을 입력해 주세요.");
      return;
    }

    if (template === "custom" && customSections.some((s) => !s.name.trim())) {
      setErrorMessage("모든 커스텀 구간의 이름을 입력해 주세요.");
      return;
    }

    if (isDirty) {
      const confirmDiscard = window.confirm(
        "현재 저장되지 않은 변경사항이 있습니다. 저장하지 않고 새 프로젝트를 생성하시겠습니까?",
      );
      if (!confirmDiscard) return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      // 1. Create project on server
      const createRes = await apiClient.post<{ ok: true; project: any }>(
        "/api/projects",
        {
          name: trimmedName,
          tonic,
          mode: "major",
        },
      );

      const newProjectId = Number(createRes.project.id);

      // 2. Determine initial sections based on selected template
      let initialSections: ProjectDraft["sections"] = [];
      if (template === "pop") {
        initialSections = [
          {
            id: `sec_1_${Date.now()}`,
            position: 0,
            name: "Verse",
            bar_count: 8,
            bars: Array.from({ length: 8 }, (_, i) => ({
              id: `bar_1_${i + 1}`,
              position: i + 1,
              chords: [],
            })),
          },
          {
            id: `sec_2_${Date.now()}`,
            position: 1,
            name: "Chorus",
            bar_count: 8,
            bars: Array.from({ length: 8 }, (_, i) => ({
              id: `bar_2_${i + 1}`,
              position: i + 1,
              chords: [],
            })),
          },
          {
            id: `sec_3_${Date.now()}`,
            position: 2,
            name: "Bridge",
            bar_count: 4,
            bars: Array.from({ length: 4 }, (_, i) => ({
              id: `bar_3_${i + 1}`,
              position: i + 1,
              chords: [],
            })),
          },
        ];
      } else if (template === "single_verse") {
        initialSections = [
          {
            id: `sec_1_${Date.now()}`,
            position: 0,
            name: "Verse",
            bar_count: 8,
            bars: Array.from({ length: 8 }, (_, i) => ({
              id: `bar_1_${i + 1}`,
              position: i + 1,
              chords: [],
            })),
          },
        ];
      } else if (template === "custom") {
        initialSections = customSections.map((sec, secIdx) => {
          const barsCount = Math.max(1, Math.min(64, sec.barCount));
          return {
            id: `sec_${secIdx + 1}_${Date.now()}`,
            position: secIdx,
            name: sec.name.trim() || `Section ${secIdx + 1}`,
            bar_count: barsCount,
            bars: Array.from({ length: barsCount }, (_, i) => ({
              id: `bar_${secIdx + 1}_${i + 1}`,
              position: i + 1,
              chords: [],
            })),
          };
        });
      }

      // 3. Save initial structure via PUT if sections exist
      let loadedProjectData = createRes.project;
      if (initialSections.length > 0) {
        const payload = serializeProjectDraft({
          id: newProjectId,
          name: trimmedName,
          tonic,
          mode: "major",
          sections: initialSections,
        });

        const saveRes = await apiClient.put<{ ok: true; project: any }>(
          `/api/projects/${newProjectId}`,
          payload,
        );
        loadedProjectData = saveRes.project;
      }

      // 4. Load the created project into draft store
      loadProject(loadedProjectData);
      toast.success(`'${trimmedName}' 프로젝트가 성공적으로 생성되었습니다.`);
      handleClose();
      onCreated?.(newProjectId);
    } catch (err: any) {
      setErrorMessage(err.message || "프로젝트 생성 중 오류가 발생했습니다.");
      toast.error(err.message || "프로젝트 생성 실패");
    } finally {
      setIsSubmitting(false);
    }
  };

  const customTotalBars = customSections.reduce(
    (acc, cur) => acc + (Number(cur.barCount) || 1),
    0,
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="새 프로젝트 생성"
      size={template === "custom" ? "lg" : "md"}
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-slate-500">
            {template === "custom" && (
              <span>
                커스텀 송폼: <strong className="text-indigo-600 font-bold">{customSections.length}개</strong> 구간 / 합계 <strong className="text-indigo-600 font-bold">{customTotalBars}마디</strong>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <span>생성 중...</span>
              ) : (
                <>
                  <span>🚀</span>
                  <span>프로젝트 생성하기</span>
                </>
              )}
            </button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Project Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            곡 이름 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errorMessage) setErrorMessage("");
            }}
            placeholder="예: 봄날의 왈츠, 여름밤 팝 발라드"
            autoFocus
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
          {errorMessage && (
            <p className="mt-1 text-xs text-red-600">{errorMessage}</p>
          )}
        </div>

        {/* Tonic Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            기준 조성 (12 Major Keys)
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {TONICS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTonic(t)}
                className={`py-1.5 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                  tonic === t
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {t} Major
              </button>
            ))}
          </div>
        </div>

        {/* Starting Form Template */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            시작 송폼 템플릿
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              {
                id: "pop",
                title: "기본 팝 송폼 (추천)",
                desc: "Verse(8마디) · Chorus(8마디) · Bridge(4마디)",
              },
              {
                id: "single_verse",
                title: "단일 8마디 구간",
                desc: "Verse(8마디) 하나로 빠르게 진행 스케치",
              },
              {
                id: "empty",
                title: "빈 프로젝트",
                desc: "구간 없이 시작하여 직접 송폼 추가",
              },
              {
                id: "custom",
                title: "⚡ 직접 송폼 구성 (커스텀)",
                desc: "원하는 송폼 목록과 길이를 한 번에 설정",
              },
            ].map((tmpl) => (
              <label
                key={tmpl.id}
                className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
                  template === tmpl.id
                    ? "border-indigo-500 bg-indigo-50/40 ring-1 ring-indigo-400"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="template"
                  value={tmpl.id}
                  checked={template === tmpl.id}
                  onChange={() => setTemplate(tmpl.id as TemplateType)}
                  className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="flex-1 text-xs">
                  <div className="font-semibold text-slate-800">
                    {tmpl.title}
                  </div>
                  <div className="text-slate-500 mt-0.5">{tmpl.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Custom Songform Builder Subpanel */}
        {template === "custom" && (
          <div className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                초기 생성할 송폼 목록 설정
              </span>
              <button
                type="button"
                onClick={handleAddCustomRow}
                className="px-2 py-1 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition cursor-pointer flex items-center gap-1"
              >
                <span>+</span>
                <span>구간 추가</span>
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {customSections.map((row, index) => (
                <div
                  key={row.id}
                  className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1.5"
                >
                  {/* Line 1: Section name dropdown & delete */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-1">
                      <span className="px-1.5 py-0.5 text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded">
                        #{index + 1}
                      </span>
                      <select
                        value={PRESET_SECTION_NAMES.includes(row.name) ? row.name : "custom"}
                        onChange={(e) => {
                          if (e.target.value !== "custom") {
                            handleUpdateCustomRow(row.id, { name: e.target.value });
                          } else {
                            handleUpdateCustomRow(row.id, { name: "" });
                          }
                        }}
                        className="px-2 py-1 text-xs font-semibold border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        {PRESET_SECTION_NAMES.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                        <option value="custom">직접 입력...</option>
                      </select>

                      {!PRESET_SECTION_NAMES.includes(row.name) && (
                        <input
                          type="text"
                          value={row.name}
                          onChange={(e) => handleUpdateCustomRow(row.id, { name: e.target.value })}
                          placeholder="구간명 직접 입력"
                          autoFocus
                          className="flex-1 px-2 py-1 text-xs border border-indigo-300 rounded-md bg-indigo-50/30 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveCustomRow(row.id)}
                      disabled={customSections.length <= 1}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition disabled:opacity-30 cursor-pointer"
                      title="이 구간 삭제"
                    >
                      🗑️
                    </button>
                  </div>

                  {/* Line 2: Bar count chips and input */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                    <span className="text-slate-500 font-medium">마디 길이 설정:</span>
                    <div className="flex items-center gap-1.5">
                      {[4, 8, 16].map((bars) => (
                        <button
                          key={bars}
                          type="button"
                          onClick={() => handleUpdateCustomRow(row.id, { barCount: bars })}
                          className={`px-2 py-0.5 text-xs rounded border transition cursor-pointer ${
                            row.barCount === bars
                              ? "bg-indigo-600 text-white border-indigo-600 font-bold"
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
                          value={row.barCount}
                          onChange={(e) =>
                            handleUpdateCustomRow(row.id, {
                              barCount: Math.max(1, Math.min(64, Number(e.target.value) || 1)),
                            })
                          }
                          className="w-12 px-1 py-0.5 text-xs text-center border border-slate-300 rounded bg-white font-semibold"
                        />
                        <span className="text-[11px] text-slate-400">마디</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}
