import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

export function processDocxTemplate(base64Template: string, data: any) {
  try {
    // Decode Base64 to Buffer (Node.js compatible)
    const content = Buffer.from(base64Template, 'base64');

    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: {
        start: "<<",
        end: ">>",
      },
    });

    // Render the document (replace placeholders)
    doc.render(data);

    // Generate Node.js buffer
    const out = doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    });

    return out;
  } catch (error) {
    console.error("Error processing DOCX:", error);
    throw error;
  }
}
