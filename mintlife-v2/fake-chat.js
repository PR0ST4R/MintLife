/* ===========================================================
   fake-chat.js — controller for the Fake Chat tool
   =========================================================== */

(() => {
  const PLATFORMS = [
    { id: "imessage", label: "iMessage" },
    { id: "whatsapp", label: "WhatsApp" },
    { id: "discord", label: "Discord" },
    { id: "telegram", label: "Telegram" },
    { id: "instagram", label: "Instagram" },
    { id: "messenger", label: "Messenger" },
  ];

  const PLATFORM_ICONS = {
    imessage: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.5 2 2 5.8 2 10.5c0 2.6 1.4 4.9 3.6 6.5-.1.9-.5 2.4-1.5 3.7-.1.1 0 .3.2.3 1.8-.2 3.4-1 4.4-1.7.9.2 1.9.3 2.9.3 5.5 0 10-3.8 10-8.5C22 5.8 17.5 2 12 2z"/></svg>`,
    whatsapp: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.5A10 10 0 1 0 12 2zm0 2a8 8 0 0 1 6.9 12l.6 2.4-2.5-.7A8 8 0 1 1 12 4zm-3.4 4.3c-.2 0-.5 0-.7.4-.2.4-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.9 4.4 4 .6.3 1.1.4 1.5.5.6.2 1.2.2 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.5-.3l-1.9-.9c-.3-.1-.5-.1-.6.1l-.7.9c-.1.2-.3.2-.5.1-.3-.1-1.2-.4-2.2-1.4-.8-.7-1.4-1.6-1.5-1.9-.2-.3 0-.4.1-.5l.4-.5c.1-.2.2-.3.2-.5.1-.2 0-.4 0-.5L8.7 8.4c-.2-.4-.4-.4-.6-.4z"/></svg>`,
    discord: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.3 5.3A17 17 0 0 0 16 4l-.3.6a13 13 0 0 1 3.8 1.6 14.6 14.6 0 0 0-15 0A13 13 0 0 1 8.3 4.6L8 4a17 17 0 0 0-4.3 1.3C1 9.6.3 13.8.6 18a17 17 0 0 0 5.1 2.6l.8-1.3a11 11 0 0 1-1.7-.8l.4-.3a12.4 12.4 0 0 0 10.6 0l.4.3a11 11 0 0 1-1.7.8l.8 1.3A17 17 0 0 0 20.3 18c.4-4.8-.7-9-3-12.7zM9 14.7c-.9 0-1.7-.9-1.7-1.9 0-1.1.7-2 1.7-2s1.7.9 1.7 2c0 1-.7 1.9-1.7 1.9zm6 0c-.9 0-1.7-.9-1.7-1.9 0-1.1.7-2 1.7-2s1.7.9 1.7 2c0 1-.8 1.9-1.7 1.9z"/></svg>`,
    telegram: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.9 4.3 2.7 11.8c-1.3.5-1.3 1.2-.2 1.5l4.9 1.5 1.9 5.8c.2.6.4.8.9.8.4 0 .6-.2.9-.5l2.2-2.1 4.6 3.4c.8.5 1.4.2 1.6-.8L22 5.5c.3-1.2-.5-1.7-1.2-1.2zM8.9 14.5l-1-3.4 9.4-5.9c.4-.3.8-.1.5.2l-7.5 6.8z"/></svg>`,
    instagram: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>`,
    messenger: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.5 2 2 6.1 2 11.2c0 2.9 1.5 5.5 3.8 7.2V22l3.5-1.9c.9.2 1.8.4 2.7.4 5.5 0 10-4.1 10-9.3S17.5 2 12 2zm1 12.5-2.6-2.7-5 2.7 5.5-5.8 2.6 2.7 5-2.7L13 14.5z"/></svg>`,
  };

  let state = {
    platform: "imessage",
    title: "Mom",
    subtitle: "online",
    avatar: "",
    messages: [
      { id: id(), name: "Mom", text: "Did you eat dinner yet? 🍝", side: "left", time: "9:14 PM", avatar: "" },
      { id: id(), name: "You", text: "Not yet, about to order something", side: "right", time: "9:15 PM", avatar: "" },
      { id: id(), name: "Mom", text: "Okay don't stay up too late!", side: "left", time: "9:15 PM", avatar: "" },
    ],
  };

  function id() {
    return "m" + Math.random().toString(36).slice(2, 9);
  }

  // ---------- Platform grid ----------
  function renderPlatformGrid() {
    const el = document.getElementById("platformGrid");
    el.innerHTML = PLATFORMS.map(
      (p) => `
      <button class="platform-btn ${p.id === state.platform ? "active" : ""}" data-platform="${p.id}" type="button">
        ${PLATFORM_ICONS[p.id]}
        <span>${p.label}</span>
      </button>`
    ).join("");
    el.querySelectorAll(".platform-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.platform = btn.dataset.platform;
        renderPlatformGrid();
        renderPreview();
        persist();
      });
    });
  }

  // ---------- Message editor list ----------
  function renderMsgList() {
    const el = document.getElementById("msgList");
    el.innerHTML = state.messages
      .map(
        (m, i) => `
      <div class="msg-edit-row" data-id="${m.id}">
        <div class="row-top">
          <input type="text" class="msg-name" placeholder="Name" value="${escapeAttr(m.name)}" style="flex:1;font-size:0.8rem;padding:6px 8px;border-radius:8px;border:1px solid var(--border-strong);background:var(--surface);color:var(--text-primary);" />
          <select class="msg-side">
            <option value="left" ${m.side === "left" ? "selected" : ""}>Left</option>
            <option value="right" ${m.side === "right" ? "selected" : ""}>Right</option>
          </select>
        </div>
        <textarea class="msg-text" placeholder="Message text">${escapeAttr(m.text)}</textarea>
        <div class="row-bottom">
          <input type="time" class="msg-time" value="${to24(m.time)}" />
          <button class="remove-btn" type="button" aria-label="Remove message">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
      </div>`
      )
      .join("");

    el.querySelectorAll(".msg-edit-row").forEach((row) => {
      const mid = row.dataset.id;
      row.querySelector(".msg-name").addEventListener("input", (e) => updateMsg(mid, "name", e.target.value));
      row.querySelector(".msg-side").addEventListener("change", (e) => updateMsg(mid, "side", e.target.value));
      row.querySelector(".msg-text").addEventListener("input", (e) => updateMsg(mid, "text", e.target.value));
      row.querySelector(".msg-time").addEventListener("input", (e) => updateMsg(mid, "time", from24(e.target.value)));
      row.querySelector(".remove-btn").addEventListener("click", () => removeMsg(mid));
    });
  }

  function escapeAttr(str) {
    return (str || "").replace(/"/g, "&quot;");
  }
  function to24(t) {
    if (!t) return "";
    const m = t.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!m) return "";
    let h = parseInt(m[1], 10);
    const min = m[2];
    const ap = (m[3] || "").toUpperCase();
    if (ap === "PM" && h < 12) h += 12;
    if (ap === "AM" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${min}`;
  }
  function from24(v) {
    if (!v) return "";
    let [h, m] = v.split(":").map(Number);
    const ap = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${String(m).padStart(2, "0")} ${ap}`;
  }

  function updateMsg(mid, key, value) {
    const msg = state.messages.find((m) => m.id === mid);
    if (!msg) return;
    msg[key] = value;
    renderPreview();
    persist();
  }
  function removeMsg(mid) {
    state.messages = state.messages.filter((m) => m.id !== mid);
    renderMsgList();
    renderPreview();
    persist();
  }
  function addMsg() {
    state.messages.push({
      id: id(),
      name: state.messages.length % 2 === 0 ? "Friend" : "You",
      text: "New message",
      side: state.messages.length % 2 === 0 ? "left" : "right",
      time: "9:00 PM",
      avatar: "",
    });
    renderMsgList();
    renderPreview();
    persist();
  }

  // ---------- Preview ----------
  function renderPreview() {
    const host = document.getElementById("chatCanvasHost");
    const header = {
      title: state.title,
      subtitle: state.subtitle,
      avatar: state.avatar,
      group: false,
    };
    host.innerHTML = ChatRenderer.render(state.platform, header, state.messages);
  }

  // ---------- Header fields ----------
  function bindHeaderFields() {
    document.getElementById("chatTitle").addEventListener("input", (e) => {
      state.title = e.target.value;
      renderPreview();
      persist();
    });
    document.getElementById("chatSubtitle").addEventListener("input", (e) => {
      state.subtitle = e.target.value;
      renderPreview();
      persist();
    });
    document.getElementById("chatAvatar").addEventListener("input", (e) => {
      state.avatar = e.target.value;
      renderPreview();
      persist();
    });
  }

  // ---------- Download ----------
  function bindDownload() {
    document.getElementById("downloadBtn").addEventListener("click", async () => {
      const node = document.getElementById("chatCanvasHost").firstElementChild;
      if (!node) return;
      LeafLoader.showOverlay("Rendering image");
      try {
        const canvas = await html2canvas(node, { scale: 3, backgroundColor: null, useCORS: true });
        const link = document.createElement("a");
        link.download = `mintlife-fake-chat-${state.platform}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        Identity.addMints(5); Toast.show("Image downloaded — +5 Mints 🌿");
      } catch (err) {
        console.error(err);
        Toast.show("Couldn't render the image — try removing external photo URLs.", { type: "warn" });
      } finally {
        LeafLoader.hideOverlay();
      }
    });
  }

  function bindReset() {
    document.getElementById("resetBtn").addEventListener("click", () => {
      state = {
        platform: "imessage",
        title: "Mom",
        subtitle: "online",
        avatar: "",
        messages: [
          { id: id(), name: "Mom", text: "Did you eat dinner yet? 🍝", side: "left", time: "9:14 PM", avatar: "" },
          { id: id(), name: "You", text: "Not yet, about to order something", side: "right", time: "9:15 PM", avatar: "" },
        ],
      };
      document.getElementById("chatTitle").value = state.title;
      document.getElementById("chatSubtitle").value = state.subtitle;
      document.getElementById("chatAvatar").value = state.avatar;
      renderPlatformGrid();
      renderMsgList();
      renderPreview();
      persist();
      Toast.show("Reset to default conversation.");
    });
  }

  // ---------- Persistence (signed-in users only) ----------
  function persist() {
    if (typeof Store !== "undefined" && Identity.isSetUp()) {
      Store.set("fakeChatDraft", state);
    }
  }
  function restore() {
    if (typeof Store !== "undefined" && Identity.isSetUp()) {
      const saved = Store.get("fakeChatDraft", null);
      if (saved) state = saved;
    }
  }

  function init() {
    restore();
    document.getElementById("chatTitle").value = state.title;
    document.getElementById("chatSubtitle").value = state.subtitle;
    document.getElementById("chatAvatar").value = state.avatar;
    renderPlatformGrid();
    renderMsgList();
    renderPreview();
    bindHeaderFields();
    document.getElementById("addMsgBtn").addEventListener("click", addMsg);
    bindDownload();
    bindReset();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
