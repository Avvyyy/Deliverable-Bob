import type { ExtractedTasksResponse } from "../schema/task.schema.js";
export declare class GeminiEngine {
    private readonly model;
    private getClient;
    private getTaskSchema;
    private getResponseSchema;
    private parseExtraction;
    private getCurrentDateTimeContext;
    extractDeadlines(text: string): Promise<ExtractedTasksResponse>;
    extractDeadlinesFromImage(image: Buffer, mimeType: string): Promise<ExtractedTasksResponse>;
}
export declare const geminiEngine: GeminiEngine;
//# sourceMappingURL=ai_engine.d.ts.map