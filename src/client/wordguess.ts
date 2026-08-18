import { formatUtcDate, utcDateKey } from "../lib/date";
import {
  WORDGUESS_BOARD_COUNT,
  WORDGUESS_LABELS,
  WORDGUESS_MAX_GUESSES,
  WORDGUESS_WORD_LENGTH,
  closenessForBoard,
  generateWordGuess,
  isAllowedGuess,
  rankBoardOrder,
  scoreGuess,
  type TileMark,
} from "../lib/wordguess";
import { loadWordGuessProgress, recordCompletion, saveWordGuessProgress } from "../lib/storage";

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

export function initWordGuess(): void {
  const today = utcDateKey();
  setText("play-date", formatUtcDate(today));
  window.setTimeout(bindWordGuess, 0);
}

function bindWordGuess(): void {
  const today = utcDateKey();
  const puzzle = generateWordGuess(today);
  const stored = loadWordGuessProgress(today);
  const guesses = [...stored.guesses];
  let draft = "";
  let message = "";

  const compose = document.getElementById("wordguess-compose-row");
  const boardsEl = document.getElementById("wordguess-boards");
  const keyboardEl = document.getElementById("wordguess-keyboard");
  if (!compose || !boardsEl || !keyboardEl) return;

  compose.replaceChildren();
  for (let i = 0; i < WORDGUESS_WORD_LENGTH; i++) {
    const tile = document.createElement("div");
    tile.className = "wordguess-tile";
    tile.dataset.slot = String(i);
    compose.append(tile);
  }

  boardsEl.replaceChildren();
  for (let b = 0; b < WORDGUESS_BOARD_COUNT; b++) {
    const board = document.createElement("section");
    board.className = "wordguess-board";
    board.dataset.board = String(b);
    board.setAttribute("aria-label", `Board ${WORDGUESS_LABELS[b]}`);

    const header = document.createElement("div");
    header.className = "wordguess-board-head";
    const label = document.createElement("span");
    label.className = "wordguess-board-label";
    label.textContent = `Board ${WORDGUESS_LABELS[b]}`;
    const meter = document.createElement("span");
    meter.className = "wordguess-board-meter";
    meter.dataset.meter = String(b);
    header.append(label, meter);

    const rows = document.createElement("div");
    rows.className = "wordguess-rows";
    for (let r = 0; r < WORDGUESS_MAX_GUESSES; r++) {
      const row = document.createElement("div");
      row.className = "wordguess-row";
      row.dataset.row = String(r);
      for (let c = 0; c < WORDGUESS_WORD_LENGTH; c++) {
        const tile = document.createElement("div");
        tile.className = "wordguess-tile";
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
    row.className = "wordguess-kb-row";
    if (rowIndex === 2) {
      const enter = document.createElement("button");
      enter.type = "button";
      enter.className = "wordguess-key wordguess-key-wide";
      enter.dataset.key = "Enter";
      enter.textContent = "Enter";
      row.append(enter);
    }
    for (const letter of rowLetters) {
      const key = document.createElement("button");
      key.type = "button";
      key.className = "wordguess-key";
      key.dataset.key = letter;
      const glyph = document.createElement("span");
      glyph.textContent = letter;
      const marks = document.createElement("span");
      marks.className = "wordguess-key-marks";
      marks.setAttribute("aria-hidden", "true");
      for (let b = 0; b < WORDGUESS_BOARD_COUNT; b++) {
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
      del.className = "wordguess-key wordguess-key-wide";
      del.dataset.key = "Backspace";
      del.textContent = "Delete";
      row.append(del);
    }
    keyboardEl.append(row);
  });

  const solved = (): boolean[] => puzzle.answers.map((answer) => guesses.includes(answer));
  const allSolved = (): boolean => solved().every(Boolean);
  const locked = (): boolean => allSolved() || guesses.length >= WORDGUESS_MAX_GUESSES;

  const persist = (): void => {
    const completed = allSolved();
    const failed = !completed && guesses.length >= WORDGUESS_MAX_GUESSES;
    saveWordGuessProgress({ date: today, guesses, completed, failed });
    if (completed) recordCompletion("wordguess", today);
  };

  const setMessage = (text: string): void => {
    message = text;
    setText("wordguess-msg", text);
  };

  const paintCompose = (): void => {
    const tiles = compose.querySelectorAll<HTMLElement>(".wordguess-tile");
    tiles.forEach((tile, i) => {
      const ch = draft[i] ?? "";
      tile.textContent = ch;
      tile.classList.toggle("is-draft", Boolean(ch));
      tile.classList.toggle("is-empty", !ch);
    });
    const remaining = WORDGUESS_MAX_GUESSES - guesses.length;
    setText(
      "wordguess-status",
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
    const leadIndex = order[order.length - 1];

    puzzle.answers.forEach((answer, b) => {
      const board = boardsEl.querySelector<HTMLElement>(`[data-board="${b}"]`);
      if (!board) return;
      const closeness = closenessForBoard(guesses, answer);
      board.style.order = String(order.indexOf(b));
      board.classList.toggle("is-solved", done[b]!);
      board.classList.toggle("is-lead", !done[b] && leadIndex === b && guesses.length > 0);

      const meter = board.querySelector("[data-meter]");
      if (meter) {
        meter.textContent = done[b]
          ? "Solved"
          : closeness.exact === 0 && closeness.present === 0
            ? "Unopened"
            : `${closeness.exact} locked`;
      }

      const rows = board.querySelectorAll<HTMLElement>(".wordguess-row");
      rows.forEach((row, r) => {
        const guess = guesses[r];
        const tiles = row.querySelectorAll<HTMLElement>(".wordguess-tile");
        row.classList.toggle("is-unused", !guess);
        tiles.forEach((tile, c) => {
          tile.className = "wordguess-tile";
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
      const lead = boardsEl.querySelector<HTMLElement>(`[data-board="${leadIndex}"]`);
      lead?.scrollIntoView({
        block: "end",
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
    }
  };

  const paintKeyboard = (): void => {
    const keys = keyboardEl.querySelectorAll<HTMLButtonElement>(".wordguess-key[data-key]");
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
    const win = document.getElementById("wordguess-complete");
    const lose = document.getElementById("wordguess-failed");
    if (allSolved()) {
      win?.classList.add("is-visible");
      win?.removeAttribute("hidden");
      lose?.setAttribute("hidden", "");
    } else if (guesses.length >= WORDGUESS_MAX_GUESSES) {
      const reveal = document.getElementById("wordguess-reveal");
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
    if (draft.length !== WORDGUESS_WORD_LENGTH) {
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
    if (draft.length >= WORDGUESS_WORD_LENGTH) return;
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
  if (message) setText("wordguess-msg", message);
}
