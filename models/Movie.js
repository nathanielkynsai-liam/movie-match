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
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 10
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
