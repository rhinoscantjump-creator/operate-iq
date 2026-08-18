import { formatUtcDate, utcDateKey } from "../lib/date";
import {
  TRIAD_BOARD_COUNT,
  TRIAD_LABELS,
  TRIAD_MAX_GUESSES,
  TRIAD_WORD_LENGTH,
  closenessForBoard,
  generateTriad,
  isAllowedGuess,
  rankBoardOrder,
  scoreGuess,
  type TileMark,
} from "../lib/triad";
import { loadTriadProgress, recordCompletion, saveTriadProgress } from "../lib/storage";

const KEY_ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"] as const;

function setText(id: string, value: string): void {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function bestMark(current: TileMark | "unused", next: TileMark): TileMark | "unused" {
  const rank = { unused: 0, absent: 1, present: 2, exact: 3 };
  return rank[next] > rank[current] ? next : current;
}

export function initTriad(): void {
  const today = utcDateKey();
  setText("play-date", formatUtcDate(today));
  window.setTimeout(bindTriad, 0);
}

function bindTriad(): void {
  const today = utcDateKey();
  const puzzle = generateTriad(today);
  const stored = loadTriadProgress(today);
  const guesses = [...stored.guesses];
  let draft = "";
  let message = "";

  const compose = document.getElementById("triad-compose-row");
  const boardsEl = document.getElementById("triad-boards");
  const keyboardEl = document.getElementById("triad-keyboard");
  if (!compose || !boardsEl || !keyboardEl) return;

  compose.replaceChildren();
  for (let i = 0; i < TRIAD_WORD_LENGTH; i++) {
    const tile = document.createElement("div");
    tile.className = "triad-tile";
    tile.dataset.slot = String(i);
    compose.append(tile);
  }

  boardsEl.replaceChildren();
  for (let b = 0; b < TRIAD_BOARD_COUNT; b++) {
    const board = document.createElement("section");
    board.className = "triad-board";
    board.dataset.board = String(b);
    board.setAttribute("aria-label", `Board ${TRIAD_LABELS[b]}`);

    const header = document.createElement("div");
    header.className = "triad-board-head";
    const label = document.createElement("span");
    label.className = "triad-board-label";
    label.textContent = `Board ${TRIAD_LABELS[b]}`;
    const meter = document.createElement("span");
    meter.className = "triad-board-meter";
    meter.dataset.meter = String(b);
    header.append(label, meter);

    const rows = document.createElement("div");
    rows.className = "triad-rows";
    for (let r = 0; r < TRIAD_MAX_GUESSES; r++) {
      const row = document.createElement("div");
      row.className = "triad-row";
      row.dataset.row = String(r);
      for (let c = 0; c < TRIAD_WORD_LENGTH; c++) {
        const tile = document.createElement("div");
        tile.className = "triad-tile";
        tile.dataset.c = String(c);
        row.append(tile);
      }
      rows.append(row);
    }

    board.append(header, rows);
    boardsEl.append(board);
  }

  keyboardEl.replaceChildren();
  KEY_ROWS.forEach((rowLetters, rowIndex) => {
    const row = document.createElement("div");
    row.className = "triad-kb-row";
    if (rowIndex === 2) {
      const enter = document.createElement("button");
      enter.type = "button";
      enter.className = "triad-key triad-key-wide";
      enter.dataset.key = "Enter";
      enter.textContent = "Enter";
      row.append(enter);
    }
    for (const letter of rowLetters) {
      const key = document.createElement("button");
      key.type = "button";
      key.className = "triad-key";
      key.dataset.key = letter;
      const glyph = document.createElement("span");
      glyph.textContent = letter;
      const marks = document.createElement("span");
      marks.className = "triad-key-marks";
      marks.setAttribute("aria-hidden", "true");
      for (let b = 0; b < TRIAD_BOARD_COUNT; b++) {
        const stripe = document.createElement("i");
        stripe.dataset.board = String(b);
        marks.append(stripe);
      }
      key.append(glyph, marks);
      row.append(key);
    }
    if (rowIndex === 2) {
      const del = document.createElement("button");
      del.type = "button";
      del.className = "triad-key triad-key-wide";
      del.dataset.key = "Backspace";
      del.textContent = "Delete";
      row.append(del);
    }
    keyboardEl.append(row);
  });

  const solved = (): boolean[] => puzzle.answers.map((answer) => guesses.includes(answer));
  const allSolved = (): boolean => solved().every(Boolean);
  const locked = (): boolean => allSolved() || guesses.length >= TRIAD_MAX_GUESSES;

  const persist = (): void => {
    const completed = allSolved();
    const failed = !completed && guesses.length >= TRIAD_MAX_GUESSES;
    saveTriadProgress({ date: today, guesses, completed, failed });
    if (completed) recordCompletion("triad", today);
  };

  const setMessage = (text: string): void => {
    message = text;
    setText("triad-msg", text);
  };

  const paintCompose = (): void => {
    const tiles = compose.querySelectorAll<HTMLElement>(".triad-tile");
    tiles.forEach((tile, i) => {
      const ch = draft[i] ?? "";
      tile.textContent = ch;
      tile.classList.toggle("is-draft", Boolean(ch));
      tile.classList.toggle("is-empty", !ch);
    });
    const remaining = TRIAD_MAX_GUESSES - guesses.length;
    setText(
      "triad-status",
      locked()
        ? allSolved()
          ? "All three words found"
          : "Out of guesses"
        : `${remaining} guess${remaining === 1 ? "" : "es"} left`,
    );
  };

  const paintBoards = (shouldSnap: boolean): void => {
    const order = rankBoardOrder(guesses, puzzle.answers);
    const done = solved();

    puzzle.answers.forEach((answer, b) => {
      const board = boardsEl.querySelector<HTMLElement>(`[data-board="${b}"]`);
      if (!board) return;
      const closeness = closenessForBoard(guesses, answer);
      board.style.order = String(order.indexOf(b));
      board.classList.toggle("is-solved", done[b]!);
      board.classList.toggle("is-lead", !done[b] && order[0] === b && guesses.length > 0);

      const meter = board.querySelector("[data-meter]");
      if (meter) {
        meter.textContent = done[b]
          ? "Solved"
          : closeness.exact === 0 && closeness.present === 0
            ? "Unopened"
            : `${closeness.exact} locked`;
      }

      const rows = board.querySelectorAll<HTMLElement>(".triad-row");
      rows.forEach((row, r) => {
        const guess = guesses[r];
        const tiles = row.querySelectorAll<HTMLElement>(".triad-tile");
        row.classList.toggle("is-unused", !guess);
        tiles.forEach((tile, c) => {
          tile.className = "triad-tile";
          if (!guess) {
            tile.textContent = "";
            tile.classList.add("is-empty");
            return;
          }
          const marks = scoreGuess(guess, answer);
          tile.textContent = guess[c] ?? "";
          tile.classList.add(`is-${marks[c]}`);
        });
      });
    });

    if (shouldSnap && guesses.length > 0 && window.matchMedia("(max-width: 900px)").matches) {
      const leadIndex = order[0];
      const lead = boardsEl.querySelector<HTMLElement>(`[data-board="${leadIndex}"]`);
      lead?.scrollIntoView({
        block: "start",
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
    }
  };

  const paintKeyboard = (): void => {
    const keys = keyboardEl.querySelectorAll<HTMLButtonElement>(".triad-key[data-key]");
    keys.forEach((key) => {
      const letter = key.dataset.key ?? "";
      if (letter.length !== 1) return;
      const stripes = key.querySelectorAll<HTMLElement>("i[data-board]");
      stripes.forEach((stripe) => {
        const b = Number(stripe.dataset.board);
        const answer = puzzle.answers[b]!;
        let status: TileMark | "unused" = "unused";
        for (const guess of guesses) {
          const marks = scoreGuess(guess, answer);
          for (let i = 0; i < guess.length; i++) {
            if (guess[i] === letter) status = bestMark(status, marks[i]!);
          }
        }
        stripe.dataset.mark = status;
      });
    });
  };

  const paintBanners = (): void => {
    const win = document.getElementById("triad-complete");
    const lose = document.getElementById("triad-failed");
    if (allSolved()) {
      win?.classList.add("is-visible");
      win?.removeAttribute("hidden");
      lose?.setAttribute("hidden", "");
    } else if (guesses.length >= TRIAD_MAX_GUESSES) {
      const reveal = document.getElementById("triad-reveal");
      if (reveal) reveal.textContent = puzzle.answers.join(" · ");
      lose?.classList.add("is-visible");
      lose?.removeAttribute("hidden");
      win?.setAttribute("hidden", "");
    }
  };

  const paint = (shouldSnap = false): void => {
    paintCompose();
    paintBoards(shouldSnap);
    paintKeyboard();
    paintBanners();
  };

  const submit = (): void => {
    if (locked()) return;
    if (draft.length !== TRIAD_WORD_LENGTH) {
      setMessage("Need five letters.");
      return;
    }
    if (!isAllowedGuess(draft)) {
      setMessage("Not in the word list.");
      return;
    }
    guesses.push(draft);
    draft = "";
    setMessage("");
    persist();
    paint(true);
  };

  const typeLetter = (letter: string): void => {
    if (locked()) return;
    if (draft.length >= TRIAD_WORD_LENGTH) return;
    draft += letter;
    setMessage("");
    paintCompose();
  };

  const del = (): void => {
    if (locked()) return;
    draft = draft.slice(0, -1);
    setMessage("");
    paintCompose();
  };

  keyboardEl.addEventListener("click", (event) => {
    const btn = (event.target as HTMLElement).closest<HTMLElement>("[data-key]");
    if (!btn) return;
    const key = btn.dataset.key ?? "";
    if (key === "Enter") submit();
    else if (key === "Backspace") del();
    else if (key.length === 1) typeLetter(key);
  });

  window.addEventListener("keydown", (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const target = event.target as HTMLElement | null;
    if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      submit();
      return;
    }
    if (event.key === "Backspace") {
      event.preventDefault();
      del();
      return;
    }
    const letter = event.key.toUpperCase();
    if (letter.length === 1 && letter >= "A" && letter <= "Z") {
      event.preventDefault();
      typeLetter(letter);
    }
  });

  if (stored.completed || allSolved()) persist();
  paint(false);
  if (message) setText("triad-msg", message);
}
