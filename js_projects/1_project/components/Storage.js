export const Storage = {
  load() {
    return JSON.parse(localStorage.getItem("todos")) || [];
  },
  save(todos) {
    localStorage.setItem("todos", JSON.stringify(todos));
  },
  loadTheme() {
    return localStorage.getItem("theme") === "dark";
  },
  saveTheme(dark) {
    localStorage.setItem("theme", dark ? "dark" : "light");
  },
};
