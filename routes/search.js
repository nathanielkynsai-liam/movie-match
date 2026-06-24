const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const OMDB_BASE = "https://www.omdbapi.com/";

// GET /api/search?q=inception&type=movie|series
router.get("/search", auth, async (req, res) => {
  try {
    const { q, type, page } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({ error: "Search query is required." });
    }

    const apiKey = process.env.OMDB_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: "Movie search is not configured. Please set OMDB_API_KEY.",
      });
    }

    // Build OMDB URL
    let url = `${OMDB_BASE}?apikey=${apiKey}&s=${encodeURIComponent(q.trim())}`;
    if (type && (type === "movie" || type === "series")) {
      url += `&type=${type}`;
    }
    if (page) {
      url += `&page=${page}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.Response === "False") {
      return res.json({ results: [], total: 0 });
    }

    // Transform results
    const results = (data.Search || []).map((item) => ({
      title: item.Title,
      year: item.Year,
      imdbID: item.imdbID,
      mediaType: item.Type,
      poster: item.Poster !== "N/A" ? item.Poster : null,
    }));

    res.json({
      results,
      total: parseInt(data.totalResults, 10) || 0,
    });
  } catch (err) {
    console.error("OMDB search error:", err);
    res.status(500).json({ error: "Search failed. Please try again." });
  }
});

// GET /api/search/:imdbID — Get full details for a single title
router.get("/search/:imdbID", auth, async (req, res) => {
  try {
    const apiKey = process.env.OMDB_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: "OMDB_API_KEY not configured." });
    }

    const url = `${OMDB_BASE}?apikey=${apiKey}&i=${req.params.imdbID}&plot=short`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.Response === "False") {
      return res.status(404).json({ error: "Title not found." });
    }

    res.json({
      title: data.Title,
      year: data.Year,
      genre: data.Genre,
      director: data.Director,
      plot: data.Plot,
      poster: data.Poster !== "N/A" ? data.Poster : null,
      imdbRating: data.imdbRating,
      imdbID: data.imdbID,
      mediaType: data.Type,
      runtime: data.Runtime,
      actors: data.Actors,
    });
  } catch (err) {
    console.error("OMDB detail error:", err);
    res.status(500).json({ error: "Failed to fetch details." });
  }
});

module.exports = router;
