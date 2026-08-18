// server.js
// Express serves the static site + playlist.json.
// A WebSocket server tracks how many browser tabs are currently connected
// and broadcasts that number to every connected client in real time —
// this is what powers the "### on the highway" live counter.

const express = require("express");
const http = require("http");
const path = require("path");
const fs = require("fs");
const { WebSocketServer } = require("ws");

const PORT = process.env.PORT || 3000;
const PLAYLIST_PATH = path.join(__dirname, "playlist.json");

const app = express();
app.use(express.static(path.join(__dirname, "public")));

// Serve the playlist as JSON so the front end can read/reorder it.
// Edit playlist.json on disk to add, remove, or reorder songs — no
// restart needed, this endpoint reads the file fresh every request.
app.get("/api/playlist", (req, res) => {
  fs.readFile(PLAYLIST_PATH, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Could not read playlist.json" });
    try {
      res.json(JSON.parse(data));
    } catch (e) {
      res.status(500).json({ error: "playlist.json is not valid JSON" });
    }
  });
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

let liveCount = 0;

function broadcastCount() {
  const payload = JSON.stringify({ type: "count", count: liveCount });
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) client.send(payload);
  });
}

wss.on("connection", (socket) => {
  liveCount += 1;
  broadcastCount();

  socket.on("close", () => {
    liveCount = Math.max(0, liveCount - 1);
    broadcastCount();
  });

  socket.on("error", () => {
    // treat as a disconnect
    liveCount = Math.max(0, liveCount - 1);
    broadcastCount();
  });
});

server.listen(PORT, () => {
  console.log(`Truck Wala running at http://localhost:${PORT}`);
});