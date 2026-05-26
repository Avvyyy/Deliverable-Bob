import { geminiEngine } from "@/engine/ai_engine";
import { saveExtraction } from "@/services/task.service";
import { OperationFailedError } from "@/response_handler/exceptions";
import { normalizeDate } from "@/utils/date.util";
import { PDFParse } from 'pdf-parse';
import type { ExtractedTask } from "@/schema/task.schema";

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

const processPdfContent = async (buffer: Buffer) => {
        const parser = new PDFParse({ data: buffer });
        try {
            const result = await parser.getText();
            if (!result.text || result.text.trim().length < 50) {
                throw new Error("No readable text found in PDF. Scanned PDFs are not supported in this Docker build.");
            }
            return result.text.trim();
        } catch (error) {
            throw new Error("Failed to extract readable text from PDF.");
        }
        finally {
            await parser.destroy();
        }
}

type IngestionFormat = 'text' | 'pdf' | 'image';

type IngestionResult =
    | { extracted: true; source: Awaited<ReturnType<typeof saveExtraction>>; extractedCount: number; skippedCount: number }
    | { extracted: false; message: string; reason: string };

const startOfToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};

const processIngestion = async (
    format: IngestionFormat,
    content: Buffer | string,
    userId: string,
    fileName?: string,
    mimeType?: string
) : Promise<IngestionResult> => {
    let extractedText: string;
    let extraction;

    try {
        if (format === 'pdf') {
            if (!(content instanceof Buffer)) {
                throw new Error("PDF content must be a Buffer");
            }
            extractedText = await processPdfContent(content);
            extraction = await geminiEngine.extractDeadlines(extractedText);
        } else if (format === 'image') {
            if (!(content instanceof Buffer)) {
                throw new Error("Image content must be a Buffer");
            }
            if (!mimeType) {
                throw new Error("Image MIME type is required");
            }
            extractedText = `Image upload: ${fileName || "Unnamed image"} (${mimeType})`;
            extraction = await geminiEngine.extractDeadlinesFromImage(content, mimeType);
        } else {
            extractedText = await processTextContent(content.toString());
            extraction = await geminiEngine.extractDeadlines(extractedText);
        }

        if (!extraction.hasDeadline || extraction.deadlines.length === 0) {
            return {
                extracted: false,
                message: "No deadline found",
                reason: extraction.description || "The submitted content did not contain a clear deadline.",
            };
        }

        const validTasks: ExtractedTask[] = [];
        let skippedCount = 0;

        for (const extractedTask of extraction.deadlines) {
            if (!extractedTask.hasDeadline) {
                skippedCount += 1;
                continue;
            }

            const deadline = normalizeDate(extractedTask.dueDate) || new Date(extractedTask.dueDate);
            if (isNaN(deadline.getTime()) || deadline < startOfToday()) {
                skippedCount += 1;
                continue;
            }

            validTasks.push(extractedTask);
        }

        if (validTasks.length === 0) {
            return {
                extracted: false,
                message: "No valid future deadlines found",
                reason: "Bob found deadline-like text, but none of it could be converted into a valid upcoming date.",
            };
        }

        const savedResult = await saveExtraction(
            {
                type: format.toUpperCase(),
                rawContent: extractedText,
                userId,
                ...(fileName && { name: fileName })
            },
            validTasks
        );

        return {
            extracted: true,
            source: savedResult,
            extractedCount: validTasks.length,
            skippedCount,
        };
    } catch (error: any) {
        throw new OperationFailedError(null, error.message || "Failed to process ingestion");
    }
}

export { processIngestion };
