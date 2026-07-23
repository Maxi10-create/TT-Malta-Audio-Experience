const STORAGE_KEY = "tt-malta-completed-v1";

const state = {
  config: null,
  tracks: [],
  currentAudio: null,
  currentTrackId: null,
  stationQueue: [],
  completed: new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"))
};

const els = {
  stations: document.getElementById("stationsContainer"),
  progressText: document.getElementById("progressText"),
  progressPercent: document.getElementById("progressPercent"),
  progressFill: document.getElementById("progressFill"),
  resetButton: document.getElementById("resetButton"),
  shareButton: document.getElementById("shareButton"),
  toast: document.getElementById("toast")
};

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => els.toast.classList.remove("is-visible"), 2600);
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

function isAvailable(track) {
  return track.available !== false && Boolean(track.audio);
}

function persistCompleted() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...state.completed]));
}

function updateProgress() {
  const availableTracks = state.tracks.filter(isAvailable);
  const total = availableTracks.length;
  const completed = availableTracks.filter(track => state.completed.has(track.id)).length;
  const percentage = total ? Math.round((completed / total) * 100) : 0;
  els.progressText.textContent = `${completed} von ${total} verfügbaren Fundstücken aufgearbeitet`;
  els.progressPercent.textContent = `${percentage} %`;
  els.progressFill.style.width = `${percentage}%`;
}

function applyConfig(config) {
  document.title = `${config.groupShort} Malta Audio Experience`;
  document.getElementById("groupBadge").textContent = `${config.groupShort} - ${config.groupName}`;
  document.getElementById("footerGroup").textContent = `${config.groupShort} - ${config.groupName}`;
  document.getElementById("editionLabel").textContent = config.edition;
  document.getElementById("siteTitle").textContent = config.title;
  document.getElementById("siteSubtitle").textContent = config.subtitle;
  document.getElementById("guideInstruction").textContent = config.instruction;
}

function trackTemplate(track) {
  const available = isAvailable(track);
  const isComplete = available && state.completed.has(track.id);
  return `
    <article class="track-card ${isComplete ? "is-complete" : ""} ${available ? "" : "is-placeholder"}" data-track-id="${track.id}">
      <div class="track-card__top">
        <div class="track-card__number">${String(track.order).padStart(2, "0")}</div>
        <div>
          <p class="track-card__label">${track.label}</p>
          <h3 class="track-card__title">${track.title}</h3>
          <p class="track-card__subtitle">${track.subtitle}</p>
        </div>
        <span class="track-card__duration">${track.duration}</span>
      </div>

      <p class="track-card__description">${track.description}</p>

      <div class="meta-row">
        <span class="meta-chip">EPOCHE: ${track.era}</span>
        <span class="meta-chip">QUELLENLAGE: ${track.sources}</span>
        <span class="meta-chip">STATUS: ${track.status}</span>
      </div>

      ${available ? `
        <div class="player-row">
          <button class="play-button" type="button" data-action="toggle" aria-label="Track abspielen">&#9654;</button>
          <input class="track-progress" data-action="seek" type="range" min="0" max="100" value="0" step="0.1" aria-label="Wiedergabeposition">
          <span class="time-display">0:00</span>
        </div>
        <div class="complete-row">
          ${isComplete ? '<span class="status-badge">HISTORISCH AUFGEARBEITET</span>' : ""}
        </div>
        <audio preload="metadata" src="${track.audio}"></audio>
      ` : `
        <div class="placeholder-row">
          <span class="placeholder-badge">ARCHIV NOCH VERSIEGELT</span>
        </div>
      `}
    </article>
  `;
}

function renderTracks() {
  const grouped = new Map();
  state.tracks.forEach(track => {
    if (!grouped.has(track.stationId)) grouped.set(track.stationId, []);
    grouped.get(track.stationId).push(track);
  });

  els.stations.innerHTML = [...grouped.entries()].map(([stationId, tracks]) => {
    const station = state.config.stations.find(item => item.id === stationId) || {
      title: `Station ${stationId}`,
      description: "Weitere Akten der Expedition."
    };
    const availableCount = tracks.filter(isAvailable).length;
    const playLabel = availableCount
      ? `Alle ${availableCount} verfügbaren Tracks starten`
      : "Archiv noch versiegelt";
    return `
      <section class="station" data-station-id="${stationId}">
        <header class="station__header">
          <div>
            <p class="station__kicker">STATION ${String(stationId).padStart(2, "0")}</p>
            <h2 class="station__title">${station.title}</h2>
            <p class="station__description">${station.description}</p>
          </div>
          <button class="station__play" type="button" data-action="play-station" ${availableCount ? "" : "disabled"}>${playLabel}</button>
        </header>
        <div class="track-list">${tracks.map(trackTemplate).join("")}</div>
      </section>
    `;
  }).join("");

  bindPlayers();
  updateProgress();
}

