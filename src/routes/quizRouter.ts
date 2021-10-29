import express from "express";
import createQuiz from "../controllers/createQuiz";
import retrieveQuizByTitle from "../controllers/retrieveQuizByTitle";
import retrieveQuizzesByPlatform from "../controllers/retrieveQuizzesByPlatform";
import { validateToken } from "../middleware/auth";

const quizRouter = express.Router();

quizRouter.post("/", validateToken, createQuiz);
quizRouter.get("/:platform/", validateToken, retrieveQuizzesByPlatform);
quizRouter.get("/:platform/:quizTitle", validateToken, retrieveQuizByTitle);

export default quizRouter;
