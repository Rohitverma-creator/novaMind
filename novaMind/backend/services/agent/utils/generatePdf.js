import PDFDocument from "pdfkit";

export const generatePDF = async (data) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      info: {
        Title: data.title || "Document",
        Author: data.author || "NovaMind",
        Creator: "NovaMind",
      },
    });

    const chunks = [];

    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // -----------------------
    // Title
    // -----------------------

    doc
      .font("Helvetica-Bold")
      .fontSize(28)
      .fillColor("#111827")
      .text(data.title || "Untitled", {
        align: "center",
      });

    if (data.subtitle) {
      doc.moveDown(0.5);

      doc
        .font("Helvetica")
        .fontSize(14)
        .fillColor("#6B7280")
        .text(data.subtitle, {
          align: "center",
        });
    }

    doc.moveDown(2);

    // -----------------------
    // Sections
    // -----------------------

    for (const section of data.sections || []) {
      doc
        .font("Helvetica-Bold")
        .fontSize(18)
        .fillColor("#111827")
        .text(section.heading);

      doc.moveDown(0.5);

      for (const block of section.content || []) {
        switch (block.type) {
          case "paragraph":
            doc
              .font("Helvetica")
              .fontSize(12)
              .fillColor("#374151")
              .text(block.text, {
                lineGap: 4,
              });

            doc.moveDown();
            break;

          case "bullet_list":
            block.items?.forEach((item) => {
              doc
                .font("Helvetica")
                .fontSize(12)
                .fillColor("#374151")
                .text("• " + item, {
                  indent: 20,
                });
            });

            doc.moveDown();

            break;

          case "numbered_list":
            block.items?.forEach((item, index) => {
              doc
                .font("Helvetica")
                .fontSize(12)
                .text(`${index + 1}. ${item}`, {
                  indent: 20,
                });
            });

            doc.moveDown();

            break;

          case "quote":
            doc
              .font("Helvetica-Oblique")
              .fontSize(12)
              .fillColor("#555555")
              .text(block.text, {
                indent: 20,
              });

            doc.moveDown();

            break;

          case "table":
            if (block.tableData?.headers) {
              doc
                .font("Helvetica-Bold")
                .fontSize(12)
                .text(block.tableData.headers.join(" | "));

              doc.moveDown(0.3);

              block.tableData.rows?.forEach((row) => {
                doc
                  .font("Helvetica")
                  .fontSize(11)
                  .text(row.join(" | "));
              });

              doc.moveDown();
            }

            break;
        }
      }

      doc.moveDown();
    }

    // Footer

    if (data.footer) {
      doc.moveDown();

      doc
        .fontSize(10)
        .fillColor("gray")
        .text(data.footer, {
          align: "center",
        });
    }

    doc.end();
  });
};