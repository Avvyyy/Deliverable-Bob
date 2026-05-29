import { geminiEngine } from "@/engine/ai_engine";
import { saveExtraction } from "@/services/task.service";
import { OperationFailedError } from "@/response_handler/exceptions";
import { normalizeDate } from "@/utils/date.util";
import { processPdfContent, processTextContent } from "@/services/extraction-service";
import type { ExtractedTask } from "@/schema/task.schema";
import { performance } from "node:perf_hooks";

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
    const totalStartedAt = performance.now();
    let extractedText: string;
    let extraction;

    const logStage = (stage: string, startedAt: number, extra: Record<string, unknown> = {}) => {
        console.info("[INGESTION] stage completed", {
            stage,
            format,
            fileName,
            durationMs: Math.round(performance.now() - startedAt),
            ...extra,
        });
    };

    try {
        if (format === 'pdf') {
            if (!(content instanceof Buffer)) {
                throw new Error("PDF content must be a Buffer");
            }
            const pdfStartedAt = performance.now();
            extractedText = await processPdfContent(content);
            logStage("pdf-text", pdfStartedAt, {
                bytes: content.length,
                characters: extractedText.length,
            });

            const aiStartedAt = performance.now();
            extraction = await geminiEngine.extractDeadlines(extractedText);
            logStage("ai-deadline-extraction", aiStartedAt, {
                deadlineCount: extraction.deadlines.length,
            });
        } else if (format === 'image') {
            if (!(content instanceof Buffer)) {
                throw new Error("Image content must be a Buffer");
            }
            if (!mimeType) {
                throw new Error("Image MIME type is required");
            }
            extractedText = `Image upload: ${fileName || "Unnamed image"} (${mimeType})`;
            const aiStartedAt = performance.now();
            extraction = await geminiEngine.extractDeadlinesFromImage(content, mimeType);
            logStage("ai-image-extraction", aiStartedAt, {
                bytes: content.length,
                deadlineCount: extraction.deadlines.length,
            });
        } else {
            const textStartedAt = performance.now();
            extractedText = await processTextContent(content.toString());
            logStage("text-cleanup", textStartedAt, {
                characters: extractedText.length,
            });

            const aiStartedAt = performance.now();
            extraction = await geminiEngine.extractDeadlines(extractedText);
            logStage("ai-deadline-extraction", aiStartedAt, {
                deadlineCount: extraction.deadlines.length,
            });
        }

        if (!extraction.hasDeadline || extraction.deadlines.length === 0) {
            logStage("total", totalStartedAt, { outcome: "no-deadline" });
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
            logStage("total", totalStartedAt, { outcome: "no-valid-future-deadlines" });
            return {
                extracted: false,
                message: "No valid future deadlines found",
                reason: "Bob found deadline-like text, but none of it could be converted into a valid upcoming date.",
            };
        }

        const saveStartedAt = performance.now();
        const savedResult = await saveExtraction(
            {
                type: format.toUpperCase(),
                rawContent: extractedText,
                userId,
                ...(fileName && { name: fileName })
            },
            validTasks
        );
        logStage("database-save", saveStartedAt, {
            validTaskCount: validTasks.length,
            skippedCount,
        });

        logStage("total", totalStartedAt, { outcome: "extracted" });
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
