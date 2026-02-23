

/**
 * Global SonicStream Logic
 * Handles music search via iTunes API and audio playback
 */

const audioEngine = document.getElementById("audioElement");
const searchInput = document.getElementById("searchInput");
const resultsGrid = document.getElementById("resultsGrid");
const viewTitle = document.getElementById("viewTitle");
const playBtn = document.getElementById("playBtn");
const playIcon = document.getElementById("playIcon");
const loader = document.getElementById("searchLoader");
const progressBar = document.getElementById("progressBar");
const progressContainer = document.getElementById("progressContainer");
const volumeSlider = document.getElementById("volumeSlider");

let isPlaying = false;

/**
 * Perform global search using iTunes API
 * @param {string} query
 */
async function performSearch(query) {
  if (!query || query.trim() === "") return;

  loader.classList.remove("hidden");

  try {
    const response = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=30`,
    );
    const data = await response.json();

    renderTracks(data.results);
    viewTitle.innerText = `Results for "${query}"`;
  } catch (error) {
    console.error("Search failed:", error);
    resultsGrid.innerHTML = `<p class="col-span-full text-center text-red-500">Error fetching music. Please check your connection.</p>`;
  } finally {
    loader.classList.add("hidden");
  }
}

/**
 * Render music results into the grid
 * @param {Array} tracks
 */
function renderTracks(tracks) {
  resultsGrid.innerHTML = "";

  if (tracks.length === 0) {
    resultsGrid.innerHTML = `<p class="col-span-full text-center text-zinc-500 mt-10">No songs found for that search.</p>`;
    return;
  }

  tracks.forEach((track) => {
    const card = document.createElement("div");
    card.className = "music-card";

    // Use higher resolution artwork
    const artwork = track.artworkUrl100.replace("100x100bb", "400x400bb");

    card.innerHTML = `
            <div class="card-image-wrapper">
                <img src="${artwork}" alt="${track.trackName}" class="w-full h-full object-cover">
                <div class="play-overlay">
                    <div class="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                </div>
            </div>
            <h3 class="font-bold text-sm truncate">${track.trackName}</h3>
            <p class="text-xs text-zinc-500 truncate mt-1">${track.artistName}</p>
        `;

    card.onclick = () => playTrack(track);
    resultsGrid.appendChild(card);
  });
}

/**
 * Load and play a specific track
 * @param {Object} track
 */
function playTrack(track) {
  // Update Player UI
  document.getElementById("playerImg").src = track.artworkUrl100;
  document.getElementById("playerTitle").innerText = track.trackName;
  document.getElementById("playerArtist").innerText = track.artistName;

  // Audio engine setup
  audioEngine.src = track.previewUrl;
  audioEngine.play();

  isPlaying = true;
  updatePlayIcon();
}

/**
 * Updates the play/pause button icon based on state
 */
function updatePlayIcon() {
  if (isPlaying) {
    playIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>'; // Pause icon
  } else {
    playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>'; // Play icon
  }
}

/**
 * Format seconds into M:SS
 * @param {number} seconds
 */
function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec < 10 ? "0" : ""}${sec}`;
}

// Event Listeners

playBtn.onclick = () => {
  if (!audioEngine.src) return;

  if (audioEngine.paused) {
    audioEngine.play();
    isPlaying = true;
  } else {
    audioEngine.pause();
    isPlaying = false;
  }
  updatePlayIcon();
};

searchInput.onkeypress = (e) => {
  if (e.key === "Enter") performSearch(searchInput.value);
};

audioEngine.ontimeupdate = () => {
  if (!audioEngine.duration) return;

  const progress = (audioEngine.currentTime / audioEngine.duration) * 100;
  progressBar.style.width = `${progress}%`;

  document.getElementById("currentTime").innerText = formatTime(
    audioEngine.currentTime,
  );
  document.getElementById("durationTime").innerText = formatTime(
    audioEngine.duration,
  );
};

progressContainer.onclick = (e) => {
  if (!audioEngine.duration) return;

  const rect = progressContainer.getBoundingClientRect();
  const pos = (e.clientX - rect.left) / rect.width;
  audioEngine.currentTime = pos * audioEngine.duration;
};

volumeSlider.oninput = (e) => {
  audioEngine.volume = e.target.value;
};

// Initial setup: Load trending hits
window.onload = () => performSearch("Top Hits 2024");
