const express = require("express");
const router = express.Router();
const Watchlist = require("../models/Watchlist");
const auth = require("../middleware/auth");

// All watchlist routes require authentication
router.use(auth);

// GET /api/watchlist — Get all watchlist items for the logged-in user
router.get("/", async (req, res) => {
  try {
    const items = await Watchlist.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/watchlist — Add to watchlist
router.post("/", async (req, res) => {
  try {
    const { title, year, genre, director, poster, imdbID, mediaType } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required." });
    }

    // Check for duplicates by imdbID if provided
    if (imdbID) {
      const existing = await Watchlist.findOne({
        imdbID,
        createdBy: req.user.id,
      });
      if (existing) {
        return res.status(409).json({ error: "Already in your watchlist." });
      }
    }

    const item = new Watchlist({
      title,
      year: year || "",
      genre: genre || "",
      director: director || "",
      poster: poster || "",
      imdbID: imdbID || "",
      mediaType: mediaType || "",
      createdBy: req.user.id,
    });

    await item.save();
    res.status(201).json(item);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Already in your watchlist." });
    }
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/watchlist/:id — Remove from watchlist
router.delete("/:id", async (req, res) => {
  try {
    const item = await Watchlist.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!item) {
      return res.status(404).json({ error: "Watchlist item not found." });
    }

    res.json({ message: "Removed from watchlist." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
