import type {
  BarChordDraft,
  BarDraft,
  ProjectDraft,
  SectionDraft,
} from "@/app/types/client";
import type { Tonic } from "@/app/lib/shared/catalog/chord-catalog";
import {
  createEmptyBar,
  createSection,
  createTempId,
} from "./project-serializer";

export type DraftAction =
  | { type: "SET_PROJECT"; payload: ProjectDraft }
  | { type: "UPDATE_META"; payload: { name?: string; tonic?: Tonic } }
  | { type: "SET_TEMPO"; payload: { tempo: number } }
  | {
      type: "ADD_SECTION";
      payload: { name: string; barCount?: number; insertIndex?: number };
    }
  | {
      type: "ADD_SECTIONS_BULK";
      payload: {
        sections: Array<{ name: string; barCount?: number }>;
        insertIndex?: number;
      };
    }
  | { type: "REMOVE_SECTION"; payload: { sectionId: string } }
  | { type: "REORDER_SECTIONS"; payload: { fromIndex: number; toIndex: number } }
  | {
      type: "UPDATE_SECTION_BARS";
      payload: { sectionId: string; barCount: number };
    }
  | {
      type: "SET_CHORD";
      payload: {
        sectionId: string;
        barPosition: number;
        chord: {
          beat?: number;
          degree: string;
          quality: BarChordDraft["quality"];
          extension?: BarChordDraft["extension"];
          bass_degree?: string | null;
        };
      };
    }
  | {
      type: "CLEAR_CHORD";
      payload: { sectionId: string; barPosition: number; beat?: number };
    }
  | {
      type: "CLEAR_BAR";
      payload: { sectionId: string; barPosition: number };
    }
  | {
      type: "APPLY_RECOMMENDATION_BLOCK";
      payload: {
        sectionId: string;
        startBar: number;
        steps: Array<{
          degree: string;
          quality: BarChordDraft["quality"];
          extension?: BarChordDraft["extension"];
          bass_degree?: string | null;
        }>;
      };
    };

