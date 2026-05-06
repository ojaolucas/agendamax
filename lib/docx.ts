import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

export function processDocxTemplate(base64Template: string, data: any) {
  try {
    // Decode Base64 to binary
    const binaryString = atob(base64Template);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const zip = new PizZip(bytes.buffer);
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

    const out = doc.getZip().generate({
      type: "blob",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    return out;
  } catch (error) {
    console.error("Error processing DOCX:", error);
    throw error;
  }
}

// Helper to convert Blob to Base64 for API transmission if needed
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(",")[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
