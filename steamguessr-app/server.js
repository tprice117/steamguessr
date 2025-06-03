// Simple Express proxy server for Steam reviews
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = 3001;

app.use(cors());

app.get("/api/reviews/:appId", async (req, res) => {
  const { appId } = req.params;
  const url = `https://store.steampowered.com/appreviews/${appId}?json=1&filter=top&language=english&num_per_page=5`;
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

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
