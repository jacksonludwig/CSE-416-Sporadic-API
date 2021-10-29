import express from "express";
import cors from "cors";
import userRouter from "./routes/userRouter";
import platformRouter from "./routes/platformRouter";
import quizRouter from "./routes/quizRouter";
const app = express();

app.use(cors(), express.json());

app.use("/users", userRouter);
app.use("/platforms", platformRouter);
app.use("/quizzes", quizRouter);

export default app;
