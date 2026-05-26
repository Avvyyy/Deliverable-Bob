export interface ExtractedTask {
    hasDeadline: boolean;
    task: string;
    dueDate: string;
    originalDeadlineText: string;
    priority: string;
    description: string;
    confidenceScore: number;
}

export interface ExtractedTasksResponse {
    hasDeadline: boolean;
    deadlines: ExtractedTask[];
    description: string;
}

// export interface SourceData {
//     type: string;
//     name: string;
//     rawContent: string;
// }
