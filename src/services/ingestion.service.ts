import { geminiEngine } from "@/engine/ai_engine";
import { saveExtraction } from "@/services/task.service";
import { OperationFailedError } from "@/response_handler/exceptions";
import { PDFParse } from 'pdf-parse';
import { createWorker } from "tesseract.js";
import * as pdfImgConvert from "pdf-img-convert";

const processTextContent = async (text: string) => {
    if (!text) throw new Error("Text input is empty!");

    const cleanText = text
        // Remove HTML tags
        .replace(/<[^>]*>/g, " ")

        // Decode basic HTML entities
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")

        // Normalize whitespace
        .replace(/\s+/g, " ")
        .trim();

    if (!cleanText) throw new Error("Processed text is empty!");

    return cleanText;
}

const performOCR = async (buffer: Buffer) => {
    // Convert PDF pages to image buffers
    const images = await pdfImgConvert.convert(buffer);

    // Initialize Tesseract worker
    const worker = await createWorker('eng');
    let fullText = "";

    for (let i = 0; i < images.length; i++) {
        const image = images[i];
        if (image) {
            const { data: { text } } = await worker.recognize(image);
            fullText += text + "\n";
        }
    }

    await worker.terminate();
    return fullText.trim();
}

const processPdfContent = async (buffer: Buffer) => {
        const parser = new PDFParse({ data: buffer });
        try {
            const result = await parser.getText();
            if (!result.text || result.text.trim().length < 50) {
                return await performOCR(buffer);
            }
            return result.text.trim();
        } catch (error) {
            return await performOCR(buffer);
        }
        finally {
            await parser.destroy();
        }
}

const processIngestion = async (format: 'text' | 'pdf', content: Buffer | string, fileName?: string) => {
    let extractedText: string;

    try {
        if (format === 'pdf') {
            if (!(content instanceof Buffer)) {
                throw new Error("PDF content must be a Buffer");
            }
            extractedText = await processPdfContent(content);
        } else {
            extractedText = await processTextContent(content.toString());
        }

        const extractedTask = await geminiEngine.extractDeadline(extractedText);

        const savedResult = await saveExtraction(
            {
                type: format.toUpperCase(),
                rawContent: extractedText,
                ...(fileName && { name: fileName })
            },
            extractedTask
        );

        return savedResult;
    } catch (error: any) {
        throw new OperationFailedError(null, error.message || "Failed to process ingestion");
    }
}

export { processIngestion };
