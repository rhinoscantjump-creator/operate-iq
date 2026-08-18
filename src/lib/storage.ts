import { addUtcDays } from "./date";

export type PuzzleId = "wordsearch" | "sudoku";

export interface Streaks {
  wordsearch: number;
  sudoku: number;
  lastWordsearchDate: string | null;
  lastSudokuDate: string | null;
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

const STREAK_KEY = "oiq.streaks.v1";
const WS_KEY = "oiq.wordsearch.v1";
const SDK_KEY = "oiq.sudoku.v1";

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

export function loadStreaks(): Streaks {
  return (
    readJson<Streaks>(STREAK_KEY) ?? {
      wordsearch: 0,
      sudoku: 0,
      lastWordsearchDate: null,
      lastSudokuDate: null,
    }
  );
}

export function saveStreaks(streaks: Streaks): void {
  writeJson(STREAK_KEY, streaks);
}

export function recordCompletion(id: PuzzleId, today: string): Streaks {
  const streaks = loadStreaks();
  const last = id === "wordsearch" ? streaks.lastWordsearchDate : streaks.lastSudokuDate;
  if (last === today) return streaks;

  const yesterday = addUtcDays(today, -1);
  const nextCount = last === yesterday ? streaks[id] + 1 : 1;

  const next: Streaks =
    id === "wordsearch"
      ? { ...streaks, wordsearch: nextCount, lastWordsearchDate: today }
      : { ...streaks, sudoku: nextCount, lastSudokuDate: today };

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

export function isSolvedToday(id: PuzzleId, today: string): boolean {
  if (id === "wordsearch") return loadWordsearchProgress(today).completed;
  return loadSudokuProgress(today).completed;
}