export function projectDraftReducer(
  state: ProjectDraft,
  action: DraftAction,
): ProjectDraft {
  switch (action.type) {
    case "SET_PROJECT":
      return action.payload;

    case "UPDATE_META":
      return {
        ...state,
        name: action.payload.name ?? state.name,
        tonic: action.payload.tonic ?? state.tonic,
      };

    case "SET_TEMPO": {
      const tempo = Math.min(240, Math.max(40, Math.round(action.payload.tempo || 120)));
      return {
        ...state,
        tempo,
      };
    }

    case "ADD_SECTION": {
      const { name, barCount = 4, insertIndex } = action.payload;
      const newSec = createSection(name, barCount, 0);

      const nextSections = [...state.sections];
      if (
        insertIndex !== undefined &&
        insertIndex >= 0 &&
        insertIndex <= nextSections.length
      ) {
        nextSections.splice(insertIndex, 0, newSec);
      } else {
        nextSections.push(newSec);
      }

      // Re-index positions
      return {
        ...state,
        sections: nextSections.map((sec, idx) => ({ ...sec, position: idx })),
      };
    }

    case "ADD_SECTIONS_BULK": {
      const { sections, insertIndex } = action.payload;
      if (!sections || sections.length === 0) return state;

      const newSecs = sections.map((item, idx) =>
        createSection(item.name, item.barCount || 4, 0),
      );

      const nextSections = [...state.sections];
      if (
        insertIndex !== undefined &&
        insertIndex >= 0 &&
        insertIndex <= nextSections.length
      ) {
        nextSections.splice(insertIndex, 0, ...newSecs);
      } else {
        nextSections.push(...newSecs);
      }

      return {
        ...state,
        sections: nextSections.map((sec, idx) => ({ ...sec, position: idx })),
      };
    }

    case "REMOVE_SECTION": {
      const nextSections = state.sections
        .filter((sec) => sec.id !== action.payload.sectionId)
        .map((sec, idx) => ({ ...sec, position: idx }));

      return {
        ...state,
        sections: nextSections,
      };
    }

    case "REORDER_SECTIONS": {
      const { fromIndex, toIndex } = action.payload;
      if (
        fromIndex < 0 ||
        fromIndex >= state.sections.length ||
        toIndex < 0 ||
        toIndex >= state.sections.length ||
        fromIndex === toIndex
      ) {
        return state;
      }

      const nextSections = [...state.sections];
      const [moved] = nextSections.splice(fromIndex, 1);
      nextSections.splice(toIndex, 0, moved);

      return {
        ...state,
        sections: nextSections.map((sec, idx) => ({ ...sec, position: idx })),
      };
    }

    case "UPDATE_SECTION_BARS": {
      const { sectionId, barCount } = action.payload;
      const clampedCount = Math.max(1, barCount);

      return {
        ...state,
        sections: state.sections.map((sec) => {
          if (sec.id !== sectionId) return sec;

          let bars: BarDraft[];
          if (clampedCount > sec.bars.length) {
            // Expand bars
            const addedBars = Array.from(
              { length: clampedCount - sec.bars.length },
              (_, i) => createEmptyBar(sec.bars.length + i + 1),
            );
            bars = [...sec.bars, ...addedBars];
          } else {
            // Trim bars
            bars = sec.bars.slice(0, clampedCount);
          }

          return {
            ...sec,
            bar_count: clampedCount,
            bars,
          };
        }),
      };
    }

    case "SET_CHORD": {
      const { sectionId, barPosition, chord } = action.payload;
      const beat = chord.beat ?? 1;

      return {
        ...state,
        sections: state.sections.map((sec) => {
          if (sec.id !== sectionId) return sec;

          return {
            ...sec,
            bars: sec.bars.map((bar) => {
              if (bar.position !== barPosition) return bar;

              const existingChordIndex = bar.chords.findIndex(
                (c) => c.beat === beat,
              );
              const newChord: BarChordDraft = {
                id:
                  existingChordIndex >= 0
                    ? bar.chords[existingChordIndex].id
                    : createTempId("chord"),
                beat,
                degree: chord.degree,
                quality: chord.quality,
                extension: chord.extension ?? null,
                bass_degree: chord.bass_degree ?? null,
              };

              let nextChords: BarChordDraft[];
              if (existingChordIndex >= 0) {
                nextChords = [...bar.chords];
                nextChords[existingChordIndex] = newChord;
              } else {
                nextChords = [...bar.chords, newChord].sort(
                  (a, b) => a.beat - b.beat,
                );
              }

              return {
                ...bar,
                chords: nextChords,
              };
            }),
          };
        }),
      };
    }

    case "CLEAR_CHORD": {
      const { sectionId, barPosition, beat = 1 } = action.payload;

      return {
        ...state,
        sections: state.sections.map((sec) => {
          if (sec.id !== sectionId) return sec;

          return {
            ...sec,
            bars: sec.bars.map((bar) => {
              if (bar.position !== barPosition) return bar;
              return {
                ...bar,
                chords: bar.chords.filter((c) => c.beat !== beat),
              };
            }),
          };
        }),
      };
    }

    case "CLEAR_BAR": {
      const { sectionId, barPosition } = action.payload;

      return {
        ...state,
        sections: state.sections.map((sec) => {
          if (sec.id !== sectionId) return sec;

          return {
            ...sec,
            bars: sec.bars.map((bar) => {
              if (bar.position !== barPosition) return bar;
              return {
                ...bar,
                chords: [],
              };
            }),
          };
        }),
      };
    }

    case "APPLY_RECOMMENDATION_BLOCK": {
      const { sectionId, startBar, steps } = action.payload;
      if (steps.length !== 4) return state;

      return {
        ...state,
        sections: state.sections.map((sec) => {
          if (sec.id !== sectionId) return sec;

          return {
            ...sec,
            bars: sec.bars.map((bar) => {
              const offset = bar.position - startBar;
              // Check if bar is within this 4-bar window
              if (offset >= 0 && offset < 4) {
                // Non-destructive: only fill empty bars!
                if (bar.chords.length === 0) {
                  const step = steps[offset];
                  const newChord: BarChordDraft = {
                    id: createTempId("rec_chord"),
                    beat: 1,
                    degree: step.degree,
                    quality: step.quality,
                    extension: step.extension ?? null,
                    bass_degree: step.bass_degree ?? null,
                  };
                  return {
                    ...bar,
                    chords: [newChord],
                  };
                }
              }
              return bar;
            }),
          };
        }),
      };
    }

    default:
      return state;
  }
}
