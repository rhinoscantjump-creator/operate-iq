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

const MIN_SCALE = 1;
const MAX_SCALE = 2.5;
const START_SCALE = 1.2;

type Mode = "play" | "move";

interface Point {
  x: number;
  y: number;
}

function cellKey(row: number, col: number): string {
  return `${row}:${col}`;
}

function setText(id: string, value: string): void {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
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
  const viewport = document.getElementById("ws-viewport");
  const wordList = document.getElementById("ws-words");
  const playBtn = document.getElementById("ws-mode-play");
  const moveBtn = document.getElementById("ws-mode-move");
  if (!board || !viewport || !wordList || !playBtn || !moveBtn) return;

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

  let mode: Mode = "play";
  let scale = START_SCALE;
  let tx = 0;
  let ty = 0;
  const pointers = new Map<number, Point>();
  let selectPointer: number | null = null;
  let selectStart: [number, number] | null = null;
  let current: [number, number][] = [];
  let panPointer: number | null = null;
  let panStart: Point | null = null;
  let panOrigin = { x: 0, y: 0 };
  let pinching = false;
  let pinchLastDist = 0;
  let pinchLastMid: Point | null = null;

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

  const viewSize = (): number => viewport.clientWidth;

  const clampPan = (nextX: number, nextY: number, nextScale: number): Point => {
    const view = viewSize();
    const size = view * nextScale;
    if (size <= view) {
      const centered = (view - size) / 2;
      return { x: centered, y: centered };
    }
    const min = view - size;
    return {
      x: clamp(nextX, min, 0),
      y: clamp(nextY, min, 0),
    };
  };

  const applyTransform = (): void => {
    const pan = clampPan(tx, ty, scale);
    tx = pan.x;
    ty = pan.y;
    board.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  };

  const localPoint = (event: PointerEvent): Point => {
    const rect = viewport.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const zoomAt = (point: Point, nextScale: number): void => {
    const clamped = clamp(nextScale, MIN_SCALE, MAX_SCALE);
    const boardX = (point.x - tx) / scale;
    const boardY = (point.y - ty) / scale;
    scale = clamped;
    tx = point.x - boardX * scale;
    ty = point.y - boardY * scale;
    applyTransform();
  };

  const centerStart = (): void => {
    const view = viewSize();
    const size = view * scale;
    tx = (view - size) / 2;
    ty = (view - size) / 2;
    applyTransform();
  };

  const setMode = (next: Mode): void => {
    mode = next;
    document.querySelectorAll<HTMLElement>("[data-ws-mode]").forEach((btn) => {
      const on = btn.dataset.wsMode === next;
      btn.classList.toggle("is-active", on);
      if (btn.hasAttribute("aria-checked")) {
        btn.setAttribute("aria-checked", on ? "true" : "false");
      }
    });
    viewport.classList.toggle("is-move", next === "move");
    selectPointer = null;
    selectStart = null;
    current = [];
    panPointer = null;
    paint();
  };

  const cellFromEvent = (event: PointerEvent): [number, number] | null => {
    const node = document.elementFromPoint(event.clientX, event.clientY);
    const btn = node?.closest<HTMLElement>("[data-r]");
    if (!btn || !board.contains(btn)) return null;
    return [Number(btn.dataset.r), Number(btn.dataset.c)];
  };

  const clearSelection = (): void => {
    selectPointer = null;
    selectStart = null;
    current = [];
    renderBoard(puzzle, foundWords, current);
  };

  const beginPinch = (): void => {
    const pts = [...pointers.values()];
    if (pts.length < 2) return;
    pinching = true;
    panPointer = null;
    viewport.classList.remove("is-panning");
    clearSelection();
    pinchLastDist = distance(pts[0]!, pts[1]!);
    pinchLastMid = midpoint(pts[0]!, pts[1]!);
  };

  viewport.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    viewport.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId, localPoint(event));

    if (pointers.size >= 2) {
      beginPinch();
      return;
    }

    if (mode === "move") {
      panPointer = event.pointerId;
      panStart = localPoint(event);
      panOrigin = { x: tx, y: ty };
      viewport.classList.add("is-panning");
      return;
    }

    const cell = cellFromEvent(event);
    if (!cell) return;
    selectPointer = event.pointerId;
    selectStart = cell;
    current = [cell];
    renderBoard(puzzle, foundWords, current);
  });

  viewport.addEventListener("pointermove", (event) => {
    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, localPoint(event));

    if (pinching && pointers.size >= 2) {
      const pts = [...pointers.values()];
      const nextDist = distance(pts[0]!, pts[1]!);
      const mid = midpoint(pts[0]!, pts[1]!);
      if (pinchLastMid) {
        tx += mid.x - pinchLastMid.x;
        ty += mid.y - pinchLastMid.y;
        applyTransform();
      }
      if (pinchLastDist > 0) {
        zoomAt(mid, scale * (nextDist / pinchLastDist));
      }
      pinchLastDist = nextDist;
      pinchLastMid = mid;
      return;
    }

    if (panPointer === event.pointerId && panStart) {
      const point = localPoint(event);
      tx = panOrigin.x + (point.x - panStart.x);
      ty = panOrigin.y + (point.y - panStart.y);
      applyTransform();
      return;
    }

    if (selectPointer === event.pointerId && selectStart && !pinching) {
      const cell = cellFromEvent(event);
      if (!cell) return;
      const line = lineCells(selectStart, cell);
      current = line ?? [selectStart];
      renderBoard(puzzle, foundWords, current);
    }
  });

  const finishPointer = (event: PointerEvent): void => {
    if (!pointers.has(event.pointerId)) return;
    pointers.delete(event.pointerId);

    if (pointers.size < 2) {
      pinching = false;
      pinchLastDist = 0;
      pinchLastMid = null;
    }

    if (panPointer === event.pointerId) {
      panPointer = null;
      panStart = null;
      viewport.classList.remove("is-panning");
    }

    if (selectPointer !== event.pointerId) return;
    if (current.length >= 2) {
      const matched = matchPlacement(puzzle, current);
      if (matched && !foundWords.has(matched.word)) {
        foundWords.add(matched.word);
        persist(foundWords.size === puzzle.words.length);
      }
    }
    selectPointer = null;
    selectStart = null;
    current = [];
    paint();
  };

  viewport.addEventListener("pointerup", finishPointer);
  viewport.addEventListener("pointercancel", finishPointer);

  viewport.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      const rect = viewport.getBoundingClientRect();
      const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      const factor = event.deltaY > 0 ? 0.92 : 1.08;
      zoomAt(point, scale * factor);
    },
    { passive: false },
  );

  viewport.addEventListener("contextmenu", (event) => event.preventDefault());

  document.querySelectorAll<HTMLElement>("[data-ws-mode]").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.stopPropagation();
      const next = btn.dataset.wsMode;
      if (next === "play" || next === "move") setMode(next);
    });
  });

  const resize = new ResizeObserver(() => applyTransform());
  resize.observe(viewport);

  paint();
  requestAnimationFrame(() => centerStart());
  if (progress.completed || foundWords.size === puzzle.words.length) {
    persist(true);
    markComplete();
  }
}
