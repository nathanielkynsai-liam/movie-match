const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Watchlist = require("../models/Watchlist");

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMG_BASE = "https://image.tmdb.org/t/p/w500";

// Simple in-memory cache to make heavy endpoints load instantly
const cache = {};
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

router.get("/actor/:id", auth, async (req, res) => {
  const { id } = req.params;
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Missing API Key" });
  
  try {
    const personRes = await fetch(`${TMDB_BASE_URL}/person/${id}?api_key=${apiKey}&append_to_response=movie_credits,tv_credits`);
    if (!personRes.ok) return res.status(personRes.status).json({ error: "Failed to fetch actor" });
    
    const person = await personRes.json();
    
    const movies = (person.movie_credits?.cast || []).map(m => ({
      id: m.id, title: m.title, year: m.release_date ? m.release_date.split("-")[0] : "",
      poster: m.poster_path ? `${TMDB_IMG_BASE}${m.poster_path}` : null,
      character: m.character, mediaType: "movie", rating: m.vote_average ? m.vote_average.toFixed(1) : "NR",
      popularity: m.popularity
    }));
    
    const tv = (person.tv_credits?.cast || []).map(t => ({
      id: t.id, title: t.name, year: t.first_air_date ? t.first_air_date.split("-")[0] : "",
      poster: t.poster_path ? `${TMDB_IMG_BASE}${t.poster_path}` : null,
      character: t.character, mediaType: "tv", rating: t.vote_average ? t.vote_average.toFixed(1) : "NR",
      popularity: t.popularity
    }));
    
    const allCredits = [...movies, ...tv]
      // filter out things with no poster
      .filter(c => c.poster)
      .sort((a, b) => b.popularity - a.popularity); // sort by popularity
    
    // Remove duplicates based on ID (sometimes actors play multiple roles in the same movie/show)
    const uniqueCredits = [];
    const seenIds = new Set();
    for (const c of allCredits) {
      if (!seenIds.has(c.id)) {
        seenIds.add(c.id);
        uniqueCredits.push(c);
      }
    }
    
    const biography = person.biography || "";
    const awards = [];
    if (/oscar|academy award/i.test(biography)) awards.push("🏆 Oscar");
    if (/grammy/i.test(biography)) awards.push("🎶 Grammy");
    if (/emmy/i.test(biography)) awards.push("📺 Emmy");
    if (/tony award/i.test(biography)) awards.push("🎭 Tony");
    if (/golden globe/i.test(biography)) awards.push("✨ Golden Globe");

    res.json({
      id: person.id,
      name: person.name,
      biography: person.biography || "No biography available.",
      birthday: person.birthday ? new Date(person.birthday).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "Unknown",
      place_of_birth: person.place_of_birth || "Unknown",
      profile: person.profile_path ? `${TMDB_IMG_BASE}${person.profile_path}` : null,
      awards: awards.length > 0 ? awards : null,
      credits: uniqueCredits
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:type", auth, async (req, res) => {
  const { type } = req.params;
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "TMDB_API_KEY not configured in .env" });
  }

  // Check cache 
  const cacheKey = type + 
                   (req.query.date ? `-${req.query.date}` : '') + 
                   (req.query.period ? `-${req.query.period}` : '') + 
                   (req.query.sort ? `-${req.query.sort}` : '') + 
                   (type === 'recommended' ? `-${req.user.id}` : '');
                   
  if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < CACHE_DURATION) {
    return res.json(cache[cacheKey].data);
  }

  try {
    if (type === "time-machine") {
      const dateStr = req.query.date; 
      if (!dateStr) return res.status(400).json({ error: "Missing date parameter" });
      
      const [year, month] = dateStr.split("-");
      const startDate = `${year}-${month}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${month}-${lastDay}`;
      
      const moviesRes = await fetch(`${TMDB_BASE_URL}/discover/movie?api_key=${apiKey}&primary_release_date.gte=${startDate}&primary_release_date.lte=${endDate}&sort_by=popularity.desc&language=en-US&page=1`);
      const moviesData = await moviesRes.json();
      const topMovies = moviesData.results ? moviesData.results.slice(0, 20) : [];
      
      const castMap = new Map();
      const top5 = topMovies.slice(0, 5);
      
      await Promise.all(top5.map(async (movie) => {
        try {
          const creditsRes = await fetch(`${TMDB_BASE_URL}/movie/${movie.id}/credits?api_key=${apiKey}`);
          const creditsData = await creditsRes.json();
          const topCast = creditsData.cast ? creditsData.cast.slice(0, 4) : [];
          topCast.forEach(actor => {
            if (!castMap.has(actor.id)) {
              castMap.set(actor.id, {
                id: actor.id,
                name: actor.name,
                role: actor.character,
                poster: actor.profile_path ? `${TMDB_IMG_BASE}${actor.profile_path}` : null,
                movieCount: 1
              });
            } else {
              castMap.get(actor.id).movieCount++;
            }
          });
        } catch (err) {
          console.error("Error fetching credits for movie", movie.id, err);
        }
      }));
      
      const topActors = Array.from(castMap.values())
        .sort((a, b) => b.movieCount - a.movieCount)
        .slice(0, 10);
        
      const formattedMovies = topMovies.map(item => {
        const date = item.release_date || "";
        const yearStr = date ? date.split("-")[0] : "";
        return {
          id: item.id,
          title: item.title,
          year: yearStr,
          release_date: date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "Unknown",
          overview: item.overview || "No plot synopsis available.",
          rating: item.vote_average ? item.vote_average.toFixed(1) : "NR",
          poster: item.poster_path ? `${TMDB_IMG_BASE}${item.poster_path}` : null
        };
      });

      const responseData = { movies: formattedMovies, actors: topActors };
      cache[cacheKey] = { timestamp: Date.now(), data: responseData };
      return res.json(responseData);
    }

    if (type === "genres") {
      const gRes = await fetch(`${TMDB_BASE_URL}/genre/movie/list?api_key=${apiKey}&language=en-US`);
      const gData = await gRes.json();
      const responseData = gData.genres || [];
      cache[cacheKey] = { timestamp: Date.now(), data: responseData };
      return res.json(responseData);
    }

    let baseUrl = "";
    let isTop100 = false;
    let isPeople = type === "people";

    if (type === "box-office") {
      if (req.query.sort === "all-time") {
        baseUrl = `${TMDB_BASE_URL}/discover/movie?api_key=${apiKey}&sort_by=revenue.desc&language=en-US`;
      } else {
        baseUrl = `${TMDB_BASE_URL}/movie/now_playing?api_key=${apiKey}&language=en-US`;
      }
    } else if (type === "trending") {
      const period = req.query.period || "week"; // day, week, month, year
      if (period === "month") {
        const today = new Date();
        const end_date = today.toISOString().split('T')[0];
        const lastMonth = new Date();
        lastMonth.setMonth(today.getMonth() - 1);
        const start_date = lastMonth.toISOString().split('T')[0];
        baseUrl = `${TMDB_BASE_URL}/discover/movie?api_key=${apiKey}&primary_release_date.gte=${start_date}&primary_release_date.lte=${end_date}&sort_by=popularity.desc&language=en-US`;
      } else if (period === "year") {
        const today = new Date();
        const end_date = today.toISOString().split('T')[0];
        const lastYear = new Date();
        lastYear.setFullYear(today.getFullYear() - 1);
        const start_date = lastYear.toISOString().split('T')[0];
        baseUrl = `${TMDB_BASE_URL}/discover/movie?api_key=${apiKey}&primary_release_date.gte=${start_date}&primary_release_date.lte=${end_date}&sort_by=popularity.desc&language=en-US`;
      } else {
        baseUrl = `${TMDB_BASE_URL}/trending/all/${period}?api_key=${apiKey}`;
      }
    } else if (type === "past-months") {
      const today = new Date();
      const end_date = today.toISOString().split('T')[0];
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(today.getMonth() - 3);
      const start_date = threeMonthsAgo.toISOString().split('T')[0];
      baseUrl = `${TMDB_BASE_URL}/discover/movie?api_key=${apiKey}&primary_release_date.gte=${start_date}&primary_release_date.lte=${end_date}&sort_by=popularity.desc&language=en-US`;
    } else if (type === "top-rated") {
      baseUrl = `${TMDB_BASE_URL}/movie/top_rated?api_key=${apiKey}&language=en-US`;
      isTop100 = true;
    } else if (type === "top-rated-series") {
      baseUrl = `${TMDB_BASE_URL}/tv/top_rated?api_key=${apiKey}&language=en-US`;
      isTop100 = true;
    } else if (type === "people") {
      baseUrl = `${TMDB_BASE_URL}/person/popular?api_key=${apiKey}&language=en-US`;
      isTop100 = true;
    } else if (type === "recommended") {
      try {
        const userWatchlist = await Watchlist.find({ user: req.user.id });
        const genreCounts = {};
        userWatchlist.forEach(item => {
          if (item.genre) {
            item.genre.split(',').forEach(g => {
              const gName = g.trim();
              if (gName) genreCounts[gName] = (genreCounts[gName] || 0) + 1;
            });
          }
        });
        
        const gRes = await fetch(`${TMDB_BASE_URL}/genre/movie/list?api_key=${apiKey}&language=en-US`);
        const gData = await gRes.json();
        const genreMap = {};
        if (gData.genres) {
          gData.genres.forEach(g => genreMap[g.name.toLowerCase()] = g.id);
        }
        
        const topGenres = Object.keys(genreCounts)
          .sort((a, b) => genreCounts[b] - genreCounts[a])
          .slice(0, 3)
          .map(gName => genreMap[gName.toLowerCase()])
          .filter(Boolean);
          
        if (topGenres.length > 0) {
          baseUrl = `${TMDB_BASE_URL}/discover/movie?api_key=${apiKey}&with_genres=${topGenres.join(',')}&sort_by=popularity.desc&language=en-US`;
        } else {
          baseUrl = `${TMDB_BASE_URL}/movie/popular?api_key=${apiKey}&language=en-US`;
        }
      } catch (e) {
        console.error("Recommended genre error", e);
        baseUrl = `${TMDB_BASE_URL}/movie/popular?api_key=${apiKey}&language=en-US`;
      }
    } else {
      return res.status(400).json({ error: "Invalid discover type" });
    }

    let allResults = [];
    
    const fetchWithRetry = async (url, retries = 3) => {
      for (let i = 0; i < retries; i++) {
        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return await res.json();
        } catch (err) {
          if (i === retries - 1) throw err;
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    };

    if (isTop100) {
      for (let i = 1; i <= 5; i++) {
        try {
          const data = await fetchWithRetry(`${baseUrl}&page=${i}`);
          if (data.results) {
            allResults.push(...data.results);
          }
        } catch (err) {
          console.error(`Error fetching page ${i}:`, err);
        }
      }
      allResults = allResults.slice(0, 100);
    } else {
      try {
        const data = await fetchWithRetry(`${baseUrl}&page=1`);
        if (data.results) allResults = data.results.slice(0, 20);
      } catch (err) {
        console.error("Error fetching discover results:", err);
      }
    }

    let results = [];

    if (isPeople) {
      const batchSize = 10;
      for (let i = 0; i < allResults.length; i += batchSize) {
        const batch = allResults.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(async (person) => {
            try {
              const detailRes = await fetch(`${TMDB_BASE_URL}/person/${person.id}?api_key=${apiKey}`);
              if (detailRes.ok) {
                const detailData = await detailRes.json();
                const biography = detailData.biography || "";
                const shortBio = biography.length > 250 ? biography.substring(0, 250) + "..." : biography;
                const awards = [];
                if (/oscar|academy award/i.test(biography)) awards.push("🏆 Oscar");
                if (/grammy/i.test(biography)) awards.push("🎶 Grammy");
                if (/emmy/i.test(biography)) awards.push("📺 Emmy");
                if (/tony award/i.test(biography)) awards.push("🎭 Tony");
                if (/golden globe/i.test(biography)) awards.push("✨ Golden Globe");
                
                const knownFor = person.known_for ? person.known_for.map(k => k.title || k.name).filter(Boolean) : [];

                return {
                  id: person.id,
                  name: person.name,
                  role: person.known_for_department,
                  poster: person.profile_path ? `${TMDB_IMG_BASE}${person.profile_path}` : null,
                  awards: awards.length > 0 ? awards : null,
                  biography: shortBio || "No biography available.",
                  birthday: detailData.birthday ? new Date(detailData.birthday).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "Unknown",
                  placeOfBirth: detailData.place_of_birth || "Unknown",
                  knownFor: knownFor.length > 0 ? knownFor.join(", ") : "Various Roles",
                  popularity: person.popularity ? Math.round(person.popularity) : 0
                };
              }
            } catch (e) {
              console.error("Error fetching biography for person ID", person.id, e.message);
            }
            const knownFor = person.known_for ? person.known_for.map(k => k.title || k.name).filter(Boolean) : [];
            return {
              id: person.id,
              name: person.name,
              role: person.known_for_department,
              poster: person.profile_path ? `${TMDB_IMG_BASE}${person.profile_path}` : null,
              awards: null,
              biography: "No biography available.",
              birthday: "Unknown",
              placeOfBirth: "Unknown",
              knownFor: knownFor.length > 0 ? knownFor.join(", ") : "Various Roles",
              popularity: person.popularity ? Math.round(person.popularity) : 0
            };
          })
        );
        results.push(...batchResults);
      }
    } else {
      results = allResults.map(item => {
        const title = item.title || item.name;
        const date = item.release_date || item.first_air_date;
        const year = date ? date.split("-")[0] : "";
        return {
          id: item.id,
          title: title,
          year: year,
          release_date: date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "Unknown",
          overview: item.overview || "No plot synopsis available.",
          rating: item.vote_average ? item.vote_average.toFixed(1) : "NR",
          boxOffice: item.popularity ? Math.round(item.popularity) : "",
          poster: item.poster_path ? `${TMDB_IMG_BASE}${item.poster_path}` : null,
          mediaType: item.media_type || (item.first_air_date ? "series" : "movie")
        };
      });
    }

    cache[cacheKey] = { timestamp: Date.now(), data: results };
    res.json(results);
  } catch (error) {
    console.error("TMDB Fetch Error:", error.message);
    res.status(500).json({ error: "Failed to fetch from TMDB" });
  }
});

