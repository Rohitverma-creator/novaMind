import { getModel } from "../../chat/config/llmModel.js";
import { generatePPt } from "../utils/generatePpt.js";
import { uploadToS3 } from "../utils/uploadToS3.js";
import { getFromS3 } from "../utils/getFromS3.js";
import { deductCredits } from "../utils/deductCredits.js";
import { checkAgentLimit } from "../config/agentLimit.js";

function extractJson(raw) {
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  const candidate = start !== -1 && end !== -1 ? cleaned.slice(start, end + 1) : cleaned;

  return JSON.parse(candidate);
}

export const pptAgent = async (state) => {
  try {
    const llm = await getModel("ppt");
      await checkAgentLimit(state.userId,"ppt")

    const prompt = `
You are an expert Presentation Designer and Technical Content Writer.

Your task is to create a professional PowerPoint presentation based on the user's request.

Return ONLY valid JSON.

Schema:

{
  "title": "string",
  "subtitle": "string",
  "theme": "professional",
  "slides": [
    {
      "title": "string",
      "layout": "title | content | comparison | image-left | image-right",
      "bullets": [
        "string"
      ],
      "speakerNotes": "string",
      "imagePrompt": "string"
    }
  ]
}

Presentation Requirements:

- Generate exactly 5 slides.
- Slide 1 must be the title slide.
- Slides 2-4 must be content slides.
- Slide 5 must be the conclusion or thank-you slide.

Content Slide Rules:

- Every content slide must have a meaningful title.
- Every content slide must contain exactly 4-6 concise bullet points.
- Every bullet point should be between 8-15 words.
- Keep bullet points presentation-friendly.
- Do not write paragraphs.
- Do not repeat information.
- Present information in a logical order.
- Focus on one main topic per slide.
- Use professional language.
- Add an imagePrompt for every content slide.
- Speaker notes should briefly explain the slide in 2-3 sentences.

Image Prompt Rules:

- Create a realistic, presentation-quality image prompt.
- Do not mention text inside images.
- Keep image prompts under 40 words.

General Rules:

- Return ONLY raw JSON.
- No markdown.
- No code fences.
- No explanations.
- First character must be {
- Last character must be }
- Ensure the JSON is valid and parseable.
- Keep the ENTIRE response compact — no extra whitespace or line breaks beyond what JSON requires. This is critical because the response must fit within the available output length without being cut off.

User Request:
${state.prompt}
`;

    const response = await llm.invoke(prompt);


    let data;
    try {
      data = extractJson(response.content);
    } catch (parseErr) {
      console.error("PPT JSON parse failed. Likely truncated response.", parseErr.message);
      return {
        ...state,
        aiResponse:
          "The presentation content was too long to generate in one go. Please try a shorter or more specific request.",
      };
    }
      await deductCredits(state.userId,"ppt")

    if (!Array.isArray(data.slides) || data.slides.length === 0) {
      return {
        ...state,
        aiResponse: "Failed to generate presentation: no slides were returned.",
      };
    }

    const pptxBuffer = await generatePPt(data);

    const fileName = `presentation-${Date.now()}.pptx`;

    await uploadToS3(
      fileName,
      pptxBuffer,
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    );

    const expirySeconds = 24 * 60 * 60;
    const downloadUrl = await getFromS3(fileName, expirySeconds);

    if (!downloadUrl) {
      throw new Error("getFromS3 returned no URL");
    }

    return {
      ...state,
      aiResponse: `# Presentation Generated Successfully\n\n**${data.title}**\n\n[Download Presentation](${downloadUrl})\n\nLink expires in 24 hours`,
      pptData: data,
      downloadUrl,
    };
  } catch (error) {
    console.error("pptAgent failed:", error);

    return {
      ...state,
      aiResponse: "Failed to generate presentation.",
    };
  }
};