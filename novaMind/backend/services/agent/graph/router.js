import { getModel } from "../config/llmModel.js";

export const router = async (state) => {
  if (state.agent && state.agent !== "auto") {
    return {
      ...state,
      agent: state.agent,
    };
  }

  if (state.file) {
    if (state.file.mimetype === "application/pdf") {
      return {
        ...state,
        agent: "pdfRag",
      };
    }

    if (state.file.mimetype.startsWith("image/")) {
      return {
        ...state,
        agent: "imageAnalyzer",
      };
    }
  }

  const llm = await getModel("router");

  const prompt = `You are an intelligent AI Router Agent.

Your responsibility is to analyze the user's request and route it to the SINGLE most appropriate agent.

Available Agents:

- chat
- search
- coding
- pdf
- ppt
- image

Routing Rules:

1. chat
Use this agent for:
- General conversation
- Greetings
- Learning
- Explanations
- Brainstorming
- Writing
- Translation
- Grammar correction
- Career advice
- Interview preparation
- Motivation
- Non-real-time questions
- Any request that does not fit another agent

2. search
Use this agent for:
- Current events
- Latest news
- Live sports scores
- Weather
- Stock prices
- Cryptocurrency prices
- Recent technology updates
- Government notifications
- Real-time information
- Information that requires internet access

3. coding
Use this agent for:
- Programming
- Debugging
- Code generation
- Code explanation
- Bug fixing
- Algorithms
- Data Structures
- System Design
- API development
- Backend development
- Frontend development
- Database queries
- SQL
- JavaScript
- React
- Node.js
- Python
- Java
- C++
- Docker
- Redis
- LangChain
- LangGraph
- Firebase
- Microservices
- DevOps

4. pdf
Use this agent for:
- Create PDF
- Read PDF
- Summarize PDF
- Extract text from PDF
- Convert text into PDF
- Generate reports
- Resume PDF
- Invoice PDF
- Notes PDF

5. ppt
Use this agent for:
- Create PowerPoint presentations
- Generate slides
- Business presentations
- College presentations
- Pitch decks
- Educational slides
- Project presentations

6. image
Use this agent for:
- Generate images
- Edit images
- Remove background
- Create logos
- Posters
- Banners
- Thumbnails
- Diagrams
- Illustrations
- Image enhancement

Instructions:

- Read the user's request carefully.
- Understand the primary intent.
- Select ONLY ONE agent.
- If multiple agents seem relevant, choose the one that best matches the main objective.
- If the request is ambiguous, choose the closest matching agent.
- Never answer the user's question.
- Never explain your reasoning.
- Never return JSON.
- Never return markdown.
- Never return punctuation.
- Return ONLY ONE WORD.

Valid Outputs:

chat
search
coding
pdf
ppt
image

User Query:
${state.prompt}`;

  const response = await llm.invoke(prompt);

  return {
    ...state,
    agent: response.content.trim().toLowerCase(),
  };
};