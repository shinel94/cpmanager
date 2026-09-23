import type { BarChordDraft, ProjectDraft, SectionDraft } from "@/app/types/client";
import { chordToVoicedNotes, type VoicedChord } from "@/app/lib/shared/domain/chord-voicer";
import type { Tonic } from "@/app/lib/shared/catalog/chord-catalog";

export type PlaybackChordEvent = {
  sectionId: string;
  sectionName: string;
  barPosition: number;
  beat: number; // 1 ~ 4
  timeBeats: number; // 전체 타임라인 누적 비트 (0부터 시작)
  durationBeats: number; // 몇 비트 동안 울리는지 (1 ~ 4)
  voiced: VoicedChord | null; // null이면 쉼표(Rest)
  isRest: boolean;
};

/**
 * 마디 내의 코드 목록(beat 1~4)을 검사하여 각 코드의 지속 시간(비트 수)을 계산합니다.
 * 4/4 박자 기준 (마디당 4비트)
 */
export function calculateBarChordDurations(
  chords: BarChordDraft[]
): Array<{ chord: BarChordDraft; durationBeats: number }> {
  if (!chords || chords.length === 0) return [];

  // beat 기준 오름차순 정렬 및 1~4 범위 필터
  const sorted = [...chords]
    .filter((c) => c.beat >= 1 && c.beat <= 4)
    .sort((a, b) => a.beat - b.beat);

  if (sorted.length === 0) return [];

  const results: Array<{ chord: BarChordDraft; durationBeats: number }> = [];

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];
    // 다음 코드가 있으면 그 사이의 비트 차이, 없으면 마디 끝(5)까지의 차이
    const nextBeat = next ? next.beat : 5;
    const durationBeats = Math.max(1, nextBeat - current.beat);

    results.push({
      chord: current,
      durationBeats,
    });
  }

  return results;
}

export type BuildTimelineOptions = {
  targetSectionId?: string; // 특정 섹션만 필터링할 경우
};

/**
 * ProjectDraft 전체를 순회하며 순차적인 마디/비트 단위 타임라인 이벤트를 생성합니다.
 */
export function buildProjectPlaybackTimeline(
  project: ProjectDraft,
  options?: BuildTimelineOptions
): PlaybackChordEvent[] {
  const events: PlaybackChordEvent[] = [];
  const tonic: Tonic = project.tonic ?? "C";

  let sectionsToPlay = project.sections;
  if (options?.targetSectionId) {
    sectionsToPlay = project.sections.filter((s) => s.id === options.targetSectionId);
  }

  let accumulatedBeats = 0;

  for (const section of sectionsToPlay) {
    const barCount = Math.max(1, section.bar_count);

    // 1부터 barCount까지 순차 순회
    for (let barIdx = 1; barIdx <= barCount; barIdx++) {
      const bar = section.bars.find((b) => b.position === barIdx);
      const chords = bar?.chords ?? [];
      const scheduledChords = calculateBarChordDurations(chords);

      if (scheduledChords.length === 0) {
        // 코드가 없는 빈 마디 -> 4비트짜리 쉼표 이벤트 등록
        events.push({
          sectionId: section.id,
          sectionName: section.name,
          barPosition: barIdx,
          beat: 1,
          timeBeats: accumulatedBeats,
          durationBeats: 4,
          voiced: null,
          isRest: true,
        });
      } else {
        // 첫 번째 코드가 1박이 아닐 경우(예: 3박부터 시작), 1박부터 시작 코드 전까지 쉼표 생성
        const firstChord = scheduledChords[0];
        if (firstChord.chord.beat > 1) {
          const restDuration = firstChord.chord.beat - 1;
          events.push({
            sectionId: section.id,
            sectionName: section.name,
            barPosition: barIdx,
            beat: 1,
            timeBeats: accumulatedBeats,
            durationBeats: restDuration,
            voiced: null,
            isRest: true,
          });
        }

        // 유효 코드 이벤트 등록
        for (const item of scheduledChords) {
          const voiced = chordToVoicedNotes(tonic, {
            degree: item.chord.degree,
            quality: item.chord.quality,
            extension: item.chord.extension,
            bass_degree: item.chord.bass_degree,
          });

          events.push({
            sectionId: section.id,
            sectionName: section.name,
            barPosition: barIdx,
            beat: item.chord.beat,
            timeBeats: accumulatedBeats + (item.chord.beat - 1),
            durationBeats: item.durationBeats,
            voiced,
            isRest: false,
          });
        }
      }

      // 4/4 박자: 마디당 4비트 누적
      accumulatedBeats += 4;
    }
  }

  return events;
}
