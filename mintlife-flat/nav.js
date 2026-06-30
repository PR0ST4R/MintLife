/* ===========================================================
   nav.js — renders account state in the navbar on every page
   =========================================================== */

const NavUI = (() => {
  function render() {
    const slot = document.getElementById("navAccountSlot");
    if (!slot) return;
    const user = Auth.getUser();

    if (user && user.signedIn) {
      slot.innerHTML = `
        <div class="account-chip" id="accountChipBtn" tabindex="0" role="button" aria-haspopup="true">
          ${
            user.picture
              ? `<img src="${user.picture}" alt="" referrerpolicy="no-referrer" />`
              : `<span class="avatar-fallback">${initials(user.name)}</span>`
          }
          <span>${firstName(user.name)}</span>
        </div>
      `;
      document.getElementById("accountChipBtn").addEventListener("click", openAccountMenu);
    } else if (user && user.signedIn === false) {
      slot.innerHTML = `
        <span style="font-size:0.82rem;color:var(--text-tertiary);margin-right:4px;">Guest mode</span>
        <button class="btn btn-secondary btn-sm" id="navSignInBtn">Sign in</button>
      `;
      document.getElementById("navSignInBtn").addEventListener("click", Auth.openLoginModal);
    } else {
      slot.innerHTML = `<button class="btn btn-primary btn-sm" id="navSignInBtn">Sign in</button>`;
      document.getElementById("navSignInBtn").addEventListener("click", Auth.openLoginModal);
    }
  }

  function initials(name) {
    return (name || "?")
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  function firstName(name) {
    return (name || "").split(" ")[0] || "Account";
  }

  function openAccountMenu() {
    const existing = document.getElementById("accountMenuPop");
    if (existing) {
      existing.remove();
      return;
    }
    const chip = document.getElementById("accountChipBtn");
    const rect = chip.getBoundingClientRect();
    const menu = document.createElement("div");
    menu.id = "accountMenuPop";
    menu.style.cssText = `
      position: fixed;
      top: ${rect.bottom + 8}px;
      right: ${window.innerWidth - rect.right}px;
      background: var(--surface);
      border: 1px solid var(--border-strong);
      box-shadow: var(--shadow-lg);
      border-radius: var(--radius-md);
      padding: 10px;
      min-width: 200px;
      z-index: 120;
      animation: modalIn 200ms var(--ease-out);
    `;
    const user = Auth.getUser();
    menu.innerHTML = `
      <div style="padding:8px 10px 12px;border-bottom:1px solid var(--border);margin-bottom:8px;">
        <div style="font-weight:700;font-size:0.9rem;">${user.name}</div>
        <div style="font-size:0.78rem;color:var(--text-tertiary);">${user.email || ""}</div>
      </div>
      <a href="${rootPath()}account.html" class="btn btn-ghost" style="width:100%;justify-content:flex-start;">My account</a>
      <button class="btn btn-ghost" id="menuSignOut" style="width:100%;justify-content:flex-start;color:#DC4C4C;">Sign out</button>
    `;
    document.body.appendChild(menu);
    document.getElementById("menuSignOut").addEventListener("click", () => {
      Auth.signOut();
      menu.remove();
    });
    setTimeout(() => {
      document.addEventListener("click", outsideClose);
    }, 0);
    function outsideClose(e) {
      if (!menu.contains(e.target) && e.target !== chip) {
        menu.remove();
        document.removeEventListener("click", outsideClose);
      }
    }
  }

  function rootPath() {
    return ""; // flat file structure — everything lives next to everything else
  }

  function init() {
    render();
    Auth.onChange(render);
  }

  return { init, render };
})();

document.addEventListener("DOMContentLoaded", NavUI.init);
