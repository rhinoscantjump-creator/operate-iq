import { formatUtcDate, utcDateKey } from "../lib/date";
import {
  emptyEntries,
  emptyNotes,
  generateSudoku,
  hasConflict,
  isComplete,
  type Digit,
} from "../lib/sudoku";
import {
  loadSudokuProgress,
  recordCompletion,
  saveSudokuProgress,
} from "../lib/storage";

const SIZE = 9;

function setText(id: string, value: string): void {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function asDigit(n: number): Digit | null {
  if (n >= 1 && n <= 9) return n as Digit;
  return null;
}

export function initSudoku(): void {
  const today = utcDateKey();
  setText("play-date", formatUtcDate(today));
  window.setTimeout(bindSudoku, 0);
}

function bindSudoku(): void {
  const today = utcDateKey();
  const puzzle = generateSudoku(today);
  const stored = loadSudokuProgress(today);
  const entries: (Digit | null)[][] =
    stored.entries.length === SIZE
      ? stored.entries.map((row) => row.map((n) => (n ? asDigit(n) : null)))
      : emptyEntries();
  const notes: number[][][] =
    stored.notes.length === SIZE ? stored.notes.map((row) => row.map((cell) => [...cell])) : emptyNotes();

  let selected: [number, number] | null = null;
  let notesMode = false;

  setText("sdk-status", "Classic 9×9 · medium · notes with N");

  const board = document.getElementById("sdk-board");
  const pad = document.getElementById("sdk-pad");
  const notesToggle = document.getElementById("sdk-notes");
  const clearBtn = document.getElementById("sdk-clear");
  if (!board || !pad) return;

  board.replaceChildren();
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "sdk-cell";
      btn.dataset.r = String(r);
      btn.dataset.c = String(c);
      if (puzzle.givens[r]![c]) btn.classList.add("given");
      board.append(btn);
    }
  }

  const persist = (completed: boolean): void => {
    saveSudokuProgress({
      date: today,
      entries,
      notes,
      completed,
    });
    if (completed) recordCompletion("sudoku", today);
  };

  const valueAt = (r: number, c: number): Digit | null => puzzle.givens[r]![c] ?? entries[r]![c];

  const paint = (): void => {
    const cells = board.querySelectorAll<HTMLButtonElement>(".sdk-cell");
    cells.forEach((btn) => {
      const r = Number(btn.dataset.r);
      const c = Number(btn.dataset.c);
      const given = puzzle.givens[r]![c];
      const entry = entries[r]![c];
      const value = given ?? entry;
      const isSelected = selected?.[0] === r && selected?.[1] === c;
      const sameNumber =
        selected && value && valueAt(selected[0], selected[1]) === value;

      btn.classList.toggle("selected", Boolean(isSelected));
      btn.classList.toggle("same", Boolean(sameNumber) && !isSelected);
      btn.classList.toggle("conflict", Boolean(value && hasConflict(puzzle.givens, entries, r, c, value)));
      btn.classList.toggle("has-notes", !value && (notes[r]![c]?.length ?? 0) > 0);

      if (value) {
        btn.replaceChildren(document.createTextNode(String(value)));
        btn.setAttribute("aria-label", `Row ${r + 1}, column ${c + 1}, ${value}${given ? ", given" : ""}`);
      } else {
        const marks = notes[r]![c] ?? [];
        if (marks.length) {
          const wrap = document.createElement("span");
          wrap.className = "sdk-notes";
          wrap.setAttribute("aria-hidden", "true");
          for (let n = 1; n <= 9; n++) {
            const mark = document.createElement("span");
            mark.textContent = marks.includes(n) ? String(n) : "";
            wrap.append(mark);
          }
          btn.replaceChildren(wrap);
          btn.setAttribute("aria-label", `Row ${r + 1}, column ${c + 1}, notes ${marks.join(" ")}`);
        } else {
          btn.replaceChildren();
          btn.setAttribute("aria-label", `Row ${r + 1}, column ${c + 1}, empty`);
        }
      }
    });

    const filled = isComplete(puzzle.givens, entries, puzzle.solution);
    if (filled) {
      persist(true);
      const banner = document.getElementById("sdk-complete");
      banner?.classList.add("is-visible");
      banner?.removeAttribute("hidden");
    }
  };

  const enter = (digit: Digit | null): void => {
    if (!selected) return;
    const [r, c] = selected;
    if (puzzle.givens[r]![c]) return;

    if (notesMode && digit) {
      entries[r]![c] = null;
      const current = new Set(notes[r]![c]);
      if (current.has(digit)) current.delete(digit);
      else current.add(digit);
      notes[r]![c] = [...current].sort((a, b) => a - b);
    } else {
      entries[r]![c] = digit;
      notes[r]![c] = [];
    }
    persist(isComplete(puzzle.givens, entries, puzzle.solution));
    paint();
  };

  board.addEventListener("click", (event) => {
    const btn = (event.target as HTMLElement).closest<HTMLElement>(".sdk-cell");
    if (!btn) return;
    selected = [Number(btn.dataset.r), Number(btn.dataset.c)];
    paint();
  });

  pad.addEventListener("click", (event) => {
    const btn = (event.target as HTMLElement).closest<HTMLElement>("[data-digit]");
    if (!btn) return;
    const digit = asDigit(Number(btn.dataset.digit));
    if (digit) enter(digit);
  });

  clearBtn?.addEventListener("click", () => enter(null));

  notesToggle?.addEventListener("click", () => {
    notesMode = !notesMode;
    notesToggle.classList.toggle("is-active", notesMode);
    notesToggle.setAttribute("aria-pressed", notesMode ? "true" : "false");
  });

  window.addEventListener("keydown", (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const digit = asDigit(Number(event.key));
    if (digit) {
      event.preventDefault();
      enter(digit);
      return;
    }
    if (event.key === "Backspace" || event.key === "Delete" || event.key === "0") {
      event.preventDefault();
      enter(null);
      return;
    }
    if (event.key === "n") {
      notesMode = !notesMode;
      notesToggle?.classList.toggle("is-active", notesMode);
      notesToggle?.setAttribute("aria-pressed", notesMode ? "true" : "false");
      return;
    }
    if (!selected) return;
    let [r, c] = selected;
    if (event.key === "ArrowUp") r = Math.max(0, r - 1);
    else if (event.key === "ArrowDown") r = Math.min(SIZE - 1, r + 1);
    else if (event.key === "ArrowLeft") c = Math.max(0, c - 1);
    else if (event.key === "ArrowRight") c = Math.min(SIZE - 1, c + 1);
    else return;
    event.preventDefault();
    selected = [r, c];
    paint();
  });

  paint();
  if (stored.completed || isComplete(puzzle.givens, entries, puzzle.solution)) {
    persist(true);
  }
}
