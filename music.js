const API_KEY = "15933a50";
let currentType = "movie";
let currentID = "";

// Initial Load
window.onload = () => {
  fetchMovies("Action", "movie");
};

async function fetchMovies(query, type = "movie") {
  const grid = document.getElementById("movieGrid");
  grid.innerHTML =
    '<div class="status-msg"><div class="spinner"></div>Searching for content...</div>';

  try {
    const response = await fetch(
      `https://www.omdbapi.com/?apikey=${API_KEY}&s=${query}&type=${type}`,
    );
    const data = await response.json();

    if (data.Response === "True") {
      grid.innerHTML = "";
      data.Search.forEach((item) => {
        const card = document.createElement("div");
        card.className = "movie-card";
        card.onclick = () => openPlayer(item.imdbID, item.Title, item.Type);

        const poster =
          item.Poster !== "N/A"
            ? item.Poster
            : "https://via.placeholder.com/300x450?text=No+Poster";

        card.innerHTML = `
                            <img src="${poster}" alt="${item.Title}">
                            <div class="movie-card-info">
                                <div class="movie-title">${item.Title}</div>
                                <div class="movie-year">${item.Year}</div>
                            </div>
                        `;
        grid.appendChild(card);
      });
    } else {
      grid.innerHTML = `<div class="status-msg">No results found for "${query}". Try another keyword.</div>`;
    }
  } catch (error) {
    grid.innerHTML = `<div class="status-msg">Connection Error. Please try again.</div>`;
  }
}

function handleSearch(e) {
  if (e.key === "Enter") {
    const val = e.target.value.trim();
    if (val) {
      document.getElementById("displayTitle").innerText =
        `Results for "${val}"`;
      fetchMovies(val, currentType);
    }
  }
}

function changeCategory(type, btn, query = "Top") {
  currentType = type;
  document
    .querySelectorAll(".nav-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");

  const title =
    type === "movie"
      ? query === "2025"
        ? "Trending 2026"
        : "Featured Movies"
      : "Popular Series";
  document.getElementById("displayTitle").innerText = title;

  fetchMovies(
    query === "2025" ? "2025" : type === "movie" ? "Action" : "Drama",
    type,
  );
}

async function openPlayer(id, title, type) {
  currentID = id;
  const modal = document.getElementById("playerModal");
  const iframe = document.getElementById("videoFrame");
  const sControls = document.getElementById("seriesControls");
  const titleDisplay = document.getElementById("activeTitle");

  modal.style.display = "flex";
  titleDisplay.innerText = title;

  if (type === "series") {
    sControls.style.display = "flex";
    // Fetch Total Seasons
    const res = await fetch(
      `https://www.omdbapi.com/?apikey=${API_KEY}&i=${id}`,
    );
    const data = await res.json();

    const sSelect = document.getElementById("seasonSelect");
    sSelect.innerHTML = "";
    for (let i = 1; i <= parseInt(data.totalSeasons); i++) {
      const opt = document.createElement("option");
      opt.value = i;
      opt.innerText = `Season ${i}`;
      sSelect.appendChild(opt);
    }
    updateEpisodeList();
  } else {
    sControls.style.display = "none";
    iframe.src = `https://vidsrc.me/embed/movie?imdb=${id}`;
  }
}

async function updateEpisodeList() {
  const season = document.getElementById("seasonSelect").value;
  const eSelect = document.getElementById("episodeSelect");
  eSelect.innerHTML = "<option>Loading...</option>";

  const res = await fetch(
    `https://www.omdbapi.com/?apikey=${API_KEY}&i=${currentID}&Season=${season}`,
  );
  const data = await res.json();

  eSelect.innerHTML = "";
  data.Episodes.forEach((ep) => {
    const opt = document.createElement("option");
    opt.value = ep.Episode;
    opt.innerText = `Ep ${ep.Episode}: ${ep.Title}`;
    eSelect.appendChild(opt);
  });
  playEpisode();
}

function playEpisode() {
  const season = document.getElementById("seasonSelect").value;
  const episode = document.getElementById("episodeSelect").value;
  document.getElementById("videoFrame").src =
    `https://vidsrc.me/embed/tv?imdb=${currentID}&sea=${season}&epi=${episode}`;
}

function closePlayer() {
  const modal = document.getElementById("playerModal");
  const iframe = document.getElementById("videoFrame");
  modal.style.display = "none";
  iframe.src = ""; // Stop the video
}
