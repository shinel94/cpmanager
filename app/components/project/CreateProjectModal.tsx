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

type TemplateType = "pop" | "single_verse" | "empty";

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

  const handleReset = () => {
    setName("");
    setTonic("C");
    setTemplate("pop");
    setErrorMessage("");
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage("곡 이름을 입력해 주세요.");
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="새 프로젝트 생성"
      size="md"
      footer={
        <>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !name.trim()}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>생성 중...</span>
              </>
            ) : (
              <span>프로젝트 만들기</span>
            )}
          </button>
        </>
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
          <div className="space-y-2">
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
            ].map((tmpl) => (
              <label
                key={tmpl.id}
                className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition ${
                  template === tmpl.id
                    ? "border-indigo-500 bg-indigo-50/40"
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
      </form>
    </Modal>
  );
}
