import type { ExtractedTask } from "../schema/task.schema.js";
declare function checkDeduplication(title: string, deadline: Date, userId: string): Promise<{
    id: string;
    createdAt: Date;
    sourceId: string;
    title: string;
    deadline: Date;
    originalDeadlineText: string;
    confidenceScore: number;
    status: string;
    updatedAt: Date;
} | null>;
declare function saveExtraction(sourceInfo: {
    type: string;
    name?: string | undefined;
    rawContent: string;
    userId: string;
}, extractedTasks: ExtractedTask[]): Promise<{
    tasks: {
        id: string;
        createdAt: Date;
        sourceId: string;
        title: string;
        deadline: Date;
        originalDeadlineText: string;
        confidenceScore: number;
        status: string;
        updatedAt: Date;
    }[];
    type: string;
    userId: string;
    name: string | null;
    id: string;
    createdAt: Date;
    rawContent: string;
}>;
export { checkDeduplication, saveExtraction };
//# sourceMappingURL=task.service.d.ts.map