import { Worker, Job } from "bullmq";
import { redisConnection } from "../config/redis.js";
import { INGESTION_QUEUE_NAME } from "../queues/ingestion.queue.js";
import { processIngestion } from "../services/ingestion.service.js";
const ingestionWorker = new Worker(INGESTION_QUEUE_NAME, async (job) => {
    const { format, content, fileName, userId, mimeType } = job.data;
    let processedContent = content;
    if ((format === 'pdf' || format === 'image') && typeof content === 'string') {
        processedContent = Buffer.from(content, 'base64');
    }
    if (!userId) {
        throw new Error("Missing userId for ingestion job");
    }
    const result = await processIngestion(format, processedContent, userId, fileName, mimeType);
    return result;
}, {
    connection: redisConnection,
    concurrency: 2,
});
ingestionWorker.on("completed", (job) => {
    console.log(`[WORKER] Job ${job.id} completed successfully.`);
});
ingestionWorker.on("failed", (job, err) => {
    console.error(`[WORKER] Job ${job?.id} failed: ${err.message}`);
});
export { ingestionWorker };
//# sourceMappingURL=ingestion.worker.js.map