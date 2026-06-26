const mongoose = require("mongoose");

const WatchlistSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    year: {
      type: String,
      default: ""
    },
    genre: {
      type: String,
      default: "",
      trim: true
    },
    director: {
      type: String,
      default: "",
      trim: true
    },
    poster: {
      type: String,
      default: ""
    },
    imdbID: {
      type: String,
      default: ""
    },
    mediaType: {
      type: String,
      enum: ["movie", "series", ""],
      default: ""
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index to prevent duplicate entries per user
WatchlistSchema.index({ imdbID: 1, createdBy: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Watchlist", WatchlistSchema);
