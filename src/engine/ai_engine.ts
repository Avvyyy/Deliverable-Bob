import { OperationFailedError } from "@/response_handler/exceptions";
import { GoogleGenAI } from "@google/genai";
import type { ExtractedTask, ExtractedTasksResponse } from "@/schema/task.schema";

export class GeminiEngine {
    private readonly model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    private getClient() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new OperationFailedError(null, "GEMINI_API_KEY is required to extract deadlines.");
        }

        return new GoogleGenAI({ apiKey });
    }

    private getTaskSchema(): any {
        return {
            type: "object",
            properties: {
                task: { type: "string" },
                dueDate: { type: "string" },
                originalDeadlineText: { type: "string" },
                priority: { type: "string" },
                description: { type: "string" },
                confidenceScore: { type: "number" },
                hasDeadline: { type: "boolean" },
            },
            required: ["hasDeadline", "task", "dueDate", "originalDeadlineText", "priority", "description", "confidenceScore"],
        };
    }

    private getResponseSchema(): any {
        return {
            type: "object",
            properties: {
                hasDeadline: { type: "boolean" },
                deadlines: {
                    type: "array",
                    items: this.getTaskSchema(),
                },
                description: { type: "string" },
            },
            required: ["hasDeadline", "deadlines", "description"],
        };
    }

    private parseExtraction(resultText?: string): ExtractedTasksResponse {
        if (!resultText) {
            throw new OperationFailedError(null, "No response from AI engine.");
        }

        const parsed = JSON.parse(resultText) as ExtractedTasksResponse | ExtractedTask;

        if ("deadlines" in parsed && Array.isArray(parsed.deadlines)) {
            return parsed;
        }

        const legacyTask = parsed as ExtractedTask;
        return {
            hasDeadline: legacyTask.hasDeadline,
            deadlines: legacyTask.hasDeadline ? [legacyTask] : [],
            description: legacyTask.description,
        };
    }

    private getCurrentDateTimeContext() {
        const now = new Date();
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

        const localDateTime = now.toLocaleString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
            timeZoneName: "short",
        });

        return `${localDateTime} (${timeZone}); ISO timestamp: ${now.toISOString()}`;
    }

    async extractDeadlines(text: string): Promise<ExtractedTasksResponse> {
        const genAI = this.getClient();
        const currentDateTime = this.getCurrentDateTimeContext();
        const prompt = `Analyze the following text and extract every academic deadline.
For each deadline, extract:
- Task: the task to be done
- Due Date: the due date as an ISO 8601 date string
- Priority: high, medium, or low
- Description: a brief description of the task
- ConfidenceScore: the confidence score of the extraction (0-1)

Return JSON with this exact shape:
{ hasDeadline: boolean, deadlines: Array<{ hasDeadline: boolean, task: string, dueDate: string, originalDeadlineText: string, priority: string, description: string, confidenceScore: number }>, description: string }`;

        const systemInstruction = `You are an AI assistant that examines structured and unstructured text and extracts task information for a user.
        The backend's current date and time is ${currentDateTime}.
        Instructions:
        1. Extract every distinct deadline in the source, including numbered lists, pasted chats, emails, LMS announcements, and syllabus-style sections.
        2. Convert relative dates (e.g., "next Friday", "tomorrow", "in 3 days", "today before 5pm") into absolute ISO 8601 date strings.
        3. If a deadline says "before midnight" and no timezone is present, use 23:59:00 in the backend's local timezone context.
        4. If a deadline says "before 5pm" and no timezone is present, use 17:00:00 in the backend's local timezone context.
        5. If a deadline has a month and day but no year, choose the next future occurrence of that date.
        6. Do not return past dates unless the source explicitly includes that past year.
        7. Omit vague deadlines that cannot be resolved to a calendar date, such as "next class", unless the source also provides the class date.
        8. Keep duplicate-looking entries if the source presents them as separate numbered items, but do not merge unrelated tasks.
        9. Set hasDeadline to true only when the deadlines array has at least one item.
        10. If no deadline is found, return hasDeadline false, an empty deadlines array, and a short description explaining why.
        11. For each deadline item, set hasDeadline true and provide a confidence score between 0 and 1 based on how clear that individual deadline is.
        Do not invent or estimate deadlines.`;

        try {
            const response = await genAI.models.generateContent({
                model: this.model,
                contents: [{ role: "user", parts: [{ text: prompt + "\n\nText to analyze:\n" + text }] }],
                config: {
                    systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: this.getResponseSchema(),
                },
            });

            return this.parseExtraction(response.text);
        } catch (error) {
            throw new OperationFailedError(null, "Failed to extract task information from text.");
        }
    }

    async extractDeadlinesFromImage(image: Buffer, mimeType: string): Promise<ExtractedTasksResponse> {
        const genAI = this.getClient();
        const currentDateTime = this.getCurrentDateTimeContext();
        const prompt = `Read this image as an academic document, screenshot, announcement, whiteboard note, or assignment sheet.
The backend's current date and time is ${currentDateTime}.
Extract every visible academic deadline as JSON with this exact shape:
{ hasDeadline: boolean, deadlines: Array<{ hasDeadline: boolean, task: string, dueDate: string, originalDeadlineText: string, priority: string, description: string, confidenceScore: number }>, description: string }

If the image includes multiple deadlines, return all distinct clear deadlines.
If a deadline has a month and day but no year, choose the next future occurrence of that date.
Resolve relative dates like "tomorrow", "this Friday", "in two weeks", and "before midnight" using the backend current date and time.
Do not return past dates unless the source explicitly includes that past year.
Omit vague deadlines that cannot be resolved to a calendar date, such as "next class", unless the image also provides the class date.
If no deadline is visible, return hasDeadline false, an empty deadlines array, and a short description. Do not invent or estimate a deadline.`;

        try {
            const response = await genAI.models.generateContent({
                model: this.model,
                contents: [
                    {
                        inlineData: {
                            mimeType,
                            data: image.toString("base64"),
                        },
                    },
                    { text: prompt },
                ],
                config: {
                    systemInstruction: "You extract academic task deadlines from images and return only valid JSON.",
                    responseMimeType: "application/json",
                    responseSchema: this.getResponseSchema(),
                },
            });

            return this.parseExtraction(response.text);
        } catch (error) {
            throw new OperationFailedError(null, "Failed to extract task information from image.");
        }
    }
}

export const geminiEngine = new GeminiEngine();
