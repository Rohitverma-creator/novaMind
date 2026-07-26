import pptxgen from "pptxgenjs";

export const generatePPt = async (data) => {
  if (!data || !Array.isArray(data.slides) || data.slides.length === 0) {
    throw new Error("Invalid presentation data: no slides found");
  }

  const pptx = new pptxgen();

  pptx.author = "NovaMind";
  pptx.title = data.title || "Untitled Presentation";

  const COLORS = {
    dark: "111827",
    gray: "6B7280",
    body: "374151",
    accent: "4F46E5",
    white: "FFFFFF",
  };

  data.slides.forEach((s, index) => {
    const slide = pptx.addSlide();

    if (s.layout === "title") {
      slide.background = { color: COLORS.dark };

      slide.addText(s.title || "", {
        x: 0.5,
        y: 2.2,
        w: 9,
        h: 1.2,
        fontSize: 36,
        bold: true,
        color: COLORS.white,
        align: "center",
      });

      if (index === 0 && data.subtitle) {
        slide.addText(data.subtitle, {
          x: 0.5,
          y: 3.3,
          w: 9,
          h: 0.6,
          fontSize: 16,
          color: COLORS.gray,
          align: "center",
        });
      }
    } else {
      slide.background = { color: COLORS.white };

      slide.addText(s.title || "", {
        x: 0.5,
        y: 0.4,
        w: 9,
        h: 0.8,
        fontSize: 26,
        bold: true,
        color: COLORS.dark,
      });

      const bullets = Array.isArray(s.bullets) ? s.bullets : [];

      if (bullets.length > 0) {
        slide.addText(
          bullets.map((b) => ({
            text: b,
            options: { bullet: true, breakLine: true },
          })),
          {
            x: 0.5,
            y: 1.4,
            w: 9,
            h: 4.5,
            fontSize: 16,
            color: COLORS.body,
            valign: "top",
            lineSpacingMultiple: 1.3,
          },
        );
      }
    }

    if (s.speakerNotes) {
      slide.addNotes(s.speakerNotes);
    }
  });

  const buffer = await pptx.write({ outputType: "nodebuffer" });
  return buffer;
};