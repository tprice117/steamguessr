// Simple Express proxy server for Steam reviews
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
// Serve static files from the Vite build
app.use(express.static(path.join(__dirname, "dist")));

app.get("/api/reviews/:appId", async (req, res) => {
  const { appId } = req.params;
  // Helper to select reviews
  async function getBestReviews(url) {
    const response = await fetch(url);
    const data = await response.json();
    if (!data.reviews) return [];
    const reviews = data.reviews;
    // Most funny review
    const sortedFunny = [...reviews].sort((a, b) => (b.votes_funny || 0) - (a.votes_funny || 0));
    const mostFunny = sortedFunny[0];
    // Most upvoted positive review (not the most funny)
    const sortedPositive = [...reviews].filter(r => r.voted_up && r.recommendationid !== (mostFunny && mostFunny.recommendationid)).sort((a, b) => (b.votes_up || 0) - (a.votes_up || 0));
    const mostUpvotedPositive = sortedPositive[0];
    // Most upvoted negative review (not the most funny or most upvoted positive)
    const sortedNegative = [...reviews].filter(r => !r.voted_up && r.recommendationid !== (mostFunny && mostFunny.recommendationid) && r.recommendationid !== (mostUpvotedPositive && mostUpvotedPositive.recommendationid)).sort((a, b) => (b.votes_up || 0) - (a.votes_up || 0));
    const mostUpvotedNegative = sortedNegative[0];
    return [mostFunny, mostUpvotedPositive, mostUpvotedNegative].filter(Boolean);
  }
  // Try past year first
  let url = `https://store.steampowered.com/appreviews/${appId}?json=1&filter=all&language=english&day_range=365&num_per_page=100`;
  try {
    let result = await getBestReviews(url);
    // If no reviews, try lifetime
    if (result.length === 0) {
      url = `https://store.steampowered.com/appreviews/${appId}?json=1&filter=all&language=english&day_range=0&num_per_page=100`;
      result = await getBestReviews(url);
    }
    res.json({ reviews: result });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// Temporary Endpoint to check if the guessed appId matches the actual appId
app.get("/api/check-appid/:appId", (req, res) => {
  const { appId } = req.params;
  const guess = req.query.guess;
  // Compare as strings
  const correct = String(appId) === String(guess);
  res.json({ correct });
});

// Endpoint to get game details (including title) by appId
app.get("/api/appdetails/:appId", async (req, res) => {
  const { appId } = req.params;
  const url = `https://store.steampowered.com/api/appdetails?appids=${appId}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    const appData = data[appId];
    if (appData && appData.success && appData.data) {
      res.json({
        name: appData.data.name,
        header_image: appData.data.header_image,
        type: appData.data.type,
        steam_appid: appData.data.steam_appid,
        ...appData.data,
      });
    } else {
      res.status(404).json({ error: "App not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch app details" });
  }
});

// Endpoint to get top 500 appIDs from SteamSpy
app.get("/api/top500appids", async (req, res) => {
  try {
    const response = await fetch("https://steamspy.com/api.php?request=all");
    const data = await response.json();
    // Sort by owners (take the lower bound of the owners range)
    const sorted = Object.values(data).sort((a, b) => {
      const aOwners = parseInt(a.owners.split(" .. ")[0].replace(/,/g, ""), 10);
      const bOwners = parseInt(b.owners.split(" .. ")[0].replace(/,/g, ""), 10);
      return bOwners - aOwners;
    });
    const top500 = sorted.slice(0, 500).map((game) => game.appid);
    res.json({ appids: top500 });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch top 500 appIDs" });
  }
});

// Fallback: serve index.html for any unknown route (for React Router)
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
