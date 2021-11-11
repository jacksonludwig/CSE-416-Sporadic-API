import express from "express";
import createQuiz from "../controllers/createQuiz";
import deleteQuizByTitle from "../controllers/deleteQuizByTitle";
import retrieveQuizByTitle from "../controllers/retrieveQuizByTitle";
import retrieveQuizzes from "../controllers/retrieveQuizzes";
import startQuiz from "../controllers/startQuiz";
import submitQuiz from "../controllers/submitQuiz";
import { validateToken } from "../middleware/auth";

const quizRouter = express.Router();
quizRouter.use(validateToken);

quizRouter.post("/", createQuiz);
quizRouter.post("/:platform/:quizTitle/submit", submitQuiz);
quizRouter.post("/:platform/:quizTitle/start", startQuiz);

quizRouter.get("/", validateToken, retrieveQuizzes);
quizRouter.get("/:platform/:quizTitle", retrieveQuizByTitle);

quizRouter.delete("/:platform/:quizTitle", deleteQuizByTitle);

export default quizRouter;
