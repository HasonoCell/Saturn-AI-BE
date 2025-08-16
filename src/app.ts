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
} from "./routes";

const app = express();

app.use(express.json());
app.use(cors());

// 提供上传的图片访问
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// API路由
app.use("/user", userRouter);
app.use("/conversations", conversationRouter);
app.use("/conversations", messageRouter);
app.use("/file", fileRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server running at port: ${process.env.PORT}`);
});
