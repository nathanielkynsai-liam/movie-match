const express = require("express");
const router = express.Router();
const Movie = require("../models/Movie");
const auth = require("../middleware/auth");

// All movie routes require authentication
router.use(auth);

// GET /api/movies — Read all movies for the logged-in user
router.get("/", async (req, res) => {
  try {
    const movies = await Movie.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 });

    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/movies — Create a new movie
router.post("/", async (req, res) => {
  try {
    const { title, genre, rating } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const movie = new Movie({
      title,
      genre: genre || "",
      rating: rating || 0,
      createdBy: req.user.id
    });

    await movie.save();

    res.status(201).json(movie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/movies/:id — Update a movie
router.put("/:id", async (req, res) => {
  try {
    const movie = await Movie.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      req.body,
      { new: true }
    );

    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    res.json(movie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/movies/:id — Delete a movie
router.delete("/:id", async (req, res) => {
  try {
    const movie = await Movie.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    res.json({ message: "Movie deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
