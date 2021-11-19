import express from "express";
import addCommentToQuiz from "../controllers/addCommentToQuiz";
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

<<<<<<< HEAD
quizRouter.get("/", validateToken, retrieveQuizzes);
quizRouter.get("/:platform/:quizTitle", retrieveQuizByTitle);
=======
quizRouter.get("/", retrieveQuizzes);
quizRouter.get("/:platform/:quizTitle", retrieveQuizByTitle);

quizRouter.put("/:platform/:quizTitle/comment", addCommentToQuiz);

quizRouter.delete("/:platform/:quizTitle", deleteQuizByTitle);
>>>>>>> BUILD_5

export default quizRouter;
