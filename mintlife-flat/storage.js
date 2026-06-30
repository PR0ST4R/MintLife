/* ===========================================================
   storage.js — unified data layer
   Google users: data persists in localStorage keyed by their
   Google account id (sub), simulating "account-bound" storage.
   Guests: data lives only in sessionStorage / memory and is
   wiped on tab close — never persisted across sessions.
   =========================================================== */

const Store = (() => {
  function userScopeKey() {
    const user = Auth.getUser();
    if (user && user.signedIn) {
      return `mintlife_data_${user.id}`;
    }
    return null; // guests have no persistent scope
  }

  function readAll() {
    const key = userScopeKey();
    if (!key) return guestMemory;
    try {
      return JSON.parse(localStorage.getItem(key)) || {};
    } catch {
      return {};
    }
  }

  function writeAll(data) {
    const key = userScopeKey();
    if (!key) {
      guestMemory = data;
      return;
    }
    localStorage.setItem(key, JSON.stringify(data));
  }

  // in-memory only, cleared on reload — used for guests
  let guestMemory = {};

  function get(namespace, fallback) {
    const all = readAll();
    return all[namespace] !== undefined ? all[namespace] : fallback;
  }

  function set(namespace, value) {
    const all = readAll();
    all[namespace] = value;
    writeAll(all);
  }

  function isPersistent() {
    const user = Auth.getUser();
    return !!(user && user.signedIn);
  }

  return { get, set, isPersistent };
})();
