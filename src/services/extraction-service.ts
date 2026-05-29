import { PDFParse } from "pdf-parse";
import { performance } from "node:perf_hooks";

const processTextContent = async (text: string) => {
    if (!text) throw new Error("Text input is empty!");

    const cleanText = text
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, " ")
        .trim();

    if (!cleanText) throw new Error("Processed text is empty!");

    return cleanText;
};

const processPdfContent = async (buffer: Buffer) => {
    const startedAt = performance.now();
    const parser = new PDFParse({ data: buffer });

    try {
        const result = await parser.getText();
        const text = result.text?.trim();
        const durationMs = Math.round(performance.now() - startedAt);

        console.info("[PDF] text extraction completed", {
            durationMs,
            bytes: buffer.length,
            characters: text?.length || 0,
        });

        if (!text || text.length < 20) {
            throw new Error("No readable text found in PDF. Scanned PDFs are not supported.");
        }

        return text;
    } finally {
        const destroyStartedAt = performance.now();
        await parser.destroy();
        console.info("[PDF] parser cleanup completed", {
            durationMs: Math.round(performance.now() - destroyStartedAt),
        });
    }
};

export { processTextContent, processPdfContent };
