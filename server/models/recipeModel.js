import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const recipeSchema = mongoose.Schema(
  {
    author: {
      type: String,
      required: true,
    },

    id: {
      type: String,
      default: uuidv4,
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    // 🔥 CHANGE: array for better search
    ingredients: [
      {
        type: String,
        required: true,
      },
    ],

    image: {
      type: String,
      required: true,
    },

    steps: {
      type: [String],
      required: true,
    },

    // 🔥 NEW FEATURES

    category: {
      type: String, // breakfast, lunch, dinner
    },

    cuisine: {
      type: String, // indian, italian, etc
    },

    cookingTime: {
      type: Number, // in minutes
    },

    difficulty: {
      type: String, // easy, medium, hard
    },

    // ⭐ Ratings system
    ratings: [
      {
        user: String,
        value: Number, // 1–5
      },
    ],

    averageRating: {
      type: Number,
      default: 0,
    },

    // ❤️ bookmarks (for user dashboard)
    bookmarks: [
      {
        type: String, // userId
      },
    ],
  },
  { timestamps: true }
);

// 🔥 INDEXING (important for performance)
recipeSchema.index({ ingredients: 1 });
recipeSchema.index({ title: "text", description: "text" });

const Recipe = mongoose.model("RECIPE", recipeSchema);

export default Recipe;