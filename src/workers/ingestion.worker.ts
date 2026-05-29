import { Worker, Job } from "bullmq";
import { redisConnection } from "@/config/redis";
import { INGESTION_QUEUE_NAME } from "@/queues/ingestion.queue";
import { processIngestion } from "@/services/ingestion.service";
import { performance } from "node:perf_hooks";

const ingestionWorker = new Worker(
    INGESTION_QUEUE_NAME,
    async (job: Job) => {
        const startedAt = performance.now();
        const { format, content, fileName, userId, mimeType } = job.data
        const queuedAt = typeof job.timestamp === "number" ? job.timestamp : Date.now();

        console.info("[WORKER] Job started", {
            id: job.id,
            format,
            fileName,
            queueWaitMs: Date.now() - queuedAt,
            attempt: job.attemptsMade + 1,
        });
        
        let processedContent = content;
        if ((format === 'pdf' || format === 'image') && typeof content === 'string') {
            const decodeStartedAt = performance.now();
            processedContent = Buffer.from(content, 'base64');
            console.info("[WORKER] base64 decode completed", {
                id: job.id,
                format,
                durationMs: Math.round(performance.now() - decodeStartedAt),
                bytes: processedContent.length,
            });
        }

        if (!userId) {
            throw new Error("Missing userId for ingestion job");
        }

        const result = await processIngestion(format, processedContent, userId, fileName, mimeType);
        console.info("[WORKER] Job processing completed", {
            id: job.id,
            format,
            durationMs: Math.round(performance.now() - startedAt),
        });
        return result;
    },
    {
        connection: redisConnection,
        concurrency: 2, 
    }
);

ingestionWorker.on("completed", (job) => {
    console.log(`[WORKER] Job ${job.id} completed successfully.`);
});

ingestionWorker.on("failed", (job, err) => {
    console.error(`[WORKER] Job ${job?.id} failed: ${err.message}`);
});

export { ingestionWorker };
