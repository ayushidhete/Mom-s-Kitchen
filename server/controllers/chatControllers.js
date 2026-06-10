import Recipe from "../models/recipeModel.js";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// normalize ingredients
const normalizeIngredients = (ingredients) => {
  return ingredients
    .join(",")
    .toLowerCase()
    .split(/[,،\n]+/)
    .map(i => i.trim())
    .filter(Boolean);
};

export const chatController = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Query is required",
      });
    }

    // 🧠 STEP 1: Clean query
    const stopWords = [
      "recipes", "recipe", "food", "something",
      "give", "me", "want", "to", "make"
    ];

    const words = query
      .toLowerCase()
      .split(" ")
      .map(w => w.trim())
      .filter(w => w && !stopWords.includes(w));

    console.log("WORDS:", words);

    // 📦 STEP 2: Fetch recipes
    const recipes = await Recipe.find({});
    console.log("TOTAL RECIPES:", recipes.length);

    // ⚡ STEP 3: Scoring
    const scoredRecipes = recipes.map(recipe => {
      let score = 0;

      const ingredientWords = normalizeIngredients(recipe.ingredients || []);
      const tagWords = (recipe.tags || []).map(t => t.toLowerCase());
      const title = (recipe.title || "").toLowerCase();
      const description = (recipe.description || "").toLowerCase();

      words.forEach(word => {
        // ingredient match (strong)
        if (ingredientWords.some(i => i.includes(word))) score += 4;

        // tag match
        if (tagWords.some(t => t.includes(word))) score += 3;

        // title match
        if (title.includes(word)) score += 2;

        // description match
        if (description.includes(word)) score += 1;
      });

      return { ...recipe._doc, score };
    });

    // 🎯 STEP 4: Filter + Sort
    let filtered = scoredRecipes
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score);

    // 🔥 FALLBACK (VERY IMPORTANT FIX)
    if (filtered.length === 0) {
      console.log("No matches found → using fallback");

      filtered = recipes.slice(0, 5).map(r => ({
        ...r._doc,
        score: 0
      }));
    }

    // 🤖 STEP 5: AI RESPONSE (RAG)
    let aiMessage = "";

    const recipeDetails = filtered
      .slice(0, 3)
      .map(r => `${r.title}: ${r.description}`)
      .join("\n");

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are a helpful cooking assistant. Suggest recipes clearly."
        },
        {
          role: "user",
          content: `
User query: "${query}"

Recipes:
${recipeDetails}

Suggest best options in a friendly way.
          `,
        },
      ],
    });

    aiMessage = completion.choices[0].message.content;

    // 📤 STEP 6: RESPONSE
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