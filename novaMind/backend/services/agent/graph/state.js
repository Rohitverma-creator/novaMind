import { Annotation } from "@langchain/langgraph";

export const agentState = Annotation.Root({
  prompt: Annotation(),
  conversationId: Annotation(),
  aiResponse: Annotation(),
  agent: Annotation(),
  searchResults:Annotation(),
  images:Annotation(),
  artifacts:Annotation(),
  userId :Annotation(),
  file:Annotation()


});