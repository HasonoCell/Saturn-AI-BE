import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRouter from "./routes/user";

dotenv.config();
const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cors());
app.use("/user", userRouter);

app.listen(PORT, () => {
  console.log(`Server running at port: ${PORT}`);
});
