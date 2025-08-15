import OpenAI from "openai";

// 统一的OpenAI实例，供所有服务使用
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
});
