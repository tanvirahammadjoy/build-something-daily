import { useState, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import { useTodos } from "./hooks/useTodos";
import { useTheme } from "./hooks/useTheme";

import AddTodoForm from "./components/AddTodoForm";
import TodoItem from "./components/TodoItem";
import FilterBar from "./components/FilterBar";
import SearchBar from "./components/SearchBar";
import ProgressBar from "./components/ProgressBar";

export default function App() {
  const { todos, addTodo, toggleTodo, deleteTodo, editTodo, reorderTodos } =
    useTodos();
  const { dark, toggleTheme } = useTheme();

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const categories = useMemo(
    () => [...new Set(todos.map((t) => t.category).filter(Boolean))],
    [todos],
  );

  const visible = useMemo(() => {
    let list = [...todos];
    const s = search.toLowerCase().trim();
    if (s) list = list.filter((t) => t.text.toLowerCase().includes(s));
    if (filter === "active") list = list.filter((t) => !t.completed);
    if (filter === "completed") list = list.filter((t) => t.completed);
    return list;
  }, [todos, filter, search]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd({ active, over }) {
    if (!over || active.id === over.id) return;
    const from = todos.findIndex((t) => t.id === active.id);
    const to = todos.findIndex((t) => t.id === over.id);
    reorderTodos(arrayMove(todos, from, to));
  }

  return (
    <>
      <header>
        <div className="logo">✅ Smart Todo</div>
        <button className="icon-btn" onClick={toggleTheme}>
          {dark ? "☀️" : "🌙"}
        </button>
      </header>

      <AddTodoForm onAdd={addTodo} categories={categories} />

      <section id="toolbar">
        <SearchBar value={search} onChange={setSearch} />
        <FilterBar current={filter} onChange={setFilter} />
      </section>

      <ProgressBar todos={todos} />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={visible.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <main id="todo-list">
            {visible.length === 0 && (
              <p id="empty-state">🎉 Nothing here. Add a todo above!</p>
            )}
            {visible.map((t) => (
              <TodoItem
                key={t.id}
                todo={t}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                onEdit={editTodo}
              />
            ))}
          </main>
        </SortableContext>
      </DndContext>
    </>
  );
}
