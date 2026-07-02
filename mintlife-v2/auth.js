/* ===========================================================
   auth.js — Google Identity Services (WEB only)
   ===========================================================
   SETUP: paste your Google OAuth Client ID below.
   Get one from: https://console.cloud.google.com/apis/credentials
   Add your Netlify URL to "Authorized JavaScript origins".
   =========================================================== */

const GOOGLE_CLIENT_ID = "740320665040-aac9nu2hga9gi0vtul1gskml9gcf8ivb.apps.googleusercontent.com";

const Auth = (() => {
  let gisReady = false;
  let modalEl  = null;

  function decodeJwt(token) {
    try {
      const b64 = token.split(".")[1].replace(/-/g,"+").replace(/_/g,"/");
      return JSON.parse(decodeURIComponent(atob(b64).split("").map(c =>
        "%" + ("00"+c.charCodeAt(0).toString(16)).slice(-2)).join("")));
    } catch { return null; }
  }

  function handleCredential(response) {
    const payload = decodeJwt(response.credential);
    if (!payload) { Toast.show("Google sign-in failed — please try again.", {type:"warn"}); return; }
    Identity.fromGoogle(payload);
    Toast.show(`Welcome, ${payload.name?.split(" ")[0] || "friend"} 🌿`);
    closeModal();
  }

  function initGis() {
    if (gisReady || typeof google === "undefined" || !google.accounts) {
      if (!gisReady) setTimeout(initGis, 300);
      return;
    }
    google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleCredential, auto_select: false });
    gisReady = true;
  }

  function renderGoogleBtn(container) {
    const draw = () => {
      if (typeof google === "undefined" || !google.accounts) { setTimeout(draw, 300); return; }
      container.innerHTML = "";
      google.accounts.id.renderButton(container, {
        theme: document.documentElement.getAttribute("data-theme") === "dark" ? "filled_black" : "outline",
        size: "large", shape: "pill", width: 280, text: "continue_with"
      });
    };
    initGis(); draw();
  }

  function openModal() {
    if (modalEl) return;
    modalEl = document.createElement("div");
    modalEl.className = "modal-overlay";
    modalEl.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true">
        <button class="btn-icon" id="closeAuthModal" aria-label="Close" style="position:absolute;top:14px;right:14px;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
        <div style="text-align:center;margin-bottom:20px;">
          <img src="logo.png" style="width:44px;height:44px;object-fit:contain;margin:0 auto 12px;" />
          <h2 style="font-family:var(--font-display);font-size:1.3rem;margin:0 0 6px;">Welcome to MintLife</h2>
          <p style="color:var(--text-secondary);font-size:0.86rem;margin:0;line-height:1.5;">Sign in to save your Mints, badges, and creations across every device.</p>
        </div>
        <div id="googleBtnWrap" style="display:flex;justify-content:center;min-height:44px;margin-bottom:12px;"></div>
        <button class="btn btn-ghost" id="guestBtn" style="width:100%;font-size:0.84rem;">Continue as guest (nothing saved)</button>
      </div>`;
    document.body.appendChild(modalEl);
    renderGoogleBtn(document.getElementById("googleBtnWrap"));
    document.getElementById("closeAuthModal").addEventListener("click", closeModal);
    document.getElementById("guestBtn").addEventListener("click", () => {
      Identity.save({ id: "guest", displayName: "Guest", username: null, mints: 0, streak: 0, badges: [], isGuest: true });
      closeModal();
      Toast.show("Browsing as guest — nothing will be saved.", {type:"warn"});
    });
    modalEl.addEventListener("click", e => { if (e.target === modalEl) closeModal(); });
    document.addEventListener("keydown", escClose);
  }

  function escClose(e) { if (e.key === "Escape") closeModal(); }

  function closeModal() {
    modalEl?.remove(); modalEl = null;
    document.removeEventListener("keydown", escClose);
  }

  function init() { initGis(); }

  return { init, openModal, closeModal };
})();

document.addEventListener("DOMContentLoaded", Auth.init);
