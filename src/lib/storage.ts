import { addUtcDays } from "./date";

export type PuzzleId = "wordsearch" | "sudoku" | "wordguess";

const LAST_DATE: Record<PuzzleId, keyof Streaks> = {
  wordsearch: "lastWordsearchDate",
  sudoku: "lastSudokuDate",
  wordguess: "lastWordGuessDate",
};

export interface Streaks {
  wordsearch: number;
  sudoku: number;
  wordguess: number;
  lastWordsearchDate: string | null;
  lastSudokuDate: string | null;
  lastWordGuessDate: string | null;
}

export interface WordsearchProgress {
  date: string;
  found: string[];
  completed: boolean;
}

export interface SudokuProgress {
  date: string;
  entries: (number | null)[][];
  notes: number[][][];
  completed: boolean;
}

export interface WordGuessProgress {
  date: string;
  guesses: string[];
  completed: boolean;
  failed: boolean;
}

const STREAK_KEY = "oiq.streaks.v1";
const WS_KEY = "oiq.wordsearch.v1";
const SDK_KEY = "oiq.sudoku.v1";
const WORDGUESS_KEY = "oiq.wordguess.v1";

function canUseStorage(): boolean {
  try {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  } catch {
    return false;
  }
}

function readJson<T>(key: string): T | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode / quota — play without persistence.
  }
}

function emptyStreaks(): Streaks {
  return {
    wordsearch: 0,
    sudoku: 0,
    wordguess: 0,
    lastWordsearchDate: null,
    lastSudokuDate: null,
    lastWordGuessDate: null,
  };
}

export function loadStreaks(): Streaks {
  const stored = readJson<Partial<Streaks>>(STREAK_KEY);
  return { ...emptyStreaks(), ...stored };
}

export function saveStreaks(streaks: Streaks): void {
  writeJson(STREAK_KEY, streaks);
}

export function recordCompletion(id: PuzzleId, today: string): Streaks {
  const streaks = loadStreaks();
  const lastField = LAST_DATE[id];
  const last = streaks[lastField];
  if (last === today) return streaks;

  const yesterday = addUtcDays(today, -1);
  const nextCount = last === yesterday ? streaks[id] + 1 : 1;
  const next: Streaks = { ...streaks, [id]: nextCount, [lastField]: today };
  saveStreaks(next);
  return next;
}

export function loadWordsearchProgress(today: string): WordsearchProgress {
  const stored = readJson<WordsearchProgress>(WS_KEY);
  if (!stored || stored.date !== today) {
    return { date: today, found: [], completed: false };
  }
  return stored;
}

export function saveWordsearchProgress(progress: WordsearchProgress): void {
  writeJson(WS_KEY, progress);
}

export function loadSudokuProgress(today: string): SudokuProgress {
  const stored = readJson<SudokuProgress>(SDK_KEY);
  if (!stored || stored.date !== today) {
    return {
      date: today,
      entries: Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => null)),
      notes: Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => [])),
      completed: false,
    };
  }
  return stored;
}

export function saveSudokuProgress(progress: SudokuProgress): void {
  writeJson(SDK_KEY, progress);
}

export function loadWordGuessProgress(today: string): WordGuessProgress {
  const stored = readJson<WordGuessProgress>(WORDGUESS_KEY);
  if (!stored || stored.date !== today) {
    return { date: today, guesses: [], completed: false, failed: false };
  }
  return {
    date: stored.date,
    guesses: stored.guesses ?? [],
    completed: Boolean(stored.completed),
    failed: Boolean(stored.failed),
  };
}

export function saveWordGuessProgress(progress: WordGuessProgress): void {
  writeJson(WORDGUESS_KEY, progress);
}

export function isSolvedToday(id: PuzzleId, today: string): boolean {
  if (id === "wordsearch") return loadWordsearchProgress(today).completed;
  if (id === "sudoku") return loadSudokuProgress(today).completed;
  return loadWordGuessProgress(today).completed;
}
