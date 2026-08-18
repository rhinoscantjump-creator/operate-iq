import { formatUtcDate, utcDateKey } from "../lib/date";
import {
  generateWordsearch,
  lineCells,
  matchPlacement,
  type WordsearchPuzzle,
} from "../lib/wordsearch";
import {
  loadWordsearchProgress,
  recordCompletion,
  saveWordsearchProgress,
} from "../lib/storage";

function cellKey(row: number, col: number): string {
  return `${row}:${col}`;
}

function setText(id: string, value: string): void {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function renderBoard(puzzle: WordsearchPuzzle, foundWords: Set<string>, selecting: [number, number][]): void {
  const board = document.getElementById("ws-board");
  if (!board) return;

  const foundCells = new Set<string>();
  for (const placement of puzzle.placements) {
    if (!foundWords.has(placement.word)) continue;
    for (const [r, c] of placement.cells) foundCells.add(cellKey(r, c));
  }
  const selectingSet = new Set(selecting.map(([r, c]) => cellKey(r, c)));

  const buttons = board.querySelectorAll<HTMLButtonElement>("[data-r]");
  buttons.forEach((btn) => {
    const r = Number(btn.dataset.r);
    const c = Number(btn.dataset.c);
    const key = cellKey(r, c);
    btn.classList.toggle("found", foundCells.has(key));
    btn.classList.toggle("selecting", selectingSet.has(key));
  });
}

function renderWordList(puzzle: WordsearchPuzzle, foundWords: Set<string>): void {
  const list = document.getElementById("ws-words");
  if (!list) return;
  list.querySelectorAll("[data-word]").forEach((item) => {
    const word = (item as HTMLElement).dataset.word ?? "";
    item.classList.toggle("is-found", foundWords.has(word));
  });
  setText("ws-found-count", `${foundWords.size} / ${puzzle.words.length}`);
}

function markComplete(): void {
  const banner = document.getElementById("ws-complete");
  banner?.classList.add("is-visible");
  banner?.removeAttribute("hidden");
}

export function initWordsearch(): void {
  const today = utcDateKey();
  const puzzle = generateWordsearch(today);
  const progress = loadWordsearchProgress(today);
  const foundWords = new Set(progress.found.filter((word) => puzzle.words.includes(word)));

  setText("play-date", formatUtcDate(today));
  setText("ws-theme", puzzle.theme);

  const board = document.getElementById("ws-board");
  const wordList = document.getElementById("ws-words");
  if (!board || !wordList) return;

  board.style.gridTemplateColumns = `repeat(${puzzle.size}, 1fr)`;
  board.replaceChildren();
  for (let r = 0; r < puzzle.size; r++) {
    for (let c = 0; c < puzzle.size; c++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ws-cell";
      btn.dataset.r = String(r);
      btn.dataset.c = String(c);
      btn.textContent = puzzle.grid[r]![c]!;
      btn.setAttribute("aria-label", `Row ${r + 1}, column ${c + 1}, ${puzzle.grid[r]![c]}`);
      board.append(btn);
    }
  }

  wordList.replaceChildren();
  for (const word of puzzle.words) {
    const li = document.createElement("li");
    li.dataset.word = word;
    li.textContent = word;
    wordList.append(li);
  }

  let pointerId: number | null = null;
  let start: [number, number] | null = null;
  let current: [number, number][] = [];

  const persist = (completed: boolean): void => {
    saveWordsearchProgress({
      date: today,
      found: [...foundWords],
      completed,
    });
    if (completed) recordCompletion("wordsearch", today);
  };

  const paint = (): void => {
    renderBoard(puzzle, foundWords, current);
    renderWordList(puzzle, foundWords);
    if (foundWords.size === puzzle.words.length) {
      persist(true);
      markComplete();
    }
  };

  const cellFromEvent = (event: PointerEvent): [number, number] | null => {
    const node = document.elementFromPoint(event.clientX, event.clientY);
    const btn = node?.closest<HTMLElement>("[data-r]");
    if (!btn || !board.contains(btn)) return null;
    return [Number(btn.dataset.r), Number(btn.dataset.c)];
  };

  const updateSelection = (end: [number, number]): void => {
    if (!start) return;
    const line = lineCells(start, end);
    current = line ?? [start];
    renderBoard(puzzle, foundWords, current);
  };

  board.addEventListener("pointerdown", (event) => {
    const cell = cellFromEvent(event);
    if (!cell) return;
    event.preventDefault();
    pointerId = event.pointerId;
    board.setPointerCapture(event.pointerId);
    start = cell;
    current = [cell];
    renderBoard(puzzle, foundWords, current);
  });

  board.addEventListener("pointermove", (event) => {
    if (pointerId !== event.pointerId || !start) return;
    const cell = cellFromEvent(event);
    if (cell) updateSelection(cell);
  });

  const finish = (event: PointerEvent): void => {
    if (pointerId !== event.pointerId) return;
    pointerId = null;
    if (current.length >= 2) {
      const matched = matchPlacement(puzzle, current);
      if (matched && !foundWords.has(matched.word)) {
        foundWords.add(matched.word);
        persist(foundWords.size === puzzle.words.length);
      }
    }
    start = null;
    current = [];
    paint();
  };

  board.addEventListener("pointerup", finish);
  board.addEventListener("pointercancel", finish);

  paint();
  if (progress.completed || foundWords.size === puzzle.words.length) {
    persist(true);
    markComplete();
  }
}
