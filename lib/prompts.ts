export type PromptCategory = "사물/현상" | "감정/상태";

export interface Prompt {
  text: string;
  category: PromptCategory;
}

export const prompts: Prompt[] = [
  { text: "식은 커피", category: "사물/현상" },
  { text: "충전기 선", category: "사물/현상" },
  { text: "배터리 3%", category: "사물/현상" },
  { text: "냉장고 속 먹다 남긴 반찬", category: "사물/현상" },
  { text: "오래된 포스트잇", category: "사물/현상" },
  { text: "비 오는 날 창문", category: "사물/현상" },
  { text: "새벽 4시의 스마트폰 화면", category: "사물/현상" },

  { text: "번아웃", category: "감정/상태" },
  { text: "애매한 귀찮음", category: "감정/상태" },
  { text: "작업 직전의 딴짓", category: "감정/상태" },
  { text: "밥 먹고 난 뒤의 무기력", category: "감정/상태" },
  { text: "마감 하루 전의 각성", category: "감정/상태" },
  { text: "자려고 누웠는데 잠이 안 오는 상태", category: "감정/상태" },
  { text: "뭔가 해야 하는데 뭘 해야 할지 모르는 상태", category: "감정/상태" },
];

export function getRandomPrompt(exclude?: string): Prompt {
  const candidates = exclude
    ? prompts.filter((p) => p.text !== exclude)
    : prompts;
  return candidates[Math.floor(Math.random() * candidates.length)];
}
