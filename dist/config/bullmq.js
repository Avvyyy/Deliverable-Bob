import { Queue, Worker, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';
const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');
export const INGESTION_QUEUE_NAME = 'ingestion-jobs';
export const ingestionQueue = new Queue(INGESTION_QUEUE_NAME, { connection });
export const ingestionQueueEvents = new QueueEvents(INGESTION_QUEUE_NAME, { connection });
//# sourceMappingURL=bullmq.js.map