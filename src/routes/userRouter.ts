import express, { Request, Response } from "express";
import { validateToken } from "../middleware/auth";

const router = express.Router();

router.get("/", validateToken, (req: Request, res: Response) => {
  res.send("You tried to get users...");
});

export default router;
