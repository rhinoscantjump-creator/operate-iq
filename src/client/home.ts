import { formatCountdown, formatUtcDate, msUntilNextUtcMidnight, utcDateKey } from "../lib/date";
import { isSolvedToday, loadStreaks, type PuzzleId } from "../lib/storage";

const PUZZLE_LABEL: Record<PuzzleId, string> = {
  wordsearch: "wordsearch",
  sudoku: "sudoku",
  wordguess: "WordGuess",
};

function setText(id: string, value: string): void {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function paintCard(id: PuzzleId, today: string): void {
  const solved = isSolvedToday(id, today);
  document.querySelectorAll(`[data-puzzle-card="${id}"]`).forEach((card) => {
    const status = card.querySelector("[data-card-status]");
    const cta = card.querySelector("[data-card-cta]");
    if (status) status.textContent = solved ? "Solved" : "Open";
    if (cta) cta.textContent = solved ? "Play again" : `Play today's ${PUZZLE_LABEL[id]}`;
    card.classList.toggle("is-solved", solved);
  });
}

function paintStreaks(): void {
  const streaks = loadStreaks();
  setText("streak-wordsearch", String(streaks.wordsearch));
  setText("streak-sudoku", String(streaks.sudoku));
  setText("streak-wordguess", String(streaks.wordguess));
}

function tickCountdown(): void {
  setText("daily-countdown", formatCountdown(msUntilNextUtcMidnight()));
}

export function initHome(): void {
  const today = utcDateKey();
  setText("daily-date", formatUtcDate(today));
  paintCard("wordsearch", today);
  paintCard("sudoku", today);
  paintCard("wordguess", today);
  paintStreaks();
  tickCountdown();
  window.setInterval(() => {
    tickCountdown();
    if (utcDateKey() !== today) window.location.reload();
  }, 1000);
}
