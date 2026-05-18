import { useState } from "react";

export default function AddTodoForm({ onAdd, categories }) {
  const [text, setText] = useState("");
  const [category, setCat] = useState("");
  const [due, setDue] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onAdd({ text, category, due });
    setText("");
    setCat("");
    setDue("");
  }

  return (
    <form id="todo-input" onSubmit={handleSubmit}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What needs to be done?"
        autoFocus
      />
      <input
        value={category}
        onChange={(e) => setCat(e.target.value)}
        placeholder="Category..."
        list="cat-list"
      />
      <datalist id="cat-list">
        {categories.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
      <input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
      <button type="submit">＋ Add</button>
    </form>
  );
}
