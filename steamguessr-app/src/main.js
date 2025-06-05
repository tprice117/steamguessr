import "./style.css";
import javascriptLogo from "./javascript.svg";
import viteLogo from "/vite.svg";
import { setupCounter } from "./counter.js";
import logoJpg from "./logo.jpg";
// <a href="https://vite.dev" target="_blank">
//   <img src="${viteLogo}" class="logo" alt="Vite logo" />
// </a>
// <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
//   <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
// </a>
// <div class="card">
//   <button id="counter" type="button"></button>
// </div>
// setupCounter(document.querySelector("#counter"));
document.querySelector("#app").innerHTML = `
  <nav class="navbar" style="position:sticky;top:0;z-index:1000;background:#333;padding:0.5rem 1rem;display:flex;align-items:center;justify-content:space-between;">
    <span style="color:#fff;font-weight:bold;font-size:1.2rem;">SteamGuessr!</span>
    <div style="display:flex;align-items:center;gap:1rem;">
      <a class="nav-link" href="https://github.com/tprice117/steamguessr" target="_blank" title="GitHub" style="display:flex;align-items:center;">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          fill="white"
          class="git-button"
          viewBox="0 0 16 16"
        >
          <path
            d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"
          />
        </svg>
      </a>

    </div>
  </nav>
  <div>
    <a href="./" target="_blank">
      <img src="${logoJpg}" class="logo vanilla" alt="Steamguessr logo" />
    </a>
    <h1>SteamGuessr!</h1>

    <div id="reviews"></div>
    <button id="backToTop" style="position:fixed;bottom:30px;right:30px;display:none;padding:0.7em 1.2em;font-size:1rem;border:none;border-radius:5px;background:#333;color:#fff;cursor:pointer;z-index:1001;">
      ↑ Back to Top
    </button>

  </div>
`;

// Change guess form to match based on game title instead of appID
const guessDiv = document.createElement("div");
guessDiv.style.margin = "2em 0";
guessDiv.innerHTML = `
  <form id="guessForm" style="display:flex;gap:0.5em;align-items:center;">
    <input type="text" id="guessInput" placeholder="Guess the Game Title..." required style="padding:0.5em;font-size:1em;border-radius:4px;border:1px solid #ccc;">
    <button type="submit" style="padding:0.5em 1em;font-size:1em;border:none;border-radius:4px;background:#333;color:#fff;cursor:pointer;">Guess</button>
    <span id="guessResult" style="margin-left:1em;font-weight:bold;"></span>
  </form>
`;
// Find the parent div that contains #reviews
const reviewsDiv = document.getElementById("reviews");
const parentDiv = reviewsDiv.parentNode;
parentDiv.insertBefore(guessDiv, reviewsDiv);

// Attach event listeners for Back to Top button after DOM is updated
const backToTopBtn = document.getElementById("backToTop");
window.addEventListener("scroll", () => {
  if (window.scrollY > 200) {
    backToTopBtn.style.display = "block";
  } else {
    backToTopBtn.style.display = "none";
  }
});
backToTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Fetch and display Steam game reviews
const appId = 1364780; // Replace with your target game's appId
const url = `http://localhost:3001/api/reviews/${appId}`;

// Fetch and display game title
function fetchGameTitle() {
  fetch(`http://localhost:3001/api/appdetails/${appId}`)
    .then((res) => res.json())
    .then((data) => {
      const titleDiv = document.createElement("div");
      titleDiv.id = "gameTitle";
      titleDiv.style.fontWeight = "bold";
      titleDiv.style.fontSize = "1.5em";
      titleDiv.style.margin = "1em 0 0.5em 0";
      titleDiv.textContent = data.name
        ? `Game: ${data.name}`
        : "Game title not found.";
      // Insert above reviews
      const reviewsDiv = document.getElementById("reviews");
      reviewsDiv.parentNode.insertBefore(titleDiv, reviewsDiv);

      // Display header image if available
      if (data.header_image) {
        const img = document.createElement("img");
        img.src = data.header_image;
        img.alt = data.name || "Game header image";
        img.style.display = "block";
        img.style.maxWidth = "100%";
        img.style.margin = "0.5em auto 1em auto";
        img.style.textAlign = "center";
        img.style.boxShadow = "0 2px 12px rgba(0,0,0,0.15)";
        img.style.borderRadius = "8px";
        img.style.width = "min(90vw, 600px)";
        img.style.filter = "blur(16px)";
        img.id = "headerImage";
        // Center the image by wrapping in a div
        const imgWrapper = document.createElement("div");
        imgWrapper.style.display = "flex";
        imgWrapper.style.justifyContent = "center";
        imgWrapper.appendChild(img);
        titleDiv.parentNode.insertBefore(imgWrapper, titleDiv.nextSibling);
      }
    })
    .catch(() => {
      // Optionally handle error
    });
}

