import { getModel } from "../config/llmModel.js";
import axios from "axios";
import { uploadToS3 } from "../utils/uploadToS3.js";
import { getFromS3 } from "../utils/getFromS3.js";
import { deductCredits } from "../utils/deductCredits.js";
import { checkAgentLimit } from "../config/agentLimit.js";

export const visionAgent = async (state) => {
  try {
    const llm = await getModel("image");
    await checkAgentLimit(state.userId, "image");
    const res = await llm.invoke(`
You are an elite AI Image Prompt Engineer.

Your only job is to transform the user's request into a world-class image generation prompt.

Guidelines:

- Preserve the user's intent exactly.
- Expand the prompt with rich visual details.
- Describe:
  - Main subject
  - Environment
  - Background
  - Lighting
  - Camera angle
  - Composition
  - Color palette
  - Mood
  - Artistic style
  - Materials & textures
  - Realism level
  - Quality

- Choose the most suitable artistic style if the user doesn't specify one.
- Add cinematic and photographic details whenever appropriate.
- Make the prompt highly descriptive but concise.
- Include important visual details naturally.
- Never explain your reasoning.
- Never ask follow-up questions.
- Never generate anything except the final image prompt.
- Never return JSON.
- Never return Markdown.
- Never use bullet points.
- Never include quotes.
- Never prefix with "Prompt:".
- Never include notes or explanations.
- Never refuse unless the request is unsafe.
- Return exactly one optimized image generation prompt.

Quality Guidelines:
- Ultra detailed
- High quality
- Sharp focus
- Professional composition
- Cinematic lighting
- Realistic shadows
- Volumetric lighting when appropriate
- Highly detailed textures
- Natural colors
- 8K quality where applicable

Examples:

User:
"A cat astronaut"

Response:
A fluffy orange cat wearing a futuristic astronaut suit floating through deep space above Earth, cinematic lighting, ultra realistic fur, reflective space helmet, vibrant nebulae, dramatic composition, highly detailed, sharp focus, volumetric lighting, breathtaking sci-fi atmosphere, 8K.

User:
"Anime girl in rain"

Response:
A beautiful anime girl standing alone in a rainy Tokyo street at night, glowing neon signs reflecting on wet pavement, soft blue and purple lighting, cinematic composition, expressive eyes, flowing hair, detailed anime style, atmospheric rain, ultra detailed illustration.

Now generate the optimized image prompt.

User Request:
${state.prompt}
`);

    const prompt = res.content.trim();
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;

    const imageRes = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 30000,
    });
    await deductCredits(state.userId, "image");

    if (!imageRes.data || imageRes.data.length === 0) {
      throw new Error("Pollinations returned empty image data");
    }

    const buffer = Buffer.from(imageRes.data);
    const fileName = `image-${Date.now()}.png`;

    await uploadToS3(fileName, buffer, "image/png");

    const expirySeconds = 24 * 60;
    const downloadUrl = await getFromS3(fileName, expirySeconds);

    if (!downloadUrl) {
      throw new Error("getFromS3 returned no URL");
    }

    return {
      ...state,
      aiResponse: `# Image Generated Successfully\n\n![Generated Image](${downloadUrl})\n\n[Download Image](${downloadUrl})\n\nLink expires in 24 hours`,
      images: [downloadUrl],
    };
  } catch (error) {
    console.error(
      "visionAgent failed:",
      error?.response?.data || error.message || error,
    );
    return {
      ...state,
      aiResponse: "Failed to generate image",
      images: [],
    };
  }
};
