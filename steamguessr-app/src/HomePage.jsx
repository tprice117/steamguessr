import React, { useEffect, useState, useRef } from "react";
import logoJpg from "./logo.jpg";
import "./style.css";

function HomePage() {
  // --- State ---
  const [appId, setAppId] = useState(); // Default AppID
  const [gameTitle, setGameTitle] = useState("");
  const [headerImage, setHeaderImage] = useState("");
  const [reviews, setReviews] = useState([]);
  const [guessInput, setGuessInput] = useState("");
  const [guessResult, setGuessResult] = useState("");
  const [isBlurred, setIsBlurred] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [topAppIds, setTopAppIds] = useState([]);
  const reviewsTopRef = useRef(null);

  // --- Fetch game details and reviews when appId changes ---
  useEffect(() => {
    if (appId === undefined) return; // Only fetch if appId is set
    let isCurrent = true; // fetch token
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
        if (!isCurrent) return;
        setGameTitle(data.name || "");
        setHeaderImage(data.header_image || "");
      })
      .catch(() => {
        if (isCurrent) setError("Error fetching game details.");
      });
    // Fetch reviews
    fetch(`http://localhost:3001/api/reviews/${appId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isCurrent) return;
        setReviews(data.reviews || []);
        setLoading(false);
      })
      .catch(() => {
        if (isCurrent) {
          setError("Error fetching reviews.");
          setLoading(false);
        }
      });
    return () => {
      isCurrent = false;
    };
  }, [appId]);

  // --- Fetch top 500 appIDs on mount ---
  useEffect(() => {
    fetch("http://localhost:3001/api/top500appids")
      .then((res) => res.json())
      .then((data) => {
        setTopAppIds(data.appids || []);
        // Only set appId if it is undefined (first load)
        if (data.appids && data.appids.length > 0 && appId === undefined) {
          setAppId(data.appids[Math.floor(Math.random() * data.appids.length)]);
        }
      })
      .catch(() => setTopAppIds([]));
  }, []);

  // --- Back to Top button logic ---
  useEffect(() => {
    function handleScroll() {
      setShowBackToTop(window.scrollY > 200);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- Utility: Remove special copyright/trademark/superscript chars from a string ---
  function normalizeTitle(str) {
    if (!str) return "";
    // Remove TM, ®, ©, ℗, superscripts, and similar marks
    return str
      .replace(/[™®©℗°·•†‡§¶…‰‱⁂⁑⁂⁃⁇⁈⁉⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁱⁿ⁰-⁹:]/gi, "")
      .replace(/\s+/g, " ") // collapse whitespace
      .trim()
      .toLowerCase();
  }

  // --- Guess form submit ---
  function handleGuessSubmit(e) {
    e.preventDefault();
    if (!gameTitle) return;
    const guess = normalizeTitle(guessInput);
    const actual = normalizeTitle(gameTitle);
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

  // --- Render a single review card ---
  function renderReviewCard(review, label) {
    if (!review) return null;
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
      >
        <div style={{ fontWeight: "bold", color: "#ffe066", marginBottom: 6, fontSize: "1.1em" }}>{label}</div>
        <div style={{ display: "flex", alignItems: "center", gap: "1em", marginBottom: "0.7em" }}>
          <img src={iconPath} alt={iconAlt} style={{ width: 28, height: 28, verticalAlign: "middle" }} />
          <span style={{ fontSize: "1.1em", fontWeight: "bold", color: review.voted_up ? "#66c0f4" : "#d94141" }}>
            {review.voted_up ? "Recommended" : "Not Recommended"}
          </span>
          <span style={{ fontSize: "0.95em", color: "#a4b1cd" }}>{Math.round((review.author.playtime_forever || 0) / 60)} hrs on record</span>
        </div>
        <div
          style={{ fontSize: "1.08em", lineHeight: 1.5, marginBottom: "0.8em" }}
          dangerouslySetInnerHTML={{ __html: blurTitleInText(review.review) }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: "1.5em", fontSize: "0.97em" }}>
          <span title="SteamID">🧑 {review.author.steamid}</span>
          <span title="Helpful votes">👍 {review.votes_up}</span>
          <span title="Funny votes">😂 {review.votes_funny}</span>
          <span title="Review posted">🕒 {new Date(review.timestamp_created * 1000).toLocaleDateString()}</span>
        </div>
      </div>
    );
  }

  // --- Render labeled reviews ---
  function renderLabeledReviews() {
    // The backend returns [mostFunny, mostUpvotedPositive, mostUpvotedNegative]
    const [mostFunny, mostUpvotedPositive, mostUpvotedNegative] = reviews;
    return (
      <div>
        {renderReviewCard(mostFunny, "Most Funny Review")}
        {renderReviewCard(mostUpvotedPositive, "Most Upvoted Positive Review")}
        {renderReviewCard(mostUpvotedNegative, "Most Upvoted Negative Review")}
      </div>
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
      <div id="reviews">{renderLabeledReviews()}</div>
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
  );
}

export default HomePage;
