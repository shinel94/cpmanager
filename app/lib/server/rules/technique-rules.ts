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
];
