import express from "express";
import createQuiz from "../controllers/createQuiz";
import retrieveQuizByTitle from "../controllers/retrieveQuizByTitle";
import retrieveQuizzes from "../controllers/retrieveQuizzes";
import { validateToken } from "../middleware/auth";

const quizRouter = express.Router();

quizRouter.post("/", validateToken, createQuiz);
quizRouter.get("/", validateToken, retrieveQuizzes);
quizRouter.get("/:platform/:quizTitle", validateToken, retrieveQuizByTitle);

export default quizRouter;
