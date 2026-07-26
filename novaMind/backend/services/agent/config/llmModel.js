import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenRouter } from "@langchain/openrouter";

export const getModel = (agent) => {
  const groq = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "openai/gpt-oss-120b",
    temperature: 0.2,
    maxRetries: 3,
  });

  const gemini = new ChatGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY,
    model: "gemini-1.5-flash",
    temperature: 0.2,
    maxRetries: 3,
  });

const groqVision = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "qwen/qwen3.6-27b",   
  temperature: 0.2,
  maxRetries: 3,
});

  const openrouter = new ChatOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
    model: "deepseek/deepseek-chat",
    temperature: 0,
    maxTokens: 2500,
  });

  switch (agent) {
    case "chat":
    case "search":
      return groq;

    case "coding":
      return openrouter;
    case "imageAnalyzer":
      return groqVision;

    default:
      return groq;
  }
};
