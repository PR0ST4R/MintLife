/* ===========================================================
   toast.js — small notification system
   =========================================================== */

const Toast = (() => {
  let stack;

  function ensureStack() {
    if (!stack) {
      stack = document.createElement("div");
      stack.className = "toast-stack";
      stack.setAttribute("aria-live", "polite");
      document.body.appendChild(stack);
    }
    return stack;
  }

  function show(message, { type = "default", duration = 3600 } = {}) {
    const root = ensureStack();
    const el = document.createElement("div");
    el.className = `toast${type === "warn" ? " warn" : ""}`;
    el.innerHTML = `<span class="dot"></span><span>${message}</span>`;
    root.appendChild(el);

    const remove = () => {
      el.classList.add("leaving");
      setTimeout(() => el.remove(), 220);
    };
    setTimeout(remove, duration);
    el.addEventListener("click", remove);
  }

  return { show };
})();
