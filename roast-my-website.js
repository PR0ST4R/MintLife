/* ===========================================================
   roast-my-website.js — controller for the roast tool
   =========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const urlInput = document.getElementById("urlInput");
  const roastBtn = document.getElementById("roastBtn");
  const resultArea = document.getElementById("resultArea");
  const emptyHint = document.getElementById("emptyHint");
  const scoreGrid = document.getElementById("scoreGrid");
  const roastText = document.getElementById("roastText");

  const SCORE_LABELS = [
    { key: "design", label: "Design" },
    { key: "performance", label: "Performance" },
    { key: "seo", label: "SEO" },
    { key: "accessibility", label: "Accessibility" },
  ];

  async function runRoast() {
    const value = urlInput.value.trim();
    if (!value) {
      Toast.show("Paste a URL first.", { type: "warn" });
      urlInput.focus();
      return;
    }

    roastBtn.disabled = true;
    roastBtn.innerHTML = `<span class="inline-loader" id="btnLoader"></span>`;
    LeafLoader.mountInto(document.getElementById("btnLoader"), 18);

    try {
      const result = await RoastEngine.generate(value);
      renderResult(result);
      persistLast(value);
    } catch (err) {
      console.error(err);
      Toast.show("Something went wrong generating the roast.", { type: "warn" });
    } finally {
      roastBtn.disabled = false;
      roastBtn.textContent = "Roast it";
    }
  }

  function renderResult(result) {
    emptyHint.style.display = "none";
    resultArea.style.display = "block";

    scoreGrid.innerHTML = SCORE_LABELS.map(
      (s) => `
      <div class="card score-card">
        <div class="score-num">${result.scores[s.key]}</div>
        <div class="score-label">${s.label}</div>
      </div>`
    ).join("");

    roastText.textContent = result.roast;
    resultArea.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function persistLast(url) {
    if (typeof Store !== "undefined" && Store.isPersistent()) {
      Store.set("lastRoastedUrl", url);
    }
  }

  function restoreLast() {
    if (typeof Store !== "undefined" && Store.isPersistent()) {
      const last = Store.get("lastRoastedUrl", "");
      if (last) urlInput.value = last;
    }
  }

  roastBtn.addEventListener("click", runRoast);
  urlInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") runRoast();
  });
  document.getElementById("roastAgainBtn")?.addEventListener("click", () => {
    resultArea.style.display = "none";
    emptyHint.style.display = "block";
    urlInput.value = "";
    urlInput.focus();
  });

  restoreLast();
});
