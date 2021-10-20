import express from "express";
import cors from "cors";
import userRouter from "./routes/userRouter";

const app = express();

app.use(cors(), express.json());

app.use("/users", userRouter);

export default app;
