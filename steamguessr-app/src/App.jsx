import React, { useEffect, useState, useRef } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import HomePage from "./HomePage";
import AboutPage from "./AboutPage";
import logoJpg from "./logo.jpg";
import "./style.css";

function App() {
  // --- State ---
  const [appId, setAppId] = useState(1364780); // Default AppID
  const [gameTitle, setGameTitle] = useState("");
  const [headerImage, setHeaderImage] = useState("");
  const [reviews, setReviews] = useState([]);
  const [guessInput, setGuessInput] = useState("");
  const [guessResult, setGuessResult] = useState("");
  const [isBlurred, setIsBlurred] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const reviewsTopRef = useRef(null);

  // --- Fetch game details and reviews when appId changes ---
  useEffect(() => {
    setLoading(true);
    setError("");
    setIsBlurred(true);
    setGuessInput("");
    setGuessResult("");
    setGameTitle("");
    setHeaderImage("");
    setReviews([]);
    // Fetch game details
    fetch(`http://localhost:3001/api/appdetails/${appId}`)
      .then((res) => res.json())
      .then((data) => {
        setGameTitle(data.name || "");
        setHeaderImage(data.header_image || "");
      })
      .catch(() => setError("Error fetching game details."));
    // Fetch reviews
    fetch(`http://localhost:3001/api/reviews/${appId}`)
      .then((res) => res.json())
      .then((data) => {
        setReviews(data.reviews || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Error fetching reviews.");
        setLoading(false);
      });
  }, [appId]);

  // --- Back to Top button logic ---
  useEffect(() => {
    function handleScroll() {
      setShowBackToTop(window.scrollY > 200);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- Guess form submit ---
  function handleGuessSubmit(e) {
    e.preventDefault();
    if (!gameTitle) return;
    const guess = guessInput.trim().toLowerCase();
    const actual = gameTitle.trim().toLowerCase();
    if (guess === actual) {
      setGuessResult("Correct!");
      setIsBlurred(false);
    } else {
      setGuessResult(`Incorrect, try again!`);
      setIsBlurred(true);
    }
  }

  // --- AppID input submit ---
  function handleAppIdChange(e) {
    e.preventDefault();
    const newId = parseInt(e.target.appIdInput.value, 10);
    if (!isNaN(newId)) {
      setAppId(newId);
    }
  }

  // --- Blur game title in review text ---
  function blurTitleInText(text) {
    if (!gameTitle) return text;
    const regex = new RegExp(
      gameTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "gi"
    );
    return text.replace(regex, (match) =>
      isBlurred
        ? `<span class='blurred-title' style='filter: blur(8px); background: #222; color: transparent; border-radius: 3px; padding: 0 0.2em;'>${match}</span>`
        : `<span style='font-weight:bold;'>${match}</span>`
    );
  }

  // --- Render reviews ---
  function renderReviews() {
    if (loading) return <p>Loading reviews...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;
    if (!reviews.length) return <p>No reviews found.</p>;
    return (
      <div>
        <h2 ref={reviewsTopRef}>Top Reviews:</h2>
        {reviews.map((review, idx) => {
          const iconPath = review.voted_up
            ? "/icon_thumbsUp_v6.png"
            : "/icon_thumbsDown_v6.png";
          const iconAlt = review.voted_up ? "Thumbs Up" : "Thumbs Down";
          return (
            <div
              className="steam-review-card"
              style={{
                background: "#181a21",
                borderRadius: 8,
                padding: "1.2em 1.5em",
                margin: "1.2em auto",
                boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
                color: "#c7d5e0",
                maxWidth: 700,
                textAlign: "left",
              }}
              key={review.recommendationid || idx}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1em",
                  marginBottom: "0.7em",
                }}
              >
                <img
                  src={iconPath}
                  alt={iconAlt}
                  style={{ width: 28, height: 28, verticalAlign: "middle" }}
                />
                <span
                  style={{
                    fontSize: "1.1em",
                    fontWeight: "bold",
                    color: review.voted_up ? "#66c0f4" : "#d94141",
                  }}
                >
                  {review.voted_up ? "Recommended" : "Not Recommended"}
                </span>
                <span style={{ fontSize: "0.95em", color: "#a4b1cd" }}>
                  {Math.round((review.author.playtime_forever || 0) / 60)} hrs
                  on record
                </span>
              </div>
              <div
                style={{
                  fontSize: "1.08em",
                  lineHeight: 1.5,
                  marginBottom: "0.8em",
                }}
                dangerouslySetInnerHTML={{
                  __html: blurTitleInText(review.review),
                }}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1.5em",
                  fontSize: "0.97em",
                }}
              >
                <span title="SteamID">🧑 {review.author.steamid}</span>
                <span title="Helpful votes">👍 {review.votes_up}</span>
                <span title="Review posted">
                  🕒{" "}
                  {new Date(
                    review.timestamp_created * 1000
                  ).toLocaleDateString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // --- Render header image ---
  function renderHeaderImage() {
    if (!headerImage) return null;
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <img
          src={headerImage}
          alt={gameTitle || "Game header image"}
          style={{
            display: "block",
            maxWidth: "100%",
            margin: "0.5em auto 1em auto",
            textAlign: "center",
            boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
            borderRadius: 8,
            width: "min(90vw, 600px)",
            filter: isBlurred ? "blur(16px)" : "none",
            transition: "filter 0.4s",
          }}
        />
      </div>
    );
  }

  // --- Render game title ---
  function renderGameTitle() {
    if (!gameTitle) return null;
    return (
      <div
        id="gameTitle"
        style={{
          fontWeight: "bold",
          fontSize: "1.5em",
          margin: "1em 0 0.5em 0",
          filter: isBlurred ? "blur(8px)" : "none",
          transition: "filter 0.4s",
        }}
      >
        Game: {gameTitle}
      </div>
    );
  }

  // --- Scroll to top ---
  function handleBackToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (reviewsTopRef.current) {
      reviewsTopRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <BrowserRouter>
      <nav
        className="navbar"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          background: "#333",
          padding: "0.5rem 1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ color: "#fff", fontWeight: "bold", fontSize: "1.2rem" }}>
          SteamGuessr!
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <a
            className="nav-link"
            href="https://github.com/tprice117/steamguessr"
            target="_blank"
            title="GitHub"
            style={{ display: "flex", alignItems: "center" }}
            rel="noopener noreferrer"
          >
            {/* SVG icon here (same as before) */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="white"
              className="git-button"
              viewBox="0 0 16 16"
            >
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8" />
            </svg>
          </a>
        </div>
      </nav>
      <div>
        <a href="./" target="_blank">
          <img src={logoJpg} className="logo vanilla" alt="Steamguessr logo" />
        </a>
        <h1>SteamGuessr!</h1>
        {/* AppID input */}
        <form
          onSubmit={handleAppIdChange}
          style={{
            margin: "1em 0",
            display: "flex",
            gap: "0.5em",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <input
            type="number"
            name="appIdInput"
            min="1"
            placeholder="Enter Steam AppID..."
            defaultValue={appId}
            style={{
              padding: "0.5em",
              fontSize: "1em",
              borderRadius: 4,
              border: "1px solid #ccc",
              width: 180,
            }}
          />
          <button
            type="submit"
            style={{
              padding: "0.5em 1em",
              fontSize: "1em",
              border: "none",
              borderRadius: 4,
              background: "#333",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Load Game
          </button>
        </form>
        {/* Guess form */}
        <form
          onSubmit={handleGuessSubmit}
          style={{
            display: "flex",
            gap: "0.5em",
            alignItems: "center",
            justifyContent: "center",
            margin: "2em 0",
          }}
        >
          <input
            type="text"
            value={guessInput}
            onChange={(e) => setGuessInput(e.target.value)}
            placeholder="Guess the Game Title..."
            required
            style={{
              padding: "0.5em",
              fontSize: "1em",
              borderRadius: 4,
              border: "1px solid #ccc",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "0.5em 1em",
              fontSize: "1em",
              border: "none",
              borderRadius: 4,
              background: "#333",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Guess
          </button>
          <span
            style={{
              marginLeft: "1em",
              fontWeight: "bold",
              color:
                guessResult === "Correct!"
                  ? "green"
                  : guessResult
                  ? "red"
                  : undefined,
            }}
          >
            {guessResult}
          </span>
        </form>
        {/* Header image and game title */}
        {renderHeaderImage()}
        {renderGameTitle()}
        {/* Reviews */}
        <div id="reviews">{renderReviews()}</div>
        {/* Back to Top button */}
        {showBackToTop && (
          <button
            id="backToTop"
            style={{
              position: "fixed",
              bottom: 30,
              right: 30,
              display: "block",
              padding: "0.7em 1.2em",
              fontSize: "1rem",
              border: "none",
              borderRadius: 5,
              background: "#333",
              color: "#fff",
              cursor: "pointer",
              zIndex: 1001,
            }}
            onClick={handleBackToTop}
          >
            ↑ Back to Top
          </button>
        )}
      </div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
