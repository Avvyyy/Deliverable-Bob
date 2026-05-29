import { Worker, Job } from "bullmq";
import { redisConnection } from "@/config/redis";
import { INGESTION_QUEUE_NAME } from "@/queues/ingestion.queue";
import { processIngestion } from "@/services/ingestion.service";
import { performance } from "node:perf_hooks";

const isQuotaError = (err: any) => {
    const msg = err?.message || "";
    return (
        msg.includes("429") ||
        msg.includes("RESOURCE_EXHAUSTED") ||
        msg.includes("quota") ||
        msg.includes("exceeded")
    );
};

const ingestionWorker = new Worker(
    INGESTION_QUEUE_NAME,
    async (job: Job) => {
        const startedAt = performance.now();

        const { format, content, fileName, userId, mimeType } = job.data;

        const queuedAt =
            typeof job.timestamp === "number" ? job.timestamp : Date.now();

        console.info("[WORKER] Job started", {
            id: job.id,
            format,
            fileName,
            queueWaitMs: Date.now() - queuedAt,
            attempt: job.attemptsMade + 1,
        });

        let processedContent = content;

        if ((format === "pdf" || format === "image") && typeof content === "string") {
            const decodeStartedAt = performance.now();

            processedContent = Buffer.from(content, "base64");

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

        try {
            const result = await processIngestion(
                format,
                processedContent,
                userId,
                fileName,
                mimeType
            );

            console.info("[WORKER] Job processing completed", {
                id: job.id,
                format,
                durationMs: Math.round(performance.now() - startedAt),
            });

            return result;
        } catch (error: any) {
            if (isQuotaError(error)) {
                console.error("[WORKER] Quota exceeded - failing fast", {
                    jobId: job.id,
                    message: error?.message,
                });

                // This prevents retry spam
                throw new Error("AI_QUOTA_EXCEEDED");
            }

            throw error;
        }
    },
    {
        connection: redisConnection,
        concurrency: 1,
    }
);

ingestionWorker.on("completed", (job) => {
    console.log(`[WORKER] Job ${job.id} completed successfully.`);
});

ingestionWorker.on("failed", (job, err) => {
    const isQuota = err?.message === "AI_QUOTA_EXCEEDED";

    console.error(`[WORKER] Job ${job?.id} failed`, {
        error: err.message,
        quotaRelated: isQuota,
    });
});

export { ingestionWorker };