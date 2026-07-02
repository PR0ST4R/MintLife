/* ===========================================================
   nav.js — navbar account/identity UI
   =========================================================== */

const NavUI = (() => {
  function initials(name) {
    return (name||"?").split(" ").map(p=>p[0]).join("").slice(0,2).toUpperCase();
  }

  function render() {
    const slot = document.getElementById("navAccountSlot");
    if (!slot) return;
    const p = Identity.getProfile();

    if (!p || p.isGuest) {
      slot.innerHTML = `
        ${p?.isGuest ? `<span style="font-size:0.78rem;color:var(--text-tertiary);">Guest</span>` : ""}
        <button class="btn btn-primary btn-sm" id="navSignInBtn">Sign in</button>`;
      document.getElementById("navSignInBtn")?.addEventListener("click", () => {
        if (typeof Auth !== "undefined") Auth.openModal();
      });
      return;
    }

    slot.innerHTML = `
      <div class="mint-badge"><span class="coin">🌿</span> ${p.mints || 0} Mints</div>
      <div class="account-chip" id="accountChip" tabindex="0" role="button">
        ${p.picture
          ? `<img src="${p.picture}" alt="" referrerpolicy="no-referrer" />`
          : `<span class="avatar-fallback">${initials(p.displayName||p.username||"?")}</span>`}
        <span>${(p.displayName||p.username||"").split(" ")[0]}</span>
      </div>`;

    document.getElementById("accountChip")?.addEventListener("click", openMenu);
  }

  function openMenu() {
    const existing = document.getElementById("navMenuPop");
    if (existing) { existing.remove(); return; }
    const chip = document.getElementById("accountChip");
    const rect = chip.getBoundingClientRect();
    const p = Identity.getProfile();
    const menu = document.createElement("div");
    menu.id = "navMenuPop";
    menu.style.cssText = `position:fixed;top:${rect.bottom+6}px;right:${window.innerWidth-rect.right}px;
      background:var(--surface);border:1px solid var(--border);box-shadow:var(--shadow-lg);
      border-radius:var(--radius-md);padding:8px;min-width:190px;z-index:120;animation:modalIn 180ms ease;`;
    const root = window.location.pathname.includes("app") ? "" : "";
    menu.innerHTML = `
      <div style="padding:7px 10px 10px;border-bottom:1px solid var(--border);margin-bottom:6px;">
        <div style="font-weight:700;font-size:0.87rem;">${p.displayName||p.username}</div>
        ${p.username ? `<div style="font-size:0.74rem;color:var(--text-tertiary);">@${p.username}</div>` : ""}
        <div style="font-size:0.74rem;color:var(--text-tertiary);margin-top:2px;">${p.mints||0} Mints · ${p.streak||0} day streak</div>
      </div>
      <a href="account.html" class="btn btn-ghost btn-sm" style="width:100%;justify-content:flex-start;">My account</a>
      <a href="leaderboard.html" class="btn btn-ghost btn-sm" style="width:100%;justify-content:flex-start;">Leaderboard</a>
      <button class="btn btn-ghost btn-sm" id="menuSignOut" style="width:100%;justify-content:flex-start;color:#DC4C4C;">Sign out</button>`;
    document.body.appendChild(menu);
    document.getElementById("menuSignOut").addEventListener("click", () => {
      Identity.signOut(); menu.remove();
      window.location.reload();
    });
    setTimeout(() => document.addEventListener("click", outsideClose), 0);
    function outsideClose(e) {
      if (!menu.contains(e.target) && e.target !== chip) { menu.remove(); document.removeEventListener("click", outsideClose); }
    }
  }

  function init() {
    render();
    Identity.onChange(render);
  }

  return { init, render };
})();

document.addEventListener("DOMContentLoaded", NavUI.init);
