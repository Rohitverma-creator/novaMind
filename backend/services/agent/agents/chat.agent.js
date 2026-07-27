import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { getModel } from "../config/llmModel.js";
import { getMemory } from "../config/memory.js";
import { deductCredits } from "../utils/deductCredits.js";
import { checkAgentLimit } from "../config/agentLimit.js";

export const chatAgent = async (state) => {
  checkAgentLimit(state.userId,"chat")

  const llm = getModel("chat");
  const history = await getMemory(state.conversationId);

  const searchContext =
    state.searchResults?.results?.length > 0
      ? state.searchResults.results
          .map(
            (result, index) => `
Result ${index + 1}

Title: ${result.title}
URL: ${result.url}

Content:
${result.content}

`,
          )
          .join("\n----------------------\n")
      : "";

  const systemPrompt = `
You are NovaMind, an intelligent AI assistant.

${
  searchContext
    ? `
Web Search Results:

${searchContext}

Instructions:
- Answer the user's question ONLY using the search results above.
- If the answer is not available in the search results, reply:
  "I couldn't find that information in the search results."
- Do NOT make up facts.
- Do NOT mention Tavily or any internal search tools.
`
    : `
No web search results are available.
Answer using your own knowledge.
`
}

General Guidelines:
- Give accurate, helpful and concise answers.
- Use Markdown formatting.
- Use headings (##) for major sections.
- Use bullet points where appropriate.
- Explain code briefly before writing it.
- Keep paragraphs short.
- Never output HTML.
`;

  const messages = [new SystemMessage(systemPrompt)];

  // Conversation history
  for (const msg of history) {
    messages.push(
      msg.role === "user"
        ? new HumanMessage(msg.content)
        : new AIMessage(msg.content),
    );
  }

  
  messages.push(new HumanMessage(state.prompt));

  const response = await llm.invoke(messages);
    await deductCredits(state.userId,"chat")

  return {
    ...state,
    aiResponse: response.content,
    images: state.images || [],
  };
};
