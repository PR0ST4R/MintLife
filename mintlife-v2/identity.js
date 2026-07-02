/* ===========================================================
   identity.js — unified identity layer
   Web:  Google OAuth user (id = google sub)
   App:  Local profile (id = device uuid, set on first launch)
   =========================================================== */

const Identity = (() => {
  const KEY_PROFILE  = "mintlife_profile";
  const KEY_DEVICE   = "mintlife_device_id";
  let profile = null;
  let listeners = [];

  // --- device id (app mode: persisted uuid) ---
  function deviceId() {
    let id = localStorage.getItem(KEY_DEVICE);
    if (!id) {
      id = "dev_" + crypto.randomUUID();
      localStorage.setItem(KEY_DEVICE, id);
    }
    return id;
  }

  // --- load from localStorage ---
  function load() {
    try { profile = JSON.parse(localStorage.getItem(KEY_PROFILE)); }
    catch { profile = null; }
    return profile;
  }

  // --- save locally ---
  function save(p) {
    profile = p;
    localStorage.setItem(KEY_PROFILE, JSON.stringify(p));
    notify();
  }

  // --- push profile to Supabase ---
  async function sync() {
    if (!profile) return;
    try {
      const tbl = await DB.from("profiles");
      await tbl.upsert({
        id:           profile.id,
        username:     profile.username || null,
        display_name: profile.displayName || null,
        mints:        profile.mints || 0,
        streak:       profile.streak || 0,
        last_active:  new Date().toISOString().split("T")[0],
        badges:       profile.badges || []
      });
    } catch(e) { console.warn("Supabase sync failed", e); }
  }

  // --- set up from Google credential (web) ---
  function fromGoogle(payload) {
    const p = load() || {};
    profile = {
      id:          payload.sub,
      displayName: payload.name || payload.email,
      username:    p.username || null,
      email:       payload.email || "",
      picture:     payload.picture || "",
      mints:       p.mints || 0,
      streak:      p.streak || 0,
      badges:      p.badges || [],
      lastActive:  p.lastActive || null,
      isGoogle:    true
    };
    save(profile);
    sync();
    checkStreak();
  }

  // --- set up from Get Started form (app) ---
  function fromGetStarted({ displayName, username }) {
    profile = {
      id:          deviceId(),
      displayName,
      username,
      email:       "",
      picture:     "",
      mints:       0,
      streak:      0,
      badges:      [],
      lastActive:  null,
      isGoogle:    false
    };
    save(profile);
    sync();
    checkStreak();
  }

  // --- streak & daily check ---
  function checkStreak() {
    if (!profile) return;
    const today = new Date().toISOString().split("T")[0];
    if (profile.lastActive === today) return;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    if (profile.lastActive === yesterday) {
      profile.streak = (profile.streak || 0) + 1;
    } else {
      profile.streak = 1;
    }
    profile.lastActive = today;
    // streak Mints bonus
    const bonus = Math.min(profile.streak * 2, 20);
    addMints(bonus, false); // false = don't re-check streak
    save(profile);
    sync();
    if (profile.streak > 1) {
      Toast.show(`🔥 Day ${profile.streak} streak! +${bonus} Mints`);
    }
  }

  function addMints(amount, syncNow = true) {
    if (!profile) return;
    profile.mints = (profile.mints || 0) + amount;
    checkBadges();
    save(profile);
    if (syncNow) sync();
  }

  function checkBadges() {
    if (!profile) return;
    const badges = profile.badges || [];
    const add = (id, label) => {
      if (!badges.find(b => b.id === id)) {
        badges.push({ id, label, earnedAt: new Date().toISOString() });
        Toast.show(`🏅 Badge unlocked: ${label}`);
      }
    };
    const m = profile.mints || 0;
    if (m >= 10)   add("mint_10",   "Seedling");
    if (m >= 50)   add("mint_50",   "Sprout");
    if (m >= 100)  add("mint_100",  "Sapling");
    if (m >= 500)  add("mint_500",  "Leaf");
    if (m >= 1000) add("mint_1000", "Grove");
    const streak = profile.streak || 0;
    if (streak >= 3)  add("streak_3",  "3-Day Streak");
    if (streak >= 7)  add("streak_7",  "Week Warrior");
    if (streak >= 30) add("streak_30", "Month Master");
    profile.badges = badges;
  }

  // --- shareable code: generate ---
  async function createShareCode() {
    if (!profile) throw new Error("Not signed in");
    const allData = {
      profile,
      toolData: Store.exportAll()
    };
    const code = Array.from({length:6}, () =>
      "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random()*32)]
    ).join("");
    const tbl = await DB.from("share_codes");
    await tbl.upsert({ code, profile_id: profile.id, data: allData });
    return code;
  }

  // --- shareable code: import ---
  async function importShareCode(code) {
    const tbl = await DB.from("share_codes");
    const rows = await tbl.select(`code=eq.${code.toUpperCase()}&limit=1`);
    if (!rows || !rows.length) throw new Error("Code not found");
    const { data } = rows[0];
    if (data.profile) save(data.profile);
    if (data.toolData) Store.importAll(data.toolData);
    await sync();
    return data.profile;
  }

  function getProfile() { return profile; }
  function isSetUp() { return !!profile; }
  function onChange(fn) { listeners.push(fn); }
  function notify() { listeners.forEach(fn => fn(profile)); document.dispatchEvent(new CustomEvent("mintlife:identity", { detail: profile })); }

  function signOut() {
    profile = null;
    localStorage.removeItem(KEY_PROFILE);
    if (typeof google !== "undefined" && google.accounts) google.accounts.id.disableAutoSelect();
    notify();
  }

  function init() { load(); }

  return {
    init, load, save, sync, fromGoogle, fromGetStarted,
    addMints, checkStreak, checkBadges,
    createShareCode, importShareCode,
    getProfile, isSetUp, onChange, signOut, deviceId
  };
})();

document.addEventListener("DOMContentLoaded", Identity.init);
