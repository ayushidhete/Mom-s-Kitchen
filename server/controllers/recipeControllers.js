import Recipe from "../models/recipeModel.js";

const normalizeIngredients = (ingredients) => {
  return ingredients
    .join(",")                  // handle array
    .toLowerCase()
    .split(/[,،\n]+/)           // split by comma or space
    .map(i => i.trim())
    .filter(Boolean);
};


const createRecipeController = async (req, res) => {
    const { author, title, description,ingredients, image, steps } = req.body;

    const newRecipe = {
        author: author,
        title: title,
        description: description,
        ingredients: ingredients,
        image: image,
        steps: steps,
    };

    try {
        const recipe = await new Recipe(newRecipe).save();
        console.log("Recipe Created....");
        return res.status(201).json(
            {
                success: true,
                message: `${title} Recipe Added successfully....`,
                recipe,
            }
        );
    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {
                success: false,
                message: `Something went wrong in Create Recipe....`,
                error,
            }
        );
    }
};

const getRecipesController = async (req, res) => {
    const count = 400;

    try {

        // Get <count> no. of Random Recipes  from MongoDB Databasse
        const recipes = await Recipe.aggregate([
            { $sample: { size: count } }
        ]);

        return res.status(200).json(
            {
                success: true,
                message: "Got Recipes successfully....",
                recipes: recipes,
            }
        )

    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {
                success: false,
                message: "Error in Get recipes....",
                error
            }
        )
    }
}

const getRecipeByAuthorController = async (req, res) => {
    console.log("IN get revipe");
    console.log(req.body);
    const author = req.body.author;

    try {

        // Get Recipes from MongoDB Databasse
        const recipes = await Recipe.find({ author: author },);

        return res.status(200).json(
            {
                success: true,
                message: "Got Recipes successfully....",
                recipes: recipes,
            }
        )

    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {
                success: false,
                message: "Error in Get recipes by author....",
                error
            }
        )
    }
}

const getRecipeByIdController = async (req, res) => {
    const id = req.params.id;
    
    try {
        
        // Get Recipes from MongoDB Databasse
        const recipe = await Recipe.findOne({id: id});

        return res.status(200).json(
            {
                success: true,
                message: "Got Recipe successfully....",
                recipe: recipe,
            }
        )

    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {
                success: false,
                message: "Error in Get recipe by id....",
                error
            }
        )
    }
}

const searchRecipesByKeywordController = async (req, res) => {

    try {
        const keyword = req.params.keyword;

        let query = {};

        // If keyword to search is provided, perform a text search on name and description fields
        if (keyword) {
            query.$or = [
                { title: { $regex: keyword, $options: 'i' } }, 
                { description: { $regex: keyword, $options: 'i' } },
                { ingredients: { $regex: keyword, $options: 'i' } },
            ];
        }

        const recipes = await Recipe.find(query);

        res.status(200).json({
            success: true,
            message: "Recipes Searched successfully....",
            recipes: recipes
        });
    } catch (error) {
        console.error("Error fetching recipes:", error);
        res.status(500).json({
            success: false,
            message: "Error searching recipes using the keyword",
            error: error.message
        });
    }
};

const updateRecipeController = async (req, res) => {

    const idOfRecipe = req.body.id;
    const author = req.body.author;

    console.log(req.body);
    const newTitleOfRecipe = req.body.title;
    const newDescriptionOfRecipe = req.body.description;
    const newStepsOfRecipe = req.body.steps;
    const newImageOfRecipe = req.body.image;
    const newIngredientsOfRecipe = req.body.ingredients;

    try {
        const updatedRecipe = await Recipe.findOneAndUpdate(
            {
                id: idOfRecipe,
                author: author,
            },
            {
                title: newTitleOfRecipe,
                description: newDescriptionOfRecipe,
                steps: newStepsOfRecipe,
                image: newImageOfRecipe,
                ingredients: newIngredientsOfRecipe,
            }
        );
        return res.status(200).json(
            {
                success: true,
                message: `Successfully updated Recipe ....`,
                updatedRecipe: updatedRecipe,
            }
        );

    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {
                success: false,
                message: `Something went wrong in Update Recipe....`,
                error,
            }
        );
    }
};

export const searchRecipesByIngredientsController = async (req, res) => {
  try {
    const { ingredients } = req.query;

    if (!ingredients) {
      return res.status(400).json({
        success: false,
        message: "Please provide ingredients",
      });
    }

    const ingredientArray = ingredients.split(",");

    const recipes = await Recipe.find({
      ingredients: { $in: ingredientArray },
    });

    res.status(200).json({
      success: true,
      recipes,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in ingredient search",
      error,
    });
  }
};

const deleteRecipeController = async (req, res) => {
    const idOfRecipe = req.body.id;
    const author = req.body.author;

    try {
        const deletedRecipe = await Recipe.findOneAndDelete(
            {
                id: idOfRecipe,
                author: author,
            },
        );
        return res.status(200).json(
            {
                success: true,
                message: `Successfully deleted Recipe....`,
                deletedRecipe,
            }
        );

    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {
                success: false,
                message: `Something went wrong in Delete Recipe....`,
                error,
            }
        );
    }
};

export { 
  createRecipeController, 
  getRecipesController, 
  getRecipeByAuthorController,
  getRecipeByIdController, 
  searchRecipesByKeywordController, 
  updateRecipeController, 
  deleteRecipeController
};