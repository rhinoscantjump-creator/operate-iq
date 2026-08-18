import { WORD_THEMES } from "../data/word-themes";
import { hashString, mulberry32, shuffle } from "./rng";

export const WORDSEARCH_SIZE = 12;
export const WORDSEARCH_TARGET = 10;
export const WORDSEARCH_MIN = 8;

export type Direction = readonly [number, number];

export const DIRECTIONS: readonly Direction[] = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];

export interface PlacedWord {
  word: string;
  cells: readonly (readonly [number, number])[];
}

export interface WordsearchPuzzle {
  date: string;
  size: number;
  themeId: string;
  theme: string;
  grid: string[][];
  words: string[];
  placements: PlacedWord[];
}

function cellsForWord(
  row: number,
  col: number,
  dir: Direction,
  length: number,
): [number, number][] {
  const cells: [number, number][] = [];
  for (let i = 0; i < length; i++) {
    cells.push([row + dir[0] * i, col + dir[1] * i]);
  }
  return cells;
}

function inBounds(row: number, col: number, size: number): boolean {
  return row >= 0 && col >= 0 && row < size && col < size;
}

function tryPlace(
  grid: (string | null)[][],
  word: string,
  rng: () => number,
): PlacedWord | null {
  const size = grid.length;
  const dirs = shuffle(DIRECTIONS, rng);

  for (let attempt = 0; attempt < 80; attempt++) {
    const dir = dirs[attempt % dirs.length]!;
    const rowStart = dir[0] === 1 ? 0 : dir[0] === -1 ? word.length - 1 : 0;
    const rowEnd = dir[0] === 1 ? size - word.length : dir[0] === -1 ? size - 1 : size - 1;
    const colStart = dir[1] === 1 ? 0 : dir[1] === -1 ? word.length - 1 : 0;
    const colEnd = dir[1] === 1 ? size - word.length : dir[1] === -1 ? size - 1 : size - 1;

    const row = rowStart + Math.floor(rng() * (rowEnd - rowStart + 1));
    const col = colStart + Math.floor(rng() * (colEnd - colStart + 1));
    const cells = cellsForWord(row, col, dir, word.length);

    if (cells.some(([r, c]) => !inBounds(r, c, size))) continue;

    let fits = true;
    for (let i = 0; i < word.length; i++) {
      const [r, c] = cells[i]!;
      const existing = grid[r]![c];
      if (existing && existing !== word[i]) {
        fits = false;
        break;
      }
    }
    if (!fits) continue;

    for (let i = 0; i < word.length; i++) {
      const [r, c] = cells[i]!;
      grid[r]![c] = word[i]!;
    }
    return { word, cells };
  }

  return null;
}

function fillAttempt(rng: () => number, themeIndex: number): WordsearchPuzzle | null {
  const theme = WORD_THEMES[themeIndex % WORD_THEMES.length]!;
  const candidates = shuffle(
    theme.words.filter((word) => word.length >= 4 && word.length <= WORDSEARCH_SIZE),
    rng,
  );
  const grid: (string | null)[][] = Array.from({ length: WORDSEARCH_SIZE }, () =>
    Array.from({ length: WORDSEARCH_SIZE }, () => null),
  );
  const placements: PlacedWord[] = [];
  const sorted = [...candidates].sort((a, b) => b.length - a.length);

  for (const word of sorted) {
    if (placements.length >= WORDSEARCH_TARGET) break;
    const placed = tryPlace(grid, word, rng);
    if (placed) placements.push(placed);
  }

  if (placements.length < WORDSEARCH_MIN) return null;

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const filled: string[][] = grid.map((row) =>
    row.map((cell) => cell ?? letters[Math.floor(rng() * 26)]!),
  );

  return {
    date: "",
    size: WORDSEARCH_SIZE,
    themeId: theme.id,
    theme: theme.name,
    grid: filled,
    words: placements.map((p) => p.word).sort(),
    placements,
  };
}

export function generateWordsearch(dateKey: string): WordsearchPuzzle {
  const rng = mulberry32(hashString(`wordsearch:${dateKey}`));
  const [year, month, day] = dateKey.split("-").map(Number);
  const dayNumber = Math.floor(Date.UTC(year ?? 2026, (month ?? 1) - 1, day ?? 1) / 86400000);
  const themeIndex = ((dayNumber % WORD_THEMES.length) + WORD_THEMES.length) % WORD_THEMES.length;

  for (let attempt = 0; attempt < 24; attempt++) {
    const puzzle = fillAttempt(rng, themeIndex);
    if (puzzle) {
      puzzle.date = dateKey;
      return puzzle;
    }
  }

  throw new Error(`Could not generate wordsearch for ${dateKey}`);
}

/** Cells on a straight row, column, or diagonal from start to end, or null. */
export function lineCells(
  start: readonly [number, number],
  end: readonly [number, number],
): [number, number][] | null {
  const dr = end[0] - start[0];
  const dc = end[1] - start[1];
  const absR = Math.abs(dr);
  const absC = Math.abs(dc);

  if (absR === 0 && absC === 0) return [[start[0], start[1]]];
  if (absR !== 0 && absC !== 0 && absR !== absC) return null;

  const steps = Math.max(absR, absC);
  const stepR = dr / steps;
  const stepC = dc / steps;
  if (!Number.isInteger(stepR) || !Number.isInteger(stepC)) return null;

  const cells: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    cells.push([start[0] + stepR * i, start[1] + stepC * i]);
  }
  return cells;
}

export function lettersForCells(grid: string[][], cells: readonly (readonly [number, number])[]): string {
  return cells.map(([r, c]) => grid[r]![c]!).join("");
}

export function matchPlacement(
  puzzle: WordsearchPuzzle,
  cells: readonly (readonly [number, number])[],
): PlacedWord | null {
  const forward = lettersForCells(puzzle.grid, cells);
  const reverse = [...forward].reverse().join("");
  return (
    puzzle.placements.find((p) => p.word === forward || p.word === reverse) ?? null
  );
}
