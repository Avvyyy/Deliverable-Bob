import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";
const INGESTION_QUEUE_NAME = "ingestion-queue";
const ingestionQueue = new Queue(INGESTION_QUEUE_NAME, {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 1000,
        },
        removeOnComplete: {
            age: 60 * 60,
            count: 1000,
        },
        removeOnFail: false,
    },
});
export { ingestionQueue, INGESTION_QUEUE_NAME };
//# sourceMappingURL=ingestion.queue.js.map