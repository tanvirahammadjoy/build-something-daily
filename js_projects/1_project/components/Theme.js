import { Storage } from "./Storage.js";

export function setupTheme(btn) {
  if (Storage.loadTheme()) document.body.classList.add("dark");

  btn.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark");
    Storage.saveTheme(isDark);
  });
}
