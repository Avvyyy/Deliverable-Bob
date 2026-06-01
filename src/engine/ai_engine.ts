import { OperationFailedError } from "@/response_handler/exceptions";
import { GoogleGenAI, Type, type Schema } from "@google/genai";
import type { ExtractedTask, ExtractedTasksResponse } from "@/schema/task.schema";

export class GeminiEngine {
    private primaryModel = process.env.GEMINI_MODEL || "gemini-2.5-pro";
    private fallbackModel = process.env.GEMINI_FALLBACK_MODEL || "gemini-2.5-pro";

    private client: GoogleGenAI | null = null;

    private getClient() {
        if (this.client) return this.client;

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new OperationFailedError(null, "GEMINI_API_KEY is required.");
        }

        this.client = new GoogleGenAI({ apiKey });
        return this.client;
    }

    private getTaskSchema(): Schema {
        return {
            type: Type.OBJECT,
            properties: {
                task: { type: Type.STRING },
                dueDate: { type: Type.STRING },
                originalDeadlineText: { type: Type.STRING },
                priority: { type: Type.STRING },
                description: { type: Type.STRING },
                confidenceScore: { type: Type.NUMBER },
                hasDeadline: { type: Type.BOOLEAN },
            },
            required: [
                "hasDeadline",
                "task",
                "dueDate",
                "originalDeadlineText",
                "priority",
                "description",
                "confidenceScore",
            ],
        };
    }

    private getResponseSchema(): Schema {
        return {
            type: Type.OBJECT,
            properties: {
                hasDeadline: { type: Type.BOOLEAN },
                deadlines: {
                    type: Type.ARRAY,
                    items: this.getTaskSchema(),
                },
                description: { type: Type.STRING },
            },
            required: ["hasDeadline", "deadlines", "description"],
        };
    }

    private readErrorMessage(error: unknown, fallback = "Unknown error") {
        if (error instanceof OperationFailedError) return error.message;
        if (error instanceof Error) return error.message;
        return fallback;
    }

    private isRetryableError(error: unknown): boolean {
        const msg = this.readErrorMessage(error).toLowerCase();

        return (
            msg.includes("503") ||
            msg.includes("unavailable") ||
            msg.includes("timeout") ||
            msg.includes("rate limit") ||
            msg.includes("overloaded")
        );
    }

    private parseExtraction(resultText?: string): ExtractedTasksResponse {
        if (!resultText) {
            throw new Error("Empty AI response");
        }

        try {
            const parsed = JSON.parse(resultText) as ExtractedTasksResponse | ExtractedTask;

            if ("deadlines" in parsed) return parsed;

            const legacy = parsed as ExtractedTask;
            return {
                hasDeadline: legacy.hasDeadline,
                deadlines: legacy.hasDeadline ? [legacy] : [],
                description: legacy.description,
            };
        } catch {
            throw new Error("Invalid JSON from AI");
        }
    }

    private getCurrentDateTimeContext() {
        const now = new Date();
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

        return `${now.toISOString()} (${tz})`;
    }

    private async callModel({
        model,
        contents,
        systemInstruction,
    }: {
        model: string;
        contents: any[];
        systemInstruction: string;
    }) {
        const genAI = this.getClient();

        return await genAI.models.generateContent({
            model,
            contents,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: this.getResponseSchema(),
                thinkingConfig: { thinkingBudget: 0 },
            },
        });
    }


    private async executeWithFallback({
        contents,
        systemInstruction,
    }: {
        contents: any[];
        systemInstruction: string;
    }): Promise<ExtractedTasksResponse> {
        try {
            console.info("[AI] Using primary model", { model: this.primaryModel });

            const res = await this.callModel({
                model: this.primaryModel,
                contents,
                systemInstruction,
            });

            return this.parseExtraction(res.text);
        } catch (error) {
            console.warn("[AI] Primary model failed", {
                error: this.readErrorMessage(error),
            });

            if (!this.isRetryableError(error)) {
                throw new OperationFailedError(
                    null,
                    this.readErrorMessage(error, "Primary model failed")
                );
            }

            try {
                console.info("[AI] Using fallback model", { model: this.fallbackModel });

                const fallbackRes = await this.callModel({
                    model: this.fallbackModel,
                    contents,
                    systemInstruction,
                });

                return this.parseExtraction(fallbackRes.text);
            } catch (fallbackError) {
                console.error("[AI] Fallback model failed", {
                    error: this.readErrorMessage(fallbackError),
                });

                throw new OperationFailedError(
                    null,
                    "Both primary and fallback models failed"
                );
            }
        }
    }

    async extractDeadlines(text: string): Promise<ExtractedTasksResponse> {
        const currentDateTime = this.getCurrentDateTimeContext();

        const prompt = `Analyze the following text and extract every academic deadline.

Return JSON with:
{ hasDeadline, deadlines[], description }

Text:
${text}`;

        const systemInstruction = `Extract structured academic deadlines.
Current time: ${currentDateTime}`;

        return this.executeWithFallback({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            systemInstruction,
        });
    }

    async extractDeadlinesFromImage(
        image: Buffer,
        mimeType: string
    ): Promise<ExtractedTasksResponse> {
        const currentDateTime = this.getCurrentDateTimeContext();

        const prompt = `Extract academic deadlines from this image as structured JSON.
Current time: ${currentDateTime}`;

        return this.executeWithFallback({
            contents: [
                {
                    inlineData: {
                        mimeType,
                        data: image.toString("base64"),
                    },
                },
                { text: prompt },
            ],
            systemInstruction:
                "You extract academic task deadlines from images and return JSON only.",
        });
    }
}

export const geminiEngine = new GeminiEngine();