import { Worker, Job } from "bullmq";
import { redisConnection } from "@/config/redis";
import { INGESTION_QUEUE_NAME } from "@/queues/ingestion.queue";
import { processIngestion } from "@/services/ingestion.service";

const ingestionWorker = new Worker(
    INGESTION_QUEUE_NAME,
    async (job: Job) => {
        const { format, content, fileName } = job.data
        
        let processedContent = content;
        if (format === 'pdf' && typeof content === 'string') {
            processedContent = Buffer.from(content, 'base64');
        }

        const result = await processIngestion(format, processedContent, fileName);
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
