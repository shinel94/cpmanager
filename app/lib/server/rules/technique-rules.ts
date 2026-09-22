export type TechniqueRule = {
  id: number;
  name: string;
  rule_type: string;
  condition: Record<string, unknown>;
  description: string;
  priority: number;
};

export const TECHNIQUE_RULES: TechniqueRule[] = [
  {
    id: 1,
    name: "모달 인터체인지",
    rule_type: "modal_interchange",
    condition: {
      before: { quality: "major" },
      after: { quality: "minor" },
      same_root_degree: true,
      within_block: true,
    },
    description: "같은 으뜸음의 평행조에서 화음을 빌려 온 진행입니다.",
    priority: 100,
  },
  {
    id: 2,
    name: "모달 인터체인지",
    rule_type: "modal_interchange",
    condition: {
      after: { degree: "bVI", quality: "major" },
      within_block: true,
    },
    description: "평행 단조에서 bVI 화음을 빌려 온 진행입니다.",
    priority: 90,
  },
  {
    id: 3,
    name: "세컨더리 도미넌트",
    rule_type: "secondary_dominant",
    condition: {
      changed: { quality: "dominant", extension: "7" },
      resolves_to_next_degree: true,
      within_block: true,
    },
    description: "다음 화음을 임시로 으뜸음처럼 취급하는 도미넌트 7화음입니다.",
    priority: 100,
  },
  {
    id: 4,
    name: "슬래시 코드",
    rule_type: "slash_chord",
    condition: {
      after: { bass_degree: { exists: true } },
      within_block: true,
    },
    description: "코드의 기본음이 아닌 베이스 음을 사용한 슬래시 코드입니다.",
    priority: 80,
  },
  {
    id: 5,
    name: "코드 텐션·변형",
    rule_type: "chord_variation",
    condition: {
      extension_changed: true,
      within_block: true,
    },
    description: "기본 화음에 텐션 또는 다른 코드 속성을 추가한 변형입니다.",
    priority: 50,
  },
  {
    id: 6,
    name: "모달 인터체인지",
    rule_type: "modal_interchange",
    condition: {
      after: { degree: "bVII", quality: "major" },
      source_mode: "Mixolydian/Aeolian",
      within_block: true,
    },
    description: "믹솔리디안 또는 평행 단조에서 bVII 화음을 차용한 진행입니다.",
    priority: 90,
  },
  {
    id: 7,
    name: "모달 인터체인지",
    rule_type: "modal_interchange",
    condition: {
      after: { degree: "bIII", quality: "major" },
      source_mode: "Aeolian",
      within_block: true,
    },
    description: "평행 단조에서 bIII 화음을 차용한 진행입니다.",
    priority: 90,
  },
  {
    id: 8,
    name: "세컨더리 리딩톤 디미니시드",
    rule_type: "secondary_leading_tone",
    condition: {
      changed_qualities: ["diminished", "half-diminished"],
      resolves_by_semitone: true,
      within_block: true,
    },
    description: "다음 화음으로 반음 상행 해결되는 이끔음 감화음입니다.",
    priority: 95,
  },
  {
    id: 9,
    name: "트라이톤 대리",
    rule_type: "tritone_substitution",
    condition: { dominant_substitution: true, resolves_to_next: true, within_block: true },
    description: "기존 도미넌트를 반음 위의 대리 도미넌트로 바꾼 진행입니다.",
    priority: 95,
  },
  {
    id: 10,
    name: "백도어 도미넌트",
    rule_type: "backdoor_dominant",
    condition: { degree: "bVII", resolves_to: "I", within_block: true },
    description: "bVII 도미넌트가 토닉으로 해결되는 백도어 도미넌트입니다.",
    priority: 94,
  },
  {
    id: 11,
    name: "크로매틱 미디언트",
    rule_type: "chromatic_mediant",
    condition: { same_quality: true, third_relation: true, within_block: true },
    description: "장3도 또는 단3도 관계의 색채적 화음으로 이동하는 크로매틱 미디언트입니다.",
    priority: 75,
  },
  {
    id: 12,
    name: "패싱 디미니시드",
    rule_type: "passing_diminished",
    condition: { diminished_between_stepwise_chords: true, within_block: true },
    description: "인접한 화음 사이를 연결하는 패싱 디미니시드입니다.",
    priority: 74,
  },
  {
    id: 13,
    name: "공통음 디미니시드",
    rule_type: "common_tone_diminished",
    condition: { diminished_with_common_target: true, within_block: true },
    description: "공통음 또는 공통 기능을 중심으로 연결되는 디미니시드 화음입니다.",
    priority: 73,
  },
];
