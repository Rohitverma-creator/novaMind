import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getModel } from "../../chat/config/llmModel.js";
import fs from "fs/promises";
import { deductCredits } from "../utils/deductCredits.js";
import { checkAgentLimit } from "../config/agentLimit.js";

export const imageAnalyzer = async (state) => {
  try {
    const llm = await getModel("imageAnalyzer");
     await checkAgentLimit(state.userId,"image")

    const imageBuffer = await fs.readFile(state.file.path);
    const base64Image = imageBuffer.toString("base64");

    const messages = [
      new SystemMessage(
        `You are NovaMind image analyzer agent.
                Rules:
                -Analyze only the uploaded image
                -Answer the user question accurately.
                -If text exists in the image extract it.
                -If charts or table exists, explain them.
                -If something is unclear, say so.
                -Use markdown when helpful.
                -Do not hallucinate
                `,
      ),
      new HumanMessage({
        content: [
          {
            type: "text",
            text: state.prompt || "analyze the image",
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${state.file.mimetype};base64,${base64Image}`,
            },
          },
        ],
      }),
    ];

    const response = await llm.invoke(messages);
    await deductCredits(state.userId, "vision");

    return {
      ...state,
      aiResponse: response.content,
    };
  } catch (error) {
    console.log(error);
    return {
      ...state,
      aiResponse: "failed to analyze file",
    };
  } finally {
    try {
      await fs.unlink(state.file.path);
    } catch (err) {
      console.log("Failed to delete temp file:", err);
    }
  }
};