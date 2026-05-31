export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const PDFParser = (await import("pdf2json")).default;

  return new Promise((resolve, reject) => {
    // تم تغيير الرقم 1 إلى true ليتوافق مع النوع المتوقع (boolean)
    const parser = new PDFParser(null, true);

    parser.on("pdfParser_dataReady", () => {
      try {
        const text = (parser as unknown as { getRawTextContent: () => string }).getRawTextContent();
        resolve(text);
      } catch {
        reject(new Error("Failed to extract text"));
      }
    });

    parser.on("pdfParser_dataError", (err: unknown) => {
      reject(err);
    });

    parser.parseBuffer(buffer);
  });
}