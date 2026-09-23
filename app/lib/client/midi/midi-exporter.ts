import MidiWriter from "midi-writer-js";
import { chordToVoicedNotes } from "@/app/lib/shared/domain/chord-voicer";
import { calculateBarChordDurations } from "@/app/lib/client/audio/timeline-calculator";
import type { ProjectDraft } from "@/app/types/client";

export type MidiExportOptions = {
  targetSectionId?: string;
  filename?: string;
};

/**
 * 박자 수(durationBeats)를 midi-writer-js duration 코드로 변환
 */
export function beatsToMidiDuration(durationBeats: number): string {
  if (durationBeats >= 4) return "1"; // 온음표 (4박)
  if (durationBeats === 3) return "d2"; // 점2분음표 (3박)
  if (durationBeats === 2) return "2"; // 2분음표 (2박)
  if (durationBeats === 1) return "4"; // 4분음표 (1박)
  if (durationBeats === 0.5) return "8"; // 8분음표 (0.5박)
  return "4";
}

/**
 * ProjectDraft 데이터를 표준 MIDI 파일 (SMF Type 1 멀티트랙) 바이너리로 인코딩합니다.
 * Track 1: 화음 트랙 (Chords, C3~C5, 채널 1, 벨로시티 75, 섹션 마커 포함)
 * Track 2: 베이스 트랙 (Bass, C1~C2, 채널 2, 벨로시티 85)
 */
export function generateProjectMidi(
  project: ProjectDraft,
  options?: MidiExportOptions
): Uint8Array {
  const chordTrack = new MidiWriter.Track();
  const bassTrack = new MidiWriter.Track();

  const bpm = project.tempo || 120;
  chordTrack.setTempo(bpm);
  chordTrack.setTimeSignature(4, 4, 24, 8);

  // 조표(Key Signature) 설정
  try {
    chordTrack.setKeySignature(project.tonic || "C", 0);
  } catch {
    // Non-critical fallback for non-standard tonic
  }

  chordTrack.addTrackName(`${project.name || "Project"} - Chords`);
  bassTrack.addTrackName(`${project.name || "Project"} - Bass`);

  const sectionsToExport = options?.targetSectionId
    ? project.sections.filter((s) => s.id === options.targetSectionId)
    : project.sections;

  let cumulativeBarIndex = 0;

  for (const section of sectionsToExport) {
    const sectionStartTick = cumulativeBarIndex * 512;
    // DAW 상단 타임라인에 표시될 섹션 마커 삽입
    chordTrack.addEvent(
      new (MidiWriter.MarkerEvent as any)({
        text: section.name,
        tick: sectionStartTick,
      })
    );

    for (let barPos = 1; barPos <= section.bar_count; barPos++) {
      const bar = section.bars.find((b) => b.position === barPos);
      const currentBarIndex = cumulativeBarIndex;
      cumulativeBarIndex++;

      if (!bar || bar.chords.length === 0) {
        // 코드가 없는 빈 마디는 startTick 스케줄링으로 무음 처리되며 타임라인 붕괴를 방지함
        continue;
      }

      const chordDurations = calculateBarChordDurations(bar.chords);

      for (const { chord, durationBeats } of chordDurations) {
        const beat = chord.beat || 1;
        // 절대 틱 위치: 1마디 = 512 ticks, 1박 = 128 ticks
        const chordTick = currentBarIndex * 512 + (beat - 1) * 128;
        const durationCode = beatsToMidiDuration(durationBeats);

        const voiced = chordToVoicedNotes(project.tonic, chord);

        if (voiced.chordNotes.length > 0) {
          chordTrack.addEvent(
            new MidiWriter.NoteEvent({
              pitch: voiced.chordNotes,
              duration: durationCode,
              startTick: chordTick,
              channel: 1,
              velocity: 75,
            })
          );
        }

        if (voiced.bassNote) {
          bassTrack.addEvent(
            new MidiWriter.NoteEvent({
              pitch: [voiced.bassNote],
              duration: durationCode,
              startTick: chordTick,
              channel: 2,
              velocity: 85,
            })
          );
        }
      }
    }
  }

  const totalBars = cumulativeBarIndex;
  // 전체 곡/구간 끝 마커 (마지막 마디가 빈 마디여도 DAW에서 전체 길이 유지)
  if (totalBars > 0) {
    chordTrack.addEvent(
      new (MidiWriter.MarkerEvent as any)({
        text: "End",
        tick: totalBars * 512,
      })
    );
  }

  const writer = new MidiWriter.Writer([chordTrack, bassTrack]);
  return writer.buildFile();
}

/**
 * 브라우저에서 생성된 MIDI 파일을 다운로드합니다.
 */
export function downloadProjectMidi(
  project: ProjectDraft,
  options?: MidiExportOptions
): void {
  if (typeof window === "undefined") return;

  const bytes = generateProjectMidi(project, options);
  const blob = new Blob([bytes as unknown as BlobPart], { type: "audio/midi" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;

  const baseName = (project.name || "chord-progression").trim();
  const safeName = baseName.replace(/[/\\?%*:|"<>]/g, "_");
  const sectionSuffix = options?.targetSectionId
    ? `_${project.sections.find((s) => s.id === options.targetSectionId)?.name || "section"}`
    : "";

  a.download = options?.filename || `${safeName}${sectionSuffix}.mid`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
