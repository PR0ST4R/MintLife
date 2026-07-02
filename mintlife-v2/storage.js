/* ===========================================================
   storage.js — per-user local data store + import/export
   =========================================================== */

const Store = (() => {
  function scopeKey() {
    const p = Identity.getProfile();
    return p ? `mintlife_data_${p.id}` : null;
  }

  function readAll() {
    const k = scopeKey();
    if (!k) return {};
    try { return JSON.parse(localStorage.getItem(k)) || {}; }
    catch { return {}; }
  }

  function writeAll(data) {
    const k = scopeKey();
    if (!k) return;
    localStorage.setItem(k, JSON.stringify(data));
  }

  function get(ns, fallback) {
    const all = readAll();
    return all[ns] !== undefined ? all[ns] : fallback;
  }

  function set(ns, value) {
    const all = readAll();
    all[ns] = value;
    writeAll(all);
  }

  function exportAll() { return readAll(); }

  function importAll(data) {
    const k = scopeKey();
    if (!k) return;
    localStorage.setItem(k, JSON.stringify(data));
  }

  function isPersistent() { return !!Identity.getProfile(); }

  return { get, set, exportAll, importAll, isPersistent };
})();
