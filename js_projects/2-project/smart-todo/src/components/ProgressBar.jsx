export default function ProgressBar({ todos }) {
  const total = todos.length;
  const done = todos.filter((t) => t.completed).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div id="progress-wrap">
      <div id="progress-label">
        {done} of {total} done ({pct}%)
      </div>
      <div id="progress-container">
        <div id="progress-bar" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
