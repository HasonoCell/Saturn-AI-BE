import express from "express";
import cors from "cors";
import userRouter from "./routes/user";
import messageRouter from "./routes/chat";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());
app.use("/user", userRouter);
app.use("/ai", messageRouter);

app.listen(PORT, () => {
  console.log(`Server running at port: ${PORT}`);
});
