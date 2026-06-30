/* ===========================================================
   chat-renderer.js — builds platform-styled chat HTML
   =========================================================== */

const ChatRenderer = (() => {

  const PLATFORM_META = {
    discord: { label: "Discord", icon: "discord" },
    whatsapp: { label: "WhatsApp", icon: "whatsapp" },
    telegram: { label: "Telegram", icon: "telegram" },
    instagram: { label: "Instagram", icon: "instagram" },
    messenger: { label: "Messenger", icon: "messenger" },
    imessage: { label: "iMessage", icon: "imessage" },
  };

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str ?? "";
    return div.innerHTML;
  }

  function avatarHtml(msg) {
    if (msg.avatar) {
      return `<img src="${msg.avatar}" alt="" class="cr-avatar-img" />`;
    }
    const initial = (msg.name || "?").trim()[0]?.toUpperCase() || "?";
    return `<div class="cr-avatar-fallback">${initial}</div>`;
  }

  function render(platform, header, messages) {
    switch (platform) {
      case "discord": return renderDiscord(header, messages);
      case "whatsapp": return renderWhatsApp(header, messages);
      case "telegram": return renderTelegram(header, messages);
      case "instagram": return renderInstagram(header, messages);
      case "messenger": return renderMessenger(header, messages);
      case "imessage": return renderIMessage(header, messages);
      default: return renderIMessage(header, messages);
    }
  }

  /* ---------------- Discord ---------------- */
  function renderDiscord(header, messages) {
    let lastSender = null;
    const rows = messages.map((m) => {
      const grouped = lastSender === m.name;
      lastSender = m.name;
      return `
        <div class="cr-discord-row ${grouped ? "grouped" : ""}">
          ${grouped ? `<div class="cr-discord-time-gutter">${m.time || ""}</div>` : avatarHtml(m).replace("cr-avatar-img", "cr-avatar-img cr-discord-avatar").replace("cr-avatar-fallback", "cr-avatar-fallback cr-discord-avatar")}
          <div class="cr-discord-content">
            ${grouped ? "" : `<div class="cr-discord-meta"><span class="cr-discord-name">${escapeHtml(m.name)}</span><span class="cr-discord-time">${m.time || ""}</span></div>`}
            <div class="cr-discord-text">${escapeHtml(m.text)}</div>
          </div>
        </div>`;
    }).join("");

    return `
      <div class="cr-root cr-discord">
        <div class="cr-discord-header">
          <span class="cr-hash">#</span>
          <span>${escapeHtml(header.title || "general")}</span>
        </div>
        <div class="cr-discord-body">${rows}</div>
      </div>`;
  }

  /* ---------------- WhatsApp ---------------- */
  function renderWhatsApp(header, messages) {
    const bubbles = messages.map((m) => `
      <div class="cr-wa-row ${m.side === "right" ? "right" : "left"}">
        <div class="cr-wa-bubble ${m.side === "right" ? "right" : "left"}">
          ${m.side !== "right" && header.group ? `<div class="cr-wa-name">${escapeHtml(m.name)}</div>` : ""}
          <div class="cr-wa-text">${escapeHtml(m.text)}</div>
          <div class="cr-wa-time">${m.time || ""} ${m.side === "right" ? doubleCheck() : ""}</div>
        </div>
      </div>`).join("");

    return `
      <div class="cr-root cr-wa">
        <div class="cr-wa-header">
          ${avatarHtml({ name: header.title, avatar: header.avatar })}
          <div class="cr-wa-header-text">
            <div class="cr-wa-header-name">${escapeHtml(header.title || "Chat")}</div>
            <div class="cr-wa-header-sub">${header.subtitle || "online"}</div>
          </div>
        </div>
        <div class="cr-wa-body">${bubbles}</div>
      </div>`;
  }
  function doubleCheck() {
    return `<svg class="cr-check" viewBox="0 0 16 11" width="16" height="11" fill="none"><path d="M1 5.5 4 8.5 9.5 1.5" stroke="#53BDEB" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.5 5.5 8.5 8.5 14.5 1.5" stroke="#53BDEB" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }

  /* ---------------- Telegram ---------------- */
  function renderTelegram(header, messages) {
    const bubbles = messages.map((m) => `
      <div class="cr-tg-row ${m.side === "right" ? "right" : "left"}">
        <div class="cr-tg-bubble ${m.side === "right" ? "right" : "left"}">
          <div class="cr-tg-text">${escapeHtml(m.text)}</div>
          <div class="cr-tg-time">${m.time || ""}</div>
        </div>
      </div>`).join("");

    return `
      <div class="cr-root cr-tg">
        <div class="cr-tg-header">
          ${avatarHtml({ name: header.title, avatar: header.avatar })}
          <div class="cr-tg-header-text">
            <div class="cr-tg-header-name">${escapeHtml(header.title || "Chat")}</div>
            <div class="cr-tg-header-sub">${header.subtitle || "last seen recently"}</div>
          </div>
        </div>
        <div class="cr-tg-body">${bubbles}</div>
      </div>`;
  }

  /* ---------------- Instagram DM ---------------- */
  function renderInstagram(header, messages) {
    const bubbles = messages.map((m) => `
      <div class="cr-ig-row ${m.side === "right" ? "right" : "left"}">
        <div class="cr-ig-bubble ${m.side === "right" ? "right" : "left"}">${escapeHtml(m.text)}</div>
      </div>`).join("");

    return `
      <div class="cr-root cr-ig">
        <div class="cr-ig-header">
          ${avatarHtml({ name: header.title, avatar: header.avatar })}
          <div class="cr-ig-header-text">
            <div class="cr-ig-header-name">${escapeHtml(header.title || "username")}</div>
            <div class="cr-ig-header-sub">Active now</div>
          </div>
        </div>
        <div class="cr-ig-body">${bubbles}</div>
      </div>`;
  }

  /* ---------------- Messenger ---------------- */
  function renderMessenger(header, messages) {
    const bubbles = messages.map((m) => `
      <div class="cr-msgr-row ${m.side === "right" ? "right" : "left"}">
        <div class="cr-msgr-bubble ${m.side === "right" ? "right" : "left"}">${escapeHtml(m.text)}</div>
      </div>`).join("");

    return `
      <div class="cr-root cr-msgr">
        <div class="cr-msgr-header">
          ${avatarHtml({ name: header.title, avatar: header.avatar })}
          <div class="cr-msgr-header-text">
            <div class="cr-msgr-header-name">${escapeHtml(header.title || "Chat")}</div>
            <div class="cr-msgr-header-sub">Active now</div>
          </div>
        </div>
        <div class="cr-msgr-body">${bubbles}</div>
      </div>`;
  }

  /* ---------------- iMessage ---------------- */
  function renderIMessage(header, messages) {
    const bubbles = messages.map((m) => `
      <div class="cr-im-row ${m.side === "right" ? "right" : "left"}">
        <div class="cr-im-bubble ${m.side === "right" ? "right" : "left"}">${escapeHtml(m.text)}</div>
      </div>`).join("");

    return `
      <div class="cr-root cr-im">
        <div class="cr-im-header">
          <div class="cr-im-header-circle">${avatarHtml({ name: header.title, avatar: header.avatar })}</div>
          <div class="cr-im-header-name">${escapeHtml(header.title || "Contact")}</div>
        </div>
        <div class="cr-im-body">${bubbles}</div>
      </div>`;
  }

  return { render, PLATFORM_META };
})();
