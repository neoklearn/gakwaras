/**
 * Minecraft Server Hub — Main JS
 * All remote config at the top for easy maintenance.
 */

// =============================================
// REMOTE CONFIG — Ganti disini saja
// =============================================
const API_URL = 'https://api.mcstatus.io/v2/status/bedrock/premium2.raehost.com:25699';
const REFRESH_INTERVAL = 60000; // 60 detik
const DISCORD_URL = 'https://discord.gg/GANTI_INI';
const DONATION_URL = 'https://GANTI_INI';
const CONTACT_EMAIL = 'admin@gakwaras.my.id';
const RULES_URL = 'https://discord.com/channels/GANTI_INI';
const SERVER_ADDRESS = 'mc.serverhub.com';
const SERVER_PORT = '19132';

// =============================================
// DOM Elements
// =============================================
const statusBadge = document.getElementById('status-badge');
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');
const playersCount = document.getElementById('players-count');
const healthBar = document.getElementById('health-bar');
const versionText = document.getElementById('version-text');
const gamemodeText = document.getElementById('gamemode-text');
const tpsText = document.getElementById('tps-text');
const pingText = document.getElementById('ping-text');
const wibClockEl = document.getElementById('wib-clock');
const playersGrid = document.getElementById('players-grid');

// =============================================
// Copy to Clipboard (no icon, click to copy)
// =============================================
function copyToClipboard(text, buttonElement) {
  navigator.clipboard.writeText(text).then(() => {
    const toast = buttonElement.parentElement.querySelector('.copy-toast');
    if (!toast) return;
    toast.classList.remove('copy-feedback');
    void toast.offsetWidth;
    toast.classList.add('copy-feedback');
  }).catch((err) => {
    console.error('Failed to copy:', err);
  });
}

document.querySelectorAll('[data-copy]').forEach((el) => {
  el.addEventListener('click', () => {
    copyToClipboard(el.getAttribute('data-copy'), el);
  });
});

// Disable right-click dan context menu di luar tombol copy
document.addEventListener('contextmenu', function(e) {
  if (!e.target.closest('#copy-address') && !e.target.closest('#copy-port')) {
    e.preventDefault();
  }
});

// Disable text selection dengan keyboard
document.addEventListener('selectstart', function(e) {
  if (!e.target.closest('#copy-address') && !e.target.closest('#copy-port')) {
    e.preventDefault();
  }
});

// =============================================
// WIB Clock (UTC+7) — Real-time
// =============================================
function updateWIBClock() {
  if (!wibClockEl) return;
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const wib = new Date(utc + 7 * 3600000);
  const hours = String(wib.getHours()).padStart(2, '0');
  const minutes = String(wib.getMinutes()).padStart(2, '0');
  const seconds = String(wib.getSeconds()).padStart(2, '0');
  wibClockEl.textContent = `${hours}:${minutes}:${seconds}`;
}

updateWIBClock();
setInterval(updateWIBClock, 1000);

// =============================================
// Link Handlers
// =============================================
document.getElementById('btn-discord')?.addEventListener('click', () => {
  window.open(DISCORD_URL, '_blank');
});

document.getElementById('link-discord')?.addEventListener('click', (e) => {
  e.preventDefault();
  window.open(DISCORD_URL, '_blank');
});

document.getElementById('link-donation')?.addEventListener('click', (e) => {
  e.preventDefault();
  window.open(DONATION_URL, '_blank');
});

document.getElementById('link-contact')?.addEventListener('click', (e) => {
  e.preventDefault();
  window.location.href = `mailto:${CONTACT_EMAIL}`;
});

document.getElementById('link-rules')?.addEventListener('click', (e) => {
  e.preventDefault();
  window.open(RULES_URL, '_blank');
});

// =============================================
// Fetch Server Status (mcstatus.io)
// =============================================
let lastServerData = null;

async function fetchServerStatus() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    lastServerData = data;
    applyServerData(data);
  } catch (err) {
    console.error('Failed to fetch server status:', err);
    applyOfflineState();
  }
}

