import { calculateBassLineMotion, getSemitoneInterval } from "@/app/lib/server/domain/harmonic-math";
import { normalizeAnalysisInput, type NormalizedBar } from "@/app/lib/server/domain/analysis-context";
import type { ChordStep } from "@/app/lib/server/catalog/chord-catalog";

export type ProgressionPattern = {
  type: "cadence" | "progression" | "bassline";
  name: string;
  description: string;
  bars: number[];
  confidence: number;
};

type PositionedChord = { position: number; chord: ChordStep };

function singleChords(bars: NormalizedBar[]): PositionedChord[] {
  if (bars.some((bar) => bar.chords.length > 1)) return [];
  return bars
    .filter((bar) => bar.chords.length === 1)
    .map((bar) => ({ position: bar.position, chord: bar.chords[0] }));
}

function isMajorOrDominant(chord: ChordStep, degree: string): boolean {
  return chord.degree === degree && (chord.quality === "major" || chord.quality === "dominant");
}

function isMinor(chord: ChordStep, degree: string): boolean {
  return chord.degree === degree && chord.quality === "minor";
}

function sameChord(left: ChordStep, right: ChordStep): boolean {
  return left.degree === right.degree && left.quality === right.quality && left.extension === right.extension && left.bass_degree === right.bass_degree;
}

export function analyzeProgression(input: unknown): ProgressionPattern[] {
  const context = normalizeAnalysisInput(input);
  const chords = singleChords(context.bars);
  if (chords.length < 2) return [];

  const patterns: ProgressionPattern[] = [];
  const lastTwo = chords.slice(-2);
  const lastThree = chords.slice(-3);

  if (lastTwo.length === 2 && isMajorOrDominant(lastTwo[0].chord, "V") && isMajorOrDominant(lastTwo[1].chord, "I")) {
    patterns.push({ type: "cadence", name: "정격 종지", description: "도미넌트에서 토닉으로 해결되는 정격 종지입니다.", bars: lastTwo.map((item) => item.position), confidence: 0.98 });
  } else if (lastTwo.length === 2 && isMajorOrDominant(lastTwo[0].chord, "IV") && isMajorOrDominant(lastTwo[1].chord, "I")) {
    patterns.push({ type: "cadence", name: "변격 종지", description: "서브도미넌트에서 토닉으로 진행하는 변격 종지입니다.", bars: lastTwo.map((item) => item.position), confidence: 0.94 });
  } else if (lastTwo.length === 2 && isMajorOrDominant(lastTwo[0].chord, "V") && isMinor(lastTwo[1].chord, "VI")) {
    patterns.push({ type: "cadence", name: "기만 종지", description: "도미넌트가 토닉 대신 VI도로 진행하는 기만 종지입니다.", bars: lastTwo.map((item) => item.position), confidence: 0.94 });
  } else if (lastTwo.length === 2 && isMajorOrDominant(lastTwo[1].chord, "V")) {
    patterns.push({ type: "cadence", name: "반종지", description: "프레이즈가 도미넌트에 머물러 긴장감을 유지하는 반종지입니다.", bars: [lastTwo[1].position], confidence: 0.86 });
  }

  for (let index = 0; index <= chords.length - 3; index += 1) {
    const triple = chords.slice(index, index + 3);
    if (isMinor(triple[0].chord, "II") && isMajorOrDominant(triple[1].chord, "V") && isMajorOrDominant(triple[2].chord, "I")) {
      patterns.push({ type: "progression", name: "ii - V - I 진행", description: "서브도미넌트에서 도미넌트를 거쳐 토닉으로 해결되는 대표 진행입니다.", bars: triple.map((item) => item.position), confidence: 0.98 });
    }
    if (isMajorOrDominant(triple[0].chord, "IV") && isMajorOrDominant(triple[1].chord, "V") && isMajorOrDominant(triple[2].chord, "I")) {
      patterns.push({ type: "progression", name: "IV - V - I 진행", description: "서브도미넌트와 도미넌트를 거쳐 토닉으로 해결되는 진행입니다.", bars: triple.map((item) => item.position), confidence: 0.94 });
    }
  }

  if (chords.length >= 3) {
    const circleBars = chords.every((item, index) => index === 0 || getSemitoneInterval(chords[index - 1].chord.degree, item.chord.degree) === 5);
    if (circleBars) {
      patterns.push({ type: "progression", name: "5도권 순환 진행", description: "연속된 코드 루트가 5도권 방향으로 순환하는 진행입니다.", bars: chords.map((item) => item.position), confidence: 0.88 });
    }
  }

  if (chords.length === 4 && sameChord(chords[0].chord, chords[2].chord) && sameChord(chords[1].chord, chords[3].chord)) {
    patterns.push({ type: "progression", name: "반복 루프 진행", description: "두 코드 블록이 반복되는 루프형 진행입니다.", bars: chords.map((item) => item.position), confidence: 0.82 });
  }

  const bassMotion = calculateBassLineMotion(chords.map((item) => item.chord.bass_degree ?? item.chord.degree));
  if (bassMotion !== "none") {
    const names = {
      stepwise_down: "하강 베이스 라인",
      stepwise_up: "상승 베이스 라인",
      pedal: "페달 포인트",
    } as const;
    patterns.push({
      type: "bassline",
      name: names[bassMotion],
      description: "코드 변화 속에서 베이스가 일정한 방향 또는 음을 유지하는 진행입니다.",
      bars: chords.map((item) => item.position),
      confidence: 0.86,
    });
  }

  return patterns.sort((left, right) => right.confidence - left.confidence);
}
