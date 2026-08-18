import { TRIAD_ANSWERS, TRIAD_GUESS_SET } from "../data/triad-words";
import { hashString, mulberry32, shuffle } from "./rng";

export const TRIAD_BOARD_COUNT = 3;
export const TRIAD_WORD_LENGTH = 5;
export const TRIAD_MAX_GUESSES = 8;
export const TRIAD_LABELS = ["A", "B", "C"] as const;

export type TileMark = "exact" | "present" | "absent";

export interface TriadPuzzle {
  date: string;
  answers: readonly [string, string, string];
}

export interface BoardCloseness {
  index: number;
  solved: boolean;
  exact: number;
  present: number;
}

/** Duplicate-aware letter marks for one guess against one answer. */
export function scoreGuess(guess: string, answer: string): TileMark[] {
  const marks: TileMark[] = Array.from({ length: TRIAD_WORD_LENGTH }, () => "absent");
  const remaining: Record<string, number> = {};

  for (let i = 0; i < TRIAD_WORD_LENGTH; i++) {
    const answerCh = answer[i]!;
    if (guess[i] === answerCh) {
      marks[i] = "exact";
    } else {
      remaining[answerCh] = (remaining[answerCh] ?? 0) + 1;
    }
  }

  for (let i = 0; i < TRIAD_WORD_LENGTH; i++) {
    if (marks[i] === "exact") continue;
    const ch = guess[i]!;
    const left = remaining[ch] ?? 0;
    if (left > 0) {
      marks[i] = "present";
      remaining[ch] = left - 1;
    }
  }

  return marks;
}

export function isAllowedGuess(word: string): boolean {
  return word.length === TRIAD_WORD_LENGTH && TRIAD_GUESS_SET.has(word);
}

export function closenessForBoard(guesses: readonly string[], answer: string): Omit<BoardCloseness, "index"> {
  const exactPos = new Set<number>();
  const inWord = new Set<string>();
  let solved = false;

  for (const guess of guesses) {
    const marks = scoreGuess(guess, answer);
    for (let i = 0; i < marks.length; i++) {
      const mark = marks[i]!;
      const ch = guess[i]!;
      if (mark === "exact") {
        exactPos.add(i);
        inWord.add(ch);
      } else if (mark === "present") {
        inWord.add(ch);
      }
    }
    if (guess === answer) solved = true;
  }

  return { solved, exact: exactPos.size, present: inWord.size };
}

/** Unsolved boards first, then most locked letters, then known-in-word letters. */
export function rankBoardOrder(guesses: readonly string[], answers: readonly string[]): number[] {
  const scored: BoardCloseness[] = answers.map((answer, index) => ({
    index,
    ...closenessForBoard(guesses, answer),
  }));

  scored.sort((a, b) => {
    if (a.solved !== b.solved) return a.solved ? 1 : -1;
    if (b.exact !== a.exact) return b.exact - a.exact;
    if (b.present !== a.present) return b.present - a.present;
    return a.index - b.index;
  });

  return scored.map((item) => item.index);
}

export function generateTriad(dateKey: string): TriadPuzzle {
  const rng = mulberry32(hashString(`triad:${dateKey}`));
  const pool = shuffle(TRIAD_ANSWERS, rng);
  const answers = [pool[0]!, pool[1]!, pool[2]!] as [string, string, string];
  return { date: dateKey, answers };
}
