# Saturn-AI-BE 项目开发路线图

本文档用于跟踪和规划 `Saturn-AI-BE` 项目的后续重构与开发工作。

## 阶段一：后端框架替换 (Express -> Hono)

**目标：** 将后端 Web 框架从 Express 迁移到 Hono，以获得更好的性能、开发体验和未来边缘计算的部署能力。

- [ ] **1. 安装依赖**
  - [ ] 移除 `express` 和 `cors`。
  - [ ] 添加 `hono` 和 `@hono/node-server`。

- [ ] **2. 更新入口文件 `src/app.ts`**
  - [ ] 使用 `Hono` 替换 `express` 实例。
  - [ ] 使用 `@hono/node-server` 的 `serve` 函数来启动服务器。
  - [ ] 引入 Hono 的 `cors` 中间件。

- [ ] **3. 重构路由 `src/routes/*.ts`**
  - [ ] 将每个 `express.Router()` 实例改为 `new Hono()` 实例。
  - [ ] 更新路由定义以适应 Hono 的链式 API。
  - [ ] 在 `app.ts` 中使用 `app.route()` 来集成各个路由模块。

- [ ] **4. 重构控制器 `src/controllers/*.ts`**
  - [ ] 将所有控制器函数的签名从 `(req: Request, res: Response)` 修改为 `(c: Context)`。
  - [ ] 使用 `c.req.json()` 或 `c.req.param()` 替代 `req.body` 和 `req.params`。
  - [ ] 使用 `c.json()` 替代 `res.json()` 或 `res.send()`。
  - [ ] 使用 `c.get('payload')` 来获取认证中间件传递的用户信息。

- [ ] **5. 重构中间件 `src/middlewares/auth.ts`**
  - [ ] 将中间件函数的签名修改为 `(c: Context, next: Next)`。
  - [ ] 使用 `c.set('payload', ...)` 将验证后的数据传递给后续处理程序。
  - [ ] 调用 `await next()` 继续执行。

- [ ] **6. 测试与验证**
  - [ ] 启动重构后的 Hono 应用。
  - [ ] 使用 Postman 或其他工具测试所有 API 端点，确保功能与之前完全一致。

## 阶段二：集成 AI Agent (Mastra)

**目标：** 在 Hono 框架的基础上，集成 Mastra 框架，开发一个具备学习和工具使用能力的 AI Agent。

- [ ] **1. 安装与配置 Mastra**
  - [ ] 安装 `mastra` 及其相关依赖。
  - [ ] 在 `.env` 文件中配置 `MASTRA_API_KEY` 和 `OPENAI_API_KEY` 等。

- [ ] **2. 创建 Agent 模块**
  - [ ] 在 `src` 目录下创建 `agents` 文件夹，用于存放所有 Agent 相关代码。

- [ ] **3. 定义第一个工具 (Tool)**
  - [ ] 在 `src/agents/tools/` 目录下创建一个新文件。
  - [ ] 包装一个现有的 `service` (例如 `userService.getUserById`) 成为一个 Mastra `tool`。

- [ ] **4. 创建基础 Agent**
  - [ ] 在 `src/agents/` 目录下创建主 Agent 文件。
  - [ ] 实例化一个 `Agent`，为其提供一个 LLM 模型和一个基础 `prompt`。
  - [ ] 将上一步创建的 `tool` 添加到 Agent 的工具列表中。

- [ ] **5. 创建 Agent API 端点**
  - [ ] 创建一个新的路由 `agent.ts` 和控制器 `agentController.ts`。
  - [ ] 添加一个 `/agent/chat` 端点，用于接收用户输入并调用 Agent。
  - [ ] 在控制器中调用 `agent.run()` 并将结果返回给前端。

- [ ] **6. 实现长期记忆 (RAG)**
  - [ ] 学习 Mastra 的 RAG 功能。
  - [ ] 选择一个向量数据库 (如 ChromaDB, Pinecone)。
  - [ ] 创建一个知识加载器，将外部文档或数据（如项目文档）加载到向量存储中。
  - [ ] 为 Agent 添加 `retriever`，使其能够在回答问题前检索相关知识。

- [ ] **7. 探索高级功能**
  - [ ] 研究并尝试 Mastra 的 `Workflows`，用于编排更复杂的任务。
  - [ ] 研究并尝试 Mastra 的 `Memory` 组件，实现更精细的对话记忆管理。
  - [ ] 研究并尝试 Mastra 的评估 (`Scorers`) 和可观测性 (`Observability`) 功能。
