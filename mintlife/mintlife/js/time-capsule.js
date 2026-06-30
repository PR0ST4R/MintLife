/* ===========================================================
   time-capsule.js — controller for the Time Capsule tool
   =========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const messageEl = document.getElementById("capsuleMessage");
  const dateEl = document.getElementById("capsuleDate");
  const sealBtn = document.getElementById("sealBtn");
  const listEl = document.getElementById("capsuleList");
  const emptyEl = document.getElementById("capsuleEmpty");
  const guestNotice = document.getElementById("guestNotice");
  const guestSignInLink = document.getElementById("guestSignInLink");

  // minimum date = tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  dateEl.min = tomorrow.toISOString().split("T")[0];

  let guestCapsules = []; // in-memory only, never persisted

  function id() {
    return "c" + Math.random().toString(36).slice(2, 9);
  }

  function getCapsules() {
    if (Store.isPersistent()) {
      return Store.get("timeCapsules", []);
    }
    return guestCapsules;
  }

  function saveCapsules(list) {
    if (Store.isPersistent()) {
      Store.set("timeCapsules", list);
    } else {
      guestCapsules = list;
    }
  }

  function updateGuestNotice() {
    guestNotice.style.display = Store.isPersistent() ? "none" : "flex";
  }

  function seal() {
    const message = messageEl.value.trim();
    const dateVal = dateEl.value;

    if (!message) {
      Toast.show("Write a message before sealing.", { type: "warn" });
      messageEl.focus();
      return;
    }
    if (!dateVal) {
      Toast.show("Choose an unlock date.", { type: "warn" });
      dateEl.focus();
      return;
    }
    const unlockDate = new Date(dateVal + "T00:00:00");
    if (unlockDate <= new Date()) {
      Toast.show("Pick a date in the future.", { type: "warn" });
      return;
    }

    const capsule = {
      id: id(),
      message,
      unlockDate: dateVal,
      createdAt: new Date().toISOString(),
    };

    const list = getCapsules();
    list.unshift(capsule);
    saveCapsules(list);

    messageEl.value = "";
    dateEl.value = "";
    render();

    if (Store.isPersistent()) {
      Toast.show("Capsule sealed — it'll unlock automatically on the date you chose.");
    } else {
      Toast.show("Capsule sealed for this session only — sign in to keep it permanently.", { type: "warn" });
    }
  }

  function isUnlocked(capsule) {
    const unlockDate = new Date(capsule.unlockDate + "T00:00:00");
    return new Date() >= unlockDate;
  }

  function formatDate(dStr) {
    const d = new Date(dStr + "T00:00:00");
    return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  }

  function render() {
    updateGuestNotice();
    const list = getCapsules();

    if (list.length === 0) {
      listEl.innerHTML = "";
      emptyEl.style.display = "block";
      return;
    }
    emptyEl.style.display = "none";

    listEl.innerHTML = list
      .map((c) => {
        const unlocked = isUnlocked(c);
        return `
        <div class="card capsule-item">
          <div class="meta">
            <div class="date">Unlocks ${formatDate(c.unlockDate)}</div>
            <p>${unlocked ? escapeHtml(c.message) : "This capsule is still sealed. Come back on the unlock date to read it."}</p>
          </div>
          <span class="capsule-status ${unlocked ? "open" : "sealed"}">${unlocked ? "Unlocked" : "Sealed"}</span>
        </div>`;
      })
      .join("");
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  sealBtn.addEventListener("click", seal);
  guestSignInLink?.addEventListener("click", (e) => {
    e.preventDefault();
    Auth.openLoginModal();
  });
  Auth.onChange(render);

  render();
});
