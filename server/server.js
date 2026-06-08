import express from "express";
import cors    from "cors";
import dotenv  from "dotenv";
import path    from "path";
import { fileURLToPath } from "url";

import connectDB    from "./config/db.js";
import authRoutes   from "./routes/authRoutes.js";
import recipeRoutes from "./routes/recipeRoutes.js";
import chatRoutes   from "./routes/chatRoutes.js";

// __dirname for ES Modules (defined ONCE, used everywhere below)
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Load .env — override:true wins over
dotenv.config({ path: path.resolve(__dirname, ".env"), override: true });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/v1/chat",   chatRoutes);
app.use("/api/v1/auth",   authRoutes);
app.use("/api/v1/recipe", recipeRoutes);

// MongoDB
connectDB();

// Serve frontend
app.use(express.static(path.join(__dirname, "client")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "index.html"));
});

// Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));