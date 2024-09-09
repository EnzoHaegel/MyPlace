const express = require("express");
const cors = require("cors");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let grid = Array(100)
  .fill()
  .map(() => Array(100).fill({ color: "#FFFFFF" }));

app.get("/grid", (req, res) => {
  res.json(grid);
});

app.post("/grid", (req, res) => {
  const { row, col, color } = req.body;
  grid[row][col] = { color };
  res.status(201).send({ row: row, col: col, color: color });
});

wss.on("connection", (ws) => {
  console.log("A client connected");

  ws.on("message", (message) => {
    const data = JSON.parse(message);
    if (data.type === "ChangePixel") {
      grid[data.row][data.col] = { color: data.color };
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ row: data.row, col: data.col, color: data.color }));
        }
      });
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
