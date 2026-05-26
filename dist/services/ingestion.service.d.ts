import { saveExtraction } from "../services/task.service.js";
type IngestionFormat = 'text' | 'pdf' | 'image';
type IngestionResult = {
    extracted: true;
    source: Awaited<ReturnType<typeof saveExtraction>>;
    extractedCount: number;
    skippedCount: number;
} | {
    extracted: false;
    message: string;
    reason: string;
};
declare const processIngestion: (format: IngestionFormat, content: Buffer | string, userId: string, fileName?: string, mimeType?: string) => Promise<IngestionResult>;
export { processIngestion };
//# sourceMappingURL=ingestion.service.d.ts.map