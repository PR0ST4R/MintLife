/* ===========================================================
   auth.js — real Google Sign-In via Google Identity Services
   ===========================================================

   SETUP REQUIRED:
   1. Go to https://console.cloud.google.com/apis/credentials
   2. Create an OAuth 2.0 Client ID (type: "Web application")
   3. Add your site's origin(s) to "Authorized JavaScript origins"
      e.g. http://localhost:5500  and  https://yourdomain.com
   4. Paste the Client ID below into GOOGLE_CLIENT_ID.
   5. Make sure index.html (and every page using the login modal)
      loads:  <script src="https://accounts.google.com/gsi/client" async defer></script>

   No backend is required for this flow — Google Identity Services
   returns a signed JWT credential directly to the browser, which is
   decoded client-side below to read the user's name/email/picture.
   For production apps wanting verified server-side sessions, send
   `credential` to your backend and verify it with Google's
   tokeninfo endpoint or a server-side library.
   =========================================================== */

const GOOGLE_CLIENT_ID = "740320665040-aac9nu2hga9gi0vtul1gskml9gcf8ivb.apps.googleusercontent.com";

const Auth = (() => {
  const USER_KEY = "mintlife_user";
  let currentUser = loadUser();
  let listeners = [];
  let gisReady = false;
  let pendingPrompt = null;

  function loadUser() {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function persistUser(user) {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }

  function getUser() {
    return currentUser;
  }

  function isGuest() {
    return !!currentUser && currentUser.signedIn === false;
  }

  function isSignedIn() {
    return !!currentUser && currentUser.signedIn === true;
  }

  function onChange(fn) {
    listeners.push(fn);
  }

  function notify() {
    listeners.forEach((fn) => fn(currentUser));
    document.dispatchEvent(new CustomEvent("mintlife:auth-changed", { detail: currentUser }));
  }

  function decodeJwt(token) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const json = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(json);
    } catch (e) {
      console.error("Failed to decode credential", e);
      return null;
    }
  }

  function handleCredentialResponse(response) {
    const payload = decodeJwt(response.credential);
    if (!payload) {
      Toast.show("Couldn't read your Google account. Please try again.", { type: "warn" });
      return;
    }
    currentUser = {
      signedIn: true,
      id: payload.sub,
      name: payload.name || payload.email || "MintLife user",
      email: payload.email || "",
      picture: payload.picture || "",
      // theme + other prefs are pulled per-account from Store after sign-in
    };
    persistUser(currentUser);

    // restore this account's saved theme preference, if any
    const savedTheme = Store.get("themePreference", null);
    if (savedTheme) Theme.apply(savedTheme);

    notify();
    Toast.show(`Welcome back, ${firstName(currentUser.name)} 🌿`);
    closeLoginModal();
  }

  function firstName(full) {
    return (full || "").split(" ")[0];
  }

  function initGis() {
    if (gisReady) return;
    if (typeof google === "undefined" || !google.accounts || !google.accounts.id) {
      // GIS script not loaded yet — retry shortly
      setTimeout(initGis, 300);
      return;
    }
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: true,
    });
    gisReady = true;
    if (pendingPrompt) {
      pendingPrompt();
      pendingPrompt = null;
    }
  }

  function renderGoogleButton(containerEl) {
    if (!containerEl) return;
    const draw = () => {
      if (typeof google === "undefined" || !google.accounts || !google.accounts.id) {
        setTimeout(draw, 300);
        return;
      }
      containerEl.innerHTML = "";
      google.accounts.id.renderButton(containerEl, {
        theme: document.documentElement.getAttribute("data-theme") === "dark" ? "filled_black" : "outline",
        size: "large",
        shape: "pill",
        width: 280,
        text: "continue_with",
      });
    };
    initGis();
    draw();
  }

  function continueAsGuest() {
    currentUser = { signedIn: false, id: null, name: "Guest", email: "", picture: "" };
    persistUser(null); // guests are never persisted to localStorage user key
    sessionStorage.setItem("mintlife_guest_active", "1");
    notify();
    closeLoginModal();
    Toast.show("Continuing as guest — your activity won't be saved.", { type: "warn" });
  }

  function signOut() {
    const wasSignedIn = isSignedIn();
    currentUser = null;
    persistUser(null);
    sessionStorage.removeItem("mintlife_guest_active");
    if (wasSignedIn && typeof google !== "undefined" && google.accounts) {
      google.accounts.id.disableAutoSelect();
    }
    notify();
    Toast.show("You've been signed out.");
  }

  // ---------- Login modal ----------
  let modalEl = null;

  function openLoginModal() {
    if (modalEl) return;
    modalEl = document.createElement("div");
    modalEl.className = "modal-overlay";
    modalEl.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="loginTitle">
        <div style="text-align:center;">
          <img src="${assetPath("logo.svg")}" alt="" style="width:48px;height:48px;margin:0 auto 16px;" />
          <h2 id="loginTitle" style="font-family:var(--font-display);font-size:1.4rem;margin:0 0 8px;">Welcome to MintLife</h2>
          <p style="color:var(--text-secondary);font-size:0.92rem;margin:0 0 26px;line-height:1.55;">
            Sign in to save your work across visits, or continue as a guest.
          </p>
        </div>
        <div id="googleBtnContainer" style="display:flex;justify-content:center;margin-bottom:14px;min-height:44px;"></div>
        <button class="btn btn-secondary" id="guestBtn" style="width:100%;margin-bottom:6px;">Continue as Guest</button>
        <p style="text-align:center;font-size:0.76rem;color:var(--text-tertiary);margin:14px 0 0;">
          No usernames. No passwords. Ever.
        </p>
        <button class="btn-icon" id="closeLoginModal" aria-label="Close" style="position:absolute;top:18px;right:18px;width:32px;height:32px;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
    `;
    modalEl.style.position = "fixed";
    modalEl.querySelector(".modal").style.position = "relative";
    document.body.appendChild(modalEl);

    renderGoogleButton(document.getElementById("googleBtnContainer"));
    document.getElementById("guestBtn").addEventListener("click", continueAsGuest);
    document.getElementById("closeLoginModal").addEventListener("click", closeLoginModal);
    modalEl.addEventListener("click", (e) => {
      if (e.target === modalEl) closeLoginModal();
    });
    document.addEventListener("keydown", escListener);
  }

  function escListener(e) {
    if (e.key === "Escape") closeLoginModal();
  }

  function closeLoginModal() {
    if (!modalEl) return;
    modalEl.remove();
    modalEl = null;
    document.removeEventListener("keydown", escListener);
  }

  function assetPath(name) {
    return name; // flat file structure — everything lives next to everything else
  }

  function init() {
    initGis();
  }

  return {
    init,
    getUser,
    isGuest,
    isSignedIn,
    onChange,
    openLoginModal,
    closeLoginModal,
    continueAsGuest,
    signOut,
    renderGoogleButton,
  };
})();

document.addEventListener("DOMContentLoaded", Auth.init);
