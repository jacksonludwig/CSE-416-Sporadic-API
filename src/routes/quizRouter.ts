import express from "express";
import createQuiz from "../controllers/createQuiz";
import retrieveQuizByTitle from "../controllers/retrieveQuizByTitle";
import retrieveQuizzes from "../controllers/retrieveQuizzes";
import submitQuiz from "../controllers/submitQuiz";
import { validateToken } from "../middleware/auth";

const quizRouter = express.Router();
quizRouter.use(validateToken);

quizRouter.post("/", createQuiz);
quizRouter.post("/:platform/:quizTitle/submit", submitQuiz);

quizRouter.get("/", validateToken, retrieveQuizzes);
quizRouter.get("/:platform/:quizTitle", retrieveQuizByTitle);

export default quizRouter;
