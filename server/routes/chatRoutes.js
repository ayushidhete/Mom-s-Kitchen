import express from "express";
import { chatController } from "../controllers/chatControllers.js";
const router = express.Router();

/**
 * @route POST /api/v1/chat
 * @desc Simple chatbot for recipe suggestions
 */
router.post("/", chatController);

export default router;