router.post("/details", auth, async (req, res) => {
  const { title, year, imdbID, type } = req.body;
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "TMDB_API_KEY not configured" });
  }

  try {
    let tmdbId = null;
    let mediaType = type === "series" || type === "tv" ? "tv" : "movie";

    // 1. Try to find by IMDB ID first
    if (imdbID && imdbID.startsWith("tt")) {
      const findRes = await fetch(`${TMDB_BASE_URL}/find/${imdbID}?api_key=${apiKey}&external_source=imdb_id`);
      const findData = await findRes.json();
      if (findData.movie_results?.length > 0) {
        tmdbId = findData.movie_results[0].id;
        mediaType = "movie";
      } else if (findData.tv_results?.length > 0) {
        tmdbId = findData.tv_results[0].id;
        mediaType = "tv";
      }
    }

    // 2. Fallback to search by title and year
    if (!tmdbId && title) {
      const searchRes = await fetch(`${TMDB_BASE_URL}/search/${mediaType}?api_key=${apiKey}&query=${encodeURIComponent(title)}&year=${year || ""}`);
      const searchData = await searchRes.json();
      if (searchData.results?.length > 0) {
        tmdbId = searchData.results[0].id;
      }
    }

    if (!tmdbId) {
      return res.status(404).json({ error: "Could not find details on TMDB" });
    }

    // 3. Fetch deep details (cast, trailers, similar)
    const detailsRes = await fetch(`${TMDB_BASE_URL}/${mediaType}/${tmdbId}?api_key=${apiKey}&append_to_response=credits,videos,similar`);
    const detailsData = await detailsRes.json();

    const cast = detailsData.credits?.cast?.slice(0, 8).map(c => ({
      name: c.name,
      character: c.character,
      profile: c.profile_path ? `${TMDB_IMG_BASE}${c.profile_path}` : null
    })) || [];

    const trailer = detailsData.videos?.results?.find(v => v.site === "YouTube" && v.type === "Trailer");
    
    const similar = detailsData.similar?.results?.slice(0, 10).map(item => ({
      id: item.id,
      title: item.title || item.name,
      poster: item.poster_path ? `${TMDB_IMG_BASE}${item.poster_path}` : null,
      mediaType: mediaType
    })) || [];

    res.json({
      overview: detailsData.overview,
      genres: detailsData.genres?.map(g => g.name).join(", "),
      cast,
      trailer: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
      similar,
      runtime: detailsData.runtime ? `${detailsData.runtime} min` : null
    });
  } catch (error) {
    console.error("TMDB Details Error:", error.message);
    res.status(500).json({ error: "Failed to fetch details" });
  }
});

module.exports = router;
