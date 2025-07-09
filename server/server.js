import "dotenv/config";
import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import recipeRoutes from "./routes/recipeRoutes.js";

import path from "path";
import { fileURLToPath } from "url";

const app = express();

// Middlewares -----------------------
app.use(cors());                      // For Cross Origin Resource Sharing
app.use(express.json());             // To access req.body

// Route logging
app.use((req, res, next) => {
    console.log(`Accessing route: ${req.method} ${req.path} at ${new Date()}`);
    next();
});

// API Routes -----------------------
app.use("/api/v1/auth", authRoutes);           // Auth routes
app.use("/api/v1/recipe", recipeRoutes);       // Recipe routes

// Connect to MongoDB -----------------------
connectDB();

// Serve Frontend -----------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from client folder
app.use(express.static(path.join(__dirname, "client")));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "index.html"));
});

// Start Server -----------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
});
