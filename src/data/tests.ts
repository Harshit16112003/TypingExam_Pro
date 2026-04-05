import { TypingTest } from "../types";
import { SSC_PARAGRAPHS } from "./paragraphs/ssc";
import { BANKING_PARAGRAPHS } from "./paragraphs/banking";
import { CAPF_PARAGRAPHS } from "./paragraphs/capf";
import { KVS_NVS_PARAGRAPHS } from "./paragraphs/kvs_nvs";
import { EMRS_PARAGRAPHS } from "./paragraphs/emrs";
import { RRB_PARAGRAPHS } from "./paragraphs/rrb";
import { MP_POLICE_PARAGRAPHS } from "./paragraphs/mp_police";

const categories = [
  { id: "ssc", name: "SSC CGL", icon: "https://upload.wikimedia.org/wikipedia/en/thumb/0/0b/Staff_Selection_Commission_Logo.svg/1200px-Staff_Selection_Commission_Logo.svg.png", paragraphs: SSC_PARAGRAPHS },
  { id: "banking", name: "Banking Exams", icon: "https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Institute_of_Banking_Personnel_Selection_Logo.svg/1200px-Institute_of_Banking_Personnel_Selection_Logo.svg.png", paragraphs: BANKING_PARAGRAPHS },
  { id: "capf", name: "CAPF HCM", icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Central_Armed_Police_Forces_Logo.png/600px-Central_Armed_Police_Forces_Logo.png", paragraphs: CAPF_PARAGRAPHS },
  { id: "kvs", name: "KVS NVS", icon: "https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/Kendriya_Vidyalaya_Sangathan_Logo.svg/1200px-Kendriya_Vidyalaya_Sangathan_Logo.svg.png", paragraphs: KVS_NVS_PARAGRAPHS },
  { id: "emrs", name: "EMRS JSA", icon: "https://tribal.nic.in/EMRS/images/logo.png", paragraphs: EMRS_PARAGRAPHS },
  { id: "rrb", name: "RRB NTPC", icon: "https://upload.wikimedia.org/wikipedia/en/thumb/4/45/Indian_Railways_logo.svg/1200px-Indian_Railways_logo.svg.png", paragraphs: RRB_PARAGRAPHS },
  { id: "mp-police", name: "MP POLICE CLERK", icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Seal_of_Madhya_Pradesh.svg/1200px-Seal_of_Madhya_Pradesh.svg.png", paragraphs: MP_POLICE_PARAGRAPHS }
];

export const EXAM_CATEGORIES = categories.map(({ paragraphs, ...rest }) => rest);

const getDifficulty = (index: number): "Easy" | "Medium" | "Hard" => {
  if (index % 3 === 0) return "Easy";
  if (index % 3 === 1) return "Medium";
  return "Hard";
};

export const ALL_TESTS: TypingTest[] = categories.flatMap(cat => 
  Array.from({ length: 50 }, (_, i) => {
    const paragraphIndex = i % cat.paragraphs.length;
    const difficulty = getDifficulty(i);
    
    return {
      id: `${cat.id}-${i + 1}`,
      title: `${cat.name} Typing Test - Set ${i + 1}`,
      category: cat.name,
      content: cat.paragraphs[paragraphIndex],
      duration: cat.id === "ssc" ? 600 : 300,
      isPremium: i >= 2,
      difficulty
    };
  })
);

export const getMergedTests = (firestoreParagraphs: any[]): TypingTest[] => {
  const dynamicTests: TypingTest[] = firestoreParagraphs.map((p, i) => ({
    id: `dynamic-${p.id}`,
    title: `${p.category} Custom Test - ${i + 1}`,
    category: p.category,
    content: p.text,
    duration: 300,
    isPremium: true,
    difficulty: p.difficulty
  }));

  return [...ALL_TESTS, ...dynamicTests];
};
