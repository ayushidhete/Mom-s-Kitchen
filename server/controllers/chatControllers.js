import Recipe from "../models/recipeModel.js";
import Groq from "groq-sdk";

// 🔥 Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// 🔥 Normalize ingredients (IMPORTANT FIX)
const normalizeIngredients = (ingredients) => {
  return ingredients
    .join(",")
    .toLowerCase()
    .split(/[,،\n]+/)
    .map(i => i.trim())
    .filter(Boolean);
};

// 🔥 FINAL CHAT CONTROLLER
export const chatController = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Query is required",
      });
    }

    // 🧠 Step 1: Clean query
    const words = query
      .toLowerCase()
      .split(" ")
      .map(w => w.trim())
      .filter(Boolean);

    // 📦 Step 2: Fetch recipes
    const recipes = await Recipe.find({});

    // ⚡ Step 3: Scoring logic (IMPROVED)
    const scoredRecipes = recipes.map(recipe => {
      let score = 0;

      const ingredientWords = normalizeIngredients(recipe.ingredients);

      words.forEach(word => {
        if (ingredientWords.some(i => i.includes(word))) {
          score += 2; // better scoring
        }
      });

      return { ...recipe._doc, score };
    });

    // 🎯 Step 4: Filter + Sort
    const filtered = scoredRecipes
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score);

    // 🤖 Step 5: AI Response (Groq)
    let aiMessage = "";

    if (filtered.length > 0) {
      const recipeDetails = filtered
        .slice(0, 3)
        .map(r => `${r.title}: ${r.description}`)
        .join("\n");

      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "user",
            content: `
User query: "${query}"

Available recipes:
${recipeDetails}

Suggest best options in a short friendly way.
            `,
          },
        ],
      });

      aiMessage = completion.choices[0].message.content;
    } else {
      aiMessage = "Sorry 😔 I couldn't find any recipes. Try different ingredients!";
    }

    // 📤 Step 6: Final response
    res.status(200).json({
      success: true,
      message: aiMessage,
      count: filtered.length,
      recipes: filtered,
    });

  } catch (error) {
    console.log("Chatbot error:", error);

    res.status(500).json({
      success: false,
      message: "Chatbot error",
      error: error.message,
    });
  }
};