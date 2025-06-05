// Simple Express proxy server for Steam reviews
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = 3001;

app.use(cors());

app.get("/api/reviews/:appId", async (req, res) => {
  const { appId } = req.params;
  // Use filter=all for helpfulness, with day_range=30, and num_per_page=5
  const url = `https://store.steampowered.com/appreviews/${appId}?json=1&filter=all&language=english&day_range=30&num_per_page=5`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
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

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
