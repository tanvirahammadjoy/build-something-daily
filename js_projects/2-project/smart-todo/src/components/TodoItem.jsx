import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getCategoryColor } from "../utils/categories";
import { getDueStatus } from "../utils/dates";

export default function TodoItem({ todo, onToggle, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    borderLeftColor: getCategoryColor(todo.category),
  };

  const due = getDueStatus(todo.due);

  function submitEdit(e) {
    e.preventDefault();
    onEdit(todo.id, editText);
    setEditing(false);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`todo ${todo.completed ? "completed" : ""}`}
      {...attributes}
    >
      <div className="todo-top">
        {/* drag handle */}
        <span className="drag-handle" {...listeners}>
          ⠿
        </span>

        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
        />

        {editing ? (
          <form
            onSubmit={submitEdit}
            style={{ flex: 1, display: "flex", gap: 6 }}
          >
            <input
              className="edit-input"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              autoFocus
            />
            <button type="submit">✔</button>
            <button type="button" onClick={() => setEditing(false)}>
              ✖
            </button>
          </form>
        ) : (
          <span
            className="todo-text"
            onClick={() => {
              setEditing(true);
              setEditText(todo.text);
            }}
          >
            {todo.text}
          </span>
        )}

        <div className="todo-actions">
          <button className="btn-edit" onClick={() => setEditing(true)}>
            ✏️
          </button>
          <button className="btn-del" onClick={() => onDelete(todo.id)}>
            🗑️
          </button>
        </div>
      </div>

      <div className="todo-meta">
        {todo.category && (
          <span
            className="tag"
            style={{ background: getCategoryColor(todo.category) }}
          >
            {todo.category}
          </span>
        )}
        {due && <span className={`due ${due.cls}`}>{due.label}</span>}
      </div>
    </div>
  );
}
