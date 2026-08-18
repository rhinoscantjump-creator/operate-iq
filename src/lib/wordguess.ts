import { WORDGUESS_ANSWERS, WORDGUESS_GUESS_SET } from "../data/wordguess-words";
import { hashString, mulberry32, shuffle } from "./rng";

export const WORDGUESS_BOARD_COUNT = 3;
export const WORDGUESS_WORD_LENGTH = 5;
export const WORDGUESS_MAX_GUESSES = 12;
export const WORDGUESS_LABELS = ["A", "B", "C"] as const;

export type TileMark = "exact" | "present" | "absent";

export interface WordGuessPuzzle {
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
  const marks: TileMark[] = Array.from({ length: WORDGUESS_WORD_LENGTH }, () => "absent");
  const remaining: Record<string, number> = {};

  for (let i = 0; i < WORDGUESS_WORD_LENGTH; i++) {
    const answerCh = answer[i]!;
    if (guess[i] === answerCh) {
      marks[i] = "exact";
    } else {
      remaining[answerCh] = (remaining[answerCh] ?? 0) + 1;
    }
  }

  for (let i = 0; i < WORDGUESS_WORD_LENGTH; i++) {
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
  return word.length === WORDGUESS_WORD_LENGTH && WORDGUESS_GUESS_SET.has(word);
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

/**
 * Display order for a column that sits above the keyboard:
 * solved boards first (away from the keys), then least-close unsolved,
 * so the closest unsolved board lands last — next to the keyboard.
 */
export function rankBoardOrder(guesses: readonly string[], answers: readonly string[]): number[] {
  const scored: BoardCloseness[] = answers.map((answer, index) => ({
    index,
    ...closenessForBoard(guesses, answer),
  }));

  scored.sort((a, b) => {
    if (a.solved !== b.solved) return a.solved ? -1 : 1;
    if (a.exact !== b.exact) return a.exact - b.exact;
    if (a.present !== b.present) return a.present - b.present;
    return a.index - b.index;
  });

  return scored.map((item) => item.index);
}

export function generateWordGuess(dateKey: string): WordGuessPuzzle {
  const rng = mulberry32(hashString(`wordguess:${dateKey}`));
  const pool = shuffle(WORDGUESS_ANSWERS, rng);
  const answers = [pool[0]!, pool[1]!, pool[2]!] as [string, string, string];
  return { date: dateKey, answers };
}
