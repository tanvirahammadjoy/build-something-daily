import { useState, useEffect } from "react";

function load() {
  try {
    return JSON.parse(localStorage.getItem("todos")) || [];
  } catch {
    return [];
  }
}

export function useTodos() {
  const [todos, setTodos] = useState(load);

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  function addTodo({ text, category, due }) {
    if (!text.trim()) return;
    setTodos((prev) => [
      {
        id: crypto.randomUUID(),
        text: text.trim(),
        category: category.trim(),
        due,
        completed: false,
        createdAt: Date.now(),
      },
      ...prev,
    ]);
  }

  function toggleTodo(id) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  }

  function deleteTodo(id) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  function editTodo(id, newText) {
    if (!newText.trim()) return;
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, text: newText.trim() } : t)),
    );
  }

  function reorderTodos(newOrder) {
    setTodos(newOrder);
  }

  return { todos, addTodo, toggleTodo, deleteTodo, editTodo, reorderTodos };
}
