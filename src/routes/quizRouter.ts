import express from "express";
import createQuiz from "../controllers/createQuiz";
import retrieveQuizByTitle from "../controllers/retrieveQuizByTitle";
import { validateToken } from "../middleware/auth";

const quizRouter = express.Router();

quizRouter.post("/", validateToken, createQuiz);
quizRouter.get("/:platformTitle/:quizTitle", validateToken, retrieveQuizByTitle);

export default quizRouter;
