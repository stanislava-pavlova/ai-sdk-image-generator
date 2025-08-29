import { extractRawText } from "mammoth";

export const readDocxContent = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        if (!arrayBuffer) {
          reject(new Error("Failed to read file as ArrayBuffer"));
          return;
        }

        const result = await extractRawText({ arrayBuffer });
        resolve(result.value || "");
      } catch (error) {
        reject(new Error("Failed to extract text from DOCX file"));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read DOCX file"));
    };

    reader.readAsArrayBuffer(file);
  });
};
