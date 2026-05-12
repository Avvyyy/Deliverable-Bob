import { Queue } from "bullmq";
import { redisConnection } from "@/config/redis";

const INGESTION_QUEUE_NAME = "ingestion-queue";

const ingestionQueue = new Queue(INGESTION_QUEUE_NAME, {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
    },
});

export { ingestionQueue, INGESTION_QUEUE_NAME };
