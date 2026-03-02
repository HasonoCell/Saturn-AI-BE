# 使用官方 Node.js 镜像作为基础镜像
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码和 Prisma 配置
COPY . .

# 生成 Prisma Client
RUN pnpm prisma generate

# 构建 TypeScript 项目
RUN pnpm build

# 运行 Prisma 迁移
RUN pnpm prisma migrate deploy

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["pnpm", "start"]
