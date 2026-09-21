"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useReducer,
  useState,
} from "react";
import type {
  BarChordDraft,
  ProjectDraft,
  SelectedBlock,
  SelectedChordTarget,
  TechniqueFeedback,
} from "@/app/types/client";
import type { Tonic } from "@/app/lib/shared/catalog/chord-catalog";
import {
  createDefaultPopProject,
  createEmptyProject,
  hydrateProjectDraft,
} from "./project-serializer";
import { projectDraftReducer, type DraftAction } from "./draft-reducer";

export type ProjectDraftContextType = {
  project: ProjectDraft;
  isDirty: boolean;
  selectedBlock: SelectedBlock | null;
  selectedChord: SelectedChordTarget | null;
  lastTechnique: TechniqueFeedback | null;

  // Actions
  updateMeta: (name: string, tonic?: Tonic) => void;
  addSection: (name: string, barCount?: number, insertIndex?: number) => void;
  removeSection: (sectionId: string) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  updateSectionBars: (sectionId: string, barCount: number) => void;
  setChord: (
    sectionId: string,
    barPosition: number,
    chord: {
      beat?: number;
      degree: string;
      quality: BarChordDraft["quality"];
      extension?: BarChordDraft["extension"];
      bass_degree?: string | null;
    },
  ) => void;
  clearChord: (sectionId: string, barPosition: number, beat?: number) => void;
  clearBar: (sectionId: string, barPosition: number) => void;
  applyRecommendation: (
    sectionId: string,
    startBar: number,
    steps: Array<{
      degree: string;
      quality: BarChordDraft["quality"];
      extension?: BarChordDraft["extension"];
      bass_degree?: string | null;
    }>,
  ) => void;

  // Selection & Feedback
  setSelectedBlock: (block: SelectedBlock | null) => void;
  setSelectedChord: (target: SelectedChordTarget | null) => void;
  setLastTechnique: (technique: TechniqueFeedback | null) => void;

  // Lifecycle
  markSaved: (serverData: any) => void;
  loadProject: (serverData: any) => void;
  resetToEmpty: (name?: string, tonic?: Tonic) => void;
  loadDefaultPreset: () => void;
};

const ProjectDraftContext = createContext<ProjectDraftContextType | null>(null);

export function useProjectDraft(): ProjectDraftContextType {
  const context = useContext(ProjectDraftContext);
  if (!context) {
    throw new Error("useProjectDraft must be used within a ProjectDraftProvider");
  }
  return context;
}

