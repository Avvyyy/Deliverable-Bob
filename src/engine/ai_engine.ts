import { OperationFailedError } from "@/response_handler/exceptions";
import { GoogleGenAI } from "@google/genai";
import type { ExtractedTask } from "@/schema/task.schema";

const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY || "");

export class GeminiEngine {
    async extractDeadline(text: string): Promise<ExtractedTask> {
        const prompt = `Analyze the following text and extract the following information:
   - Task: The task to be done
   - Due Date: The due date of the task
   - Priority: The priority of the task (high, medium, or low)
   - Description: A brief description of the task
   - ConfidenceScore: The confidence score of the extraction (0-1)
   
   Return the information in the following format:
   { task: string, dueDate: string, originalDeadlineText: string, priority: string, description: string, confidenceScore: number }`;

        const systemInstruction = `You are an AI assistant that examines structured and unstructured text and extracts task information for a user.
        Instructions:
        1. Convert relative dates (e.g., "next Friday", "tomorrow") into absolute ISO 8601 date strings.
        2. Provide a confidence score between 0 and 1 based on how clear the deadline is in the text.
        3. If no deadline is found, estimate one based on context or set confidence low.`;

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            
            const response = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt + "\n\nText to analyze:\n" + text }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "object",
                        properties: {
                            task: { type: "string" },
                            dueDate: { type: "string" },
                            originalDeadlineText: { type: "string" },
                            priority: { type: "string" },
                            description: { type: "string" },
                            confidenceScore: { type: "number" },
                        },
                        required: ["task", "dueDate", "originalDeadlineText", "priority", "description", "confidenceScore"],
                    },
                },
            });

            const resultText = response.response.text();
            if (!resultText) {
                throw new OperationFailedError(null, "No response from AI engine.");
            }

            const parsedJson = JSON.parse(resultText) as ExtractedTask;
            return parsedJson;
        } catch (error) {
            throw new OperationFailedError(null, "Failed to extract task information from text.");
        }
    }
}

export const geminiEngine = new GeminiEngine();
