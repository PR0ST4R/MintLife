/* ===========================================================
   loader.js — animated leaf loader
   The leaf itself stays perfectly still.
   A thin glowing mint segment races around the INNER border
   of the leaf outline, leaving a fading trail.
   =========================================================== */

const LeafLoader = (() => {
  // A single closed path approximating the leaf silhouette,
  // inset slightly so the trace sits just inside the outline.
  const LEAF_PATH = `
    M 100 26
    C 140 30, 168 56, 170 96
    C 172 130, 150 158, 118 170
    C 86 182, 48 176, 32 150
    C 16 124, 20 88, 44 62
    C 62 42, 80 30, 100 26 Z
  `;

  function svgMarkup(size = 64) {
    return `
      <svg class="leaf-loader" viewBox="0 0 200 200" width="${size}" height="${size}" role="img" aria-label="Loading">
        <path class="leaf-base" d="${LEAF_PATH}"></path>
        <path class="leaf-vein" d="M 48 150 C 75 122, 100 95, 138 56"
              stroke="currentColor" stroke-width="3" stroke-linecap="round"
              fill="none" opacity="0.18"></path>
        <path class="leaf-trace" id="leafTracePath_UID" d="${LEAF_PATH}"
              pathLength="100"
              stroke-dasharray="14 86"
              stroke-dashoffset="0"></path>
      </svg>
    `;
  }

  let uidCounter = 0;

  function create(size = 64) {
    uidCounter += 1;
    const uid = `lt-${uidCounter}`;
    const wrapper = document.createElement("div");
    wrapper.innerHTML = svgMarkup(size).replace(/_UID/g, `-${uid}`);
    const svg = wrapper.firstElementChild;
    const trace = svg.querySelector(`#leafTracePath-${uid}`);

    // animate dashoffset continuously — CSS handles smoothness via animation
    trace.style.animation = "leafTrace 1.8s linear infinite";
    return svg;
  }

  function mountInto(el, size = 64) {
    el.innerHTML = "";
    el.appendChild(create(size));
  }

  // Full screen overlay used between page loads / heavy operations
  let overlayEl = null;
  let overlayTimer = null;

  function showOverlay(message = "Loading") {
    if (overlayEl) return;
    overlayEl = document.createElement("div");
    overlayEl.className = "loading-overlay";
    overlayEl.innerHTML = `<p id="loaderMsg">${message}</p>`;
    overlayEl.prepend(create(72));
    document.body.appendChild(overlayEl);
  }

  function setMessage(message) {
    const m = document.getElementById("loaderMsg");
    if (m) m.textContent = message;
  }

  function hideOverlay(delay = 0) {
    if (!overlayEl) return;
    clearTimeout(overlayTimer);
    overlayTimer = setTimeout(() => {
      overlayEl.classList.add("hide");
      setTimeout(() => {
        overlayEl?.remove();
        overlayEl = null;
      }, 400);
    }, delay);
  }

  return { create, mountInto, showOverlay, hideOverlay, setMessage };
})();

// Inject keyframes once
(function injectLeafTraceKeyframes() {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes leafTrace {
      0%   { stroke-dashoffset: 0; }
      100% { stroke-dashoffset: -100; }
    }
    .leaf-trace { color: var(--mint-400); }
  `;
  document.head.appendChild(style);
})();
