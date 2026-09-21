"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/app/components/layout/Header";
import { WorkspaceLayout } from "@/app/components/layout/WorkspaceLayout";
import { Modal } from "@/app/components/common/Modal";
import { ConfirmDialog } from "@/app/components/common/ConfirmDialog";
import { useToast } from "@/app/components/common/Toast";
import { TONICS, type Tonic } from "@/app/lib/shared/catalog/chord-catalog";
import { getMajorDiatonicChords, realizeChord } from "@/app/lib/shared/domain/chord-realizer";
import { useProjectDraft } from "@/app/lib/client/project-draft-context";
import { serializeProjectDraft } from "@/app/lib/client/project-serializer";
import { apiClient } from "@/app/lib/client/api";
import { ProjectListModal } from "@/app/components/project/ProjectListModal";
import { CreateProjectModal } from "@/app/components/project/CreateProjectModal";
import { SectionList } from "@/app/components/songform/SectionList";
import { AddSectionModal } from "@/app/components/songform/AddSectionModal";
import { ChordChartGrid } from "@/app/components/chordchart/ChordChartGrid";

export function WorkspaceShell() {
  const toast = useToast();
  const {
    project,
    isDirty,
    selectedBlock,
    setSelectedBlock,
    updateMeta,
    addSection,
    removeSection,
    setChord,
    clearChord,
    clearBar,
    applyRecommendation,
    markSaved,
    loadDefaultPreset,
    resetToEmpty,
  } = useProjectDraft();

  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [selectedBarPosition, setSelectedBarPosition] = useState<number | null>(null);
  const [selectedBeat, setSelectedBeat] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Modals state
  const [isProjectListOpen, setIsProjectListOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isUserProgressionsOpen, setIsUserProgressionsOpen] = useState(false);
  const [isConfirmLeaveOpen, setIsConfirmLeaveOpen] = useState(false);
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);

  const diatonicChords = getMajorDiatonicChords(project.tonic);
  const activeSection = project.sections.find((s) => s.id === activeSectionId);

  // Target block resolution for 4-bar recommendations
  const activeStartBar = (() => {
    if (!activeSection || activeSection.bars.length === 0) return 1;
    let start = 1;
    if (selectedBlock && selectedBlock.sectionId === activeSection.id) {
      start = selectedBlock.startBar;
    } else if (selectedBarPosition) {
      start = Math.floor((selectedBarPosition - 1) / 4) * 4 + 1;
    }
    // Safeguard: clamp start to valid range if bars were trimmed
    if (start > activeSection.bar_count) {
      start = Math.max(1, Math.floor((activeSection.bar_count - 1) / 4) * 4 + 1);
    }
    return start;
  })();

  const targetEndBar = Math.min(
    activeStartBar + 3,
    activeSection ? activeSection.bar_count : activeStartBar + 3,
  );

  const barsInTargetBlock = activeSection
    ? activeSection.bars.filter(
        (b) => b.position >= activeStartBar && b.position <= targetEndBar,
      )
    : [];

  const isTargetBlockLessThanFour = barsInTargetBlock.length < 4;

  // Keep activeSectionId valid
  useEffect(() => {
    if (project.sections.length > 0) {
      if (!activeSectionId || !project.sections.some((s) => s.id === activeSectionId)) {
        setActiveSectionId(project.sections[0].id);
        setSelectedBarPosition(null);
        setSelectedBeat(null);
      }
    } else {
      setActiveSectionId(null);
      setSelectedBarPosition(null);
      setSelectedBeat(null);
    }
  }, [project.sections, activeSectionId]);

  // Keyboard shortcut listener: 1~7 to set chord, Delete/Backspace to clear, Esc to unselect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if focus is in an input or modal is open
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        isProjectListOpen ||
        isCreateProjectOpen ||
        isUserProgressionsOpen ||
        isAddSectionOpen ||
        isConfirmLeaveOpen
      ) {
        return;
      }

      if (!activeSection) return;

      if (e.key === "Escape") {
        setSelectedBarPosition(null);
        setSelectedBeat(null);
        return;
      }

      if (selectedBarPosition) {
        if (e.key === "Backspace" || e.key === "Delete") {
          e.preventDefault();
          if (selectedBeat && selectedBeat > 1) {
            clearChord(activeSection.id, selectedBarPosition, selectedBeat);
            toast.info(
              `마디 #${selectedBarPosition} ${selectedBeat}박의 코드를 삭제했습니다.`,
            );
          } else {
            clearBar(activeSection.id, selectedBarPosition);
            toast.info(`마디 #${selectedBarPosition}의 코드를 삭제했습니다.`);
          }
          return;
        }

        const digit = parseInt(e.key, 10);
        if (digit >= 1 && digit <= 7) {
          e.preventDefault();
          const targetChord = diatonicChords[digit - 1];
          if (targetChord) {
            const beatToSet = selectedBeat || 1;
            setChord(activeSection.id, selectedBarPosition, {
              beat: beatToSet,
              degree: targetChord.degree,
              quality: targetChord.quality,
            });
            toast.info(
              `마디 #${selectedBarPosition}${
                beatToSet > 1 ? ` ${beatToSet}박` : ""
              }에 '${targetChord.displayName}'(${targetChord.degree}) 할당됨`,
            );
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    activeSection,
    selectedBarPosition,
    selectedBeat,
    diatonicChords,
    isProjectListOpen,
    isCreateProjectOpen,
    isUserProgressionsOpen,
    isAddSectionOpen,
    isConfirmLeaveOpen,
    clearBar,
    clearChord,
    setChord,
    toast,
  ]);

  // Prevent accidental navigation when dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const handleSave = async () => {
    if (!isDirty) return;
    setIsSaving(true);
    try {
      const payload = serializeProjectDraft(project);
      if (project.id) {
        // Existing project PUT
        const res = await apiClient.put<{ ok: true; project: any }>(
          `/api/projects/${project.id}`,
          payload,
        );
        markSaved(res.project);
        toast.success("프로젝트가 성공적으로 저장되었습니다.");
      } else {
        // Try creating via POST if available or fallback to local markSaved
        try {
          const createRes = await apiClient.post<{ ok: true; project: any }>(
            "/api/projects",
            { name: payload.name, tonic: payload.tonic, mode: "major" },
          );
          if (createRes?.project?.id) {
            const putRes = await apiClient.put<{ ok: true; project: any }>(
              `/api/projects/${createRes.project.id}`,
              payload,
            );
            markSaved(putRes.project);
            toast.success("새 프로젝트가 저장되었습니다.");
          } else {
            markSaved(payload);
            toast.success("프로젝트가 로컬에 저장되었습니다.");
          }
        } catch {
          markSaved(payload);
          toast.success("프로젝트가 로컬에 저장되었습니다.");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-white text-slate-900 font-sans">
      {/* Top Global Header */}
      <Header
        projectName={project.name}
        tonic={project.tonic}
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={handleSave}
        onNewProject={() => setIsCreateProjectOpen(true)}
        onOpenProjectList={() => setIsProjectListOpen(true)}
        onOpenUserProgressions={() => setIsUserProgressionsOpen(true)}
        onUpdateProjectName={(name) => updateMeta(name)}
      />

      {/* 3-Panel Main Workspace */}
      <WorkspaceLayout
        leftTitle="송폼 & 조성"
        rightTitle="추천 & 기법 분석"
        leftPanel={
          <div className="space-y-5">
            {/* Key Selector Section */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                기준 조성 (Tonic)
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {TONICS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => updateMeta(project.name, t)}
                    className={`py-1.5 text-xs font-semibold rounded-md border transition cursor-pointer ${
                      project.tonic === t
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Song Form Sections */}
            <SectionList
              activeSectionId={activeSectionId}
              onSelectSection={(id) => {
                setActiveSectionId(id);
                setSelectedBarPosition(null);
                setSelectedBeat(null);
                const targetSec = project.sections.find((s) => s.id === id);
                const maxEnd = targetSec ? Math.min(4, targetSec.bar_count) : 4;
                setSelectedBlock({ sectionId: id, startBar: 1, endBar: maxEnd });
              }}
              onOpenAddModal={() => setIsAddSectionOpen(true)}
            />
          </div>
        }
        centerPanel={
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Quick Diatonic 7-Chords Bar */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {project.tonic} Major 다이어토닉 7코드 팔레트
                  </span>
                  {selectedBarPosition ? (
                    <span className="px-2 py-0.5 text-xs font-semibold rounded bg-indigo-100 text-indigo-800">
                      선택된 마디: #{selectedBarPosition}
                      {selectedBeat ? ` (${selectedBeat}박)` : ""}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">
                      (마디를 먼저 클릭한 후 코드를 선택하세요)
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400">단축키: 숫자 1~7</span>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {diatonicChords.map((chord) => (
                  <button
                    key={chord.degree}
                    type="button"
                    onClick={() => {
                      if (!activeSection || activeSection.bars.length === 0) {
                        toast.warning("먼저 송폼 구간을 선택하거나 생성하세요.");
                        return;
                      }

                      // 2-Step Interaction: Target selected bar first, or fallback to first empty bar
                      let targetBarPosition = selectedBarPosition;
                      if (!targetBarPosition) {
                        const emptyBar = activeSection.bars.find(
                          (b) => b.chords.length === 0,
                        );
                        targetBarPosition = emptyBar ? emptyBar.position : 1;
                        setSelectedBarPosition(targetBarPosition);
                        toast.info(
                          `선택된 마디가 없어 #${targetBarPosition} 마디가 자동 선택되었습니다.`,
                        );
                      }

                      const beatToSet = selectedBeat || 1;
                      setChord(activeSection.id, targetBarPosition, {
                        beat: beatToSet,
                        degree: chord.degree,
                        quality: chord.quality,
                      });
                      toast.success(
                        `${activeSection.name} #${targetBarPosition} 마디${
                          beatToSet > 1 ? ` ${beatToSet}박` : ""
                        }에 '${chord.displayName}'(${chord.degree}) 코드가 할당되었습니다.`,
                      );
                    }}
                    className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-indigo-50 hover:border-indigo-300 text-center transition group cursor-pointer"
                  >
                    <div className="text-sm font-bold text-slate-800 group-hover:text-indigo-600">
                      {chord.displayName}
                    </div>
                    <div className="text-xs text-slate-400 group-hover:text-indigo-500 font-serif mt-0.5">
                      {chord.degree}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Empty Project Onboarding or Active Section Grid */}
            {project.sections.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border-2 border-dashed border-slate-300 text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl font-bold">
                  🎵
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    아직 등록된 송폼 구간이 없습니다
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Intro, Verse, Chorus 등의 구간을 추가하여 나만의 코드 진행을 완성해 보세요.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={loadDefaultPreset}
                    className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow-xs cursor-pointer"
                  >
                    🚀 기본 팝 송폼 프리셋 일괄 생성 (Intro+Verse+Chorus)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddSectionOpen(true)}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition cursor-pointer"
                  >
                    + 직접 구간 추가
                  </button>
                </div>
              </div>
            ) : activeSection ? (
              <ChordChartGrid
                section={activeSection}
                tonic={project.tonic}
                selectedBarPosition={selectedBarPosition}
                selectedBeat={selectedBeat}
                selectedStartBar={activeStartBar}
                onSelectBar={(barPos) => {
                  setSelectedBarPosition(barPos);
                  setSelectedBeat(null);
                  const blockStart = Math.floor((barPos - 1) / 4) * 4 + 1;
                  setSelectedBlock({
                    sectionId: activeSection.id,
                    startBar: blockStart,
                    endBar: Math.min(blockStart + 3, activeSection.bar_count),
                  });
                }}
                onSelectBeat={(barPos, beat) => {
                  setSelectedBarPosition(barPos);
                  setSelectedBeat(beat);
                  const blockStart = Math.floor((barPos - 1) / 4) * 4 + 1;
                  setSelectedBlock({
                    sectionId: activeSection.id,
                    startBar: blockStart,
                    endBar: Math.min(blockStart + 3, activeSection.bar_count),
                  });
                }}
                onSelectBlock={(startBar, endBar) => {
                  setSelectedBlock({
                    sectionId: activeSection.id,
                    startBar,
                    endBar,
                  });
                }}
                onClearBar={(barPos) => {
                  clearBar(activeSection.id, barPos);
                  toast.info(`마디 #${barPos}의 코드를 삭제했습니다.`);
                }}
                onClearBeat={(barPos, beat) => {
                  clearChord(activeSection.id, barPos, beat);
                  toast.info(`마디 #${barPos} ${beat}박의 코드를 삭제했습니다.`);
                }}
                onClearSection={() => {
                  activeSection.bars.forEach((b) =>
                    clearBar(activeSection.id, b.position),
                  );
                  setSelectedBarPosition(null);
                  setSelectedBeat(null);
                  toast.info(`${activeSection.name} 구간의 모든 코드가 초기화되었습니다.`);
                }}
              />
            ) : null}
          </div>
        }
        rightPanel={
          <div className="space-y-5">
            {/* Realtime Technique Analysis Feedback Card */}
            <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/50 shadow-xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900 mb-1.5">
                <span className="px-1.5 py-0.5 rounded bg-purple-200 text-purple-800 text-[10px] font-extrabold uppercase">
                  실시간 분석
                </span>
                <span>모달 인터체인지 (iv)</span>
              </div>
              <p className="text-xs text-purple-700 leading-relaxed">
                현재 조의 평행단조에서 코드를 차용한 진행입니다. 독특하고 애절한 화성적 색채를 부여합니다.
              </p>
            </div>

            {/* 4-Bar Recommendation Panel */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    4마디 추천 진행
                  </span>
                  {activeSection && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      대상: #{activeStartBar} ~ #{targetEndBar}마디
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400">대중성 순</span>
              </div>

              {/* Recommendation Cards list */}
              <div className="space-y-2.5">
                {[
                  {
                    name: "I - V - VI - IV (팝 4코드 진행)",
                    formTag: "Chorus",
                    steps: [
                      { degree: "I", quality: "major" as const },
                      { degree: "V", quality: "major" as const },
                      { degree: "VI", quality: "minor" as const },
                      { degree: "IV", quality: "major" as const },
                    ],
                  },
                  {
                    name: "IV - V - III - VI (왕도 진행)",
                    formTag: "Chorus",
                    steps: [
                      { degree: "IV", quality: "major" as const },
                      { degree: "V", quality: "major" as const },
                      { degree: "III", quality: "minor" as const },
                      { degree: "VI", quality: "minor" as const },
                    ],
                  },
                ].map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 shadow-xs transition"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {rec.name}
                      </span>
                      <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                        {rec.formTag}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-indigo-600 mb-1">
                      {rec.steps.map((s) => s.degree).join(" - ")}
                    </div>
                    <div className="text-xs text-slate-600 mb-2">
                      {rec.steps
                        .map((s) =>
                          realizeChord(project.tonic, {
                            degree: s.degree,
                            quality: s.quality,
                            extension: null,
                            bass_degree: null,
                          }),
                        )
                        .join(" - ")}
                    </div>
                    <button
                      type="button"
                      disabled={isTargetBlockLessThanFour || !activeSection}
                      onClick={() => {
                        if (!activeSection) {
                          toast.warning("먼저 송폼 구간을 선택하세요.");
                          return;
                        }
                        if (isTargetBlockLessThanFour) {
                          toast.warning(
                            "선택된 블록이 4마디 미만이어서 추천 진행을 적용할 수 없습니다.",
                          );
                          return;
                        }
                        applyRecommendation(
                          activeSection.id,
                          activeStartBar,
                          rec.steps,
                        );
                        toast.success(
                          `추천 진행이 '${activeSection.name}' #${activeStartBar}~#${targetEndBar} 마디에 비파괴 적용되었습니다.`,
                        );
                      }}
                      className={`w-full py-1.5 text-xs font-semibold rounded-lg transition ${
                        isTargetBlockLessThanFour
                          ? "cursor-not-allowed bg-slate-100 text-slate-400 border border-slate-200"
                          : "cursor-pointer bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
                      }`}
                    >
                      {isTargetBlockLessThanFour
                        ? `4마디 미만 (${activeStartBar}~${targetEndBar}마디 적용 불가)`
                        : `이 진행 ${activeStartBar}~${targetEndBar}마디에 적용하기`}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        }
      />

      {/* Add Section Modal */}
      <AddSectionModal
        isOpen={isAddSectionOpen}
        onClose={() => setIsAddSectionOpen(false)}
      />

      {/* Project List Modal */}
      <ProjectListModal
        isOpen={isProjectListOpen}
        onClose={() => setIsProjectListOpen(false)}
        onOpenCreateModal={() => setIsCreateProjectOpen(true)}
      />

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
      />

      {/* User Progression Modal (Shell Preview) */}
      <Modal
        isOpen={isUserProgressionsOpen}
        onClose={() => setIsUserProgressionsOpen(false)}
        title="사용자 진행 보관함"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            기본 추천과 분리된 나만의 4마디 도수 진행을 등록하고 와일드카드(`x`)로 검색합니다.
          </p>
          <div className="flex gap-2">
            {["x", "II", "I", "x"].map((token, i) => (
              <input
                key={i}
                type="text"
                defaultValue={token}
                className="w-14 h-10 text-center font-bold text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            ))}
            <button
              type="button"
              onClick={() => toast.info("와일드카드 패턴 검색을 실행했습니다.")}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
            >
              패턴 검색
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirm Unsaved Changes Dialog */}
      <ConfirmDialog
        isOpen={isConfirmLeaveOpen}
        onClose={() => setIsConfirmLeaveOpen(false)}
        onConfirm={() => {
          resetToEmpty();
          toast.info("초기화되었습니다.");
        }}
        title="새 프로젝트 시작"
        message="현재 작업 중인 내용이 초기화됩니다. 계속하시겠습니까?"
        confirmText="새로 만들기"
        variant="danger"
      />
    </div>
  );
}