// Fetch and display Steam game reviews
function fetchSteamReviews() {
  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      const reviewsDiv = document.getElementById("reviews");
      if (data.reviews) {
        reviewsDiv.innerHTML =
          `<h2>Top Reviews:</h2>` +
          data.reviews
            .map((review) => {
              // Blur the game title in the review text
              let reviewText = review.review;
              const actualTitle = (data.name || "").trim();
              if (actualTitle) {
                const titleRegex = new RegExp(
                  actualTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                  "gi"
                );
                reviewText = reviewText.replace(
                  titleRegex,
                  (match) =>
                    `<span class='blurred-title' style='filter: blur(8px); background: #222; color: transparent; border-radius: 3px; padding: 0 0.2em;'>${match}</span>`
                );
              }
              // Icon for recommended/not recommended
              const iconPath = review.voted_up
                ? '/public/icon_thumbsUp_v6.png'
                : '/public/icon_thumbsDown_v6.png';
              const iconAlt = review.voted_up ? 'Thumbs Up' : 'Thumbs Down';
              // Steam-like review card
              return `
                <div class="steam-review-card" style="background:#181a21;border-radius:8px;padding:1.2em 1.5em;margin:1.2em 0;box-shadow:0 2px 12px rgba(0,0,0,0.18);color:#c7d5e0;max-width:700px;">
                  <div style="display:flex;align-items:center;gap:1em;margin-bottom:0.7em;">
                    <img src="${iconPath}" alt="${iconAlt}" style="width:28px;height:28px;vertical-align:middle;" />
                    <span style="font-size:1.1em;font-weight:bold;color:${review.voted_up ? '#66c0f4' : '#d94141'};">
                      ${review.voted_up ? 'Recommended' : 'Not Recommended'}
                    </span>
                    <span style="font-size:0.95em;color:#a4b1cd;">${Math.round((review.author.playtime_forever || 0) / 60)} hrs on record</span>
                  </div>
                  <div style="font-size:1.08em;line-height:1.5;margin-bottom:0.8em;">${reviewText}</div>
                  <div style="display:flex;align-items:center;gap:1.5em;font-size:0.97em;">
                    <span title="SteamID">🧑 ${review.author.steamid}</span>
                    <span title="Helpful votes">👍 ${review.votes_up}</span>
                    <span title="Review posted">🕒 ${new Date(review.timestamp_created * 1000).toLocaleDateString()}</span>
                  </div>
                </div>
              `;
            })
            .join("");
      } else {
        reviewsDiv.innerHTML = "<p>No reviews found.</p>";
      }
      console.log(data.reviews);
    })
    .catch(() => {
      document.getElementById("reviews").innerHTML =
        "<p>Error fetching reviews.</p>";
    });
}

fetchGameTitle();

fetchSteamReviews();
document.getElementById("guessForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const guess = document
    .getElementById("guessInput")
    .value.trim()
    .toLowerCase();
  // Fetch the actual game title for the current appId
  fetch(`http://localhost:3001/api/appdetails/${appId}`)
    .then((res) => res.json())
    .then((data) => {
      const actualTitle = (data.name || "").trim().toLowerCase();
      const resultSpan = document.getElementById("guessResult");
      if (guess === actualTitle) {
        resultSpan.textContent = "Correct!";
        resultSpan.style.color = "green";
        // Unblur the header image
        const headerImg = document.getElementById("headerImage");
        if (headerImg) headerImg.style.filter = "none";
      } else {
        resultSpan.textContent = `Incorrect, try again! (Actual: ${data.name})`;
        resultSpan.style.color = "red";
      }
    })
    .catch(() => {
      document.getElementById("guessResult").textContent =
        "Error checking guess.";
    });
});
