import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

const main = async () => {
  // 检查是否已存在管理员账号
  const admin = await prisma.user.findUnique({
    where: { username: "admin" },
  });
    
  if (!admin) {
    await prisma.user.create({
      data: {
        username: "admin",
        password: "admin123", // 生产环境请加密密码
        nickname: "管理员",
        avatar: null,
      },
    });
    console.log("管理员账号已创建: admin/admin123");
  } else {
    console.log("管理员账号已存在");
  }
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