export function ProjectDraftProvider({
  children,
  initialProject,
}: {
  children: React.ReactNode;
  initialProject?: ProjectDraft;
}) {
  const [project, dispatch] = useReducer(
    projectDraftReducer,
    initialProject ?? createDefaultPopProject(),
  );

  const [isDirty, setIsDirty] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<SelectedBlock | null>(null);
  const [selectedChord, setSelectedChord] = useState<SelectedChordTarget | null>(
    null,
  );
  const [lastTechnique, setLastTechnique] = useState<TechniqueFeedback | null>(
    null,
  );

  const dispatchAction = useCallback((action: DraftAction) => {
    dispatch(action);
    setIsDirty(true);
  }, []);

  const updateMeta = useCallback(
    (name: string, tonic?: Tonic) => {
      dispatchAction({ type: "UPDATE_META", payload: { name, tonic } });
    },
    [dispatchAction],
  );

  const addSection = useCallback(
    (name: string, barCount = 4, insertIndex?: number) => {
      dispatchAction({
        type: "ADD_SECTION",
        payload: { name, barCount, insertIndex },
      });
    },
    [dispatchAction],
  );

  const removeSection = useCallback(
    (sectionId: string) => {
      dispatchAction({ type: "REMOVE_SECTION", payload: { sectionId } });
      if (selectedBlock?.sectionId === sectionId) {
        setSelectedBlock(null);
      }
      if (selectedChord?.sectionId === sectionId) {
        setSelectedChord(null);
      }
    },
    [dispatchAction, selectedBlock, selectedChord],
  );

  const reorderSections = useCallback(
    (fromIndex: number, toIndex: number) => {
      dispatchAction({
        type: "REORDER_SECTIONS",
        payload: { fromIndex, toIndex },
      });
    },
    [dispatchAction],
  );

  const updateSectionBars = useCallback(
    (sectionId: string, barCount: number) => {
      dispatchAction({
        type: "UPDATE_SECTION_BARS",
        payload: { sectionId, barCount },
      });
    },
    [dispatchAction],
  );

  const setChord = useCallback(
    (
      sectionId: string,
      barPosition: number,
      chord: {
        beat?: number;
        degree: string;
        quality: BarChordDraft["quality"];
        extension?: BarChordDraft["extension"];
        bass_degree?: string | null;
      },
    ) => {
      dispatchAction({
        type: "SET_CHORD",
        payload: { sectionId, barPosition, chord },
      });
    },
    [dispatchAction],
  );

  const clearChord = useCallback(
    (sectionId: string, barPosition: number, beat?: number) => {
      dispatchAction({
        type: "CLEAR_CHORD",
        payload: { sectionId, barPosition, beat },
      });
      // Reset technique when chord is cleared
      setLastTechnique(null);
    },
    [dispatchAction],
  );

  const clearBar = useCallback(
    (sectionId: string, barPosition: number) => {
      dispatchAction({
        type: "CLEAR_BAR",
        payload: { sectionId, barPosition },
      });
      setLastTechnique(null);
    },
    [dispatchAction],
  );

  const applyRecommendation = useCallback(
    (
      sectionId: string,
      startBar: number,
      steps: Array<{
        degree: string;
        quality: BarChordDraft["quality"];
        extension?: BarChordDraft["extension"];
        bass_degree?: string | null;
      }>,
    ) => {
      dispatchAction({
        type: "APPLY_RECOMMENDATION_BLOCK",
        payload: { sectionId, startBar, steps },
      });
    },
    [dispatchAction],
  );

  const markSaved = useCallback((serverData: any) => {
    const hydrated = hydrateProjectDraft(serverData);
    dispatch({ type: "SET_PROJECT", payload: hydrated });
    setIsDirty(false);
  }, []);

  const loadProject = useCallback((serverData: any) => {
    const hydrated = hydrateProjectDraft(serverData);
    dispatch({ type: "SET_PROJECT", payload: hydrated });
    setIsDirty(false);
    setSelectedBlock(null);
    setSelectedChord(null);
    setLastTechnique(null);
  }, []);

  const resetToEmpty = useCallback((name = "새 프로젝트", tonic: Tonic = "C") => {
    const empty = createEmptyProject(name, tonic);
    dispatch({ type: "SET_PROJECT", payload: empty });
    setIsDirty(false);
    setSelectedBlock(null);
    setSelectedChord(null);
    setLastTechnique(null);
  }, []);

  const loadDefaultPreset = useCallback(() => {
    const pop = createDefaultPopProject();
    dispatch({ type: "SET_PROJECT", payload: pop });
    setIsDirty(true);
    setSelectedBlock(null);
    setSelectedChord(null);
    setLastTechnique(null);
  }, []);

  return (
    <ProjectDraftContext.Provider
      value={{
        project,
        isDirty,
        selectedBlock,
        selectedChord,
        lastTechnique,

        updateMeta,
        addSection,
        removeSection,
        reorderSections,
        updateSectionBars,
        setChord,
        clearChord,
        clearBar,
        applyRecommendation,

        setSelectedBlock,
        setSelectedChord,
        setLastTechnique,

        markSaved,
        loadProject,
        resetToEmpty,
        loadDefaultPreset,
      }}
    >
      {children}
    </ProjectDraftContext.Provider>
  );
}
