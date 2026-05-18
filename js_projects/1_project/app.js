import { Storage } from "./components/Storage.js";
import { TodoItem } from "./components/TodoItem.js";
import { setupFilters } from "./components/Filters.js";
import { setupTheme } from "./components/Theme.js";

// ── State ──────────────────────────────────────────────
let todos = Storage.load();
let filter = "all";
let dragSrcId = null;

// ── DOM refs ───────────────────────────────────────────
const q = (s) => document.querySelector(s);
const els = {
  list: q("#todo-list"),
  text: q("#todo-text"),
  cat: q("#todo-category"),
  date: q("#todo-date"),
  add: q("#add-btn"),
  search: q("#search"),
  filters: q("#filter-buttons"),
  progress: q("#progress-bar"),
  label: q("#progress-label"),
  catList: q("#cat-list"),
  empty: q("#empty-state"),
  theme: q("#theme-toggle"),
};

// ── Persistence ────────────────────────────────────────
function save() {
  Storage.save(todos);
}

// ── Actions ────────────────────────────────────────────
function addTodo() {
  const text = els.text.value.trim();
  if (!text) {
    els.text.focus();
    return;
  }

  todos.unshift({
    id: crypto.randomUUID(),
    text,
    category: els.cat.value.trim(),
    due: els.date.value,
    completed: false,
    createdAt: Date.now(),
  });

  els.text.value = "";
  els.cat.value = "";
  els.date.value = "";
  els.text.focus();

  save();
  render();
}

function toggleComplete(id) {
  const t = todos.find((x) => x.id === id);
  if (t) {
    t.completed = !t.completed;
    save();
    render();
  }
}

function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  save();
  render();
}

function editTodo(id) {
  const t = todos.find((x) => x.id === id);
  if (!t) return;
  const newText = prompt("Edit todo:", t.text);
  if (newText !== null && newText.trim()) {
    t.text = newText.trim();
    save();
    render();
  }
}

// ── Filtering ──────────────────────────────────────────
function filterList() {
  let list = [...todos];
  const s = els.search.value.toLowerCase().trim();

  if (s) list = list.filter((t) => t.text.toLowerCase().includes(s));
  if (filter === "active") list = list.filter((t) => !t.completed);
  if (filter === "completed") list = list.filter((t) => t.completed);

  return list;
}

// ── Progress ───────────────────────────────────────────
function renderProgress() {
  const done = todos.filter((t) => t.completed).length;
  const total = todos.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  els.progress.style.width = pct + "%";
  els.label.textContent = `${done} of ${total} done (${pct}%)`;
}

// ── Category autocomplete ──────────────────────────────
function renderCatList() {
  const cats = [...new Set(todos.map((t) => t.category).filter(Boolean))];
  els.catList.innerHTML = cats
    .map((c) => `<option value="${c}"></option>`)
    .join("");
}

// ── Main Render ────────────────────────────────────────
function render() {
  const list = filterList();

  els.list.innerHTML = "";
  els.empty.classList.toggle("hidden", list.length > 0);

  list.forEach((t) => {
    els.list.appendChild(
      TodoItem(t, {
        toggle: toggleComplete,
        delete: deleteTodo,
        edit: editTodo,
        dragStart: (id) => (dragSrcId = id),
        drop: (id) => {
          const from = todos.findIndex((x) => x.id === dragSrcId);
          const to = todos.findIndex((x) => x.id === id);
          if (from === -1 || to === -1 || from === to) return;
          const [moved] = todos.splice(from, 1);
          todos.splice(to, 0, moved);
          save();
          render();
        },
      }),
    );
  });

  renderProgress();
  renderCatList();
}

// ── Event wiring ───────────────────────────────────────
els.add.addEventListener("click", addTodo);
els.text.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTodo();
});
els.search.addEventListener("input", render);

setupFilters(els.filters, (f) => {
  filter = f;
  render();
});
setupTheme(els.theme);

render();
