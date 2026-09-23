"use client";

import React, { useState, useEffect, useMemo } from "react";
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
import { FullSongFormView } from "@/app/components/chordchart/FullSongFormView";
import { ChordEditModal } from "@/app/components/chordchart/ChordEditModal";
import { InlineChordBuilder } from "@/app/components/chordchart/InlineChordBuilder";
import { TechniqueCard } from "@/app/components/analysis/TechniqueCard";
import { RecommendationPanel } from "@/app/components/recommendation/RecommendationPanel";
import { UserProgressionsModal } from "@/app/components/progression/UserProgressionsModal";
import { PlaybackToolbar } from "@/app/components/audio/PlaybackToolbar";
import type { PlayheadPosition } from "@/app/lib/client/audio/audio-scheduler";
import { playAuditionChord } from "@/app/lib/client/audio/audition";

export function WorkspaceShell() {
  const toast = useToast();
  const {
    project,
    isDirty,
    selectedBlock,
    setSelectedBlock,
    lastTechnique,
    setLastTechnique,
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

  const [viewMode, setViewMode] = useState<"single" | "all">("single");
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [selectedBarPosition, setSelectedBarPosition] = useState<number | null>(null);
  const [selectedBeat, setSelectedBeat] = useState<number | null>(null);
  const [activePlayhead, setActivePlayhead] = useState<PlayheadPosition | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Modals state
  const [isProjectListOpen, setIsProjectListOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isUserProgressionsOpen, setIsUserProgressionsOpen] = useState(false);
  const [isConfirmLeaveOpen, setIsConfirmLeaveOpen] = useState(false);
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [isChordEditOpen, setIsChordEditOpen] = useState(false);
  const [isDetailExpanded, setIsDetailExpanded] = useState(false);

  const diatonicChords = getMajorDiatonicChords(project.tonic);
  const activeSection = project.sections.find((s) => s.id === activeSectionId);

  const currentSelectedChord = useMemo(() => {
    if (!activeSection || !selectedBarPosition) return null;
    const bar = activeSection.bars.find((b) => b.position === selectedBarPosition);
    if (!bar) return null;
    const beatToFind = selectedBeat || 1;
    return bar.chords.find((c) => (c.beat || 1) === beatToFind) || null;
  }, [activeSection, selectedBarPosition, selectedBeat]);

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

  // Realtime harmonic technique analysis helper
  const runTechniqueAnalysis = async (
    sectionId: string,
    barPos: number,
    beat: number,
    afterChord: { degree: string; quality: any; extension?: any; bass_degree?: string | null },
    beforeChord?: any,
  ) => {
    const sec = project.sections.find((s) => s.id === sectionId);
    if (!sec) return;
    const blockStart = Math.floor((barPos - 1) / 4) * 4 + 1;
    const blockBars = [1, 2, 3, 4].map((relPos) => {
      const b = sec.bars.find((bar) => bar.position === blockStart + relPos - 1);
      return {
        position: relPos,
        chords: b?.chords.map((c) => ({
          beat: c.beat,
          degree: c.degree,
          quality: c.quality,
          extension: c.extension ?? null,
          bass_degree: c.bass_degree ?? null,
        })) ?? [],
      };
    });

    const targetRelPos = barPos - blockStart + 1;
    const targetBarInBlock = blockBars.find((b) => b.position === targetRelPos);
    if (targetBarInBlock) {
      const nextChord = {
        beat: beat || 1,
        degree: afterChord.degree,
        quality: afterChord.quality,
        extension: afterChord.extension ?? null,
        bass_degree: afterChord.bass_degree ?? null,
      };
      const existingAtBeat = targetBarInBlock.chords.some((chord) => chord.beat === nextChord.beat);
      targetBarInBlock.chords = existingAtBeat
        ? targetBarInBlock.chords.map((chord) => chord.beat === nextChord.beat ? nextChord : chord)
        : [...targetBarInBlock.chords, nextChord].sort((a, b) => a.beat - b.beat);
    }

    const beforeStep = beforeChord
      ? {
          degree: beforeChord.degree,
          quality: beforeChord.quality,
          extension: beforeChord.extension ?? null,
          bass_degree: beforeChord.bass_degree ?? null,
        }
      : {
          degree: afterChord.degree,
          quality: "major",
          extension: null,
          bass_degree: null,
        };

    const afterStep = {
      degree: afterChord.degree,
      quality: afterChord.quality,
      extension: afterChord.extension ?? null,
      bass_degree: afterChord.bass_degree ?? null,
    };

    try {
      const res = await apiClient.post<{
        technique: any;
        progressionPattern?: any;
        progressionAlternatives?: any;
      }>("/api/analysis", {
        tonic: project.tonic,
        sectionName: sec.name,
        blockStart: blockStart,
        target: {
          barPosition: targetRelPos,
          beat: beat || 1,
        },
        before: beforeStep,
        after: afterStep,
        bars: blockBars,
      });
      if (res?.technique || res?.progressionPattern) {
        setLastTechnique({
          id: res.technique?.id ?? 0,
          name: res.technique?.name ?? (res.progressionPattern?.name || "화성 진행 분석"),
          description:
            res.technique?.description ?? (res.progressionPattern?.description || ""),
          targetBarPosition: barPos,
          targetBeat: beat,
          confidence: res.technique?.confidence,
          evidence: res.technique?.evidence,
          targetDegree: res.technique?.targetDegree,
          sourceMode: res.technique?.sourceMode,
          inversion: res.technique?.inversion,
          progressionPattern: res.progressionPattern ?? null,
          progressionAlternatives: res.progressionAlternatives ?? [],
          alternatives: res.technique?.alternatives ?? [],
        });
      }
    } catch {
      // Non-critical analysis failure
    }
  };

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
        isConfirmLeaveOpen ||
        isChordEditOpen
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
            const targetBar = activeSection.bars.find(
              (b) => b.position === selectedBarPosition,
            );
            const existingChord = targetBar?.chords.find(
              (c) => c.beat === beatToSet,
            );
            setChord(activeSection.id, selectedBarPosition, {
              beat: beatToSet,
              degree: targetChord.degree,
              quality: targetChord.quality,
            });
            playAuditionChord(targetChord, project.tonic);
            runTechniqueAnalysis(
              activeSection.id,
              selectedBarPosition,
              beatToSet,
              targetChord,
              existingChord,
            );
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
    runTechniqueAnalysis,
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

      {/* Playback Controls Toolbar */}
      <PlaybackToolbar
        activeSectionId={activeSectionId}
        onPlayheadTick={(pos) => setActivePlayhead(pos)}
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
              viewMode={viewMode}
              onToggleViewMode={(mode) => setViewMode(mode)}
              onSelectSection={(id) => {
                setActiveSectionId(id);
                setViewMode("single");
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
                      {activeSection ? `[${activeSection.name}] ` : ""}선택된 마디: #{selectedBarPosition}
                      {selectedBeat ? ` (${selectedBeat}박)` : ""}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">
                      (마디를 먼저 클릭한 후 코드를 선택하세요)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 hidden sm:inline">단축키: 숫자 1~7</span>
                  <button
                    type="button"
                    onClick={() => setIsDetailExpanded((prev) => !prev)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                      isDetailExpanded
                        ? "bg-indigo-600 text-white hover:bg-indigo-700 ring-2 ring-indigo-200"
                        : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
                    }`}
                    title="텐션, 슬래시 코드 등 상세 화성 설정 펼치기/접기"
                  >
                    <span>⚙️</span>
                    <span>코드 상세 설정</span>
                    <span className="text-[10px]">{isDetailExpanded ? "▲ 접기" : "▼ 펼치기"}</span>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {diatonicChords.map((chord) => (
                  <div key={chord.degree} className="relative group">
                    <button
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
                        const targetBar = activeSection.bars.find(
                          (b) => b.position === targetBarPosition,
                        );
                        const existingChord = targetBar?.chords.find(
                          (c) => c.beat === beatToSet,
                        );

                        setChord(activeSection.id, targetBarPosition, {
                          beat: beatToSet,
                          degree: chord.degree,
                          quality: chord.quality,
                        });
                        playAuditionChord(chord, project.tonic);
                        runTechniqueAnalysis(
                          activeSection.id,
                          targetBarPosition,
                          beatToSet,
                          chord,
                          existingChord,
                        );
                        toast.success(
                          `${activeSection.name} #${targetBarPosition} 마디${
                            beatToSet > 1 ? ` ${beatToSet}박` : ""
                          }에 '${chord.displayName}'(${chord.degree}) 코드가 할당되었습니다.`,
                        );
                      }}
                      className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-indigo-50 hover:border-indigo-300 text-center transition cursor-pointer"
                    >
                      <div className="text-sm font-bold text-slate-800 group-hover:text-indigo-600">
                        {chord.displayName}
                      </div>
                      <div className="text-xs text-slate-400 group-hover:text-indigo-500 font-serif mt-0.5">
                        {chord.degree}
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        playAuditionChord(chord, project.tonic);
                      }}
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-0.5 text-[10px] text-slate-400 hover:text-indigo-600 hover:bg-white rounded transition shadow-2xs cursor-pointer"
                      title={`${chord.displayName} (${chord.degree}) 코드 소리 듣기`}
                    >
                      🔊
                    </button>
                  </div>
                ))}
              </div>

              {/* Inline Chord Detail Builder Drawer */}
              {isDetailExpanded && (
                <InlineChordBuilder
                  tonic={project.tonic}
                  sectionName={activeSection?.name}
                  sectionId={activeSection?.id}
                  barPosition={selectedBarPosition}
                  beat={selectedBeat || 1}
                  currentChord={currentSelectedChord}
                  onChangeChord={(updated) => {
                    if (!activeSection) {
                      toast.warning("먼저 송폼 구간을 선택하거나 생성하세요.");
                      return;
                    }
                    let targetBarPos = selectedBarPosition;
                    if (!targetBarPos) {
                      const emptyBar = activeSection.bars.find(
                        (b) => b.chords.length === 0,
                      );
                      targetBarPos = emptyBar ? emptyBar.position : 1;
                      setSelectedBarPosition(targetBarPos);
                    }
                    const beatToSet = selectedBeat || 1;
                    const prevChord = currentSelectedChord || undefined;

                    setChord(activeSection.id, targetBarPos, {
                      beat: beatToSet,
                      degree: updated.degree,
                      quality: updated.quality,
                      extension: updated.extension || undefined,
                      bass_degree: updated.bass_degree || undefined,
                    });

                    runTechniqueAnalysis(
                      activeSection.id,
                      targetBarPos,
                      beatToSet,
                      updated,
                      prevChord,
                    );
                  }}
                  onClearChord={() => {
                    if (!activeSection || !selectedBarPosition) return;
                    if (selectedBeat && selectedBeat > 1) {
                      clearChord(activeSection.id, selectedBarPosition, selectedBeat);
                      toast.info(
                        `마디 #${selectedBarPosition} ${selectedBeat}박의 코드를 삭제했습니다.`,
                      );
                    } else {
                      clearBar(activeSection.id, selectedBarPosition);
                      toast.info(`마디 #${selectedBarPosition}의 코드를 삭제했습니다.`);
                    }
                  }}
                  onOpenDetailedModal={() => setIsChordEditOpen(true)}
                />
              )}
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
            ) : viewMode === "all" ? (
              <FullSongFormView
                sections={project.sections}
                tonic={project.tonic}
                activeSectionId={activeSectionId}
                selectedBarPosition={selectedBarPosition}
                selectedBeat={selectedBeat}
                selectedStartBar={activeStartBar}
                activePlayhead={activePlayhead}
                onAuditionChord={(chord) => playAuditionChord(chord, project.tonic)}
                onSelectBar={(secId, barPos) => {
                  setActiveSectionId(secId);
                  setSelectedBarPosition(barPos);
                  setSelectedBeat(null);
                  const targetSec = project.sections.find((s) => s.id === secId);
                  const blockStart = Math.floor((barPos - 1) / 4) * 4 + 1;
                  setSelectedBlock({
                    sectionId: secId,
                    startBar: blockStart,
                    endBar: Math.min(
                      blockStart + 3,
                      targetSec ? targetSec.bar_count : blockStart + 3,
                    ),
                  });
                  const targetBar = targetSec?.bars.find((b) => b.position === barPos);
                  if (targetBar && targetBar.chords.length > 0) {
                    const firstChord = targetBar.chords[0];
                    runTechniqueAnalysis(secId, barPos, firstChord.beat || 1, firstChord);
                  }
                }}
                onSelectBeat={(secId, barPos, beat) => {
                  setActiveSectionId(secId);
                  setSelectedBarPosition(barPos);
                  setSelectedBeat(beat);
                  const targetSec = project.sections.find((s) => s.id === secId);
                  const blockStart = Math.floor((barPos - 1) / 4) * 4 + 1;
                  setSelectedBlock({
                    sectionId: secId,
                    startBar: blockStart,
                    endBar: Math.min(
                      blockStart + 3,
                      targetSec ? targetSec.bar_count : blockStart + 3,
                    ),
                  });
                  const targetBar = targetSec?.bars.find((b) => b.position === barPos);
                  const targetChord = targetBar?.chords.find((c) => c.beat === beat) || targetBar?.chords[0];
                  if (targetChord) {
                    runTechniqueAnalysis(secId, barPos, beat, targetChord);
                  }
                }}
                onSelectBlock={(secId, startBar, endBar) => {
                  setActiveSectionId(secId);
                  setSelectedBlock({
                    sectionId: secId,
                    startBar,
                    endBar,
                  });
                }}
                onOpenEdit={(secId, barPos, beat) => {
                  setActiveSectionId(secId);
                  setSelectedBarPosition(barPos);
                  setSelectedBeat(beat);
                  setIsChordEditOpen(true);
                }}
                onClearBar={(secId, barPos) => {
                  clearBar(secId, barPos);
                  toast.info(`마디 #${barPos}의 코드를 삭제했습니다.`);
                }}
                onClearBeat={(secId, barPos, beat) => {
                  clearChord(secId, barPos, beat);
                  toast.info(`마디 #${barPos} ${beat}박의 코드를 삭제했습니다.`);
                }}
                onClearSection={(secId) => {
                  const sec = project.sections.find((s) => s.id === secId);
                  if (sec) {
                    sec.bars.forEach((b) => clearBar(secId, b.position));
                    if (activeSectionId === secId) {
                      setSelectedBarPosition(null);
                      setSelectedBeat(null);
                    }
                    toast.info(`${sec.name} 구간의 모든 코드가 초기화되었습니다.`);
                  }
                }}
                onFocusSingleSection={(secId) => {
                  setActiveSectionId(secId);
                  setViewMode("single");
                  setSelectedBarPosition(null);
                  setSelectedBeat(null);
                  const targetSec = project.sections.find((s) => s.id === secId);
                  const maxEnd = targetSec ? Math.min(4, targetSec.bar_count) : 4;
                  setSelectedBlock({ sectionId: secId, startBar: 1, endBar: maxEnd });
                }}
              />
            ) : activeSection ? (
              <ChordChartGrid
                section={activeSection}
                tonic={project.tonic}
                selectedBarPosition={selectedBarPosition}
                selectedBeat={selectedBeat}
                selectedStartBar={activeStartBar}
                activePlayhead={activePlayhead}
                onAuditionChord={(chord) => playAuditionChord(chord, project.tonic)}
                onSelectBar={(barPos) => {
                  setSelectedBarPosition(barPos);
                  setSelectedBeat(null);
                  const blockStart = Math.floor((barPos - 1) / 4) * 4 + 1;
                  setSelectedBlock({
                    sectionId: activeSection.id,
                    startBar: blockStart,
                    endBar: Math.min(blockStart + 3, activeSection.bar_count),
                  });
                  const targetBar = activeSection.bars.find((b) => b.position === barPos);
                  if (targetBar && targetBar.chords.length > 0) {
                    const firstChord = targetBar.chords[0];
                    runTechniqueAnalysis(activeSection.id, barPos, firstChord.beat || 1, firstChord);
                  }
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
                  const targetBar = activeSection.bars.find((b) => b.position === barPos);
                  const targetChord = targetBar?.chords.find((c) => c.beat === beat) || targetBar?.chords[0];
                  if (targetChord) {
                    runTechniqueAnalysis(activeSection.id, barPos, beat, targetChord);
                  }
                }}
                onSelectBlock={(startBar, endBar) => {
                  setSelectedBlock({
                    sectionId: activeSection.id,
                    startBar,
                    endBar,
                  });
                }}
                onOpenEdit={(barPos, beat) => {
                  setSelectedBarPosition(barPos);
                  setSelectedBeat(beat);
                  setIsChordEditOpen(true);
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
            <TechniqueCard
              lastTechnique={lastTechnique}
              onClear={() => setLastTechnique(null)}
            />

            {/* 4-Bar Recommendation Panel */}
            <RecommendationPanel
              section={activeSection ?? null}
              tonic={project.tonic}
              startBar={activeStartBar}
              endBar={targetEndBar}
              onApplyRecommendation={(start, steps) => {
                if (!activeSection) return;
                applyRecommendation(activeSection.id, start, steps);
                if (steps.length > 0) {
                  const lastStep = steps[steps.length - 1];
                  runTechniqueAnalysis(
                    activeSection.id,
                    start + steps.length - 1,
                    1,
                    lastStep,
                  );
                }
              }}
            />
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

      {/* User Progression Modal (Fully Wired with Wildcard Search & Registration) */}
      <UserProgressionsModal
        isOpen={isUserProgressionsOpen}
        onClose={() => setIsUserProgressionsOpen(false)}
        tonic={project.tonic}
        activeSection={activeSection}
        targetBlock={
          activeSection
            ? {
                startBar: activeStartBar,
                endBar: Math.min(activeStartBar + 3, activeSection.bar_count),
              }
            : null
        }
        onApplyProgression={(steps) => {
          if (!activeSection) return;
          applyRecommendation(
            activeSection.id,
            activeStartBar,
            steps.map((step) => ({
              position: step.position,
              degree: step.degree,
              quality: step.quality,
              extension: step.extension || undefined,
              bass_degree: step.bass_degree || undefined,
            }))
          );
          if (steps.length > 0) {
            const lastStep = steps[steps.length - 1];
            runTechniqueAnalysis(
              activeSection.id,
              activeStartBar + lastStep.position - 1,
              1,
              lastStep,
            );
          }
        }}
      />

      {/* Chord Attribute Edit Modal */}
      {activeSection && selectedBarPosition && (
        <ChordEditModal
          isOpen={isChordEditOpen}
          onClose={() => setIsChordEditOpen(false)}
          sectionName={activeSection.name}
          barPosition={selectedBarPosition}
          beat={selectedBeat || 1}
          tonic={project.tonic}
          initialChord={
            activeSection.bars
              .find((b) => b.position === selectedBarPosition)
              ?.chords.find((c) => c.beat === (selectedBeat || 1)) ||
            activeSection.bars
              .find((b) => b.position === selectedBarPosition)
              ?.chords[0] ||
            null
          }
          onSave={(chordData) => {
            const beatToSet = selectedBeat || 1;
            const targetBar = activeSection.bars.find(
              (b) => b.position === selectedBarPosition,
            );
            const existingChord = targetBar?.chords.find(
              (c) => c.beat === beatToSet,
            );

            setChord(activeSection.id, selectedBarPosition, {
              beat: beatToSet,
              degree: chordData.degree,
              quality: chordData.quality,
              extension: chordData.extension,
              bass_degree: chordData.bass_degree,
            });
            runTechniqueAnalysis(
              activeSection.id,
              selectedBarPosition,
              beatToSet,
              chordData,
              existingChord,
            );
            toast.success(
              `${activeSection.name} #${selectedBarPosition} 마디(${beatToSet}박) 코드가 수정되었습니다.`,
            );
          }}
          onDelete={() => {
            if (selectedBeat && selectedBeat > 1) {
              clearChord(activeSection.id, selectedBarPosition, selectedBeat);
              toast.info(
                `마디 #${selectedBarPosition} ${selectedBeat}박의 코드를 삭제했습니다.`,
              );
            } else {
              clearBar(activeSection.id, selectedBarPosition);
              toast.info(`마디 #${selectedBarPosition}의 코드를 삭제했습니다.`);
            }
          }}
        />
      )}

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