function setPlayingUi(card, playing) {
  if (!card) return;
  card.classList.toggle("is-playing", playing);
  const button = card.querySelector('[data-action="toggle"]');
  if (!button) return;
  button.innerHTML = playing ? "&#10074;&#10074;" : "&#9654;";
  button.setAttribute("aria-label", playing ? "Track pausieren" : "Track abspielen");
}

function stopCurrentAudio() {
  if (!state.currentAudio) return;
  state.currentAudio.pause();
  const currentCard = state.currentAudio.closest(".track-card");
  setPlayingUi(currentCard, false);
  state.currentAudio = null;
  state.currentTrackId = null;
}

function markComplete(trackId, card) {
  state.completed.add(trackId);
  persistCompleted();
  card.classList.add("is-complete");
  const row = card.querySelector(".complete-row");
  if (row) row.innerHTML = '<span class="status-badge">HISTORISCH AUFGEARBEITET</span>';
  updateProgress();
}

function playTrackById(trackId) {
  const card = document.querySelector(`[data-track-id="${trackId}"]`);
  if (!card) return;
  const audio = card.querySelector("audio");
  if (!audio) return;

  if (state.currentAudio && state.currentAudio !== audio) stopCurrentAudio();

  state.currentAudio = audio;
  state.currentTrackId = trackId;
  audio.play().then(() => setPlayingUi(card, true)).catch(() => {
    showToast("Wiedergabe blockiert. Bitte den Play-Button erneut antippen.");
    state.stationQueue = [];
  });
}

function bindPlayers() {
  document.querySelectorAll(".track-card audio").forEach(audio => {
    const card = audio.closest(".track-card");
    const trackId = card.dataset.trackId;
    const button = card.querySelector('[data-action="toggle"]');
    const seek = card.querySelector('[data-action="seek"]');
    const timeDisplay = card.querySelector(".time-display");

    button.addEventListener("click", () => {
      state.stationQueue = [];
      if (!audio.paused) audio.pause();
      else playTrackById(trackId);
    });

    audio.addEventListener("play", () => setPlayingUi(card, true));
    audio.addEventListener("pause", () => setPlayingUi(card, false));
    audio.addEventListener("timeupdate", () => {
      if (audio.duration) seek.value = (audio.currentTime / audio.duration) * 100;
      timeDisplay.textContent = formatTime(audio.currentTime);
    });
    audio.addEventListener("loadedmetadata", () => {
      timeDisplay.textContent = formatTime(audio.currentTime);
    });
    audio.addEventListener("ended", () => {
      setPlayingUi(card, false);
      markComplete(trackId, card);
      state.currentAudio = null;
      state.currentTrackId = null;
      const nextId = state.stationQueue.shift();
      if (nextId) window.setTimeout(() => playTrackById(nextId), 450);
    });
    seek.addEventListener("input", () => {
      if (audio.duration) audio.currentTime = (Number(seek.value) / 100) * audio.duration;
    });
  });

  document.querySelectorAll('[data-action="play-station"]:not(:disabled)').forEach(button => {
    button.addEventListener("click", () => {
      const station = button.closest(".station");
      const ids = [...station.querySelectorAll(".track-card")]
        .filter(card => card.querySelector("audio"))
        .map(card => card.dataset.trackId);
      if (!ids.length) return;
      state.stationQueue = ids.slice(1);
      playTrackById(ids[0]);
    });
  });
}

els.resetButton.addEventListener("click", () => {
  if (!window.confirm("Den lokalen Fortschritt auf diesem Gerät wirklich zurücksetzen?")) return;
  stopCurrentAudio();
  state.completed.clear();
  persistCompleted();
  renderTracks();
  showToast("Forschungsstand wurde zurückgesetzt.");
});

els.shareButton.addEventListener("click", async () => {
  const shareData = {
    title: document.title,
    text: "TT Malta Audio Experience",
    url: window.location.href
  };
  try {
    if (navigator.share) await navigator.share(shareData);
    else if (navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Link wurde kopiert.");
    } else showToast(window.location.href);
  } catch (error) {
    if (error.name !== "AbortError") showToast("Teilen war nicht möglich.");
  }
});

async function init() {
  try {
    const [configResponse, tracksResponse] = await Promise.all([
      fetch("config.json", { cache: "no-store" }),
      fetch("tracks.json", { cache: "no-store" })
    ]);
    if (!configResponse.ok || !tracksResponse.ok) throw new Error("Dateien konnten nicht geladen werden.");
    state.config = await configResponse.json();
    state.tracks = (await tracksResponse.json()).sort((a, b) => a.order - b.order);
    applyConfig(state.config);
    renderTracks();
  } catch (error) {
    els.stations.innerHTML = `
      <div class="error-box">
        <strong>Das Archiv konnte nicht geladen werden.</strong><br>
        Bitte die Seite über GitHub Pages oder einen lokalen Webserver öffnen, nicht direkt als Datei.
      </div>`;
    console.error(error);
  }

  if ("serviceWorker" in navigator && window.location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("service-worker.js").catch(console.warn);
  }
}

init();
