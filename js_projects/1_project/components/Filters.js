export function setupFilters(container, onChange) {
  ["all", "active", "completed"].forEach((f, i) => {
    const btn = document.createElement("button");
    btn.textContent = f.charAt(0).toUpperCase() + f.slice(1);
    btn.className = "filter-btn" + (i === 0 ? " active" : "");
    btn.dataset.filter = f;
    btn.addEventListener("click", () => {
      container
        .querySelectorAll(".filter-btn")
        .forEach((b) => b.classList.toggle("active", b === btn));
      onChange(f);
    });
    container.appendChild(btn);
  });
}
