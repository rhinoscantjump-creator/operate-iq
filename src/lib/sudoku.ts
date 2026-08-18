import { hashString, mulberry32, shuffle } from "./rng";

export type Digit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface SudokuPuzzle {
  date: string;
  givens: (Digit | null)[][];
  solution: Digit[][];
}

const DIGITS: Digit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const SIZE = 9;
const TARGET_CLUES = 34;

function emptyBoard(): number[][] {
  return Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => 0));
}

function cloneBoard(board: number[][]): number[][] {
  return board.map((row) => [...row]);
}

function isValid(board: number[][], row: number, col: number, n: number): boolean {
  for (let i = 0; i < SIZE; i++) {
    if (board[row]![i] === n || board[i]![col] === n) return false;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (board[r]![c] === n) return false;
    }
  }
  return true;
}

function findEmpty(board: number[][]): [number, number] | null {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r]![c] === 0) return [r, c];
    }
  }
  return null;
}

function fillDiagonal(board: number[][], rng: () => number): void {
  for (let box = 0; box < 3; box++) {
    const nums = shuffle(DIGITS, rng);
    let i = 0;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        board[box * 3 + r]![box * 3 + c] = nums[i++]!;
      }
    }
  }
}

function fillRemaining(board: number[][], rng: () => number): boolean {
  const empty = findEmpty(board);
  if (!empty) return true;
  const [row, col] = empty;
  for (const n of shuffle(DIGITS, rng)) {
    if (isValid(board, row, col, n)) {
      board[row]![col] = n;
      if (fillRemaining(board, rng)) return true;
      board[row]![col] = 0;
    }
  }
  return false;
}

function countSolutions(board: number[][], limit = 2): number {
  let count = 0;

  const solve = (): void => {
    if (count >= limit) return;
    const empty = findEmpty(board);
    if (!empty) {
      count += 1;
      return;
    }
    const [row, col] = empty;
    for (const n of DIGITS) {
      if (isValid(board, row, col, n)) {
        board[row]![col] = n;
        solve();
        board[row]![col] = 0;
        if (count >= limit) return;
      }
    }
  };

  solve();
  return count;
}

function toDigitBoard(board: number[][]): Digit[][] {
  return board.map((row) => row.map((n) => n as Digit));
}

function toGivens(board: number[][]): (Digit | null)[][] {
  return board.map((row) => row.map((n) => (n === 0 ? null : (n as Digit))));
}

export function generateSudoku(dateKey: string): SudokuPuzzle {
  const rng = mulberry32(hashString(`sudoku:${dateKey}`));
  const board = emptyBoard();
  fillDiagonal(board, rng);
  if (!fillRemaining(board, rng)) {
    throw new Error(`Could not fill sudoku for ${dateKey}`);
  }

  const solution = toDigitBoard(cloneBoard(board));
  const puzzle = cloneBoard(board);
  const positions = shuffle(
    Array.from({ length: SIZE * SIZE }, (_, i) => [Math.floor(i / SIZE), i % SIZE] as const),
    rng,
  );

  let clues = SIZE * SIZE;
  for (const [row, col] of positions) {
    if (clues <= TARGET_CLUES) break;
    const backup = puzzle[row]![col]!;
    puzzle[row]![col] = 0;
    if (countSolutions(cloneBoard(puzzle), 2) !== 1) {
      puzzle[row]![col] = backup;
    } else {
      clues -= 1;
    }
  }

  return {
    date: dateKey,
    givens: toGivens(puzzle),
    solution,
  };
}

export function hasConflict(
  givens: (Digit | null)[][],
  entries: (Digit | null)[][],
  row: number,
  col: number,
  value: Digit,
): boolean {
  const seen = (r: number, c: number): Digit | null => givens[r]![c] ?? entries[r]![c];

  for (let i = 0; i < SIZE; i++) {
    if (i !== col && seen(row, i) === value) return true;
    if (i !== row && seen(i, col) === value) return true;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if ((r !== row || c !== col) && seen(r, c) === value) return true;
    }
  }
  return false;
}

export function isComplete(
  givens: (Digit | null)[][],
  entries: (Digit | null)[][],
  solution: Digit[][],
): boolean {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const value = givens[r]![c] ?? entries[r]![c];
      if (value !== solution[r]![c]) return false;
    }
  }
  return true;
}

export function emptyEntries(): (Digit | null)[][] {
  return Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => null));
}

export function emptyNotes(): number[][][] {
  return Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => []));
}
