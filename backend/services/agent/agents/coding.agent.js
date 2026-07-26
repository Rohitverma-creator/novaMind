import { checkAgentLimit } from "../config/agentLimit.js";
import { getModel } from "../../chat/config/llmModel.js";
import { deductCredits } from "../utils/deductCredits.js";

const KNOWN_INTENTS = [
  "code_generation",
  "code_debugging",
  "code_review",
  "code_explanation",
  "code_refactoring",
  "algorithm",
];

function extractJson(raw) {
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  const candidate =
    start !== -1 && end !== -1 ? cleaned.slice(start, end + 1) : cleaned;

  return JSON.parse(candidate);
}

function normalizeIntent(raw) {
  const cleaned = raw.trim().toLowerCase().replace(/["'.]/g, "");
  // handle cases where model says "intent: code_generation" or wraps in extra words
  const match = KNOWN_INTENTS.find((i) => cleaned.includes(i));
  return match || null;
}

export const codingAgent = async (state) => {
  await checkAgentLimit(state.userId, "coding");
  const intentLLM = await getModel("intent");
  const llm = await getModel("coding");

  const intentPrompt = `
You are an intent classifier for a coding assistant. Classify the user's message into EXACTLY ONE of these intents:

- code_generation: User wants new code written from scratch (functions, scripts, components, apps, features, "sum two numbers", "build a todo app", etc.) — this includes SIMPLE and TRIVIAL requests, not just complex ones.
- code_debugging: User has broken/erroring code and wants it fixed.
- code_review: User wants existing code reviewed/critiqued for quality or issues.
- code_explanation: User wants existing code explained, with no code to be written.
- code_refactoring: User wants existing code restructured/improved without changing behavior.
- algorithm: User is asking to solve a DSA/algorithmic problem (sorting, searching, graph, DP, etc.) that requires approach + complexity analysis.

Rules:
- Default to "code_generation" for any request to write/create code, no matter how simple (e.g. "sum of two numbers", "reverse a string", "add function") — simplicity does NOT mean it should be classified as algorithm or explanation.
- Only use "algorithm" when the request is a genuine algorithmic/DSA problem requiring complexity analysis (e.g. "find shortest path", "sort this array efficiently", "detect a cycle").
- Return ONLY the intent label, lowercase, no punctuation, no explanation, no extra text.

User Message:
${state.prompt}
`;

  const intentResponse = await intentLLM.invoke(intentPrompt);
  const resolvedIntent =
    normalizeIntent(intentResponse.content) || "code_generation";

  if (resolvedIntent === "code_generation") {
    const prompt = `
You are a senior software engineer.

Generate clean, production-ready code for the user's request.

Match the depth of your response to the complexity of the request:
- For trivial/simple requests (e.g. sum two numbers, reverse a string, basic utility functions): keep "explanation" short (1-2 entries max), skip unnecessary sections like exhaustive edge-case walkthroughs. Do not over-engineer beyond what was asked.
- For complex requests (multi-file features, apps, non-trivial logic): go deeper with assumptions, dependencies, and detailed explanation.

Return ONLY valid JSON.

Schema:
{
  "summary": "string",
  "language": "string",
  "assumptions": ["string"],
  "dependencies": ["string"],
  "files": [
    {
      "filename": "string",
      "description": "string",
      "code": "string"
    }
  ],
  "explanation": [
    {
      "title": "string",
      "content": "string"
    }
  ],
  "runInstructions": ["string"]
}

Rules:
- Return ONLY raw JSON.
- Do NOT use markdown.
- Do NOT use \`\`\`json.
- First character must be {
- Last character must be }
- For trivial requests, "assumptions" and "dependencies" can be empty arrays, and "runInstructions" can be a single simple entry (or empty if not applicable).

User Request:
${state.prompt}
`;

    const response = await llm.invoke(prompt);
    await deductCredits(state.userId, "coding");

    let result;
    try {
      result = extractJson(response.content);
      await deductCredits(state.userId, "coding");
    } catch (err) {
      return {
        ...state,
        aiResponse:
          "I generated a response but it wasn't valid JSON, so I couldn't produce structured artifacts. Please try again.",
        artifacts: [],
        error: `JSON parse failed: ${err.message}`,
      };
    }

    if (!Array.isArray(result.files)) result.files = [];

    return {
      ...state,
      aiResponse: result.summary || "Code generated successfully",
      artifacts: [
        {
          id: Date.now(),
          type: "Project",
          files: result.files,
          title: result.summary || state.prompt,
          language: result.language,
          assumptions: result.assumptions || [],
          dependencies: result.dependencies || [],
          explanation: result.explanation || [],
          runInstructions: result.runInstructions || [],
        },
      ],
    };
  }

  const res = await llm.invoke(`
You are a Staff Software Engineer with expertise in software architecture, clean code, and performance optimization.

The user's coding intent is:
${resolvedIntent}

The user's request is:
${state.prompt}

Instructions:
- Return ONLY valid Markdown.
- Match the depth and length of your response to the complexity of the request. Trivial requests get short, direct answers. Complex requests get deeper analysis.
- Do NOT pad simple answers with generic sections like "Best Practices Followed" or exhaustive "Example Usage" walkthroughs unless the user asks or the code genuinely warrants it (e.g. security-sensitive, public API).
- Understand the user's requirements before responding.
- Generate clean, readable, maintainable, and production-ready code.
- Follow industry best practices and modern coding standards.
- Optimize for readability, performance, scalability, and security.
- Use meaningful variable and function names.
- Handle edge cases and errors gracefully — but only elaborate on this when it's non-obvious.
- Avoid unnecessary complexity and duplicate code.
- Follow SOLID, DRY, and KISS principles where appropriate.
- Add comments only where they improve understanding.
- If multiple files are needed, separate them using Markdown headings.
- Mention required dependencies and installation commands only if applicable.
- Explain important implementation decisions briefly — skip this for trivial code.

Intent-specific behavior:
- code_debugging: Find the root cause, explain it, and provide the corrected code.
- code_review: Review the code, identify issues, suggest improvements, and provide an optimized version if needed.
- code_explanation: Explain the code step by step with examples.
- code_refactoring: Improve structure, readability, maintainability, and performance without changing functionality.
- algorithm: Explain the approach, provide time & space complexity, then implement the solution.

Return ONLY Markdown.
`);

  return {
    ...state,
    aiResponse: res.content,
    artifacts: [],
  };
};
