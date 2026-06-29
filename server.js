const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const movieRoutes = require("./routes/movies");
const chatRoutes = require("./routes/chat");
const searchRoutes = require("./routes/search");
const watchlistRoutes = require("./routes/watchlist");
const discoverRoutes = require("./routes/discover");

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
app.use("/api/discover", discoverRoutes);

const path = require("path");

// Serve static build in production (local/Docker only, not Vercel)
if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
  app.use(express.static(path.join(__dirname, "build")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
  });
}

// Export the app for Vercel serverless function
module.exports = app;

// Only start the server when run directly (not imported by Vercel)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log("MongoDB Connected");

      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err);
    });
}

