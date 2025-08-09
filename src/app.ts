import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { userRouter, messageRouter, conversationRouter } from "./routes";

const app = express();

app.use(express.json());
app.use(cors());
app.use("/user", userRouter);
app.use("/", messageRouter); // message 路由挂载到根路径，因为路由本身已包含完整路径
app.use("/conversations", conversationRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server running at port: ${process.env.PORT}`);
});
