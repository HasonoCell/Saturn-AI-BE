import express from "express";
import { PrismaClient } from "./generated/prisma";

const app = express();
const PORT = 3000;

app.get("/", async (req, res) => {
  const prisma = new PrismaClient();
  const admin = await prisma.user.findUnique({
    where: { username: "admin" },
    select: {
      id: true,
      username: true,
      nickname: true,
      avatar: true,
      createdAt: true,
    },
  });
  if (admin) {
    res.json({
      message: "Admin info",
      admin,
    });
  } else {
    res.status(404).json({ message: "Admin not found" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at port: ${PORT}`);
});
