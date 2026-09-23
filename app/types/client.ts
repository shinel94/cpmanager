import type { Extension, Quality, Tonic } from "@/app/lib/shared/catalog/chord-catalog";

export type KeyTonic = Tonic;

export type BarChordDraft = {
  id: string;
  beat: number; // 1 ~ 4
  degree: string; // I, II, bVI, etc.
  quality: Quality; // major, minor, dominant, etc.
  extension: Extension; // 7, maj7, 9, etc.
  bass_degree: string | null;
};

export type BarDraft = {
  id: string;
  position: number; // 1-indexed within section
  chords: BarChordDraft[];
};

export type SectionDraft = {
  id: string;
  name: string; // Intro, Verse, Chorus, etc.
  bar_count: number; // >= 1
  position: number; // 0-indexed within project
  bars: BarDraft[];
};

export type ProjectDraft = {
  id: number | null; // null for unsaved local project
  name: string;
  tonic: Tonic;
  mode: "major";
  tempo?: number; // default 120
  time_signature?: string; // default "4/4"
  sections: SectionDraft[];
  createdAt?: string;
  updatedAt?: string;
};

export type SelectedBlock = {
  sectionId: string;
  startBar: number; // 1, 5, etc.
  endBar: number; // 4, 8, etc.
};

export type SelectedChordTarget = {
  sectionId: string;
  barPosition: number;
  beat: number;
};

export type ProgressionPatternFeedback = {
  type: "cadence" | "progression" | "bassline";
  name: string;
  description: string;
  bars: number[];
};

export type TechniqueAlternative = {
  id: number;
  name: string;
  description: string;
  confidence: number;
  evidence?: string[];
};

export type TechniqueFeedback = {
  id: number;
  name: string;
  description: string;
  targetBarPosition?: number;
  targetBeat?: number;
  confidence?: number;
  evidence?: string[];
  targetDegree?: string;
  sourceMode?: string;
  inversion?: string;
  progressionPattern?: ProgressionPatternFeedback | null;
  progressionAlternatives?: ProgressionPatternFeedback[];
  alternatives?: TechniqueAlternative[];
};

export type RecommendationStep = {
  position: number;
  degree: string;
  quality: Quality;
  extension?: Extension;
  bass_degree?: string | null;
  displayName?: string;
};

export type RecommendationItem = {
  id: number;
  name: string;
  description?: string | null;
  diversityGroup?: string | null;
  formTags?: string[];
  steps: RecommendationStep[];
};

export type SerializedProjectPayload = {
  name: string;
  tonic: Tonic;
  mode: "major";
  tempo: number;
  time_signature: string;
  sections: Array<{
    position: number;
    name: string;
    bar_count: number;
    bars: Array<{
      position: number;
      chords: Array<{
        beat: number;
        degree: string;
        quality: Quality;
        extension: Extension;
        bass_degree: string | null;
      }>;
    }>;
  }>;
};

export type UserProgressionStep = {
  position: number;
  degree: string;
  quality: Quality;
  extension?: Extension | null;
  bass_degree?: string | null;
};

export type UserProgressionItem = {
  id: number;
  name: string;
  description?: string | null;
  formTags: string[];
  steps: UserProgressionStep[];
  created_at: string;
};
