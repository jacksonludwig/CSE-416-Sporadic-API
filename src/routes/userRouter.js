import express from "express";
import { validateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", validateToken, (req, res) => {
  res.send("You tried to get users...");
});

export default router;
