const CATEGORY_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f97316",
  "#10b981",
  "#14b8a6",
  "#ef4444",
  "#f59e0b",
];

const colorCache = {};

function getCategoryColor(cat) {
  if (!cat) return "#6b7280";
  if (!colorCache[cat]) {
    const i = Object.keys(colorCache).length % CATEGORY_COLORS.length;
    colorCache[cat] = CATEGORY_COLORS[i];
  }
  return colorCache[cat];
}

function getDueStatus(due) {
  if (!due) return { label: null, cls: "" };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(due + "T00:00:00");
  const diff = Math.round((d - today) / 86400000);
  if (diff < 0)
    return { label: `Overdue by ${Math.abs(diff)}d`, cls: "overdue" };
  if (diff === 0) return { label: "Due today", cls: "due-soon" };
  if (diff <= 3) return { label: `Due in ${diff}d`, cls: "due-soon" };
  return { label: `Due ${d.toLocaleDateString()}`, cls: "" };
}

export function TodoItem(todo, handlers) {
  const el = document.createElement("div");
  el.className = "todo" + (todo.completed ? " completed" : "");
  el.draggable = true;
  el.dataset.id = todo.id;

  const color = getCategoryColor(todo.category);
  el.style.borderLeftColor = color;

  const due = getDueStatus(todo.due);

  el.innerHTML = `
    <div class="todo-top">
      <input type="checkbox" ${todo.completed ? "checked" : ""} />
      <span class="todo-text">${escapeHtml(todo.text)}</span>
      <div class="todo-actions">
        <button class="btn-edit" title="Edit">✏️</button>
        <button class="btn-del"  title="Delete">🗑️</button>
      </div>
    </div>
    <div class="todo-meta">
      ${
        todo.category
          ? `<span class="tag" style="background:${color}">${escapeHtml(todo.category)}</span>`
          : ""
      }
      ${due.label ? `<span class="due ${due.cls}">${due.label}</span>` : ""}
    </div>
  `;

  el.querySelector("input").addEventListener("change", () =>
    handlers.toggle(todo.id),
  );
  el.querySelector(".btn-del").addEventListener("click", () =>
    handlers.delete(todo.id),
  );
  el.querySelector(".btn-edit").addEventListener("click", () =>
    handlers.edit(todo.id),
  );
  el.querySelector(".todo-text").addEventListener("click", () =>
    handlers.edit(todo.id),
  );

  // Drag & drop
  el.addEventListener("dragstart", (e) => {
    el.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
    handlers.dragStart(todo.id);
  });
  el.addEventListener("dragend", () => el.classList.remove("dragging"));
  el.addEventListener("dragover", (e) => {
    e.preventDefault();
    el.classList.add("drag-over");
  });
  el.addEventListener("dragleave", () => el.classList.remove("drag-over"));
  el.addEventListener("drop", (e) => {
    e.preventDefault();
    el.classList.remove("drag-over");
    handlers.drop(todo.id);
  });

  return el;
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