function applyServerData(data) {
  // Status badge
  if (data.online) {
    statusDot?.classList.add('bg-primary', 'animate-pulse');
    statusDot?.classList.remove('bg-red-500');
    statusText && (statusText.textContent = 'Server Online');
    statusText?.classList.add('text-primary');
    statusText?.classList.remove('text-red-400');
    statusBadge?.classList.remove('border-red-500/50');
    statusBadge?.classList.add('border-primary/50', 'status-glow');
  } else {
    applyOfflineState();
    return;
  }

  // Players
  const online = data.players?.online ?? 0;
  const max = data.players?.max ?? 100;
  const pct = max > 0 ? Math.round((online / max) * 100) : 0;
  playersCount && (playersCount.textContent = `${online}/${max}`);
  healthBar && (healthBar.style.width = `${pct}%`);

  // Version & Gamemode
  versionText && (versionText.textContent = data.version?.name ?? '---');
  gamemodeText && (gamemodeText.textContent = (data.gamemode ?? 'Survival').toUpperCase());
}

function applyOfflineState() {
  statusDot?.classList.remove('bg-primary', 'animate-pulse');
  statusDot?.classList.add('bg-red-500');
  statusText && (statusText.textContent = 'Server Offline');
  statusText?.classList.remove('text-primary');
  statusText?.classList.add('text-red-400');
  statusBadge?.classList.remove('border-primary/50', 'status-glow');
  statusBadge?.classList.add('border-red-500/50');
}

// Initial fetch + auto-refresh
fetchServerStatus();
setInterval(fetchServerStatus, REFRESH_INTERVAL);

// =============================================
// Gimmick: TPS (17–20) & Ping (50–78, spike ~100)
// =============================================
function randomInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function updateGimmickTPS() {
  if (!tpsText) return;
  const tps = randomInRange(18, 20);
  tpsText.textContent = `${tps} TPS`;

  // Color based on TPS
  tpsText.classList.remove('text-primary', 'text-yellow-400', 'text-red-400');
  if (tps >= 19) {
    tpsText.classList.add('text-primary');
  } else if (tps = 18) {
    tpsText.classList.add('text-yellow-400');
  } else {
    tpsText.classList.add('text-yellow-400');
  }
}

function updateGimmickPing() {
  if (!pingText) return;

  // 5% chance of spike to ~100ms
  const isSpike = Math.random() < 0.05;
  const ping = isSpike ? randomInRange(70, 79) : randomInRange(82, 137);
  pingText.textContent = `${ping}ms`;

  // Color: normal = white, spike = yellow
  pingText.classList.remove('text-slate-300', 'text-yellow-400');
  if (ping >= 80) {
    pingText.classList.add('text-yellow-400');
  } else {
    pingText.classList.add('text-slate-300');
  }
}

// Update TPS setiap 1–1.5 detik, Ping setiap 2–4 detik
function scheduleGimmickTPS() {
  updateGimmickTPS();
  const next = randomInRange(1000, 1500);
  setTimeout(scheduleGimmickTPS, next);
}

function scheduleGimmickPing() {
  updateGimmickPing();
  const next = randomInRange(1500, 2000);
  setTimeout(scheduleGimmickPing, next);
}

scheduleGimmickTPS();
scheduleGimmickPing();

// =============================================
// Players Section — from players.json
// =============================================
let playersData = [];
let expandedPlayer = null;

