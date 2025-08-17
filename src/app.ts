import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import {
  userRouter,
  messageRouter,
  conversationRouter,
  fileRouter,
  searchRouter,
} from "./routes";

const app = express();

app.use(express.json());
app.use(cors());

// API路由
app.use("/user", userRouter);
app.use("/conversations", conversationRouter);
app.use("/conversations", messageRouter);
app.use("/file", fileRouter);
app.use("/messages/search", searchRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server running at port: ${process.env.PORT}`);
});
