export function initPlayChrome(): void {
  const button = document.getElementById("play-pull");
  const action = button?.querySelector(".play-pull-action");
  if (!button) return;

  const setOpen = (open: boolean): void => {
    document.body.classList.toggle("chrome-open", open);
    button.setAttribute("aria-expanded", open ? "true" : "false");
    if (action) action.textContent = open ? "Hide" : "Details";
  };

  button.addEventListener("click", () => {
    setOpen(!document.body.classList.contains("chrome-open"));
  });
}
