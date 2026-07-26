import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export const getModel = (agent) => {
 console.log("GROQ:", process.env.GROQ_API_KEY);
console.log("GOOGLE:", process.env.GOOGLE_API_KEY);
  const groq = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "openai/gpt-oss-120b",
    temperature: 0.2,
    maxRetries: 3,
  });

  const gemini = new ChatGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY,
    model: "gemini-2.5-pro",
    temperature: 0.2,
    maxRetries: 3,
  });

  switch (agent) {
    case "chat":
    case "search":
      return groq;

    case "coding":
      return gemini;

    default:
      return groq;
  }
};