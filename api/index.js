const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("../routes/auth");
const movieRoutes = require("../routes/movies");
const chatRoutes = require("../routes/chat");
const searchRoutes = require("../routes/search");
const watchlistRoutes = require("../routes/watchlist");

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/api", (req, res) => {
  res.send("API is running");
});

app.use("/api", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api", chatRoutes);
app.use("/api", searchRoutes);
app.use("/api/watchlist", watchlistRoutes);

// ── MongoDB Connection (cached for serverless) ──
// Vercel serverless functions are ephemeral but may reuse containers.
// We cache the connection promise to avoid reconnecting on every invocation.
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }

  const conn = await mongoose.connect(process.env.MONGO_URI);
  cachedDb = conn;
  console.log("MongoDB connected (serverless)");
  return cachedDb;
}

// Wrap the app to ensure DB is connected before handling requests
const handler = async (req, res) => {
  await connectToDatabase();
  return app(req, res);
};

module.exports = handler;
