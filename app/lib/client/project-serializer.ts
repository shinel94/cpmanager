import type {
  BarChordDraft,
  BarDraft,
  ProjectDraft,
  SectionDraft,
  SerializedProjectPayload,
} from "@/app/types/client";
import type { Tonic } from "@/app/lib/shared/catalog/chord-catalog";

export function createTempId(prefix = "temp"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createEmptyBar(position: number): BarDraft {
  return {
    id: createTempId("bar"),
    position,
    chords: [],
  };
}

export function createSection(
  name: string,
  barCount = 4,
  position = 0,
): SectionDraft {
  const bars: BarDraft[] = Array.from({ length: barCount }, (_, index) =>
    createEmptyBar(index + 1),
  );

  return {
    id: createTempId("sec"),
    name,
    bar_count: barCount,
    position,
    bars,
  };
}

export function createEmptyProject(
  name = "새 프로젝트",
  tonic: Tonic = "C",
): ProjectDraft {
  return {
    id: null,
    name,
    tonic,
    mode: "major",
    tempo: 120,
    time_signature: "4/4",
    sections: [],
  };
}

export function createDefaultPopProject(
  name = "새 팝 프로젝트",
  tonic: Tonic = "C",
): ProjectDraft {
  return {
    id: null,
    name,
    tonic,
    mode: "major",
    tempo: 120,
    time_signature: "4/4",
    sections: [
      createSection("Intro", 4, 0),
      createSection("Verse", 8, 1),
      createSection("Chorus", 8, 2),
    ],
  };
}

/**
 * Serializes a ProjectDraft into the payload required by PUT /api/projects/:id
 * Enforces sequential 0-indexed sections (0..N-1) and sequential 1-indexed bars (1..bar_count)
 */
export function serializeProjectDraft(
  draft: ProjectDraft,
): SerializedProjectPayload {
  const sections = draft.sections.map((section, secIdx) => {
    const barCount = Math.max(1, section.bar_count);

    // Map existing bars by position
    const barMap = new Map<number, BarChordDraft[]>();
    for (const bar of section.bars) {
      if (bar.position >= 1 && bar.position <= barCount) {
        barMap.set(bar.position, bar.chords);
      }
    }

    // Ensure exactly barCount sequential bars (1..barCount)
    const bars = Array.from({ length: barCount }, (_, barIdx) => {
      const position = barIdx + 1;
      const existingChords = barMap.get(position) ?? [];

      const chords = existingChords.map((chord) => ({
        beat: chord.beat,
        degree: chord.degree,
        quality: chord.quality,
        extension: chord.extension ?? null,
        bass_degree: chord.bass_degree ?? null,
      }));

      return {
        position,
        chords,
      };
    });

    return {
      position: secIdx,
      name: section.name.trim() || "Section",
      bar_count: barCount,
      bars,
    };
  });

  return {
    name: draft.name.trim() || "Untitled Project",
    tonic: draft.tonic,
    mode: "major",
    tempo: draft.tempo || 120,
    time_signature: draft.time_signature || "4/4",
    sections,
  };
}

/**
 * Hydrates a server project response into a client ProjectDraft
 * Converts integer DB IDs into strings for safe frontend rendering & manipulation
 */
export function hydrateProjectDraft(serverData: any): ProjectDraft {
  const project = serverData?.project ?? serverData;

  const sections: SectionDraft[] = (project?.sections ?? []).map(
    (sec: any, secIdx: number) => {
      const barCount = Number(sec.bar_count) || 4;
      const bars: BarDraft[] = (sec.bars ?? []).map(
        (b: any, barIdx: number) => {
          const chords: BarChordDraft[] = (b.chords ?? []).map((c: any) => ({
            id: String(c.id ?? createTempId("chord")),
            beat: Number(c.beat) || 1,
            degree: String(c.degree),
            quality: c.quality,
            extension: c.extension ?? null,
            bass_degree: c.bass_degree ?? null,
          }));

          return {
            id: String(b.id ?? createTempId("bar")),
            position: Number(b.position) || barIdx + 1,
            chords,
          };
        },
      );

      // If server returned fewer bars than bar_count, pad with empty bars
      while (bars.length < barCount) {
        bars.push(createEmptyBar(bars.length + 1));
      }

      return {
        id: String(sec.id ?? createTempId("sec")),
        name: String(sec.name),
        bar_count: barCount,
        position: Number(sec.position ?? secIdx),
        bars,
      };
    },
  );

  return {
    id: project?.id ? Number(project.id) : null,
    name: String(project?.name ?? "불러온 프로젝트"),
    tonic: (project?.tonic as Tonic) ?? "C",
    mode: "major",
    tempo: Number(project?.tempo) || 120,
    time_signature: String(project?.time_signature ?? "4/4"),
    sections,
    createdAt: project?.created_at,
    updatedAt: project?.updated_at,
  };
}

