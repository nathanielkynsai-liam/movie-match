const mongoose = require("mongoose");

const MovieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
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
    year: {
      type: Number,
      default: null,
      min: 1888,
      max: 2100
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 10
    },
    mediaType: {
      type: String,
      enum: ["movie", "series", "anime", ""],
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

module.exports = mongoose.model("Movie", MovieSchema);
