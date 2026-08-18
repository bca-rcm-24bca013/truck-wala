// app.js — runs in the browser.

// ---------- live clock ----------
const clockEl = document.getElementById("clock");
function tickClock() {
  const now = new Date();
  clockEl.textContent = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
tickClock();
setInterval(tickClock, 1000);

// ---------- live listener count over WebSocket ----------
const liveCountEl = document.getElementById("liveCount");
function connectSocket() {
  const proto = location.protocol === "https:" ? "wss" : "ws";
  const socket = new WebSocket(`${proto}://${location.host}`);

  socket.addEventListener("message", (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.type === "count") {
        liveCountEl.textContent = msg.count;
      }
    } catch (e) {
      /* ignore malformed messages */
    }
  });

  socket.addEventListener("close", () => {
    liveCountEl.textContent = "--";
    // try to reconnect after a short delay
    setTimeout(connectSocket, 2000);
  });

  socket.addEventListener("error", () => socket.close());
}
connectSocket();

// ---------- truck decoration (slats + wheels, drawn from JS to keep index.html short) ----------
const slatsG = document.getElementById("slats");
for (let i = 0; i < 11; i++) {
  const r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  r.setAttribute("x", 80 + i * 55);
  r.setAttribute("y", 330);
  r.setAttribute("width", 34);
  r.setAttribute("height", 70);
  r.setAttribute("fill", "#08101d");
  slatsG.appendChild(r);
}
const wheelsG = document.getElementById("wheels");
[160, 330, 500, 820].forEach((cx) => {
  const outer = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  outer.setAttribute("cx", cx);
  outer.setAttribute("cy", 440);
  outer.setAttribute("r", 34);
  outer.setAttribute("fill", "#060a12");
  wheelsG.appendChild(outer);
  const inner = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  inner.setAttribute("cx", cx);
  inner.setAttribute("cy", 440);
  inner.setAttribute("r", 14);
  inner.setAttribute("fill", "#3a4658");
  wheelsG.appendChild(inner);
});

// ---------- player ----------
const audio = document.getElementById("audio");
const playBtn = document.getElementById("playBtn");
const playIcon = document.getElementById("playIcon");
const topPlayBtn = document.getElementById("topPlayBtn");
const topPlayIcon = document.getElementById("topPlayIcon");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const repeatBtn = document.getElementById("repeatBtn");
const queueBtn = document.getElementById("queueBtn");
const artBtn = document.getElementById("artBtn");
const hornBadge = document.getElementById("hornBadge");
const closeQueueBtn = document.getElementById("closeQueue");
const queuePanel = document.getElementById("queuePanel");
const queueListEl = document.getElementById("queueList");
const trackTitleEl = document.getElementById("trackTitle");
const trackArtistEl = document.getElementById("trackArtist");
const nowPlayingTitleEl = document.getElementById("nowPlayingTitle");
const progressBar = document.getElementById("progressBar");
const progressFill = document.getElementById("progressFill");
const progressHandle = document.getElementById("progressHandle");
const curTimeEl = document.getElementById("curTime");
const durTimeEl = document.getElementById("durTime");

const PLAY_SVG = '<path d="M8 5v14l11-7z" fill="currentColor"/>';
const PAUSE_SVG = '<path d="M6 5h4v14H6zM14 5h4v14h-4z" fill="currentColor"/>';

let playlist = [];
let currentIndex = 0;
let shuffle = false;
let repeat = false;

function fmtTime(s) {
  if (!s || Number.isNaN(s) || !Number.isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

function renderQueue() {
  queueListEl.innerHTML = "";
  playlist.forEach((song, i) => {
    const li = document.createElement("li");
    li.className = i === currentIndex ? "active" : "";
    li.innerHTML = `<span>${i + 1}. ${song.title}</span><span class="q-artist">${song.artist}</span>`;
    li.addEventListener("click", () => loadTrack(i, true));
    queueListEl.appendChild(li);
  });
}

function loadTrack(index, autoplay) {
  if (!playlist.length) return;
  currentIndex = ((index % playlist.length) + playlist.length) % playlist.length;
  const song = playlist[currentIndex];
  audio.src = song.src;
  trackTitleEl.textContent = song.title;
  trackArtistEl.textContent = song.artist;
  nowPlayingTitleEl.textContent = song.title;
  renderQueue();
  if (autoplay) {
    audio.play().catch(() => {
      console.warn(`Could not play "${song.title}". Add the audio file at ${song.src}.`);
    });
  }
}

function setPlayingUI(isPlaying) {
  playIcon.innerHTML = isPlaying ? PAUSE_SVG : PLAY_SVG;
  topPlayIcon.innerHTML = isPlaying ? PAUSE_SVG : PLAY_SVG;
}

function togglePlay() {
  if (!playlist.length) return;
  if (audio.paused) {
    audio.play().catch(() => {});
  } else {
    audio.pause();
  }
}

function playNext() {
  if (!playlist.length) return;
  const nextIndex = shuffle
    ? Math.floor(Math.random() * playlist.length)
    : currentIndex + 1;
  loadTrack(nextIndex, true);
}

function playPrev() {
  if (!playlist.length) return;
  loadTrack(currentIndex - 1, true);
}

// events
playBtn.addEventListener("click", togglePlay);
topPlayBtn.addEventListener("click", togglePlay);
nextBtn.addEventListener("click", playNext);
prevBtn.addEventListener("click", playPrev);

shuffleBtn.addEventListener("click", () => {
  shuffle = !shuffle;
  shuffleBtn.classList.toggle("active", shuffle);
});

repeatBtn.addEventListener("click", () => {
  repeat = !repeat;
  repeatBtn.classList.toggle("active", repeat);
});

function toggleQueue() {
  queuePanel.classList.toggle("hidden");
}
queueBtn.addEventListener("click", toggleQueue);
artBtn.addEventListener("click", toggleQueue);
hornBadge.addEventListener("click", toggleQueue);
closeQueueBtn.addEventListener("click", () => queuePanel.classList.add("hidden"));

audio.addEventListener("play", () => setPlayingUI(true));
audio.addEventListener("pause", () => setPlayingUI(false));
audio.addEventListener("timeupdate", () => {
  const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
  progressFill.style.width = pct + "%";
  progressHandle.style.left = pct + "%";
  curTimeEl.textContent = fmtTime(audio.currentTime);
});
audio.addEventListener("loadedmetadata", () => {
  durTimeEl.textContent = fmtTime(audio.duration);
});
audio.addEventListener("ended", () => {
  if (repeat) {
    audio.currentTime = 0;
    audio.play();
  } else {
    playNext();
  }
});

progressBar.addEventListener("click", (e) => {
  if (!audio.duration) return;
  const rect = progressBar.getBoundingClientRect();
  const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
  audio.currentTime = ratio * audio.duration;
});

// ---------- load the playlist from the server ----------
fetch("/api/playlist")
  .then((res) => res.json())
  .then((data) => {
    playlist = Array.isArray(data) ? data : [];
    if (playlist.length) {
      loadTrack(0, false);
    } else {
      nowPlayingTitleEl.textContent = "playlist.json is empty — add a song";
    }
  })
  .catch(() => {
    nowPlayingTitleEl.textContent = "Could not load playlist.json";
  });