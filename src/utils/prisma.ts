import { PrismaClient } from "../generated/prisma";

// PrismaClient 单例，防止多次实例化
const prisma = new PrismaClient();

export default prisma;
