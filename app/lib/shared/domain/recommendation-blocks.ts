export type BarInput<T = unknown> = {
  position: number;
  chords: T[];
};

export type RecommendationBlock<T = unknown> = {
  start: number;
  end: number;
  bars: BarInput<T>[];
  eligible: boolean;
  reason: "multi_chord_excluded" | "too_short" | null;
};

export function partitionRecommendationBlocks<T>(input: BarInput<T>[]): RecommendationBlock<T>[] {
  const bars = [...input].sort((a, b) => a.position - b.position);
  const blocks: RecommendationBlock<T>[] = [];

  for (let index = 0; index < bars.length; index += 4) {
    const blockBars = bars.slice(index, index + 4);
    const isFullBlock = blockBars.length === 4;
    const hasMultipleChords = blockBars.some((bar) => bar.chords.length > 1);
    const reason = !isFullBlock
      ? "too_short"
      : hasMultipleChords
        ? "multi_chord_excluded"
        : null;

    blocks.push({
      start: blockBars[0]?.position ?? index + 1,
      end: blockBars.at(-1)?.position ?? index,
      bars: blockBars,
      eligible: reason === null,
      reason,
    });
  }

  return blocks;
}

export function isBlockFilled<T>(block: RecommendationBlock<T>): boolean {
  return block.eligible && block.bars.every((bar) => bar.chords.length === 1);
}
