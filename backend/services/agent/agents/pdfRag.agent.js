import fs, { stat } from "fs";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PDFParse } from "pdf-parse";
import { vectorStore } from "../config/vectorDb.js";
import { getModel } from "../../chat/config/llmModel.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { deductCredits } from "../utils/deductCredits.js";
import { checkAgentLimit } from "../config/agentLimit.js";
export const pdfRag = async (state) => {
  try {
    const buffer = fs.readFileSync(state.file.path);
      await checkAgentLimit(state.userId,"ppt")
    const pdf = new PDFParse({
      data: buffer,
    });
    const result = pdf.getText();
    const text = result.text;
    const spilliter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const docs = await spilliter.createDocuments([text]);
    const collectionName = `pdf-${Date.now()}`;
    const store = await vectorStore(docs, collectionName);

    const relevantDocs = await store.similaritySearch(state.prompt, 5);

    const context = relevantDocs.map((d) => d.pageContent).join("/n/n");
    const llm = await getModel9("pdf-rag");

    const messages = [
      new SystemMessage(`
                You are NovaMind PDF Assistant.
                Rules:
                -Answer Only the uploaded PDF.
                -Never make up infromation.
                -If the answer is not present in the PDF,reply:
                "I couldnot find this information in the uploaded PDF."
                -Use Markdown formatting.
                `),
      new HumanMessage(
        `
                Context:${context}
                Question:${state.prompt}

                    `,
      ),
    ];

    const response = llm.invoke(messages);
    deductCredits(state.userId,"pdf")
    return {
        ...state,
        aiResponse:response.content
    }
  } catch (error) {
    return {
        ...state,
        aiResponse:"Failed to analyze pdf"
    }
  }
  finally{
    fs.unlinkSync(state.file.path)
  }
};
