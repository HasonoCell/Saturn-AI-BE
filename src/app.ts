import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { userRouter, messageRouter, conversationRouter } from "./routes";

const app = express();

app.use(express.json());
app.use(cors());
app.use("/user", userRouter);
app.use("/messages", messageRouter);
app.use("/conversations", conversationRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server running at port: ${process.env.PORT}`);
});