async function loadPlayers() {
  try {
    const res = await fetch('/players.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    playersData = await res.json();
    renderPlayers();
  } catch (err) {
    console.error('Failed to load players:', err);
  }
}

function renderPlayers() {
  if (!playersGrid) return;
  playersGrid.innerHTML = '';

  playersData.forEach((player, index) => {
    // Player card wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'player-wrapper';
    wrapper.dataset.index = index;

    // Card
    const card = document.createElement('div');
    card.className = 'flex flex-col items-center gap-2 group cursor-pointer';
    card.innerHTML = `
      <div class="w-full aspect-[3/4] bg-slate-700 pixel-border overflow-hidden transition-transform group-hover:scale-105">
        <img alt="${player.name} avatar" class="w-full h-full object-cover" src="${player.avatar}" />
      </div>
      <span class="font-pixel text-lg text-slate-300 group-hover:text-primary transition-colors">${player.name}</span>
    `;

    card.addEventListener('click', () => togglePlayerDetail(index));
    wrapper.appendChild(card);
    playersGrid.appendChild(wrapper);
  });
}

function togglePlayerDetail(index) {
  // If same player clicked, close
  if (expandedPlayer === index) {
    closePlayerDetail();
    return;
  }

  // Close previous if any
  const prevDetail = playersGrid.querySelector('.player-detail-panel');
  if (prevDetail) prevDetail.remove();

  expandedPlayer = index;
  const player = playersData[index];
  const wrappers = Array.from(playersGrid.querySelectorAll('.player-wrapper'));
  const targetWrapper = wrappers[index];

  // Calculate grid columns reliably based on offsetTop
  let cols = 1;
  if (wrappers.length > 1) {
    const firstTop = wrappers[0].offsetTop;
    for (let i = 1; i < wrappers.length; i++) {
      if (wrappers[i].offsetTop > firstTop) {
        cols = i;
        break;
      }
    }
  }

  // Find the end of the current row (used for mobile/tablet)
  const rowStart = Math.floor(index / cols) * cols;
  const rowEnd = Math.min(rowStart + cols, wrappers.length);

  // For Laptop/Desktop (lg breakpoint is 1024px), place it at the very bottom
  // so unopened cards remain above. For smaller screens, place it below the current row.
  const insertAfter = window.innerWidth >= 1024 ? wrappers[wrappers.length - 1] : wrappers[rowEnd - 1];

  // Create detail panel
  const detail = document.createElement('div');
  detail.className = 'player-detail-panel';
  // Span full grid width
  detail.style.gridColumn = `1 / -1`;

  detail.innerHTML = `
    <div class="bg-background-dark/95 pixel-border p-6 md:p-8 flex flex-col lg:flex-row gap-6 items-center lg:items-start player-detail-content text-center lg:text-left relative w-full">
      <button class="close-detail absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer" aria-label="Close">
        <span class="material-symbols-outlined text-3xl">close</span>
      </button>
      <div class="w-32 h-40 lg:w-32 lg:h-44 flex-shrink-0 pixel-border overflow-hidden">
        <img alt="${player.name}" class="w-full h-full object-cover" src="${player.avatar}" />
      </div>
      <div class="flex-1 w-full min-w-0 mt-2 lg:mt-0 flex flex-col items-center lg:items-start">
        <div class="flex flex-col lg:flex-row items-center gap-2 lg:gap-3 mb-3">
          <h3 class="font-pixel text-4xl text-white">${player.name}</h3>
          <span class="font-pixel text-xl text-slate-400 lg:mb-1">a.k.a. ${player.aka}</span>
        </div>
        <div class="flex flex-wrap justify-center lg:justify-start gap-4 mb-4">
          ${player.roles.map(role => `<span class="bg-primary/20 text-primary font-pixel text-xl px-3 py-1 rounded">${role}</span>`).join('')}
        </div>
        <p class="text-slate-300 text-lg leading-relaxed text-center lg:text-left pb-2 w-full">${player.bio}</p>
      </div>
    </div>
  `;

  detail.querySelector('.close-detail').addEventListener('click', (e) => {
    e.stopPropagation();
    closePlayerDetail();
  });

  // Insert after the last element in the row
  insertAfter.after(detail);

  // Animate in
  requestAnimationFrame(() => {
    detail.classList.add('open');
  });

  // Highlight active card
  wrappers.forEach(w => w.classList.remove('player-active'));
  targetWrapper.classList.add('player-active');
}

// Close detail panel on window resize to avoid grid layout breaking
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    if (expandedPlayer !== null) {
      closePlayerDetail();
    }
  }, 150);
});

function closePlayerDetail() {
  const detail = playersGrid?.querySelector('.player-detail-panel');
  if (detail) {
    detail.classList.remove('open');
    detail.addEventListener('transitionend', () => detail.remove(), { once: true });
    // Fallback removal
    setTimeout(() => detail.remove(), 400);
  }
  playersGrid?.querySelectorAll('.player-wrapper').forEach(w => w.classList.remove('player-active'));
  expandedPlayer = null;
}

// Load players on start
loadPlayers();
