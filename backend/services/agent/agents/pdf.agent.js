import { getModel } from "../../chat/config/llmModel.js";
import { generatePDF } from "../utils/generatePdf.js";
import { uploadToS3 } from "../utils/uploadToS3.js";
import { getFromS3 } from "../utils/getFromS3.js";
import { deductCredits } from "../utils/deductCredits.js";
import { checkAgentLimit } from "../config/agentLimit.js";

export const pdfAgent = async (state) => {
  try {
      await checkAgentLimit(state.userId,"pdf")
    const llm = await getModel("pdf");
    const prompt = `
You are a professional document writer and technical author.

Your job is to generate well-structured, polished document content based on the user's request, formatted as structured JSON that can be rendered into a PDF.

Return ONLY valid JSON. No markdown. No code fences. No explanations.

Schema:
{
  "title": "string",
  "subtitle": "string",
  "author": "string",
  "sections": [
    {
      "heading": "string",
      "level": "number (1 for main heading, 2 for subheading, 3 for minor heading)",
      "content": [
        {
          "type": "paragraph | bullet_list | numbered_list | table | quote",
          "text": "string (for paragraph/quote)",
          "items": ["string"] ,
          "tableData": {
            "headers": ["string"],
            "rows": [["string"]]
          }
        }
      ]
    }
  ],
  "footer": "string"
}

Rules:
- Return ONLY raw JSON.
- Do NOT use markdown formatting anywhere in the output.
- Do NOT use \`\`\`json or any code fences.
- First character must be {
- Last character must be }
- Write in clear, professional, well-organized prose appropriate for a formal document.
- Break content into logical sections with meaningful headings.
- Use bullet_list or numbered_list content blocks for lists instead of embedding "-" or "1." inside paragraph text.
- Use table content blocks for any tabular/comparison data instead of describing it in prose.
- Keep paragraphs concise — 3 to 6 sentences each.
- Match the depth and length of the document to the complexity of the request: a simple request (e.g. "write a one-page summary") should produce 1-2 sections; a detailed request (e.g. "write a full report") should produce comprehensive multi-section content.
- Do not invent facts, statistics, or sources. If specific data is requested but not provided by the user, note the assumption in a clearly labeled way instead of fabricating numbers.
- Ensure section headings are specific and descriptive, not generic ("Section 1", "Details").
- If the user's request implies a specific document type (resume, report, proposal, letter, research summary, etc.), structure the sections to match the conventions of that document type.

Topic:
${state.prompt}
`;
    const res = await llm.invoke(prompt);
    const data = JSON.parse(res.content);
    await deductCredits(state.userId, "pdf");
    const pdfBuffer = await generatePDF(data);
    const fileName = `pdf-${Date.now()}.pdf`;
    await uploadToS3(fileName, pdfBuffer, "application/pdf");

    const downloadUrl = await getFromS3(fileName, 24 * 60);

    return {
      ...state,
      aiResponse: `# 📄 PDF Generated Successfully

**${data.title}**

🔗 [Download PDF](${downloadUrl})

> Link expires in 10 minutes.
`,
    };
  } catch (error) {
    console.log(error);
    return {
      ...state,
      aiResponse: "Failed to generate PDF",
    };
  }
};
